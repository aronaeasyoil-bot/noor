import { packages, services } from "@/lib/catalog";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/** Options of the quote form's "service" field. Values are stable keys stored with the request. */
export function serviceOptions(locale: Locale, d: Dictionary): { value: string; label: string }[] {
  return [
    { value: "flights", label: d.nav.flights },
    { value: "hotels", label: d.nav.hotels },
    { value: "flight-hotel", label: d.nav.flightHotel },
    { value: "cars", label: d.nav.cars },
    { value: "transfers", label: d.nav.transfers },
    { value: "desert-safari", label: d.nav.safari },
    { value: "activities", label: d.nav.activities },
    { value: "visa", label: d.nav.visa },
    ...packages.map((p) => ({ value: p.slug, label: `${d.nav.packages} · ${p.title[locale]}` })),
    ...services.map((s) => ({ value: s.slug, label: s.title[locale] })),
    { value: "other", label: d.nav.more },
  ];
}
