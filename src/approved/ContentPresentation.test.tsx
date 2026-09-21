import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import data from '../data/approved-trip.json';
import { ApprovedTrip } from './ApprovedTrip';

const original = structuredClone(data);
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('busan-fx-v1', JSON.stringify({rate: 0.0235, savedAt: Date.now(), updatedAt: '2026-09-20'}));
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Offline')));
});
afterEach(() => { cleanup(); Object.assign(data, structuredClone(original)); vi.unstubAllGlobals(); });

describe('行程資訊的呈現', () => {
  it('keeps decorative art out of the accessible name and retains details and map access if it fails', () => {
    Object.assign(data.days[0]!.items.find(item => item.placeKey === 'water_soup')!, {illustrationKey: 'pork-soup'});
    render(<ApprovedTrip />);
    const heading = screen.getByRole('button', {name: '水邊最高豬肉湯飯詳情'});
    const card = heading.closest('li')!;
    const image = card.querySelector('img')!;
    expect(image).not.toBeNull();
    expect(image.getAttribute('alt')).toBe('');
    expect(image.closest('[aria-hidden="true"]')).toBeTruthy();
    const map = within(card).getByRole('link', {name: '水邊最高豬肉湯飯地圖搜尋'});
    const href = map.getAttribute('href');
    fireEvent.error(image);
    expect(card.querySelector('img')).toBeNull();
    fireEvent.click(heading);
    expect(heading.getAttribute('aria-expanded')).toBe('true');
    const details = document.getElementById(heading.getAttribute('aria-controls')!)!;
    expect(within(details).getByRole('heading', {name: '現場資訊'})).toBeTruthy();
    expect(map.getAttribute('href')).toBe(href);
  });
  it('keeps deadline and timezone suffixes visible in the clock column', () => {
    localStorage.setItem('busan-selected-day', 'd5');
    render(<ApprovedTrip />);
    expect(screen.getByText('前', {selector: '[data-time-qualifier]'})).toBeTruthy();
    expect(screen.getByText('台灣時間', {selector: '[data-time-qualifier]'})).toBeTruthy();
  });
  it('shows a visit budget as a plan, separately from instructions and clock time', () => {
    Object.assign(data.days[0]!.items[0]!, {visitMinutes: {min: 45, max: 60}});
    render(<ApprovedTrip />);
    const card = screen.getByRole('button', {name: 'BX794 抵達詳情'}).closest('li')!;
    expect(within(card).getByText('預留 45–60 分')).toBeTruthy();
    expect(screen.getByText('17:05')).toBeTruthy();
  });
  it('reads the same place information in the itinerary and backup page', () => {
    Object.assign(data.places.water_soup, {description: '測試用店家特色，不是當天安排。'});
    render(<ApprovedTrip />);
    fireEvent.click(screen.getByRole('button', {name: /水邊.*詳情/}));
    expect(screen.getByText(/測試用店家特色/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: '備案'}));
    expect(screen.getByText(/測試用店家特色/)).toBeTruthy();
  });
  it('lets people compare restaurant descriptions before opening each restaurant’s practical details', () => {
    Object.assign(data.places.water_soup, {details: ['測試候位說明']});
    Object.assign(data.places.nasari, {details: ['測試備案點餐說明']});
    render(<ApprovedTrip />);
    fireEvent.click(screen.getByRole('button', {name: '備案'}));
    expect(screen.queryByText('測試候位說明')).toBeNull();
    const main = screen.getByRole('button', {name: '水邊最高豬肉湯飯・民樂本店用餐資訊'});
    fireEvent.click(main);
    expect(main.getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById(main.getAttribute('aria-controls')!)?.textContent).toContain('測試候位說明');
    expect(screen.queryByText('測試備案點餐說明')).toBeNull();
    expect(screen.getAllByRole('link', {name: /地圖搜尋/})).toHaveLength(2);
    const backup = screen.getByRole('button', {name: 'Nasari 廣安店用餐資訊'});
    fireEvent.click(backup);
    expect(main.getAttribute('aria-expanded')).toBe('true');
    expect(backup.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(main);
    expect(screen.queryByText('測試候位說明')).toBeNull();
    expect(screen.getByText('測試備案點餐說明')).toBeTruthy();
  });
  it('keeps the current restaurant details open when expanding the backup list to all days', () => {
    localStorage.setItem('busan-selected-day', 'd3');
    render(<ApprovedTrip />);
    fireEvent.click(screen.getByRole('button', {name: '備案'}));
    fireEvent.click(screen.getByRole('button', {name: 'Ribs of Legend 海雲台用餐資訊'}));
    fireEvent.click(screen.getByRole('button', {name: '查看全部'}));
    expect(screen.getByRole('button', {name: 'Ribs of Legend 海雲台用餐資訊'}).getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(screen.getByRole('button', {name: '只看 10/05'}));
    expect(screen.getByRole('button', {name: 'Ribs of Legend 海雲台用餐資訊'}).getAttribute('aria-expanded')).toBe('true');
  });
});
