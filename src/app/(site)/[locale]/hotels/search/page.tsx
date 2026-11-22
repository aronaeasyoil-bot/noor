import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { hotelSearchSchema, issuesByField } from "@/lib/validation/search";
import { formatDate, todayInDubai } from "@/lib/format";
import { RequestResults } from "@/components/search/RequestResults";

export const metadata: Metadata = { robots: { index: false } };

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
  return (
    <RequestResults
      locale={locale}
      dict={dict}
      tab="hotels"
      title={r.success ? `${dict.nav.hotels} · ${r.data.destination}` : dict.nav.hotels}
      issues={r.success ? null : issuesByField(r.error)}
      rows={rows}
      notice={dict.supplier.hotelsNotConnected}
      service="hotels"
      context={r.success ? { type: "hotels", ...r.data } : {}}
    />
  );
}
