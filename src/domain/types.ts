/** 由 schema.ts 推導的型別；UI 與資料層都只 import 這裡。 */
import type { z } from 'zod/mini';
import type {
  AirportTransitOptionSchema,
  AppPreferencesSchema,
  AreaSchema,
  BackupCategorySchema,
  BackupOptionSchema,
  CoordinatesSchema,
  DayPlanSchema,
  EventTypeSchema,
  GuideCategorySchema,
  GuideEntrySchema,
  ImageRefSchema,
  ItineraryEventSchema,
  LinkRefSchema,
  LocationPrecisionSchema,
  MapLinksSchema,
  MoneySchema,
  MultilingualAddressSchema,
  MultilingualNameSchema,
  PlaceKindSchema,
  PlaceSchema,
  ReservationInfoSchema,
  ReservationStatusSchema,
  SequenceItemSchema,
  SourceRefSchema,
  TimePointSchema,
  ToolLinkSchema,
  ToolsContentSchema,
  TransitEndpointSchema,
  TransitLegSchema,
  TransitModeSchema,
  TripDataFileSchema,
  TripSchema,
} from './schema';

export type LocalDate = string; // YYYY-MM-DD
export type LocalTime = string; // HH:mm
export type TimePoint = z.infer<typeof TimePointSchema>;
export type SourceRef = z.infer<typeof SourceRefSchema>;
export type MultilingualName = z.infer<typeof MultilingualNameSchema>;
export type MultilingualAddress = z.infer<typeof MultilingualAddressSchema>;
export type LocationPrecision = z.infer<typeof LocationPrecisionSchema>;
export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type MapLinks = z.infer<typeof MapLinksSchema>;
export type ImageRef = z.infer<typeof ImageRefSchema>;
export type Area = z.infer<typeof AreaSchema>;
export type PlaceKind = z.infer<typeof PlaceKindSchema>;
export type Place = z.infer<typeof PlaceSchema>;
export type Money = z.infer<typeof MoneySchema>;
export type ReservationStatus = z.infer<typeof ReservationStatusSchema>;
export type ReservationInfo = z.infer<typeof ReservationInfoSchema>;
export type EventType = z.infer<typeof EventTypeSchema>;
export type ToolLink = z.infer<typeof ToolLinkSchema>;
export type ItineraryEvent = z.infer<typeof ItineraryEventSchema>;
export type TransitMode = z.infer<typeof TransitModeSchema>;
export type TransitEndpoint = z.infer<typeof TransitEndpointSchema>;
export type TransitLeg = z.infer<typeof TransitLegSchema>;
export type SequenceItem = z.infer<typeof SequenceItemSchema>;
export type DayPlan = z.infer<typeof DayPlanSchema>;
export type BackupCategory = z.infer<typeof BackupCategorySchema>;
export type BackupOption = z.infer<typeof BackupOptionSchema>;
export type GuideCategory = z.infer<typeof GuideCategorySchema>;
export type GuideEntry = z.infer<typeof GuideEntrySchema>;
export type LinkRef = z.infer<typeof LinkRefSchema>;
export type AirportTransitOption = z.infer<typeof AirportTransitOptionSchema>;
export type ToolsContent = z.infer<typeof ToolsContentSchema>;
export type Trip = z.infer<typeof TripSchema>;
export type TripDataFile = z.infer<typeof TripDataFileSchema>;
export type AppPreferences = z.infer<typeof AppPreferencesSchema>;

/**
 * 驗證後、供 UI 使用的資料：在原始檔之上加上 id 索引，避免各元件各自 find()。
 * 內容與 TripDataFile 完全相同，只是多了查表。
 */
export interface TripDataset extends TripDataFile {
  placesById: ReadonlyMap<string, Place>;
  areasById: ReadonlyMap<string, Area>;
  eventsById: ReadonlyMap<string, ItineraryEvent>;
  transitsById: ReadonlyMap<string, TransitLeg>;
  guidesById: ReadonlyMap<string, GuideEntry>;
  daysById: ReadonlyMap<string, DayPlan>;
}
