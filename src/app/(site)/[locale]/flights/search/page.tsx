import type { Metadata } from "next";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { airportLabel } from "@/lib/airports";
import { flightSearchSchema, issuesByField } from "@/lib/validation/search";
import { formatDate, formatMoney, todayInDubai } from "@/lib/format";
import { getFlightSupplier, type FlightOffer } from "@/lib/suppliers";
import { getCurrentUser } from "@/lib/auth/session";
import { hotelAreas } from "@/lib/catalog";
import { SearchPanel } from "@/components/search/SearchPanel";
import { SupplierNotice } from "@/components/search/SupplierNotice";
import { SearchSummary } from "@/components/search/SearchSummary";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { serviceOptions } from "@/components/catalog/serviceOptions";

export const metadata: Metadata = { robots: { index: false } };

export default async function FlightSearchPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const today = todayInDubai();
  const sp = await searchParams;
  const parsed = flightSearchSchema(today).safeParse(Object.fromEntries(Object.entries(sp).filter(([, v]) => typeof v === "string")));
  const user = await getCurrentUser();
  const s = dict.search;

  if (!parsed.success) {
    const issues = issuesByField(parsed.error);
    return (
      <div className="container-noor py-8">
        <h1 className="mb-4 text-2xl font-extrabold">{dict.nav.flights}</h1>
        <ul className="mb-4 space-y-1 rounded-xl bg-red-50 p-4 text-sm font-semibold text-noor-red" role="alert">
          {Object.entries(issues).map(([k, v]) => (
            <li key={k}>{s.errors[v]}</li>
          ))}
        </ul>
        <SearchPanel locale={locale} labels={s} today={today} initialTab="flights" areaSuggestions={hotelAreas.map((a) => a.name[locale])} />
      </div>
    );
  }
  const q = parsed.data;
  const legs = [{ from: q.from, to: q.to, date: q.depart }];
  if (q.trip === "round" && q.return) legs.push({ from: q.to, to: q.from, date: q.return });
  if (q.trip === "multi" && q.legs) {
    for (const part of q.legs.split(",")) {
      const m = part.match(/^([A-Z]{3})-([A-Z]{3})-(\d{4}-\d{2}-\d{2})$/);
      if (m && m[1] && m[2] && m[3]) legs.push({ from: m[1], to: m[2], date: m[3] });
    }
  }
  const supplier = getFlightSupplier();
  const result = supplier ? await supplier.search({ legs, adults: q.adults, children: q.children, infants: q.infants, cabin: q.cabin, direct: q.direct }) : { status: "not_configured" as const };

  const rows: [string, string][] = [
    ...legs.map((l, i): [string, string] => [`${s.flight} ${i + 1}`, `${airportLabel(l.from)} → ${airportLabel(l.to)} · ${formatDate(l.date, locale)}`]),
    [s.travellers, `${q.adults} ${s.adults} · ${q.children} ${s.children} · ${q.infants} ${s.infants}`],
    [s.cabin, s.cabins[q.cabin]],
    [s.direct, q.direct ? dict.common.yes : dict.common.no],
  ];
  const message = rows.map(([k, v]) => `${k}: ${v}`).join("\n");

  return (
    <div className="container-noor py-8">
      <h1 className="text-2xl font-extrabold">
        {airportLabel(q.from)} → {airportLabel(q.to)}
      </h1>
      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-4">
          <SearchSummary title={dict.supplier.searchSummary} rows={rows} />
          {result.status === "ok" ? (
            result.items.length === 0 ? (
              <p className="card p-5">{dict.supplier.noResults}</p>
            ) : (
              <ul className="space-y-3" data-testid="flight-results">
                {result.items.map((o: FlightOffer) => (
                  <li key={o.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm">
                      {o.segments.map((sg, i) => (
                        <p key={i}>
                          <span className="font-bold">{sg.flightNumber}</span> {sg.from} {sg.departAt.slice(11, 16)} → {sg.to} {sg.arriveAt.slice(11, 16)}
                        </p>
                      ))}
                    </div>
                    <div className="text-end">
                      <p className="text-xl font-extrabold text-noor-red">{formatMoney(o.totalMinor, o.currency, locale)}</p>
                      <a href="#request" className="btn btn-outline mt-2">{dict.supplier.sendSearch}</a>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <SupplierNotice title={dict.supplier.notConnectedTitle} body={dict.supplier.flightsNotConnected} />
          )}
        </div>
        <aside id="request" className="card h-fit min-w-0 p-5">
          <h2 className="mb-3 text-lg font-extrabold">{dict.supplier.sendSearch}</h2>
          <QuoteForm compact locale={locale} q={dict.quote} c={dict.common} rateLimited={dict.auth.rateLimited} services={serviceOptions(locale, dict)} defaultService="flights" context={{ type: "flights", ...q, legs }} defaultMessage={message} whatsappPrefill={dict.whatsapp.prefill} user={user} />
        </aside>
      </div>
    </div>
  );
}
