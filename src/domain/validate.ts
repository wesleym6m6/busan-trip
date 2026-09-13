/**
 * 資料驗證：schema 形狀 + 跨物件規則。
 *
 * 用法：
 *   const result = validateTripData(json);
 *   if (!result.ok) { 顯示 result.issues }
 *   else { 使用 result.data（已加上 id 索引的 TripDataset） }
 *
 * error 會阻止資料被使用；warning 只提示（例如來源尚未核對）。
 */
import { TripDataFileSchema } from './schema';
import type { DayPlan, SourceRef, TimePoint, TripDataFile, TripDataset } from './types';

export type IssueSeverity = 'error' | 'warning';

export interface ValidationIssue {
  severity: IssueSeverity;
  /** 例如 "events[3].start" 或 "days[day-2].sequence[4]" */
  path: string;
  message: string;
}

export type ValidationResult =
  | { ok: true; data: TripDataset; issues: ValidationIssue[] }
  | { ok: false; data: null; issues: ValidationIssue[] };

/** 把 TimePoint 變成可直接字串比較的鍵（同一時區下 "YYYY-MM-DDTHH:mm" 可依字典序比較）。 */
export function timePointKey(tp: TimePoint, fallbackDate: string): string {
  return `${tp.date ?? fallbackDate}T${tp.time}`;
}

function findDuplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) dups.add(id);
    seen.add(id);
  }
  return [...dups];
}

export function buildDataset(file: TripDataFile): TripDataset {
  return {
    ...file,
    placesById: new Map(file.places.map((p) => [p.id, p])),
    areasById: new Map(file.areas.map((a) => [a.id, a])),
    eventsById: new Map(file.events.map((e) => [e.id, e])),
    transitsById: new Map(file.transits.map((t) => [t.id, t])),
    guidesById: new Map(file.guides.map((g) => [g.id, g])),
    daysById: new Map(file.days.map((d) => [d.id, d])),
  };
}

