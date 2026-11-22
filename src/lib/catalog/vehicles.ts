import type { CatalogItem } from "./types";

const car = (
  slug: string,
  photo: CatalogItem["photos"][number],
  title: CatalogItem["title"],
  summary: CatalogItem["summary"],
  seats: number,
  bags: number,
): CatalogItem => ({
  slug,
  category: "car",
  photos: [photo],
  title,
  summary,
  description: summary,
  seats,
  bags,
  priceUnit: "per_day",
  maxPax: seats,
});

/** Rental categories. The model shown is an example of the category; the exact model is confirmed by the rental partner. */
export const carCategories: CatalogItem[] = [
  car("economy", "carEconomy", { en: "Economy", fr: "Économique", ar: "اقتصادية" }, { en: "Compact hatchback for city driving", fr: "Citadine compacte pour la ville", ar: "سيارة صغيرة للتنقل في المدينة" }, 4, 2),
  car("sedan", "carSedan", { en: "Sedan", fr: "Berline", ar: "سيدان" }, { en: "Comfortable saloon for longer drives", fr: "Berline confortable pour les longs trajets", ar: "سيارة مريحة للمسافات الطويلة" }, 5, 3),
  car("suv", "carSuv", { en: "SUV", fr: "SUV", ar: "دفع رباعي متوسطة" }, { en: "Spacious SUV for families", fr: "SUV spacieux pour les familles", ar: "سيارة واسعة للعائلات" }, 5, 4),
  car("luxury", "carLuxury", { en: "Luxury", fr: "Luxe", ar: "فاخرة" }, { en: "Premium sedans and SUVs", fr: "Berlines et SUV haut de gamme", ar: "سيارات سيدان ودفع رباعي فاخرة" }, 5, 3),
  car("sports", "carSports", { en: "Sports cars", fr: "Sportives", ar: "سيارات رياضية" }, { en: "High-performance coupés and convertibles", fr: "Coupés et cabriolets de haute performance", ar: "سيارات كوبيه ومكشوفة عالية الأداء" }, 2, 1),
  car("four-by-four", "car4x4", { en: "4×4", fr: "4×4", ar: "دفع رباعي" }, { en: "Off-road capable 4×4 vehicles", fr: "Véhicules 4×4 tout-terrain", ar: "مركبات دفع رباعي للطرق الوعرة" }, 7, 4),
  car("minivan", "carMinivan", { en: "Minivan", fr: "Monospace", ar: "فان صغير" }, { en: "7 to 8 seats for groups", fr: "7 à 8 places pour les groupes", ar: "من 7 إلى 8 مقاعد للمجموعات" }, 8, 5),
  car("chauffeur", "carChauffeur", { en: "With chauffeur", fr: "Avec chauffeur", ar: "مع سائق" }, { en: "Hourly or daily car with professional driver", fr: "Voiture avec chauffeur à l'heure ou à la journée", ar: "سيارة مع سائق محترف بالساعة أو باليوم" }, 4, 3),
  car("vip", "carVip", { en: "VIP", fr: "VIP", ar: "كبار الشخصيات" }, { en: "Limousines and VIP vehicles for events", fr: "Limousines et véhicules VIP pour vos événements", ar: "سيارات ليموزين ومركبات لكبار الشخصيات للمناسبات" }, 6, 3),
];

const transfer = (
  slug: string,
  photo: CatalogItem["photos"][number],
  title: CatalogItem["title"],
  summary: CatalogItem["summary"],
  seats: number,
  bags: number,
): CatalogItem => ({
  slug,
  category: "transfer",
  photos: [photo],
  title,
  summary,
  description: summary,
  seats,
  bags,
  priceUnit: "per_vehicle",
  maxPax: seats,
});

export const transferVehicles: CatalogItem[] = [
  transfer("transfer-sedan", "transfers", { en: "Sedan", fr: "Berline", ar: "سيدان" }, { en: "Up to 3 passengers", fr: "Jusqu'à 3 passagers", ar: "حتى 3 ركاب" }, 3, 3),
  transfer("transfer-suv", "transferSuv", { en: "SUV", fr: "SUV", ar: "دفع رباعي" }, { en: "Up to 5 passengers", fr: "Jusqu'à 5 passagers", ar: "حتى 5 ركاب" }, 5, 5),
  transfer("transfer-van", "transferVan", { en: "Van", fr: "Van", ar: "فان" }, { en: "Up to 10 passengers", fr: "Jusqu'à 10 passagers", ar: "حتى 10 ركاب" }, 10, 10),
  transfer("transfer-luxury", "transferLuxury", { en: "Luxury", fr: "Luxe", ar: "فاخرة" }, { en: "Premium sedan, up to 3 passengers", fr: "Berline premium, jusqu'à 3 passagers", ar: "سيدان فاخرة حتى 3 ركاب" }, 3, 3),
];

export const airports = [
  { code: "DXB", name: { en: "Dubai International (DXB)", fr: "Dubaï International (DXB)", ar: "مطار دبي الدولي (DXB)" } },
  { code: "DWC", name: { en: "Al Maktoum International (DWC)", fr: "Al Maktoum International (DWC)", ar: "مطار آل مكتوم الدولي (DWC)" } },
  { code: "AUH", name: { en: "Abu Dhabi (AUH)", fr: "Abou Dhabi (AUH)", ar: "مطار أبوظبي (AUH)" } },
] as const;
