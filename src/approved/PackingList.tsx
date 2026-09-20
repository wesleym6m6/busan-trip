import { useEffect, useId, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import { loadPacking, PACKING_KEY, packingCategories, savePacking, type PackingCategory, type PackingState } from './packingStorage';
import './packing-list.css';

type Editor = { kind: 'category' | 'item'; categoryId?: string; itemId?: string; value?: string };
type Undo = { model: PackingState; label: string };
const sameName = (a: string, b: string) => a.trim().normalize().toLowerCase() === b.trim().normalize().toLowerCase();

function NameForm({ label, initial = '', submitLabel, onSave, onClose, keepOpen = false }: {
  label: string; initial?: string; submitLabel: string;
  onSave: (value: string) => string | undefined; onClose: () => void; keepOpen?: boolean;
}) {
  const id = useId();
  const [value, setValue] = useState(initial);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const composing = useRef(false);
  useEffect(() => {
    input.current?.focus({ preventScroll: true });
    form.current?.scrollIntoView({ block: 'nearest' });
  }, []);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (composing.current) return;
    const problem = onSave(value.trim());
    if (problem) { setError(problem); input.current?.focus(); return; }
    setError('');
    if (keepOpen) {
      setValue(''); input.current?.focus({ preventScroll: true });
      requestAnimationFrame(() => form.current?.scrollIntoView({ block: 'nearest' }));
    }
  };
  return <form ref={form} className="packing-form" onSubmit={submit} onKeyDown={event => {
    if (event.key === 'Escape' && !composing.current) onClose();
    if (event.key === 'Enter' && (composing.current || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)) event.preventDefault();
  }}>
    <label htmlFor={id}>{label}</label>
    <input id={id} ref={input} autoFocus value={value} maxLength={label === '分類名稱' ? 32 : 80}
      placeholder={label === '分類名稱' ? '例如：隨身包' : '例如：耳塞'}
      autoComplete="off" enterKeyHint={keepOpen ? 'done' : 'go'}
      aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined}
      onChange={event => { setValue(event.target.value); setError(''); }}
      onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} />
    {error && <p id={`${id}-error`} className="packing-error" role="alert">{error}</p>}
    <div className="packing-form-actions">
      <button type="submit" className="packing-primary" disabled={!value.trim()}>{submitLabel}</button>
      <button type="button" onClick={onClose}>{keepOpen ? '完成' : '取消'}</button>
    </div>
  </form>;
}