export function validateTripData(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  const parsed = TripDataFileSchema.safeParse(input);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      issues.push({
        severity: 'error',
        path: issue.path.map(String).join('.') || '(root)',
        message: issue.message,
      });
    }
    return { ok: false, data: null, issues };
  }
  const file = parsed.data;
  const err = (path: string, message: string) => issues.push({ severity: 'error', path, message });
  const warn = (path: string, message: string) =>
    issues.push({ severity: 'warning', path, message });

  // --- 根層一致性 ---
  if (file.tripId !== file.trip.id) err('tripId', `tripId (${file.tripId}) 與 trip.id (${file.trip.id}) 不一致`);
  if (file.trip.startDate && file.trip.endDate && file.trip.startDate > file.trip.endDate) {
    err('trip.endDate', '結束日期早於開始日期');
  }

  // --- 重複 id ---
  const collections: Array<[string, string[]]> = [
    ['areas', file.areas.map((x) => x.id)],
    ['places', file.places.map((x) => x.id)],
    ['days', file.days.map((x) => x.id)],
    ['events', file.events.map((x) => x.id)],
    ['transits', file.transits.map((x) => x.id)],
    ['backups', file.backups.map((x) => x.id)],
    ['guides', file.guides.map((x) => x.id)],
    ['tools.airportTransit', file.tools.airportTransit.map((x) => x.id)],
  ];
  for (const [name, ids] of collections) {
    for (const dup of findDuplicates(ids)) err(name, `重複的 id：${dup}`);
  }
  for (const dup of findDuplicates(file.days.map((d) => String(d.dayNumber)))) {
    err('days', `重複的 dayNumber：${dup}`);
  }
  for (const dup of findDuplicates(file.days.map((d) => d.date))) err('days', `重複的日期：${dup}`);

  const dataset = buildDataset(file);
  const { placesById, areasById, daysById, eventsById, transitsById, guidesById } = dataset;

  // --- 引用完整性 ---
  const checkPlace = (path: string, id: string | null) => {
    if (id !== null && !placesById.has(id)) err(path, `找不到地點 id：${id}`);
  };
  const checkArea = (path: string, id: string | null) => {
    if (id !== null && !areasById.has(id)) err(path, `找不到區域 id：${id}`);
  };

  file.places.forEach((p, i) => {
    checkArea(`places[${i}].areaId`, p.areaId);
    if (p.precision === 'exact' && !p.address.ko && !p.address.en && !p.address.zh) {
      err(`places[${i}].address`, 'precision 為 exact 但沒有任何地址');
    }
    if (p.precision === 'unknown' && p.coordinates) {
      warn(`places[${i}].coordinates`, 'precision 為 unknown 卻有座標，請確認精度標記');
    }
    p.images.forEach((img, j) => {
      if (/^https?:\/\//.test(img.src)) {
        warn(`places[${i}].images[${j}].src`, '圖片應放在 public/ 下以相對路徑引用，避免依賴外部主機');
      }
    });
  });

  file.trip.lodgingPlaceIds.forEach((id, i) => {
    checkPlace(`trip.lodgingPlaceIds[${i}]`, id);
    const place = placesById.get(id);
    if (place && place.kind !== 'lodging') err(`trip.lodgingPlaceIds[${i}]`, `地點 ${id} 的 kind 不是 lodging`);
  });

  file.days.forEach((d, i) => {
    d.areaIds.forEach((a, j) => checkArea(`days[${i}].areaIds[${j}]`, a));
    if (file.trip.startDate && d.date < file.trip.startDate) err(`days[${i}].date`, '日期早於行程開始日');
    if (file.trip.endDate && d.date > file.trip.endDate) err(`days[${i}].date`, '日期晚於行程結束日');
  });

  const placedEventIds = new Set<string>();
  const placedTransitIds = new Set<string>();
  file.days.forEach((d, i) => {
    const seen = new Set<string>();
    d.sequence.forEach((item, j) => {
      const path = `days[${i}].sequence[${j}]`;
      const key = `${item.kind}:${item.id}`;
      if (seen.has(key)) err(path, `同一天重複排入 ${key}`);
      seen.add(key);
      if (item.kind === 'event') {
        const ev = eventsById.get(item.id);
        if (!ev) return err(path, `找不到事件 id：${item.id}`);
        if (ev.dayId !== d.id) err(path, `事件 ${item.id} 的 dayId (${ev.dayId}) 與所在日 (${d.id}) 不符`);
        if (placedEventIds.has(item.id)) err(path, `事件 ${item.id} 被排入多天`);
        placedEventIds.add(item.id);
      } else {
        const tr = transitsById.get(item.id);
        if (!tr) return err(path, `找不到交通段落 id：${item.id}`);
        if (tr.dayId !== d.id) err(path, `交通段落 ${item.id} 的 dayId (${tr.dayId}) 與所在日 (${d.id}) 不符`);
        if (placedTransitIds.has(item.id)) err(path, `交通段落 ${item.id} 被排入多天`);
        placedTransitIds.add(item.id);
      }
    });
  });

  file.events.forEach((e, i) => {
    const path = `events[${i}]`;
    const day = daysById.get(e.dayId);
    if (!day) err(`${path}.dayId`, `找不到日期 id：${e.dayId}`);
    if (!placedEventIds.has(e.id)) err(path, `事件 ${e.id} 未排入任何一天的 sequence，UI 不會顯示`);
    checkPlace(`${path}.placeId`, e.placeId);
    if (e.placeId === null && e.title === null) err(`${path}.title`, '沒有 placeId 時必須提供 title');
    e.guideIds.forEach((g, j) => {
      if (!guidesById.has(g)) err(`${path}.guideIds[${j}]`, `找不到攻略 id：${g}`);
    });
    if (e.toolLinks.includes('address-large') && e.placeId === null) {
      err(`${path}.toolLinks`, 'address-large 需要 placeId');
    }
    if (day) {
      checkTimeOrder(e.start, e.end, day, `${path}.end`, '結束時間早於開始時間');
      checkTimeOrder(e.arriveBy, e.start, day, `${path}.arriveBy`, '建議抵達時間晚於開始時間');
      if (e.reservation) {
        checkPlace(`${path}.reservation.meetingPoint.placeId`, e.reservation.meetingPoint.placeId);
        checkTimeOrder(
          e.reservation.arriveBy,
          e.reservation.sessionTime,
          day,
          `${path}.reservation.arriveBy`,
          '預約抵達時間晚於場次時間',
        );
        if (e.reservation.status === 'confirmed' && !e.sources.some((s) => s.type === 'user-provided' || s.type === 'official')) {
          warn(`${path}.reservation.status`, '預約標記為 confirmed，但沒有 user-provided 或 official 來源');
        }
      }
    }
    checkSources(e.sources, `${path}.sources`);
  });

  file.transits.forEach((t, i) => {
    const path = `transits[${i}]`;
    const day = daysById.get(t.dayId);
    if (!day) err(`${path}.dayId`, `找不到日期 id：${t.dayId}`);
    if (!placedTransitIds.has(t.id)) err(path, `交通段落 ${t.id} 未排入任何一天的 sequence`);
    for (const end of ['from', 'to'] as const) {
      const ep = t[end];
      checkPlace(`${path}.${end}.placeId`, ep.placeId);
      if (ep.placeId === null && ep.text === null) err(`${path}.${end}`, '端點需要 placeId 或 text 其中之一');
    }
    if (day) checkTimeOrder(t.depart, t.arrive, day, `${path}.arrive`, '抵達時間早於出發時間');
    if (t.durationMinutes !== null && t.durationMinutes > 24 * 60) warn(`${path}.durationMinutes`, '行進時間超過 24 小時');
    if (t.bufferMinutes !== null && t.bufferMinutes > 180) warn(`${path}.bufferMinutes`, '緩衝超過 3 小時，請確認');
    checkSources(t.sources, `${path}.sources`);
  });

  file.backups.forEach((b, i) => {
    checkPlace(`backups[${i}].placeId`, b.placeId);
    checkSources(b.sources, `backups[${i}].sources`);
  });
  file.guides.forEach((g, i) => {
    g.relatedPlaceIds.forEach((p, j) => checkPlace(`guides[${i}].relatedPlaceIds[${j}]`, p));
    checkSources(g.sources, `guides[${i}].sources`);
  });
  file.places.forEach((p, i) => checkSources(p.sources, `places[${i}].sources`));
  file.tools.airportTransit.forEach((a, i) => checkSources(a.sources, `tools.airportTransit[${i}].sources`));
  file.tools.officialLinks.forEach((l, i) => checkSources([l.source], `tools.officialLinks[${i}].source`));

  // --- demo / production 界線 ---
  if (file.mode === 'production') {
    file.days.forEach((d, i) => {
      if (d.isDemoDate) err(`days[${i}].isDemoDate`, 'production 模式不可含示範日期');
    });
    if (file.trip.startDate === null || file.trip.endDate === null) {
      err('trip.startDate', 'production 模式需提供正式起訖日期');
    }
    const allSources: Array<[string, SourceRef[]]> = [
      ...file.places.map((p, i): [string, SourceRef[]] => [`places[${i}]`, p.sources]),
      ...file.events.map((e, i): [string, SourceRef[]] => [`events[${i}]`, e.sources]),
      ...file.transits.map((t, i): [string, SourceRef[]] => [`transits[${i}]`, t.sources]),
      ...file.backups.map((b, i): [string, SourceRef[]] => [`backups[${i}]`, b.sources]),
      ...file.guides.map((g, i): [string, SourceRef[]] => [`guides[${i}]`, g.sources]),
    ];
    for (const [path, sources] of allSources) {
      if (sources.some((s) => s.type === 'demo')) err(`${path}.sources`, 'production 模式不可含 demo 來源');
    }
  }

  const ok = !issues.some((i) => i.severity === 'error');
  return ok ? { ok: true, data: dataset, issues } : { ok: false, data: null, issues };

  function checkTimeOrder(
    earlier: TimePoint | null,
    later: TimePoint | null,
    day: DayPlan,
    path: string,
    message: string,
  ) {
    if (!earlier || !later) return;
    if (timePointKey(earlier, day.date) > timePointKey(later, day.date)) err(path, message);
  }

  function checkSources(sources: SourceRef[], path: string) {
    sources.forEach((s, i) => {
      if ((s.type === 'demo' || s.type === 'unverified') && s.verifiedAt !== null) {
        err(`${path}[${i}].verifiedAt`, `${s.type} 來源不可有 verifiedAt`);
      }
      if (s.verifiedAt !== null && s.verifiedAt > file.updatedAt) {
        warn(`${path}[${i}].verifiedAt`, 'verifiedAt 晚於 updatedAt，請確認是否為真正核對時間');
      }
    });
  }
}
