import type { L10n } from "@/lib/i18n/config";
import type { PhotoKey } from "@/lib/media";

export type CatalogCategory = "safari" | "activity" | "package" | "car" | "transfer" | "service";

/** Editorial description of something NOOR sells. Prices and availability are NOT here: they live in the database. */
export type CatalogItem = {
  slug: string;
  category: CatalogCategory;
  title: L10n;
  summary: L10n;
  description: L10n;
  photos: PhotoKey[];
  duration?: L10n;
  programme?: L10n[];
  included?: L10n[];
  excluded?: L10n[];
  /** For vehicles. */
  seats?: number;
  bags?: number;
  /** Default commercial settings written to the products table on first seed (never a price). */
  priceUnit?: "per_person" | "per_vehicle" | "per_group" | "per_day";
  requiresSlot?: boolean;
  maxPax?: number;
};
