"use client";

import { useMemo, useState } from "react";
import type { ComponentProps } from "react";
import type { HotelOffer } from "@/lib/suppliers/types";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { fill, formatDate, formatMoney } from "@/lib/format";
import { QuoteForm } from "@/components/forms/QuoteForm";

type QuoteProps = Omit<ComponentProps<typeof QuoteForm>, "context" | "defaultMessage" | "whatsappMessage">;

type Props = {
  locale: Locale;
  offers: HotelOffer[];
  h: Dictionary["supplier"]["hotels"];
  w: Dictionary["supplier"]["fares"]["wa"];
  stay: { destination: string; checkin: string; checkout: string; nights: number; rooms: number; adults: number; children: number; guestsText: string };
  searchMessage: string;
  searchContext: Record<string, unknown>;
  searchRows: [string, string][];
  quote: QuoteProps;
  requestTitle: string;
};

export function HotelResults({ locale, offers, h, w, stay, searchMessage, searchContext, searchRows, quote, requestTitle }: Props) {
  const [sort, setSort] = useState<"price" | "rating">("price");
  const [chosen, setChosen] = useState<HotelOffer | null>(null);

  const shown = useMemo(
    () => [...offers].sort((a, b) => (sort === "price" ? a.totalMinor - b.totalMinor : (b.reviewScore ?? 0) - (a.reviewScore ?? 0) || (b.stars ?? 0) - (a.stars ?? 0))),
    [offers, sort],
  );

  const totalText = fill(h.totalStay, { nights: stay.nights, rooms: stay.rooms });
  const summary = (o: HotelOffer) =>
    [
      `${o.name}${o.stars ? ` · ${fill(h.stars, { n: o.stars })}` : ""}`,
      o.address,
      `${formatDate(stay.checkin, locale)} → ${formatDate(stay.checkout, locale)} · ${stay.nights} ${w.nights.toLowerCase()} · ${stay.rooms} ${w.rooms.toLowerCase()}`,
      `${formatMoney(o.totalMinor, o.currency, locale)} (${totalText})`,
    ]
      .filter(Boolean)
      .join("\n");

  const chosenText = chosen ? summary(chosen) : null;
  const message = chosenText ? `${h.selectedTitle}:\n${chosenText}\n\n${searchMessage}` : searchMessage;
  const context = chosen
    ? { ...searchContext, offer: { supplier: chosen.supplier, id: chosen.id, accommodationId: chosen.accommodationId, name: chosen.name, total: (chosen.totalMinor / 100).toFixed(2), currency: chosen.currency } }
    : searchContext;

  function whatsappText(v: { reference: string; name: string; email: string; phone: string; message: string }) {
    const out = [`*${w.hotelTitle}*`, `${w.reference} : *${v.reference}*`, "", `*${w.client}*`, `${w.name} : ${v.name}`];
    if (v.phone) out.push(`${w.phone} : ${v.phone}`);
    out.push(`${w.email} : ${v.email}`, "");
    if (chosen) {
      out.push(`*${w.hotel}*`, `${w.hotelName} : ${chosen.name}`);
      if (chosen.stars) out.push(`${w.category} : ${fill(h.stars, { n: chosen.stars })}`);
      if (chosen.address) out.push(`${w.address} : ${chosen.address}`);
      out.push(
        `${w.checkin} : ${formatDate(stay.checkin, locale, { dateStyle: "full" })}`,
        `${w.checkout} : ${formatDate(stay.checkout, locale, { dateStyle: "full" })}`,
        `${w.nights} : ${stay.nights}`,
        `${w.rooms} : ${stay.rooms}`,
        `${w.travellers} : ${stay.guestsText}`,
        `${w.price} : *${formatMoney(chosen.totalMinor, chosen.currency, locale)}* (${totalText})`,
      );
    } else {
      out.push(`*${w.search}*`, ...searchRows.map(([k, val]) => `${k} : ${val}`));
    }
    const extra = v.message.trim();
    if (extra && extra !== message.trim()) out.push("", `*${w.notes}*`, extra);
    return out.join("\n");
  }

  function choose(o: HotelOffer) {
    setChosen(o);
    requestAnimationFrame(() => document.getElementById("request")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold" data-testid="hotels-title">
            {fill(h.title, { n: offers.length })}
          </h2>
          <div className="flex gap-1 rounded-full bg-noor-bg p-1 text-sm font-bold" role="group">
            {(["price", "rating"] as const).map((k) => (
              <button key={k} type="button" onClick={() => setSort(k)} aria-pressed={sort === k} className={`rounded-full px-3 py-1.5 ${sort === k ? "bg-white text-noor-red shadow-sm" : "text-noor-muted"}`}>
                {k === "price" ? h.sortCheapest : h.sortRating}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-noor-muted">
          {h.priceNote}
          {stay.children > 0 ? ` ${fill(h.childrenNote, { n: stay.adults })}` : ""}
        </p>
        <ul className="space-y-3" data-testid="hotel-results">
          {shown.map((o) => {
            const isChosen = chosen?.id === o.id;
            return (
              <li key={o.id} className={`card overflow-hidden p-0 ${isChosen ? "ring-2 ring-noor-red" : ""}`} data-testid="hotel-offer">
                <div className="flex flex-col sm:flex-row">
                  {o.photo && (
                    <div className="relative aspect-[16/10] w-full shrink-0 bg-noor-bg sm:aspect-auto sm:w-56">
                      <img src={o.photo} alt={o.name} className="absolute inset-0 size-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-stretch">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="text-base font-extrabold leading-snug">{o.name}</p>
                      {o.stars ? <p className="text-sm text-noor-red" aria-label={fill(h.stars, { n: o.stars })}>{"★".repeat(Math.round(o.stars))}</p> : null}
                      {o.address && <p className="text-xs text-noor-muted">{o.address}</p>}
                      {o.reviewScore != null && (
                        <p className="inline-flex items-center gap-1.5 text-xs font-semibold">
                          <span className="rounded bg-noor-navy px-1.5 py-0.5 text-white">{o.reviewScore.toFixed(1)}</span>
                          {o.reviewCount ? <span className="text-noor-muted">{fill(h.reviews, { score: o.reviewScore.toFixed(1), n: o.reviewCount })}</span> : null}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-noor-line pt-3 sm:w-44 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:border-s sm:ps-4 sm:pt-0">
                      <div className="sm:text-end">
                        <p className="text-2xl font-extrabold text-noor-red" data-testid="hotel-price">{formatMoney(o.totalMinor, o.currency, locale)}</p>
                        <p className="text-[11px] text-noor-muted">{totalText}</p>
                      </div>
                      <button type="button" onClick={() => choose(o)} className={`btn ${isChosen ? "btn-navy" : "btn-primary"} shrink-0`} data-testid="book-hotel">
                        {isChosen ? `✓ ${h.selected}` : h.book}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <aside id="request" className="card h-fit min-w-0 scroll-mt-20 p-5 lg:sticky lg:top-20">
        <h2 className="mb-2 text-lg font-extrabold">{chosen ? h.requestTitle : requestTitle}</h2>
        {chosen ? (
          <div className="mb-4 space-y-2" data-testid="chosen-hotel">
            <p className="text-sm text-noor-muted">{h.requestIntro}</p>
            <pre className="whitespace-pre-wrap rounded-xl bg-noor-red-50 p-3 font-sans text-sm text-noor-ink">{chosenText}</pre>
            <button type="button" className="text-sm font-bold text-noor-red underline" onClick={() => setChosen(null)}>
              {h.change}
            </button>
          </div>
        ) : (
          <p className="mb-4 text-sm text-noor-muted">{h.pickFirst}</p>
        )}
        <QuoteForm
          key={chosen?.id ?? "search"}
          {...quote}
          context={context}
          defaultMessage={message}
          whatsappAfterSubmitOnly
          whatsappOnSuccess={whatsappText}
          whatsappLabel={w.successCta}
          successWhatsappHint={w.successHint}
          submitLabel={chosen ? h.requestTitle : undefined}
        />
      </aside>
    </div>
  );
}
