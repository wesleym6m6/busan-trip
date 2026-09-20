import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('busan-fx-v1', JSON.stringify({ rate: 0.0235, updatedAt: '2026-09-20T00:00:00Z', savedAt: Date.now() }));
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Offline in test')));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function openPacking() {
  const view = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: '打包' }));
  return view;
}
function nameCategory(name: string) {
  fireEvent.click(screen.getByRole('button', { name: '新增分類' }));
  fireEvent.change(screen.getByRole('textbox', { name: '分類名稱' }), { target: { value: name } });
  fireEvent.click(screen.getByRole('button', { name: '建立分類' }));
}
function addItem(name: string) {
  fireEvent.change(screen.getByRole('textbox', { name: '新增項目名稱' }), { target: { value: name } });
  fireEvent.click(screen.getByRole('button', { name: '加入' }));
}

describe('個人打包清單', () => {
  it('keeps old checks while saving a new category and its items across reloads', () => {
    localStorage.setItem('busan-pack-v1', JSON.stringify({ powerbank: true }));
    const first = openPacking();
    expect((screen.getByRole('checkbox', { name: '行動電源' }) as HTMLInputElement).checked).toBe(true);
    nameCategory(' 隨身包 ');
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: '新增項目名稱' }));
    addItem(' 耳塞 ');
    fireEvent.click(screen.getByRole('checkbox', { name: '耳塞' }));
    expect(screen.getByText(/已準備 2／14/)).toBeTruthy();
    first.unmount();
    openPacking();
    expect(screen.getByRole('heading', { name: '隨身包' })).toBeTruthy();
    expect((screen.getByRole('checkbox', { name: '耳塞' }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole('checkbox', { name: '行動電源' }) as HTMLInputElement).checked).toBe(true);
  });

  it('adds consecutive items to an existing category without closing the input', () => {
    const first = openPacking();
    fireEvent.click(screen.getByRole('button', { name: '新增項目至手機與電子' }));
    addItem('相機');
    const input = screen.getByRole('textbox', { name: '新增項目名稱' });
    expect((input as HTMLInputElement).value).toBe('');
    expect(document.activeElement).toBe(input);
    addItem('相機電池');
    expect(within(screen.getByRole('region', { name: '手機與電子' })).getAllByRole('checkbox')).toHaveLength(5);
    first.unmount();
    openPacking();
    expect(within(screen.getByRole('region', { name: '手機與電子' })).getByRole('checkbox', { name: '相機電池' })).toBeTruthy();
  });

  it('returns focus to the new category after finishing its items', async () => {
    openPacking(); nameCategory('隨身包'); addItem('耳塞');
    fireEvent.click(screen.getByRole('button', { name: '完成' }));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: '新增項目至隨身包' })));
  });

  it('rejects whitespace and duplicate names without adding empty rows', () => {
    openPacking();
    fireEvent.click(screen.getByRole('button', { name: '新增分類' }));
    const input = screen.getByRole('textbox', { name: '分類名稱' });
    fireEvent.change(input, { target: { value: '   ' } });
    expect((screen.getByRole('button', { name: '建立分類' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(input, { target: { value: '手機與電子' } });
    fireEvent.click(screen.getByRole('button', { name: '建立分類' }));
    expect(screen.getByRole('alert').textContent).toContain('同名分類');
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    fireEvent.click(screen.getByRole('button', { name: '新增項目至手機與電子' }));
    addItem(' 行動電源 ');
    expect(screen.getByRole('alert').textContent).toContain('同名項目');
    expect(screen.getAllByRole('checkbox')).toHaveLength(13);
  });

  it('renames a custom category and item without losing the check', () => {
    const first = openPacking();
    nameCategory('隨身包'); addItem('耳塞');
    fireEvent.click(screen.getByRole('button', { name: '完成' }));
    fireEvent.click(screen.getByRole('checkbox', { name: '耳塞' }));
    fireEvent.click(screen.getByRole('button', { name: '編輯清單' }));
    fireEvent.click(screen.getByRole('button', { name: '改名分類隨身包' }));
    fireEvent.change(screen.getByRole('textbox', { name: '分類名稱' }), { target: { value: '登機包' } });
    fireEvent.click(screen.getByRole('button', { name: '儲存' }));
    fireEvent.click(screen.getByRole('button', { name: '改名項目耳塞' }));
    fireEvent.change(screen.getByRole('textbox', { name: '項目名稱' }), { target: { value: '降噪耳塞' } });
    fireEvent.click(screen.getByRole('button', { name: '儲存' }));
    first.unmount(); openPacking();
    expect(within(screen.getByRole('region', { name: '登機包' })).getByRole('checkbox', { name: '降噪耳塞' })).toBeTruthy();
    expect((screen.getByRole('checkbox', { name: '降噪耳塞' }) as HTMLInputElement).checked).toBe(true);
  });

  it('restores a removed category with all its checked items and saves that restoration', () => {
    const first = openPacking();
    nameCategory('隨身包'); addItem('耳塞'); addItem('眼罩');
    fireEvent.click(screen.getByRole('button', { name: '完成' }));
    fireEvent.click(screen.getByRole('checkbox', { name: '眼罩' }));
    fireEvent.click(screen.getByRole('button', { name: '編輯清單' }));
    fireEvent.click(screen.getByRole('button', { name: '移除分類隨身包' }));
    expect(screen.queryByRole('heading', { name: '隨身包' })).toBeNull();
    expect(screen.getByText(/已準備 0／13/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '復原' }));
    first.unmount(); openPacking();
    expect(screen.getByText(/已準備 1／15/)).toBeTruthy();
    expect((screen.getByRole('checkbox', { name: '眼罩' }) as HTMLInputElement).checked).toBe(true);
  });

  it('removes only the selected custom item and allows undo', () => {
    openPacking();
    fireEvent.click(screen.getByRole('button', { name: '新增項目至手機與電子' }));
    addItem('相機'); addItem('相機電池');
    fireEvent.click(screen.getByRole('button', { name: '完成' }));
    fireEvent.click(screen.getByRole('button', { name: '編輯清單' }));
    fireEvent.click(screen.getByRole('button', { name: '移除項目相機' }));
    expect(screen.queryByRole('checkbox', { name: '相機' })).toBeNull();
    expect(screen.getByRole('checkbox', { name: '相機電池' })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: '行動電源' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '復原' }));
    expect(screen.getByRole('checkbox', { name: '相機' })).toBeTruthy();
  });

  it('does not submit while a Chinese input composition is active', () => {
    openPacking(); nameCategory('隨身包');
    const input = screen.getByRole('textbox', { name: '新增項目名稱' });
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: '口罩' } });
    fireEvent.submit(input.closest('form')!);
    expect(screen.queryByRole('checkbox', { name: '口罩' })).toBeNull();
    fireEvent.compositionEnd(input);
    fireEvent.submit(input.closest('form')!);
    expect(screen.getByRole('checkbox', { name: '口罩' })).toBeTruthy();
  });

  it('reports unavailable storage and keeps the current list when switching tabs', () => {
    openPacking();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); });
    nameCategory('隨身包'); addItem('耳塞');
    expect(screen.getByRole('alert').textContent).toContain('無法儲存');
    fireEvent.click(screen.getByRole('button', { name: '行程' }));
    fireEvent.click(screen.getByRole('button', { name: '打包' }));
    expect(screen.getByRole('checkbox', { name: '耳塞' })).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain('重新整理');
  });

  it('opens safely with malformed saved data and recovers valid legacy checks', () => {
    localStorage.setItem('busan-pack-v2', '{broken');
    localStorage.setItem('busan-pack-v1', JSON.stringify({ powerbank: true, passport: 'false' }));
    openPacking();
    expect((screen.getByRole('checkbox', { name: '行動電源' }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole('checkbox', { name: '護照（效期 6 個月以上）' }) as HTMLInputElement).checked).toBe(false);
    expect(screen.getAllByRole('checkbox')).toHaveLength(13);
    expect(screen.getByRole('alert').textContent).toContain('無法讀取');
  });

  it('blocks a stale tab from overwriting another tab additions before its storage event arrives', () => {
    const first = render(<App />);
    const second = render(<App />);
    const a = within(first.container), b = within(second.container);
    fireEvent.click(a.getByRole('button', { name: '打包' }));
    fireEvent.click(a.getByRole('button', { name: '新增分類' }));
    fireEvent.change(a.getByRole('textbox', { name: '分類名稱' }), { target: { value: '隨身包' } });
    fireEvent.click(a.getByRole('button', { name: '建立分類' }));
    fireEvent.change(a.getByRole('textbox', { name: '新增項目名稱' }), { target: { value: '耳塞' } });
    fireEvent.click(a.getByRole('button', { name: '加入' }));
    const savedByA = localStorage.getItem('busan-pack-v2');
    fireEvent.click(b.getByRole('button', { name: '打包' }));
    fireEvent.click(b.getByRole('checkbox', { name: '行動電源' }));
    expect(localStorage.getItem('busan-pack-v2')).toBe(savedByA);
    expect(b.getByRole('checkbox', { name: '耳塞' })).toBeTruthy();
    expect(b.getByRole('alert').textContent).toContain('另一個分頁');
    fireEvent.click(b.getByRole('checkbox', { name: '行動電源' }));
    first.unmount(); second.unmount(); openPacking();
    expect(screen.getByRole('checkbox', { name: '耳塞' })).toBeTruthy();
    expect((screen.getByRole('checkbox', { name: '行動電源' }) as HTMLInputElement).checked).toBe(true);
  });

  it('receives another tab updates while preserving the text being entered', () => {
    const first = openPacking();
    fireEvent.click(screen.getByRole('button', { name: '新增分類' }));
    fireEvent.change(screen.getByRole('textbox', { name: '分類名稱' }), { target: { value: '還在輸入的分類' } });
    const external = JSON.stringify({ version: 2, groups: [{ id: 'custom-category-other', label: '相機包', items: [{ id: 'custom-item-lens', label: '鏡頭' }] }], checked: { powerbank: true } });
    localStorage.setItem('busan-pack-v2', external);
    fireEvent(window, new StorageEvent('storage', { key: 'busan-pack-v2', newValue: external, storageArea: localStorage }));
    expect(screen.getByRole('checkbox', { name: '鏡頭' })).toBeTruthy();
    expect((screen.getByRole('textbox', { name: '分類名稱' }) as HTMLInputElement).value).toBe('還在輸入的分類');
    fireEvent.click(screen.getByRole('button', { name: '建立分類' }));
    first.unmount(); openPacking();
    expect(screen.getByRole('heading', { name: '相機包' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: '還在輸入的分類' })).toBeTruthy();
  });
});
