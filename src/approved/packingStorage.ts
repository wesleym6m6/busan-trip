import { z } from 'zod/mini';

export type PackingItem = { id: string; label: string };
export type PackingCategory = { id: string; label: string; items: PackingItem[] };
export type PackingState = { version: 2; groups: PackingCategory[]; checked: Record<string, boolean> };
export const PACKING_KEY = 'busan-pack-v2';

const SavedPacking = z.object({
  version: z.literal(2),
  groups: z.array(z.object({
    id: z.string().check(z.minLength(1)), label: z.string().check(z.trim(), z.minLength(1), z.maxLength(32)),
    items: z.array(z.object({ id: z.string().check(z.startsWith('custom-item-')), label: z.string().check(z.trim(), z.minLength(1), z.maxLength(80)) })),
  })),
  checked: z.record(z.string(), z.boolean()),
}).check(z.refine<PackingState>(value => {
  const groupIds = value.groups.map(group => group.id);
  const itemIds = value.groups.flatMap(group => group.items.map(item => item.id));
  return new Set(groupIds).size === groupIds.length && new Set(itemIds).size === itemIds.length;
}));

export function loadPacking(): { model: PackingState; warning: string } {
  const model: PackingState = { version: 2, groups: [], checked: {} };
  let warning = '';
  try {
    const saved = localStorage.getItem(PACKING_KEY);
    if (saved !== null) {
      const parsed = SavedPacking.safeParse(JSON.parse(saved));
      if (parsed.success) return { model: parsed.data, warning };
      warning = '打包紀錄無法讀取，暫時顯示預設清單與可讀取的舊勾選。';
    }
  } catch { warning = '打包紀錄無法讀取，暫時顯示預設清單與可讀取的舊勾選。'; }
  try {
    const old: unknown = JSON.parse(localStorage.getItem('busan-pack-v1') || '{}');
    if (old && typeof old === 'object' && !Array.isArray(old)) {
      model.checked = Object.fromEntries(Object.entries(old).filter(([, value]) => typeof value === 'boolean'));
    }
  } catch { warning ||= '這個瀏覽器無法讀取打包紀錄，目前顯示預設清單。'; }
  return { model, warning };
}

export function savePacking(model: PackingState): boolean {
  try { localStorage.setItem(PACKING_KEY, JSON.stringify(model)); return true; }
  catch { return false; }
}

/** Keep the shipped categories current; save only personal additions and checks. */
export function packingCategories(base: PackingCategory[], model: PackingState): PackingCategory[] {
  const baseIds = new Set(base.map(category => category.id));
  return [
    ...base.map(category => ({ ...category, items: [...category.items, ...(model.groups.find(group => group.id === category.id)?.items || [])] })),
    ...model.groups.filter(group => !baseIds.has(group.id)),
  ];
}
