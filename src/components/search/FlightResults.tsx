"use client";

import { useMemo, useState } from "react";
import type { ComponentProps } from "react";
import type { FlightOffer, FlightSlice } from "@/lib/suppliers/types";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { fill, formatDate, formatMoney } from "@/lib/format";
import { QuoteForm } from "@/components/forms/QuoteForm";

type Fares = Dictionary["supplier"]["fares"];
type QuoteProps = Omit<ComponentProps<typeof QuoteForm>, "context" | "defaultMessage" | "whatsappMessage">;

type Props = {
  locale: Locale;
  offers: FlightOffer[];
  testMode: boolean;
  fares: Fares;
  flightLabel: string;
  cabinLabel: string;
  travellers: number;
  /** Text describing the search, used when no flight is chosen. */
  searchMessage: string;
  searchContext: Record<string, unknown>;
  quote: QuoteProps;
  requestTitle: string;
};

const hhmm = (iso: string) => iso.slice(11, 16);
const dayDiff = (a: string, b: string) => Math.round((Date.parse(b.slice(0, 10)) - Date.parse(a.slice(0, 10))) / 86_400_000);
const totalMinutes = (o: FlightOffer) => o.slices.reduce((n, s) => n + (s.durationMin ?? 0), 0);

function duration(min: number | null) {
  if (min == null) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${m ? String(m).padStart(2, "0") : ""}`;
}

function stopsLabel(slice: FlightSlice, f: Fares) {
  const n = slice.segments.length - 1;
  if (n === 0) return f.direct;
  const places = slice.segments.slice(0, -1).map((s) => s.to).join(", ");
  return `${n === 1 ? f.oneStop : fill(f.stops, { n })} · ${fill(f.via, { places })}`;
}

function baggageLabel(o: FlightOffer, f: Fares) {
  const { checked, carryOn } = o.baggage;
  if (checked == null && carryOn == null) return f.bagsUnknown;
  const parts = [checked ? fill(f.checkedBags, { n: checked }) : f.noCheckedBag];
  if (carryOn) parts.push(f.carryOn);
  return parts.join(" · ");
}

/** Plain-text summary of a chosen flight, for the request message, the admin and WhatsApp. */
export function offerSummary(o: FlightOffer, p: { locale: Locale; fares: Fares; flightLabel: string; cabinLabel: string; travellers: number }) {
  const lines = [`${o.airline.name}${o.fareName ? ` · ${o.fareName}` : ""} · ${p.cabinLabel}`];
  o.slices.forEach((s, i) => {
    lines.push(
      `${p.flightLabel} ${i + 1}: ${s.from} → ${s.to}, ${formatDate(s.departAt.slice(0, 10), p.locale)} ${hhmm(s.departAt)} → ${hhmm(s.arriveAt)}${dayDiff(s.departAt, s.arriveAt) > 0 ? ` (+${dayDiff(s.departAt, s.arriveAt)})` : ""} · ${s.segments.map((g) => g.flightNumber).join(" + ")} · ${stopsLabel(s, p.fares)}`,
    );
  });
  lines.push(`${formatMoney(o.totalMinor, o.currency, p.locale)} (${fill(p.fares.totalFor, { n: p.travellers })})`);
  lines.push(baggageLabel(o, p.fares));
  return lines.join("\n");
}

export function FlightResults({ locale, offers, testMode, fares: f, flightLabel, cabinLabel, travellers, searchMessage, searchContext, quote, requestTitle }: Props) {
  const [sort, setSort] = useState<"price" | "time">("price");
  const [airline, setAirline] = useState<string | null>(null);
  const [chosen, setChosen] = useState<FlightOffer | null>(null);

  const airlines = useMemo(() => {
    const m = new Map<string, { name: string; logo: string | null; from: FlightOffer }>();
    for (const o of offers) {
      const cur = m.get(o.airline.name);
      if (!cur || o.totalMinor < cur.from.totalMinor) m.set(o.airline.name, { name: o.airline.name, logo: o.airline.logo, from: o });
    }
    return [...m.values()].sort((a, b) => a.from.totalMinor - b.from.totalMinor);
  }, [offers]);

  const shown = useMemo(() => {
    const list = airline ? offers.filter((o) => o.airline.name === airline) : [...offers];
    return list.sort((a, b) => (sort === "price" ? a.totalMinor - b.totalMinor : totalMinutes(a) - totalMinutes(b) || a.totalMinor - b.totalMinor));
  }, [offers, airline, sort]);

  const summaryProps = { locale, fares: f, flightLabel, cabinLabel, travellers };
  const chosenText = chosen ? offerSummary(chosen, summaryProps) : null;
  const message = chosenText ? `${f.selectedTitle}:\n${chosenText}\n\n${searchMessage}` : searchMessage;
  const context = chosen
    ? {
        ...searchContext,
        offer: {
          supplier: chosen.supplier,
          id: chosen.id,
          live: chosen.live,
          airline: chosen.airline.name,
          total: (chosen.totalMinor / 100).toFixed(2),
          currency: chosen.currency,
          flights: chosen.slices.map((s) => ({ from: s.from, to: s.to, depart: s.departAt, arrive: s.arriveAt, numbers: s.segments.map((g) => g.flightNumber) })),
          baggage: chosen.baggage,
          refundable: chosen.refundable,
          expiresAt: chosen.expiresAt,
        },
      }
    : searchContext;

  function choose(o: FlightOffer) {
    setChosen(o);
    requestAnimationFrame(() => document.getElementById("request")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0 space-y-4">
        {testMode && (
          <p role="note" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-900" data-testid="fares-test-mode">
            {f.testMode}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold" data-testid="fares-title">
            {fill(f.title, { n: offers.length, m: airlines.length })}
          </h2>
          <div className="flex gap-1 rounded-full bg-noor-bg p-1 text-sm font-bold" role="group">
            {(["price", "time"] as const).map((k) => (
              <button key={k} type="button" onClick={() => setSort(k)} aria-pressed={sort === k} className={`rounded-full px-3 py-1.5 ${sort === k ? "bg-white text-noor-red shadow-sm" : "text-noor-muted"}`}>
                {k === "price" ? f.sortCheapest : f.sortFastest}
              </button>
            ))}
          </div>
        </div>

        {airlines.length > 1 && (
          <div className="scroll-row !gap-2" data-testid="airline-filter">
            <button type="button" onClick={() => setAirline(null)} aria-pressed={airline === null} className={`shrink-0 rounded-xl border px-3 py-2 text-start text-sm font-bold ${airline === null ? "border-noor-red bg-noor-red-50 text-noor-red" : "border-noor-line bg-white"}`}>
              {f.allAirlines}
            </button>
            {airlines.map((a) => (
              <button key={a.name} type="button" onClick={() => setAirline(a.name === airline ? null : a.name)} aria-pressed={airline === a.name} className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-start ${airline === a.name ? "border-noor-red bg-noor-red-50" : "border-noor-line bg-white"}`}>
                {a.logo && <img src={a.logo} alt="" width={24} height={24} className="size-6 object-contain" loading="lazy" />}
                <span>
                  <span className="block max-w-36 truncate text-xs font-bold">{a.name}</span>
                  <span className="block text-sm font-extrabold text-noor-red">{formatMoney(a.from.totalMinor, a.from.currency, locale)}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-noor-muted">{f.priceNote}</p>

        <ul className="space-y-3" data-testid="flight-results">
          {shown.map((o) => {
            const isChosen = chosen?.id === o.id;
            return (
              <li key={o.id} className={`card overflow-hidden p-0 ${isChosen ? "ring-2 ring-noor-red" : ""}`} data-testid="flight-offer">
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      {o.airline.logo ? <img src={o.airline.logo} alt="" width={28} height={28} className="size-7 object-contain" loading="lazy" /> : <span className="grid size-7 place-items-center rounded bg-noor-bg text-[10px] font-bold">{o.airline.code}</span>}
                      <p className="truncate text-sm font-bold">{o.airline.name}</p>
                      {o.fareName && <span className="chip bg-noor-bg text-noor-muted">{o.fareName}</span>}
                    </div>
                    {o.slices.map((s, i) => {
                      const plus = dayDiff(s.departAt, s.arriveAt);
                      return (
                        <div key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                          <div>
                            <p className="text-lg font-extrabold leading-none">{hhmm(s.departAt)}</p>
                            <p className="text-xs font-semibold text-noor-muted">{s.from}</p>
                          </div>
                          <div className="min-w-0 text-center">
                            <p className="text-[11px] text-noor-muted">{duration(s.durationMin)}</p>
                            <div className="relative my-1 h-px bg-noor-line">
                              {s.segments.slice(0, -1).map((_, k, arr) => (
                                <span key={k} className="absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-noor-red" style={{ insetInlineStart: `${((k + 1) / (arr.length + 1)) * 100}%` }} />
                              ))}
                            </div>
                            <p className={`truncate text-[11px] font-semibold ${s.segments.length === 1 ? "text-emerald-700" : "text-noor-muted"}`}>{stopsLabel(s, f)}</p>
                          </div>
                          <div className="text-end">
                            <p className="text-lg font-extrabold leading-none">
                              {hhmm(s.arriveAt)}
                              {plus > 0 && <sup className="ms-0.5 text-[10px] text-noor-red">+{plus}</sup>}
                            </p>
                            <p className="text-xs font-semibold text-noor-muted">{s.to}</p>
                          </div>
                          <p className="col-span-3 -mt-1 text-[11px] text-noor-muted">
                            {o.slices.length > 1 ? `${flightLabel} ${i + 1} · ` : ""}
                            {formatDate(s.departAt.slice(0, 10), locale)} · {s.segments.map((g) => g.flightNumber).join(" + ")}
                            {s.segments[0]?.operatedBy ? ` · ${fill(f.operatedBy, { name: s.segments[0].operatedBy })}` : ""}
                          </p>
                        </div>
                      );
                    })}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="chip bg-noor-bg text-noor-ink">{baggageLabel(o, f)}</span>
                      {o.refundable != null && <span className={`chip ${o.refundable ? "bg-emerald-50 text-emerald-800" : "bg-noor-bg text-noor-muted"}`}>{o.refundable ? f.refundable : f.nonRefundable}</span>}
                      {o.changeable && <span className="chip bg-noor-bg text-noor-ink">{f.changeable}</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-noor-line pt-3 sm:w-44 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:border-s sm:ps-4 sm:pt-0">
                    <div className="sm:text-end">
                      <p className="text-2xl font-extrabold text-noor-red" data-testid="offer-price">{formatMoney(o.totalMinor, o.currency, locale)}</p>
                      <p className="text-[11px] text-noor-muted">{fill(f.totalFor, { n: travellers })}</p>
                    </div>
                    <button type="button" onClick={() => choose(o)} className={`btn ${isChosen ? "btn-navy" : "btn-primary"} shrink-0`} data-testid="book-offer">
                      {isChosen ? `✓ ${f.selected}` : f.book}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <aside id="request" className="card h-fit min-w-0 scroll-mt-20 p-5 lg:sticky lg:top-20">
        <h2 className="mb-2 text-lg font-extrabold">{chosen ? f.requestTitle : requestTitle}</h2>
        {chosen ? (
          <div className="mb-4 space-y-2" data-testid="chosen-flight">
            <p className="text-sm text-noor-muted">{f.requestIntro}</p>
            <pre className="whitespace-pre-wrap rounded-xl bg-noor-red-50 p-3 font-sans text-sm text-noor-ink">{chosenText}</pre>
            <button type="button" className="text-sm font-bold text-noor-red underline" onClick={() => setChosen(null)}>
              {f.change}
            </button>
          </div>
        ) : (
          <p className="mb-4 text-sm text-noor-muted">{f.pickFirst}</p>
        )}
        <QuoteForm
          key={chosen?.id ?? "search"}
          {...quote}
          context={context}
          defaultMessage={message}
          whatsappMessage={chosenText ? `${f.whatsappIntro}\n${chosenText}` : undefined}
          whatsappLabel={chosen ? f.whatsappSend : undefined}
          submitLabel={chosen ? f.requestTitle : undefined}
        />
      </aside>
    </div>
  );
}
