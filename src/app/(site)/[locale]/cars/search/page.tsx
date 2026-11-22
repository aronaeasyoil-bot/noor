import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { carSearchSchema, issuesByField } from "@/lib/validation/search";
import { formatDate, todayInDubai } from "@/lib/format";
import { RequestResults } from "@/components/search/RequestResults";

export const metadata: Metadata = { robots: { index: false } };

export default async function CarSearchPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const s = dict.search;
  const r = carSearchSchema(todayInDubai()).safeParse(await searchParams);
  const rows: [string, string][] = r.success
    ? [
        [s.pickupLocation, r.data.pickup],
        [s.dropoffLocation, r.data.dropoff || r.data.pickup],
        [s.pickupDate, `${formatDate(r.data.pickupDate, locale)} ${r.data.pickupTime}`],
        [s.dropoffDate, `${formatDate(r.data.dropoffDate, locale)} ${r.data.dropoffTime}`],
      ]
    : [];
  return (
    <RequestResults
      locale={locale}
      dict={dict}
      tab="cars"
      title={dict.nav.cars}
      issues={r.success ? null : issuesByField(r.error)}
      rows={rows}
      notice={dict.supplier.carsNotConnected}
      service="cars"
      waTitle={dict.supplier.fares.wa.carTitle}
      context={r.success ? { type: "cars", ...r.data } : {}}
    />
  );
}
