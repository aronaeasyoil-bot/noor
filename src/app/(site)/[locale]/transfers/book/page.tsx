import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { issuesByField, transferSearchSchema } from "@/lib/validation/search";
import { airports, itemPath, transferVehicles } from "@/lib/catalog";
import { formatDate, todayInDubai } from "@/lib/format";
import { getProducts } from "@/lib/products";
import { SearchPanel } from "@/components/search/SearchPanel";
import { SearchSummary } from "@/components/search/SearchSummary";
import { PhotoCard } from "@/components/ui/PhotoCard";
import { Price } from "@/components/ui/Price";
import { CurrencyNote } from "@/components/ui/CurrencyNote";

export const metadata: Metadata = { robots: { index: false } };

/** Transfer search: lists NOOR vehicles that fit the group. Prices are the ones set in admin (or "on request"). */
export default async function TransferBookPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const s = dict.search;
  const today = todayInDubai();
  const r = transferSearchSchema(today).safeParse(await searchParams);
  if (!r.success) {
    const issues = issuesByField(r.error);
    return (
      <div className="container-noor py-8">
        <h1 className="mb-4 text-2xl font-extrabold">{dict.nav.transfers}</h1>
        <ul className="mb-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-noor-red" role="alert">
          {Object.entries(issues).map(([k, v]) => <li key={k}>{s.errors[v]}</li>)}
        </ul>
        <SearchPanel locale={locale} labels={s} today={today} initialTab="transfers" />
      </div>
    );
  }
  const q = r.data;
  const fit = transferVehicles.filter((v) => (v.seats ?? 0) >= q.passengers);
  const products = await getProducts(fit.map((v) => v.slug));
  const airport = airports.find((a) => a.code === q.airport);
  return (
    <div className="container-noor py-8">
      <h1 className="text-2xl font-extrabold">{dict.nav.transfers}</h1>
      <div className="mt-5 space-y-5">
        <SearchSummary
          title={dict.supplier.searchSummary}
          rows={[
            [s.airport, airport?.name[locale] ?? q.airport],
            [s.direction, q.direction === "from" ? s.fromAirport : s.toAirport],
            [s.address, q.address],
            [s.date, `${formatDate(q.date, locale)} ${q.time}`],
            [s.passengers, String(q.passengers)],
          ]}
        />
        <h2 className="text-xl font-extrabold">{dict.extra.vehiclesFor.replace("{n}", String(q.passengers))}</h2>
        <CurrencyNote dict={dict} locale={locale} />
        {fit.length === 0 ? (
          <p className="card p-5">
            {dict.supplier.noResults} <Link className="font-bold text-noor-blue underline" href={`/${locale}/quote?service=transfers`}>{dict.sections.requestQuote}</Link>
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="transfer-results">
            {fit.map((v) => (
              <PhotoCard key={v.slug} href={`/${locale}${itemPath(v)}`} photo={v.photos[0]!} title={v.title[locale]} subtitle={dict.extra.upTo.replace("{n}", String(v.seats))} footer={<Price product={products.get(v.slug)} dict={dict} locale={locale} />} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
