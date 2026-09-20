/**
 * 資料契約（單一事實來源）。
 *
 * - 所有型別由這裡的 zod schema 推導（見 ./types.ts），UI 只消費這份契約。
 * - 語意規則（null / 空陣列 / 0 的差異、時區、來源狀態）寫在 docs/ARCHITECTURE_AND_DATA.md，
 *   這裡的註解只說明欄位用途。
 * - 跨物件規則（重複 id、無效引用、時間先後）在 ./validate.ts 做，schema 只管單一物件形狀。
 * - 使用 zod/mini（可 tree-shake，bundle 明顯較小）；寫法為函式式：z.nullable(x)、x.check(z.minLength(1))。
 */
import { z } from 'zod/mini';

/** 非空字串：id、名稱等必要欄位共用。 */
const NonEmptyString = z.string().check(z.minLength(1, '不可為空字串'));

/** 當地日期（行程時區），格式 YYYY-MM-DD。 */
export const LocalDateSchema = z.iso.date();

/** 當地時間（行程時區），24 小時制 HH:mm。 */
export const LocalTimeSchema = z.string().check(z.regex(/^([01]\d|2[0-3]):[0-5]\d$/, '時間需為 HH:mm（24 小時制）'));

/**
 * 時間點：以「當地日期 + 當地時間」表達，時區由 Trip.timezone 決定。
 * date 省略或 null 時代表所屬 DayPlan 的日期；跨日（例如深夜抵達）時明確寫出 date。
 * 含 offset 的 ISO 時間戳由 lib/dates.ts 依需要推導，不重複儲存。
 */
export const TimePointSchema = z.object({
  date: z.optional(z.nullable(LocalDateSchema)),
  time: LocalTimeSchema,
});

/** ISO 8601 時間戳，必須含 offset 或 Z（例如 2026-09-13T10:00:00+09:00）。 */
export const IsoDateTimeSchema = z.iso.datetime({ offset: true });

/** 以 http(s) 開頭的絕對 URL。 */
export const HttpUrlSchema = z.url({ protocol: /^https?$/, error: '需為 http(s) 開頭的絕對 URL' }).check(z.maxLength(2048));

/**
 * 資料來源。verifiedAt 只能填「真正核對」的時間；產生檔案的時間不算。
 * type：
 * - official：官方網站／官方公告
 * - user-provided：使用者提供（訂單、截圖、口述）
 * - web：非官方網頁（部落格、地圖服務頁）
 * - demo：示範資料，內容不可視為事實
 * - unverified：有來源方向但尚未核對
 */
export const SourceRefSchema = z.object({
  type: z.enum(['official', 'user-provided', 'web', 'demo', 'unverified']),
  label: NonEmptyString,
  url: z.nullable(HttpUrlSchema),
  verifiedAt: z.nullable(IsoDateTimeSchema),
  note: z.nullable(z.string()),
});

export const MultilingualNameSchema = z.object({
  zh: NonEmptyString,
  ko: z.nullable(NonEmptyString),
  en: z.nullable(NonEmptyString),
});

export const MultilingualAddressSchema = z.object({
  ko: z.nullable(NonEmptyString),
  zh: z.nullable(NonEmptyString),
  en: z.nullable(NonEmptyString),
});

/**
 * 位置精度：
 * - exact：門牌級，可放進司機用地址畫面
 * - approximate：大概位置（例如某條街），不可當精確地址
 * - area-only：只知道區域
 * - unknown：位置未提供
 */
export const LocationPrecisionSchema = z.enum(['exact', 'approximate', 'area-only', 'unknown']);

export const CoordinatesSchema = z.object({
  lat: z.number().check(z.gte(-90), z.lte(90)),
  lng: z.number().check(z.gte(-180), z.lte(180)),
});

/** 經核對的地圖連結；沒有就 null，UI 會改提供明確標示的「搜尋」入口。 */
export const MapLinksSchema = z.object({
  naver: z.nullable(HttpUrlSchema),
  kakao: z.nullable(HttpUrlSchema),
  google: z.nullable(HttpUrlSchema),
});

