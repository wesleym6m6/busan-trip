/**
 * 視覺基準截圖：npm run screenshots
 *
 * 前提：先 `npm run build && npm run preview`（預設 http://127.0.0.1:4173/），或設定 SCREENSHOT_BASE_URL。
 * 使用本機已安裝的 Edge／Chrome（puppeteer-core 不下載瀏覽器）；可用 BROWSER_PATH 指定執行檔。
 *
 * 為了讓截圖可比較：
 * - 固定時間 ?now=2026-10-17T09:30:00+09:00（示範 Day 2 早上）
 * - 關閉裝飾動畫（localStorage 偏好），並標記海鷗已飛過（sessionStorage）
 * 輸出到 docs/screenshots/。
 */
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? 'http://127.0.0.1:4173/';
const OUT_DIR = resolve('docs/screenshots');
const FIXED_NOW = '2026-10-17T09:30:00%2B09:00';

const CANDIDATE_BROWSERS = [
  process.env.BROWSER_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/microsoft-edge',
].filter(Boolean);

const executablePath = CANDIDATE_BROWSERS.find((p) => existsSync(p));
if (!executablePath) {
  console.error('找不到 Edge／Chrome，請設定 BROWSER_PATH。');
  process.exit(2);
}

const VIEWPORTS = {
  phone390: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  phone360: { width: 360, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { width: 1024, height: 768, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
};

function url(hash, extraQuery = '') {
  return `${BASE_URL}?now=${FIXED_NOW}${extraQuery}${hash}`;
}

async function preparePage(browser, viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('busan-trip:prefs:v1', JSON.stringify({ motion: false, lastViewedDayId: null }));
      sessionStorage.setItem('busan-trip:gull-shown', '1');
    } catch {
      /* ignore */
    }
  });
  return page;
}

async function shot(page, name, options = {}) {
  const path = resolve(OUT_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: options.fullPage ?? false });
  console.log(`✓ ${name}.png`);
}

async function waitForApp(page) {
  await page.waitForSelector('nav[aria-label="主要頁面"]', { timeout: 15000 });
  // 讓 sticky／字體排版穩定
  await new Promise((r) => setTimeout(r, 300));
}

async function clickByText(page, selector, text) {
  const handle = await page.evaluateHandle(
    (sel, txt) => Array.from(document.querySelectorAll(sel)).find((el) => el.textContent?.trim() === txt) ?? null,
    selector,
    text,
  );
  const el = handle.asElement();
  if (!el) throw new Error(`找不到 ${selector} "${text}"`);
  await el.click();
  await new Promise((r) => setTimeout(r, 300));
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--lang=zh-TW'] });
  try {
    // --- 390×844 ---
    let page = await preparePage(browser, VIEWPORTS.phone390);
    await page.goto(url('#/itinerary/day-2'), { waitUntil: 'networkidle0' });
    await waitForApp(page);
    await shot(page, 'itinerary-390');
    await shot(page, 'itinerary-390-full', { fullPage: true });

    // 展開天空膠囊列車卡片並捲到卡片頂端
    await page.goto(url('#/itinerary/day-2', '&expand=ev-d2-skycapsule'), { waitUntil: 'networkidle0' });
    await waitForApp(page);
    await page.evaluate(() => {
      const h = Array.from(document.querySelectorAll('h3')).find((el) => el.textContent?.includes('天空膠囊列車'));
      const article = h?.closest('article');
      if (article) {
        const top = article.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top });
      }
    });
    await new Promise((r) => setTimeout(r, 300));
    await shot(page, 'event-expanded-390');

    // 給司機看：從展開卡片的按鈕開啟
    await clickByText(page, 'article button', '給司機看');
    await page.waitForSelector('dialog[open]');
    await shot(page, 'address-dialog-390');
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 200));

    // 地圖選單
    await clickByText(page, 'article button', '地圖');
    await page.waitForSelector('dialog[open]');
    await shot(page, 'map-menu-390');
    await page.close();

    page = await preparePage(browser, VIEWPORTS.phone390);
    await page.goto(url('#/backups'), { waitUntil: 'networkidle0' });
    await waitForApp(page);
    await shot(page, 'backups-390');
    await page.goto(url('#/tools'), { waitUntil: 'networkidle0' });
    await waitForApp(page);
    await shot(page, 'tools-390');
    await shot(page, 'tools-390-full', { fullPage: true });
    await page.close();

    // --- 360×800 ---
    page = await preparePage(browser, VIEWPORTS.phone360);
    await page.goto(url('#/itinerary/day-2'), { waitUntil: 'networkidle0' });
    await waitForApp(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    console.log(`360px 橫向溢出：${overflow}px`);
    await shot(page, 'itinerary-360');
    await page.goto(url('#/backups'), { waitUntil: 'networkidle0' });
    await waitForApp(page);
    await shot(page, 'backups-360');
    await page.close();

    // --- 桌機 ---
    page = await preparePage(browser, VIEWPORTS.desktop);
    await page.goto(url('#/itinerary/day-2'), { waitUntil: 'networkidle0' });
    await waitForApp(page);
    await shot(page, 'itinerary-desktop-1024');
    await page.close();
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
