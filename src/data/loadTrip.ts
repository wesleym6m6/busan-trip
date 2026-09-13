/**
 * 靜態 JSON adapter：fetch → JSON → validateTripData。
 * 之後若改成 Google Sheets 匯出、Notion 匯出等，只要在建置階段產出同一契約的 JSON 放進 public/data/ 即可，
 * 這個檔案不需要改；不預先建立任何第三方 API 整合。
 */
import { validateTripData, type ValidationIssue } from '../domain/validate';
import type { TripDataset } from '../domain/types';
import { getDataSourceConfig, withBase, type DataSourceConfig } from './config';

export type LoadTripResult =
  | { status: 'ok'; data: TripDataset; warnings: ValidationIssue[]; config: DataSourceConfig }
  | { status: 'error'; kind: 'network' | 'parse' | 'validation' | 'mode-mismatch'; message: string; issues: ValidationIssue[]; config: DataSourceConfig };

export async function loadTripData(
  config: DataSourceConfig = getDataSourceConfig(),
  fetchImpl: typeof fetch = fetch,
): Promise<LoadTripResult> {
  const url = withBase(config.path);
  let response: Response;
  try {
    response = await fetchImpl(url, { cache: 'no-cache' });
  } catch (e) {
    return { status: 'error', kind: 'network', message: `無法讀取資料檔（${url}）：${(e as Error).message}`, issues: [], config };
  }
  if (!response.ok) {
    return { status: 'error', kind: 'network', message: `資料檔回應 ${response.status}（${url}）`, issues: [], config };
  }
  let json: unknown;
  try {
    json = await response.json();
  } catch (e) {
    return { status: 'error', kind: 'parse', message: `資料檔不是合法 JSON：${(e as Error).message}`, issues: [], config };
  }
  const result = validateTripData(json);
  if (!result.ok) {
    return {
      status: 'error',
      kind: 'validation',
      message: `資料驗證失敗（${result.issues.filter((i) => i.severity === 'error').length} 個錯誤）`,
      issues: result.issues,
      config,
    };
  }
  if (config.mode === 'production' && result.data.mode !== 'production') {
    return {
      status: 'error',
      kind: 'mode-mismatch',
      message: '建置為 production 模式，但資料檔標記為 demo。不會以示範資料充當正式行程。',
      issues: [],
      config,
    };
  }
  return { status: 'ok', data: result.data, warnings: result.issues, config };
}
