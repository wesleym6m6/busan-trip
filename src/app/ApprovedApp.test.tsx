import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('busan-fx-v1', JSON.stringify({rate: 0.0235, updatedAt: '2026-09-15T00:00:00Z', savedAt: Date.now()}));
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Offline in test')));
});
afterEach(() => vi.unstubAllGlobals());

describe('使用者定案版', () => {
  it('直接顯示真實五天與四分頁，第一張可整列展開', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', {name:'抵達釜山，晚上到海邊走走'})).toBeTruthy();
    for (const date of ['10/03','10/04','10/05','10/06','10/07']) {
      expect(screen.getByRole('button',{name:new RegExp(date)})).toBeTruthy();
    }
    expect(within(screen.getByRole('navigation')).getAllByRole('button')).toHaveLength(4);
    const arrival = screen.getByRole('button',{name:'BX794 抵達詳情'});
    expect(arrival.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(arrival);
    expect(arrival.getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById(arrival.getAttribute('aria-controls')!)?.textContent).toContain('WiFi Dosirak');
    expect(document.querySelector('sc-if,sc-for,x-dc')).toBeNull();
  });
  it('切日、備案空狀態與重新掛載保留日期', async () => {
    const first=render(<App />);
    fireEvent.click(await screen.findByRole('button',{name:/10\/07/}));
    fireEvent.click(screen.getByRole('button',{name:'備案'}));
    expect(screen.getByText('這天沒有另外安排備案。')).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:'查看全部'}));
    expect(screen.getByText(/水邊.*民樂本店/)).toBeTruthy();
    first.unmount();
    render(<App />);
    expect(await screen.findByRole('heading',{name:'收拾行李，準備回台北'})).toBeTruthy();
  });
  it('第三天保留尾浦入口及膠囊詳情', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('button',{name:/10\/05/}));
    const card=screen.getByText('抵達尾浦站').closest('li')!;
    expect(decodeURIComponent(within(card).getByRole('link').getAttribute('href')!)).toContain('미포정거장');
    fireEvent.click(screen.getByRole('button',{name:'天空膠囊列車詳情'}));
    expect(screen.getByText(/08:30 是預約入場時段/)).toBeTruthy();
  });
  it('保留參考匯率、手動匯率、空值與無效輸入的體驗', async () => {
    render(<App />);
    await act(async()=>fireEvent.click(screen.getByRole('button',{name:'工具'})));
    const input=screen.getByPlaceholderText('輸入韓元金額');
    fireEvent.change(input,{target:{value:'10,000'}});
    expect(screen.getByText('約 NT$ 235')).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:'沒有網路？手動輸入匯率'}));
    fireEvent.change(screen.getByLabelText('手動匯率，1 韓元等於多少台幣'),{target:{value:'0.025'}});
    expect(screen.getByText('約 NT$ 250')).toBeTruthy();
    fireEvent.change(input,{target:{value:'0'}});
    expect(screen.getByText('約 NT$ 0')).toBeTruthy();
    for (const value of ['', '-100', 'abc']) {
      fireEvent.change(input,{target:{value}});
      expect(screen.getByText('約 NT$ —')).toBeTruthy();
    }
  });
  it('打包勾選在重新掛載後保留', async () => {
    const first=render(<App />);
    fireEvent.click(await screen.findByRole('button',{name:'打包'}));
    fireEvent.click(screen.getByRole('checkbox',{name:'行動電源'}));
    expect(screen.getByText(/已準備 1／13/)).toBeTruthy();
    first.unmount();
    render(<App />);
    fireEvent.click(screen.getByRole('button',{name:'打包'}));
    expect((screen.getByRole('checkbox',{name:'行動電源'}) as HTMLInputElement).checked).toBe(true);
  });
});
