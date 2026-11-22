import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { issuesByField, packageSearchSchema } from "@/lib/validation/search";
import { airportLabel } from "@/lib/airports";
import { formatDate, todayInDubai } from "@/lib/format";
import { RequestResults } from "@/components/search/RequestResults";

export const metadata: Metadata = { robots: { index: false } };

export default async function PackageSearchPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const s = dict.search;
  const r = packageSearchSchema(todayInDubai()).safeParse(await searchParams);
  const rows: [string, string][] = r.success
    ? [
        [s.from, airportLabel(r.data.from)],
        [s.destination, r.data.destination],
        [s.depart, formatDate(r.data.depart, locale)],
        [s.return, formatDate(r.data.return, locale)],
        [s.rooms, String(r.data.rooms)],
        [s.guests, `${r.data.adults} ${s.adults} · ${r.data.children} ${s.children}`],
      ]
    : [];
  return (
    <RequestResults
      locale={locale}
      dict={dict}
      tab="flightHotel"
      title={dict.nav.flightHotel}
      issues={r.success ? null : issuesByField(r.error)}
      rows={rows}
      notice={`${dict.supplier.flightsNotConnected} ${dict.supplier.hotelsNotConnected}`}
      service="flight-hotel"
      context={r.success ? { type: "flight-hotel", ...r.data } : {}}
    />
  );
}
