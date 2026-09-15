/**
 * 命令列資料驗證：npm run validate:data [檔案...]
 * 未指定檔案時驗證 public/data/demo/trip.json 與（若存在）public/data/trip.json。
 * 有 error 時以非零碼結束；warning 只列出。
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateApprovedTripData, validateTripData } from '../src/domain/validate.ts';

const approved = validateApprovedTripData(JSON.parse(readFileSync('src/data/approved-trip.json', 'utf8')));
if (!approved.ok) { console.error(approved.issues); process.exit(1); }
console.log('✓ src/data/approved-trip.json — approved shape and references valid');

const args = process.argv.slice(2);
const targets = args.length > 0 ? args : ['public/data/demo/trip.json', 'public/data/trip.json'].filter((p) => existsSync(p));

if (targets.length === 0) {
  console.error('找不到要驗證的資料檔。');
  process.exit(2);
}

let failed = false;
for (const target of targets) {
  const path = resolve(target);
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    console.error(`✗ ${target}: 無法解析 JSON — ${(e as Error).message}`);
    failed = true;
    continue;
  }
  const result = validateTripData(json);
  const errors = result.issues.filter((i) => i.severity === 'error');
  const warnings = result.issues.filter((i) => i.severity === 'warning');
  console.log(`${result.ok ? '✓' : '✗'} ${target} — ${errors.length} 錯誤, ${warnings.length} 警告`);
  for (const issue of result.issues) {
    console.log(`  [${issue.severity}] ${issue.path}: ${issue.message}`);
  }
  if (result.ok) {
    const d = result.data;
    console.log(`  mode=${d.mode} dataVersion=${d.dataVersion} days=${d.days.length} events=${d.events.length} transits=${d.transits.length} places=${d.places.length} backups=${d.backups.length}`);
  }
  if (!result.ok) failed = true;
}
process.exit(failed ? 1 : 0);
