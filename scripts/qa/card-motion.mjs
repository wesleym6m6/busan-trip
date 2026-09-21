/** Real-browser motion and geometry regression. Run against a built preview.
 * MODE=baseline records the approved layout before changes; default verifies it.
 * QA_OUTPUT_DIR must point to the same directory for both runs.
 */
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const out = resolve(process.env.QA_OUTPUT_DIR || '/tmp/busan-card-motion');
const url = process.env.QA_BASE_URL || 'http://127.0.0.1:4180/busan-trip/';
const baseline = process.env.MODE === 'baseline';
const browser = await puppeteer.launch({
  executablePath: process.env.BROWSER_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const errors = [];
const results = [];
const pause = ms => new Promise(r => setTimeout(r, ms));
await mkdir(out, { recursive: true });
try {
  const page = await browser.newPage();
  page.on('pageerror', e => errors.push(e.message));
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('busan-selected-day', 'd1');
    localStorage.setItem('busan-reduce-motion', '0');
    localStorage.setItem('busan-fx-v1', JSON.stringify({ rate: .0235, savedAt: Date.now(), updatedAt: '2026-09-22' }));
  });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  const clickText = async text => {
    await page.evaluate(text => {
      const button = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === text);
      if (!button) throw new Error(`Missing button: ${text}`);
      button.click();
    }, text);
    await pause(350);
  };
  const day = async number => {
    await page.evaluate(number => [...document.querySelectorAll('button')].find(b => b.textContent.includes(`10/0${number}`)).click(), number);
    await pause(350);
  };
  const metrics = [];
  for (const width of [320, 360, 390, 1024]) {
    await page.setViewport({ width, height: 844 });
    for (const date of [3, 4, 5, 6, 7]) {
      await day(date);
      const geometry = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        cards: [...document.querySelectorAll('.trip-card')].map(card => ({
          title: card.querySelector('.trip-card-title').textContent,
          height: card.getBoundingClientRect().height,
          artWidth: card.querySelector('.trip-card-art')?.getBoundingClientRect().width,
        })),
      }));
      assert.equal(geometry.overflow, 0, `horizontal overflow at ${width}, day ${date}`);
      metrics.push({ width, date, ...geometry });
    }
  }
  if (baseline) {
    await writeFile(resolve(out, 'baseline.json'), JSON.stringify(metrics, null, 2));
    console.log(`Baseline: ${metrics.length} day/width combinations, ${metrics.reduce((n, m) => n + m.cards.length, 0)} cards`);
  } else {
    assert.deepEqual(metrics, JSON.parse(await readFile(resolve(out, 'baseline.json'), 'utf8')), 'collapsed layout changed');
    results.push('156 collapsed card geometries exactly match baseline; no horizontal overflow');
  }
  await page.setViewport({ width: 390, height: 844 });
  await day(3);
  const heading = 'button.trip-card-heading';
  await page.$eval(heading, el => el.scrollIntoView({ block: 'center' }));
  await pause(400);
  const h = () => page.$eval('.trip-card', el => el.getBoundingClientRect().height);
  const closed = await h();
  // Capture animation on actual animation frames instead of fixed sleeps.
  const samples = await page.$eval(heading, button => new Promise(resolve => {
    const card = button.closest('.trip-card');
    const frames = [];
    const start = performance.now();
    const top = button.getBoundingClientRect().top;
    button.click();
    function sample(now) {
      frames.push({ ms: now - start, height: card.getBoundingClientRect().height, top: button.getBoundingClientRect().top });
      if (now - start < 380) requestAnimationFrame(sample); else resolve({ frames, top });
    }
    requestAnimationFrame(sample);
  }));
  const open = await h();
  await page.screenshot({ path: resolve(out, baseline ? 'before-expanded.png' : 'after-expanded-390.png') });
  if (!baseline) {
    assert.ok(samples.frames.some(f => f.height > closed + 2 && f.height < open - 2), 'opening must have intermediate heights, not jump');
    assert.ok(samples.frames.every(f => Math.abs(f.top - samples.top) < 1), 'heading should not jump during expansion');
    results.push('opening has intermediate frames and stable heading');
    const targetId = await page.$eval(heading, el => el.getAttribute('aria-controls'));
    // Start closing, then reverse while it is moving.
    await page.$eval(heading, el => el.click());
    await pause(65);
    const middle = await h();
    assert.ok(middle > closed && middle < open, 'closing must animate');
    const inaccessible = await page.evaluate(id => {
      const el = document.getElementById(id);
      return el?.inert && el.getAttribute('aria-hidden') === 'true';
    }, targetId);
    assert.ok(inaccessible, 'closing details must immediately leave keyboard and accessibility navigation');
    await page.$eval(heading, el => el.click());
    await pause(350);
    assert.ok(Math.abs(await h() - open) < 1, 'rapid reversal should finish open');
    await page.$eval(heading, el => el.click());
    await pause(350);
    assert.ok(Math.abs(await h() - closed) < 1, 'collapse must leave no blank space');
    results.push('collapse, reversal, inert details and zero leftover space');

    // Keyboard interaction retains focus on the controlling heading.
    await page.focus(heading);
    await page.keyboard.press('Enter');
    await pause(350);
    assert.equal(await page.$eval(heading, el => el.getAttribute('aria-expanded')), 'true');
    await page.keyboard.press('Space');
    await pause(350);
    assert.equal(await page.$eval(heading, el => el === document.activeElement && el.getAttribute('aria-expanded')), 'false');
    results.push('Enter/Space toggles with focus retained');

    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.$eval(heading, el => el.click());
    const reduced = await h();
    assert.ok(Math.abs(reduced - open) < 1, 'system reduced motion must expand immediately');
    assert.equal(await page.$eval('.trip-card', el => el.getAnimations({ subtree: true }).length), 0);
    await page.$eval(heading, el => el.click());
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    await clickText('工具');
    await page.$eval('button[aria-controls="prep-panel"]', el => el.click());
    await page.evaluate(() => [...document.querySelectorAll('label')].find(el => el.textContent.includes('減少動態效果')).querySelector('input').click());
    await clickText('行程');
    await page.$eval(heading, el => el.click());
    assert.ok(Math.abs(await h() - open) < 1, 'in-app reduced motion must expand immediately');
    await page.$eval(heading, el => el.click());
    results.push('system and in-app reduced motion: immediate state, no card animation');
    for (const tab of ['備案', '工具', '打包', '行程']) await clickText(tab);
    results.push('four tabs remain usable');
    // Every expandable card is readable at both required mobile widths.
    let expandedChecks = 0;
    for (const width of [360, 390]) {
      await page.setViewport({ width, height: 844 });
      for (const date of [3, 4, 5, 6, 7]) {
        await day(date);
        const checks = await page.evaluate(async () => {
          const checks = [];
          for (const button of document.querySelectorAll('button.trip-card-heading')) {
            const card = button.closest('.trip-card');
            const closed = card.getBoundingClientRect().height;
            button.click();
            await new Promise(requestAnimationFrame);
            const panel = document.getElementById(button.getAttribute('aria-controls'));
            const detail = panel.querySelector('.trip-card-detail');
            checks.push({
              title: button.getAttribute('aria-label'),
              visible: !panel.inert && panel.getBoundingClientRect().height >= detail.getBoundingClientRect().height - 1,
              overflow: document.documentElement.scrollWidth > innerWidth,
            });
            button.click();
            await new Promise(requestAnimationFrame);
            checks.at(-1).restored = Math.abs(card.getBoundingClientRect().height - closed) < 1;
          }
          return checks;
        });
        for (const check of checks) assert.ok(check.visible && !check.overflow && check.restored, JSON.stringify({ width, date, ...check }));
        expandedChecks += checks.length;
      }
    }
    results.push(`${expandedChecks} expanded mobile cards: no clipped content, no overflow, restored height`);
    await day(3);
    await page.setViewport({ width: 360, height: 800 });
    await page.$eval(heading, el => el.scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: resolve(out, 'after-collapsed-360.png') });
  }
  if (!baseline) {
    const artPage = await browser.newPage();
    artPage.on('pageerror', e => errors.push(e.message));
    await artPage.setViewport({ width: 390, height: 844 });
    await artPage.goto(url, { waitUntil: 'networkidle0' });
    // Disable the in-app reduced setting from the previous page, then reload.
    await artPage.evaluate(() => { localStorage.setItem('busan-reduce-motion', '0'); localStorage.setItem('busan-selected-day', 'd1'); });
    await artPage.reload({ waitUntil: 'networkidle0' });
    const artResult = await artPage.evaluate(async () => {
      const image = [...document.querySelectorAll('.trip-card-art img')].at(-1);
      image.loading = 'eager';
      await image.decode();
      const card = image.closest('.trip-card');
      const height = card.getBoundingClientRect().height;
      const observe = () => new Promise(resolve => {
        let moving = false;
        const start = performance.now();
        function frame(now) {
          moving ||= image.getAnimations().some(a => a.playState === 'running');
          if (now - start < 450) requestAnimationFrame(frame); else resolve(moving);
        }
        requestAnimationFrame(frame);
      });
      image.scrollIntoView({ block: 'center' });
      const first = await observe();
      scrollTo(0, 0);
      await new Promise(resolve => setTimeout(resolve, 80));
      image.scrollIntoView({ block: 'center' });
      const replay = await observe();
      return { first, replay, heightStable: height === card.getBoundingClientRect().height };
    });
    assert.equal(artResult.first, true, 'first visible loaded art should animate');
    assert.equal(artResult.replay, false, 'scrolling back must not replay art');
    assert.equal(artResult.heightStable, true, 'art entrance must not change card height');
    for (const date of [4, 3]) {
      await artPage.evaluate(date => [...document.querySelectorAll('button')].find(b => b.textContent.includes(`10/0${date}`)).click(), date);
      await pause(350);
    }
    const replayAfterDate = await artPage.evaluate(async () => {
      const image = [...document.querySelectorAll('.trip-card-art img')].at(-1);
      await image.decode();
      image.scrollIntoView({ block: 'center' });
      return new Promise(resolve => {
        let moving = false;
        const start = performance.now();
        function frame(now) {
          moving ||= image.getAnimations().some(a => a.playState === 'running');
          if (now - start < 400) requestAnimationFrame(frame); else resolve(moving);
        }
        requestAnimationFrame(frame);
      });
    });
    assert.equal(replayAfterDate, false, 'date round-trip must not replay art');
    results.push('art entrance on first view only; no replay after scroll or date switch; stable card height');
    await artPage.close();
  }
  assert.deepEqual(errors, [], 'browser runtime errors');
  await writeFile(resolve(out, baseline ? 'baseline-frames.json' : 'verification.json'), JSON.stringify({ results, samples, errors }, null, 2));
  console.log(results.join('\n') || 'Baseline recorded');
} finally { await browser.close(); }