export function PackingList({ baseCategories }: { baseCategories: PackingCategory[] }) {
  const [loaded] = useState(loadPacking);
  const [model, setModel] = useState(loaded.model);
  const [warning, setWarning] = useState(loaded.warning);
  const [editing, setEditing] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [undo, setUndo] = useState<Undo | null>(null);
  const savedSnapshot = useRef(loaded.serialized);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  const addItemButtons = useRef(new Map<string, HTMLButtonElement>());
  const categories = packingCategories(baseCategories, model);
  const total = categories.reduce((sum, category) => sum + category.items.length, 0);
  const done = categories.reduce((sum, category) => sum + category.items.filter(item => model.checked[item.id]).length, 0);
  const baseIds = new Set(baseCategories.map(category => category.id));

  useEffect(() => {
    const refresh = (event: StorageEvent) => {
      if (event.storageArea !== localStorage || (event.key !== PACKING_KEY && event.key !== null)) return;
      const latest = loadPacking();
      savedSnapshot.current = latest.serialized;
      setModel(latest.model);
      setWarning(latest.warning);
      setUndo(null);
    };
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  const commit = (next: PackingState, removed?: string) => {
    const result = savePacking(next, savedSnapshot.current);
    if (result.status === 'conflict') {
      savedSnapshot.current = result.latest.serialized;
      setModel(result.latest.model);
      setWarning('清單剛在另一個分頁更新，已載入最新版，請再操作一次。');
      setUndo(null);
      return false;
    }
    setUndo(removed ? { model, label: removed } : null);
    setModel(next);
    if (result.status === 'saved') savedSnapshot.current = result.serialized;
    setWarning(result.status === 'saved' ? '' : '這個瀏覽器目前無法儲存。新增內容與勾選暫時留在這個頁面，重新整理後可能消失。');
    return true;
  };
  const startEditor = (next: Editor, event: MouseEvent<HTMLButtonElement>) => {
    returnFocus.current = event.currentTarget;
    setEditor(next);
  };
  const closeEditor = () => {
    setEditor(null);
    if (editor?.kind === 'item' && !editor.itemId) {
      requestAnimationFrame(() => addItemButtons.current.get(editor.categoryId!)?.focus({ preventScroll: true }));
    } else returnFocus.current?.focus({ preventScroll: true });
  };

  const saveName = (value: string): string | undefined => {
    if (!editor) return;
    if (!value) return '請先輸入名稱。';
    if (value.length > (editor.kind === 'category' ? 32 : 80)) return '名稱太長了，請縮短一點。';
    if (editor.kind === 'category') {
      if (categories.some(category => category.id !== editor.categoryId && sameName(category.label, value))) return '已經有同名分類，換個名稱吧。';
      if (editor.categoryId) {
        if (!commit({ ...model, groups: model.groups.map(group => group.id === editor.categoryId ? { ...group, label: value } : group) })) return '清單已更新，請再按一次。';
        closeEditor();
      } else {
        const id = `custom-category-${crypto.randomUUID()}`;
        if (!commit({ ...model, groups: [...model.groups, { id, label: value, items: [] }] })) return '清單已更新，請再按一次。';
        setEditor({ kind: 'item', categoryId: id });
      }
    } else {
      const category = categories.find(category => category.id === editor.categoryId);
      if (!category) return '找不到這個分類，請重新選擇。';
      if (category.items.some(item => item.id !== editor.itemId && sameName(item.label, value))) return '這個分類已經有同名項目。';
      const personalGroup = model.groups.find(group => group.id === category.id) || { id: category.id, label: category.label, items: [] };
      const nextGroup = { ...personalGroup, items: editor.itemId
        ? personalGroup.items.map(item => item.id === editor.itemId ? { ...item, label: value } : item)
        : [...personalGroup.items, { id: `custom-item-${crypto.randomUUID()}`, label: value }] };
      if (!commit({ ...model, groups: model.groups.some(group => group.id === category.id)
        ? model.groups.map(group => group.id === category.id ? nextGroup : group) : [...model.groups, nextGroup] })) return '清單已更新，請再按一次。';
      if (editor.itemId) closeEditor();
    }
  };

  const remove = (categoryId: string, label: string, itemId?: string) => {
    const removedIds = itemId ? [itemId] : model.groups.find(group => group.id === categoryId)?.items.map(item => item.id) || [];
    const checked = Object.fromEntries(Object.entries(model.checked).filter(([id]) => !removedIds.includes(id)));
    const groups = itemId
      ? model.groups.map(group => group.id === categoryId ? { ...group, items: group.items.filter(item => item.id !== itemId) } : group)
      : model.groups.filter(group => group.id !== categoryId);
    if (!commit({ ...model, groups, checked }, label)) return;
    setEditor(null);
    editButton.current?.focus({ preventScroll: true });
  };
  const renderEditor = () => editor && <NameForm key={`${editor.kind}-${editor.categoryId || 'new'}-${editor.itemId || ''}`}
    label={editor.kind === 'category' ? '分類名稱' : editor.itemId ? '項目名稱' : '新增項目名稱'}
    initial={editor.value} submitLabel={editor.value !== undefined ? '儲存' : editor.kind === 'category' ? '建立分類' : '加入'}
    onSave={saveName} onClose={closeEditor} keepOpen={editor.kind === 'item' && !editor.itemId} />;

  return <div className="packing-list">
    <div className="packing-heading">
      <h2>我的打包清單</h2>
      <button ref={editButton} type="button" className="packing-edit" aria-pressed={editing} onClick={() => { setEditing(!editing); setEditor(null); }}>{editing ? '完成編輯' : '編輯清單'}</button>
    </div>
    <p className="packing-progress">已準備 {done}／{total}</p>
    <p className="packing-hint">新增內容與勾選只保存在這個瀏覽器。</p>
    <button type="button" className="packing-add-category" aria-expanded={editor?.kind === 'category' && !editor.categoryId} onClick={event => startEditor({ kind: 'category' }, event)}><span aria-hidden="true">＋</span>新增分類</button>
    {editor?.kind === 'category' && !editor.categoryId && renderEditor()}
    {warning && <p className="packing-warning" role="alert">{warning}</p>}
    {undo && <div className="packing-undo" role="status"><span>已移除「{undo.label}」</span><button type="button" onClick={() => commit(undo.model)}>復原</button></div>}
    {editing && <p className="packing-hint">可以修改自己新增的分類與項目。</p>}
    <div className="packing-categories">
      {categories.map(category => <section key={category.id} className="packing-category" aria-labelledby={`packing-${category.id}`}>
        <div className="packing-category-heading">
          <h3 id={`packing-${category.id}`}>{category.label}</h3>
          {editing && !baseIds.has(category.id) && <div className="packing-row-actions">
            <button type="button" aria-label={`改名分類${category.label}`} onClick={event => startEditor({ kind: 'category', categoryId: category.id, value: category.label }, event)}>改名</button>
            <button type="button" className="packing-remove" aria-label={`移除分類${category.label}`} onClick={() => remove(category.id, category.label)}>移除</button>
          </div>}
        </div>
        {editor?.kind === 'category' && editor.categoryId === category.id && renderEditor()}
        <div className="packing-items">
          {category.items.map(item => <div key={item.id} className="packing-item">
            <label>
              <input type="checkbox" checked={!!model.checked[item.id]} onChange={() => commit({ ...model, checked: { ...model.checked, [item.id]: !model.checked[item.id] } })} />
              <span className={model.checked[item.id] ? 'packing-checked' : undefined}>{item.label}</span>
            </label>
            {editing && item.id.startsWith('custom-item-') && <div className="packing-row-actions">
              <button type="button" aria-label={`改名項目${item.label}`} onClick={event => startEditor({ kind: 'item', categoryId: category.id, itemId: item.id, value: item.label }, event)}>改名</button>
              <button type="button" className="packing-remove" aria-label={`移除項目${item.label}`} onClick={() => remove(category.id, item.label, item.id)}>移除</button>
            </div>}
          </div>)}
        </div>
        {editor?.kind === 'item' && editor.categoryId === category.id ? renderEditor()
          : <button type="button" ref={node => { if (node) addItemButtons.current.set(category.id, node); else addItemButtons.current.delete(category.id); }} className="packing-add-item" aria-label={`新增項目至${category.label}`} onClick={event => startEditor({ kind: 'item', categoryId: category.id }, event)}><span aria-hidden="true">＋</span>新增項目</button>}
      </section>)}
    </div>
  </div>;
}
