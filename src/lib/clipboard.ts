/**
 * 複製文字。回傳 'copied' 或 'failed'；失敗時呼叫端要保留可選取文字並提示手動複製，
 * 不可顯示假的成功訊息。
 */
export type CopyResult = 'copied' | 'failed';

export async function copyText(text: string): Promise<CopyResult> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return 'copied';
    }
  } catch {
    // 落到舊式 fallback
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok ? 'copied' : 'failed';
  } catch {
    return 'failed';
  }
}