/** 圖片引用：路徑相對於 public/，必須帶尺寸以避免 layout shift；需記錄來源／授權。 */
export const ImageRefSchema = z.object({
  src: NonEmptyString,
  alt: z.string(),
  width: z.int().check(z.positive()),
  height: z.int().check(z.positive()),
  caption: z.nullable(z.string()),
  credit: z.nullable(z.string()),
});

export const AreaSchema = z.object({
  id: NonEmptyString,
  name: MultilingualNameSchema,
});

export const PlaceKindSchema = z.enum([
  'sight',
  'food',
  'cafe',
  'lodging',
  'transport',
  'shop',
  'activity',
  'other',
]);

export const PlaceSchema = z.object({
  id: NonEmptyString,
  kind: PlaceKindSchema,
  name: MultilingualNameSchema,
  areaId: z.nullable(NonEmptyString),
  address: MultilingualAddressSchema,
  precision: LocationPrecisionSchema,
  coordinates: z.nullable(CoordinatesSchema),
  mapLinks: MapLinksSchema,
  images: z.array(ImageRefSchema),
  /** 營業時間等自由文字；未知就 null，不推測。 */
  hours: z.nullable(z.string()),
  notes: z.nullable(z.string()),
  sources: z.array(SourceRefSchema),
});

/** 金額：null = 未知；amount 0 = 免費。兩者在 UI 上顯示不同。 */
export const MoneySchema = z.object({
  amount: z.number().check(z.nonnegative()),
  currency: z.enum(['KRW', 'TWD', 'USD', 'JPY']),
  note: z.nullable(z.string()),
});

/**
 * 預約資訊。status 描述「預約本身」的狀態，與資料是否經核對（SourceRef）無關。
 * - confirmed：已確認有票／有位
 * - pending：已排入計畫但尚未買到或尚未確認
 * - unknown：不確定是否需要預約或狀態不明
 * - not-required：不需預約
 */
export const ReservationStatusSchema = z.enum(['confirmed', 'pending', 'unknown', 'not-required']);

export const ReservationGroupSchema = z.object({
  label: NonEmptyString,
  /** 可公開顯示的成員名稱或代號；不要放全名以外的個資。 */
  members: z.array(NonEmptyString),
});

export const ReservationInfoSchema = z.object({
  status: ReservationStatusSchema,
  provider: z.nullable(z.string()),
  /** 場次／搭乘時間，與抵達要求分開。 */
  sessionTime: z.nullable(TimePointSchema),
  /** 建議或要求抵達時間。 */
  arriveBy: z.nullable(TimePointSchema),
  /** 抵達規則的文字說明，例如「建議提前 20 分鐘取票」。 */
  arrivalRule: z.nullable(z.string()),
  meetingPoint: z.object({
    placeId: z.nullable(NonEmptyString),
    text: z.nullable(z.string()),
  }),
  /** 分組安排；null = 未安排或不公開；[] = 明確沒有分組。 */
  groups: z.nullable(z.array(ReservationGroupSchema)),
  /** 可公開的備註。訂單編號、QR code、密碼等一律不得放這裡。 */
  publicNotes: z.nullable(z.string()),
});

export const EventTypeSchema = z.enum([
  'sight',
  'meal',
  'cafe',
  'activity',
  'transport',
  'lodging',
  'free',
  'note',
]);

/** 事件上可直接開啟的工具入口。 */
export const ToolLinkSchema = z.enum(['address-large', 'lodging']);

export const ItineraryEventSchema = z.object({
  id: NonEmptyString,
  dayId: NonEmptyString,
  type: EventTypeSchema,
  /** 綁定地點時透過 id 引用，避免地址在不同頁面不一致；自由活動等可為 null。 */
  placeId: z.nullable(NonEmptyString),
  /** 顯示標題；null 時採用地點的繁中名稱。 */
  title: z.nullable(NonEmptyString),
  start: z.nullable(TimePointSchema),
  end: z.nullable(TimePointSchema),
  /** 建議抵達時間（與開始時間不同時才填）。 */
  arriveBy: z.nullable(TimePointSchema),
  /** 一句必要摘要，收合狀態也會顯示。 */
  summary: NonEmptyString,
  /** 展開後的補充說明。 */
  notes: z.nullable(z.string()),
  /** 短標籤，例如「需預約」「室內」；克制使用。 */
  tags: z.array(NonEmptyString),
  cost: z.nullable(MoneySchema),
  reservation: z.nullable(ReservationInfoSchema),
  guideIds: z.array(NonEmptyString),
  toolLinks: z.array(ToolLinkSchema),
  sources: z.array(SourceRefSchema),
});

