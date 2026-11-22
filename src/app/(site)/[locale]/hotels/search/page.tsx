import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { hotelSearchSchema, issuesByField } from "@/lib/validation/search";
import { formatDate, todayInDubai } from "@/lib/format";
import { getHotelSupplier } from "@/lib/suppliers";
import { getCurrentUser } from "@/lib/auth/session";
import { RequestResults } from "@/components/search/RequestResults";
import { HotelResults } from "@/components/search/HotelResults";
import { SearchSummary } from "@/components/search/SearchSummary";
import { SupplierNotice } from "@/components/search/SupplierNotice";
import { serviceOptions } from "@/components/catalog/serviceOptions";

export const metadata: Metadata = { robots: { index: false } };

const nightsBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

export default async function HotelSearchPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const s = dict.search;
  const r = hotelSearchSchema(todayInDubai()).safeParse(await searchParams);
  const rows: [string, string][] = r.success
    ? [
        [s.destination, r.data.destination],
        [s.checkIn, formatDate(r.data.checkin, locale)],
        [s.checkOut, formatDate(r.data.checkout, locale)],
        [s.rooms, String(r.data.rooms)],
        [s.guests, `${r.data.adults} ${s.adults} · ${r.data.children} ${s.children}`],
      ]
    : [];
  const title = r.success ? `${dict.nav.hotels} · ${r.data.destination}` : dict.nav.hotels;
  const common = {
    locale,
    dict,
    tab: "hotels" as const,
    title,
    issues: r.success ? null : issuesByField(r.error),
    rows,
    notice: dict.supplier.hotelsNotConnected,
    service: "hotels",
    context: r.success ? { type: "hotels", ...r.data } : {},
    waTitle: dict.supplier.fares.wa.hotelTitle,
  };

  const supplier = getHotelSupplier();
  if (!r.success || !supplier) return <RequestResults {...common} />;

  const q = r.data;
  const place = await supplier.geocode(q.destination);
  if (!place) {
    return (
      <RequestResults {...common}>
        <SupplierNotice title={dict.supplier.notConnectedTitle} body={dict.supplier.hotels.notFound} />
      </RequestResults>
    );
  }
  const result = await supplier.search({ lat: place.lat, lng: place.lng, radiusKm: place.radiusKm, checkin: q.checkin, checkout: q.checkout, rooms: q.rooms, adults: q.adults });
  if (result.status === "error") console.error(`[hotels] supplier error: ${result.message}`);
  if (result.status !== "ok" || result.items.length === 0) {
    return (
      <RequestResults {...common}>
        <SupplierNotice title={dict.supplier.notConnectedTitle} body={result.status === "ok" ? dict.supplier.noResults : dict.supplier.hotels.error} />
      </RequestResults>
    );
  }

  const user = await getCurrentUser();
  const message = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const guestsText = [
    [q.adults, s.adults],
    [q.children, s.children],
  ]
    .filter(([n]) => Number(n) > 0)
    .map(([n, l]) => `${n} ${l}`)
    .join(" · ");
  return (
    <div className="container-noor py-8">
      <h1 className="text-2xl font-extrabold">{title}</h1>
      <div className="mt-4">
        <SearchSummary title={dict.supplier.searchSummary} rows={rows} />
      </div>
      <div className="mt-5">
        <HotelResults
          locale={locale}
          offers={result.items}
          h={dict.supplier.hotels}
          w={dict.supplier.fares.wa}
          stay={{ destination: q.destination, checkin: q.checkin, checkout: q.checkout, nights: nightsBetween(q.checkin, q.checkout), rooms: q.rooms, adults: q.adults, children: q.children, guestsText }}
          searchMessage={message}
          searchContext={{ type: "hotels", ...q, place: place.label }}
          searchRows={rows}
          requestTitle={dict.supplier.sendSearch}
          quote={{
            compact: true,
            locale,
            q: dict.quote,
            c: dict.common,
            rateLimited: dict.auth.rateLimited,
            services: serviceOptions(locale, dict),
            defaultService: "hotels",
            whatsappPrefill: dict.whatsapp.prefill,
            user,
            defaultTravellers: q.adults + q.children,
            defaultDate: q.checkin,
            defaultReturn: q.checkout,
          }}
        />
      </div>
    </div>
  );
}
