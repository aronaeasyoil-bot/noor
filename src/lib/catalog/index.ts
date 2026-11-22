import { activities } from "./activities";
import { packages } from "./packages";
import { safaris } from "./safaris";
import { services } from "./services";
import { carCategories, transferVehicles } from "./vehicles";
import type { CatalogCategory, CatalogItem } from "./types";

export * from "./types";
export { activities, packages, safaris, services, carCategories, transferVehicles };
export * from "./destinations";
export { airports } from "./vehicles";

export const allCatalogItems: CatalogItem[] = [
  ...safaris,
  ...activities,
  ...packages,
  ...carCategories,
  ...transferVehicles,
  ...services,
];

export function findItem(slug: string, category?: CatalogCategory): CatalogItem | undefined {
  return allCatalogItems.find((i) => i.slug === slug && (!category || i.category === category));
}

/** Public URL of a catalogue item. */
export function itemPath(item: Pick<CatalogItem, "slug" | "category">): string {
  switch (item.category) {
    case "safari":
      return `/desert-safari/${item.slug}`;
    case "activity":
      return `/activities/${item.slug}`;
    case "package":
      return `/packages/${item.slug}`;
    case "car":
      return `/cars/${item.slug}`;
    case "transfer":
      return `/transfers/${item.slug}`;
    case "service":
      return `/services/${item.slug}`;
  }
}