export const TransitModeSchema = z.enum([
  'walk',
  'metro',
  'bus',
  'taxi',
  'train',
  'airport-bus',
  'light-rail',
  'ferry',
  'car',
  'other',
]);

/** 交通段落的端點：地點 id 或自由文字，至少其中一個。 */
export const TransitEndpointSchema = z.object({
  placeId: z.nullable(NonEmptyString),
  text: z.nullable(NonEmptyString),
});

export const TransitLegSchema = z.object({
  id: NonEmptyString,
  dayId: NonEmptyString,
  from: TransitEndpointSchema,
  to: TransitEndpointSchema,
  mode: TransitModeSchema,
  /** 路線／班次的簡短描述，例如「地鐵 2 號線 → 海雲台站」。 */
  label: z.nullable(z.string()),
  depart: z.nullable(TimePointSchema),
  arrive: z.nullable(TimePointSchema),
  /** 行進時間（分鐘）；null = 未知。 */
  durationMinutes: z.nullable(z.int().check(z.nonnegative())),
  /** true 時 UI 顯示「約／估計」。 */
  isEstimate: z.boolean(),
  /** 額外緩衝（分鐘）；null = 未設定。 */
  bufferMinutes: z.nullable(z.int().check(z.nonnegative())),
  cost: z.nullable(MoneySchema),
  notes: z.nullable(z.string()),
  sources: z.array(SourceRefSchema),
});

/** 時間軸排序：明確列出事件與交通段落的順序，不靠開始時間推算（未知時間也能排）。 */
export const SequenceItemSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('event'), id: NonEmptyString }),
  z.object({ kind: z.literal('transit'), id: NonEmptyString }),
]);

export const DayPlanSchema = z.object({
  id: NonEmptyString,
  dayNumber: z.int().check(z.positive()),
  date: LocalDateSchema,
  /** true 表示日期為示範假設，正式行程確認後應改為 false。 */
  isDemoDate: z.boolean(),
  title: NonEmptyString,
  areaIds: z.array(NonEmptyString),
  summary: z.nullable(z.string()),
  /** 當日必看提醒（例如集合、預約），簡短條列。 */
  reminders: z.array(NonEmptyString),
  sequence: z.array(SequenceItemSchema),
});

export const BackupCategorySchema = z.enum(['food', 'cafe', 'indoor', 'sight', 'shop', 'other']);

export const BackupOptionSchema = z.object({
  id: NonEmptyString,
  placeId: NonEmptyString,
  category: BackupCategorySchema,
  /** 適合情境的一句話，例如「下雨時可待 2 小時」。 */
  suitableFor: NonEmptyString,
  /** 雨天是否適合：null = 未標記（UI 不提供雨天篩選判斷）。 */
  rainOk: z.nullable(z.boolean()),
  notes: z.nullable(z.string()),
  sources: z.array(SourceRefSchema),
});

export const GuideCategorySchema = z.enum(['transport', 'food', 'tips', 'area', 'reservation']);

export const GuideEntrySchema = z.object({
  id: NonEmptyString,
  title: NonEmptyString,
  category: GuideCategorySchema,
  /** 純文字，段落以空行分隔；不支援 HTML。 */
  body: NonEmptyString,
  relatedPlaceIds: z.array(NonEmptyString),
  sources: z.array(SourceRefSchema),
});

export const LinkRefSchema = z.object({
  label: NonEmptyString,
  url: HttpUrlSchema,
  note: z.nullable(z.string()),
  source: SourceRefSchema,
});

export const AirportTransitOptionSchema = z.object({
  id: NonEmptyString,
  mode: TransitModeSchema,
  title: NonEmptyString,
  summary: NonEmptyString,
  durationMinutes: z.nullable(z.int().check(z.nonnegative())),
  isEstimate: z.boolean(),
  cost: z.nullable(MoneySchema),
  link: z.nullable(LinkRefSchema),
  sources: z.array(SourceRefSchema),
});

