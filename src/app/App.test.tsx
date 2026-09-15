/**
 * 元件冒煙測試：用示範資料直接注入，驗證三個頁面與核心互動可運作。
 */
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import demo from '../../public/data/demo/trip.json';
import { validateTripData } from '../domain/validate';
import { getDataSourceConfig } from '../data/config';
import { LegacyApp as App } from '../LegacyApp';
import type { TripDataState } from './TripDataContext';

function okState(): TripDataState {
  const result = validateTripData(demo);
  if (!result.ok) throw new Error('demo fixture invalid');
  return { status: 'ok', data: result.data, warnings: result.issues, config: getDataSourceConfig({ VITE_DATA_MODE: 'demo' }) };
}

beforeEach(() => {
  window.location.hash = '';
  localStorage.clear();
  sessionStorage.clear();
});

describe('App', () => {
  it('首屏直接顯示行程：日期列、摘要與第一張卡片', async () => {
    render(<App initialData={okState()} />);
    expect(await screen.findByRole('heading', { level: 1, name: '釜山小旅行' })).toBeTruthy();
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    // 今天不在示範日期內、無上次查看 → Day 1
    expect(tabs[0]!.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('heading', { level: 3, name: '抵達金海機場' })).toBeTruthy();
  });

  it('切換日期會更新網址，且時間軸顯示跨日交通', async () => {
    render(<App initialData={okState()} />);
    await screen.findByRole('heading', { level: 1 });
    await act(async () => {
      fireEvent.click(screen.getAllByRole('tab')[1]!);
      // hashchange 在 jsdom 為非同步事件
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(window.location.hash).toBe('#/itinerary/day-2');
    expect(await screen.findByText(/翌日 00:05/)).toBeTruthy();
    expect(screen.getAllByText('預約待確認').length).toBeGreaterThanOrEqual(2); // 今日提醒 + 卡片標籤
  });

  it('展開卡片顯示韓文地址，並可開啟給司機看對話框', async () => {
    render(<App initialData={okState()} />);
    const card = (await screen.findByRole('heading', { level: 3, name: '廣安里海水浴場' })).closest('article')!;
    fireEvent.click(within(card).getByRole('button', { name: '詳情' }));
    expect(within(card).getByText('부산광역시 수영구 광안해변로 219')).toBeTruthy();
    fireEvent.click(within(card).getAllByRole('button', { name: '給司機看' })[0]!);
    const dialog = document.querySelector('dialog[open]')!;
    expect(dialog).toBeTruthy();
    expect(within(dialog as HTMLElement).getByText('광안리해수욕장')).toBeTruthy();
  });

  it('區域級住宿不提供門牌', async () => {
    render(<App initialData={okState()} />);
    const card = (await screen.findByRole('heading', { level: 3, name: '住宿 Check-in' })).closest('article')!;
    fireEvent.click(within(card).getByRole('button', { name: '給司機看' }));
    const dialog = document.querySelector('dialog[open]') as HTMLElement;
    expect(within(dialog).getByText(/精確地址待確認/)).toBeTruthy();
    expect((within(dialog).getByRole('button', { name: '複製地址' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('備案頁篩選與空狀態', async () => {
    window.location.hash = '#/backups';
    render(<App initialData={okState()} />);
    expect(await screen.findByRole('heading', { level: 1, name: '備案' })).toBeTruthy();
    expect(screen.getByText('8 / 8 個備案')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '雨天可' }));
    expect(screen.getByText('4 / 8 個備案')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '松島' }));
    expect(screen.getByText('沒有符合篩選的備案')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '清除篩選' }));
    expect(screen.getByText('8 / 8 個備案')).toBeTruthy();
  });

  it('工具頁顯示資料版本與動態開關', async () => {
    window.location.hash = '#/tools';
    render(<App initialData={okState()} />);
    expect(await screen.findByRole('heading', { level: 1, name: '工具' })).toBeTruthy();
    expect(screen.getByText('demo-0.1.0')).toBeTruthy();
    const sw = screen.getByRole('switch', { name: '裝飾動畫' });
    expect(sw.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(sw);
    expect(sw.getAttribute('aria-checked')).toBe('false');
    expect(document.documentElement.dataset.motion).toBe('off');
  });

  it('資料錯誤時顯示錯誤狀態而非示範資料', () => {
    render(
      <App
        initialData={{
          status: 'error',
          kind: 'validation',
          message: '資料驗證失敗',
          issues: [{ severity: 'error', path: 'trip', message: '缺少' }],
          config: getDataSourceConfig({ VITE_DATA_MODE: 'production' }),
        }}
      />,
    );
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText(/資料驗證失敗/)).toBeTruthy();
    expect(screen.queryByRole('tab')).toBeNull();
  });
});