export const ToolsContentSchema = z.object({
  airportTransit: z.array(AirportTransitOptionSchema),
  officialLinks: z.array(LinkRefSchema),
});

export const TripSchema = z.object({
  id: NonEmptyString,
  name: NonEmptyString,
  /** 短名，例如 "BUSAN"，用於頁首小標。 */
  shortName: NonEmptyString,
  locale: z.literal('zh-TW'),
  timezone: z.literal('Asia/Seoul'),
  /** 正式起訖日期；未知可 null（示範資料通常為 null，日期只存在於 DayPlan）。 */
  startDate: z.nullable(LocalDateSchema),
  endDate: z.nullable(LocalDateSchema),
  /** 住宿地點 id（可多個，例如換飯店）。 */
  lodgingPlaceIds: z.array(NonEmptyString),
});

/** 根層資料檔。 */
export const TripDataFileSchema = z.object({
  schemaVersion: z.literal(1),
  tripId: NonEmptyString,
  dataVersion: NonEmptyString,
  updatedAt: IsoDateTimeSchema,
  /** demo：示範資料（UI 顯示標籤）；production：正式資料。 */
  mode: z.enum(['demo', 'production']),
  trip: TripSchema,
  areas: z.array(AreaSchema),
  places: z.array(PlaceSchema),
  days: z.array(DayPlanSchema),
  events: z.array(ItineraryEventSchema),
  transits: z.array(TransitLegSchema),
  backups: z.array(BackupOptionSchema),
  guides: z.array(GuideEntrySchema),
  tools: ToolsContentSchema,
});

/** 僅存本機的偏好，不進入資料檔。 */
export const AppPreferencesSchema = z.object({
  /** 裝飾動畫開關；系統 prefers-reduced-motion 仍優先。 */
  motion: z.boolean(),
  lastViewedDayId: z.nullable(NonEmptyString),
});

/** 2026-09-15 使用者定案的 Claude 匯出資料；舊版 TripDataSchema 保留給歷史模組。 */
const ApprovedItemSchema = z.object({
  time: z.string(), title: NonEmptyString, kind: z.enum(['event', 'transit']),
  status: z.optional(z.enum(['booked', 'tentative', 'flexible'])),
  steps: z.optional(z.array(z.string())), note: z.optional(z.string()), placeKey: z.optional(z.string()),
  visitMinutes: z.optional(z.object({min: z.int().check(z.positive()), max: z.int().check(z.positive())})),
});
export const ApprovedTripSchema = z.object({
  trip: z.object({ name: NonEmptyString, dateRange: NonEmptyString }),
  days: z.array(z.object({ id: NonEmptyString, dayNumber: z.number(), date: LocalDateSchema,
    weekday: z.string(), dateLabel: z.string(), summary: NonEmptyString, image: z.optional(z.string()),
    items: z.array(ApprovedItemSchema), })).check(z.minLength(1)),
  backupGroups: z.array(z.object({ dayId: NonEmptyString, label: z.string(), items: z.array(z.object({
    mainPlaceKey: NonEmptyString, backupPlaceKey: NonEmptyString,
    otherPlaceKeys: z.optional(z.array(NonEmptyString)), note: z.string(),
  })) })),
  tools: z.object({
    fixed: z.array(z.object({ label: z.string(), content: z.string(), booked: z.boolean() })),
    transit: z.array(z.object({ leg: z.string(), mode: z.string(), budget: z.string(), pending: z.boolean() })),
    todo: z.array(z.object({ item: z.string(), detail: z.string() })),
    address: z.array(z.object({ placeKey: NonEmptyString })),
  }),
  packing: z.array(z.object({ id: NonEmptyString, label: z.string(), items: z.array(z.object({id: NonEmptyString, label: z.string()})) })),
  lodging: z.object({ name: z.string(), area: z.string(), notice: z.string(), kr: z.string(), crossRef: z.string(), mapUrl: z.url() }),
  places: z.record(z.string(), z.object({
    label: NonEmptyString, query: NonEmptyString,
    description: z.optional(NonEmptyString), details: z.optional(z.array(NonEmptyString)),
  })),
  statusMeta: z.record(z.enum(['booked', 'tentative', 'flexible']), z.object({label: z.string(), color: z.string()})),
});
