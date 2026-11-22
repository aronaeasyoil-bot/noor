"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { createBookingAction, type FormState } from "@/app/actions/commerce";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { Counter } from "@/components/search/Counter";

export type SlotOption = { id: string; date: string; startTime: string; remaining: number };

type Props = {
  locale: Locale;
  slug: string;
  kind: "experience" | "transfer" | "car";
  slots: SlotOption[];
  requiresSlot: boolean;
  maxPax: number;
  canPay: boolean;
  today: string;
  user: { name: string; email: string; phone: string | null } | null;
  b: Dictionary["booking"];
  c: Dictionary["common"];
  s: Dictionary["search"];
  signInLabel: string;
  rateLimited: string;
  airports?: { code: string; name: string }[];
  path: string;
};

/**
 * Booking form for NOOR-managed products. The server re-validates everything and reserves seats atomically;
 * nothing shown here is a confirmation until the server and (when applicable) the payment provider say so.
 */
export function BookingForm(p: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(createBookingAction, {});
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const dates = useMemo(() => [...new Set(p.slots.map((s) => s.date))].sort(), [p.slots]);
  const [date, setDate] = useState(dates[0] ?? "");
  const daySlots = p.slots.filter((s) => s.date === date);
  const [slotId, setSlotId] = useState(daySlots[0]?.id ?? "");
  const fe = state.fieldErrors ?? {};

  if (!p.user) {
    return (
      <div className="rounded-2xl border border-noor-line bg-noor-bg p-5">
        <p className="text-sm text-noor-ink">{p.b.requestNote}</p>
        <Link href={`/${p.locale}/account/sign-in?next=${encodeURIComponent(p.path)}`} className="btn btn-primary mt-4 w-full" data-testid="booking-signin">
          {p.signInLabel}
        </Link>
      </div>
    );
  }

  // No dates opened online yet: the form still works, as a dated request an adviser confirms (no payment).
  const requestOnly = p.requiresSlot && p.slots.length === 0;
  const useSlots = p.requiresSlot && !requestOnly;
  const canPay = p.canPay && !requestOnly;

  const selectedSlot = p.slots.find((s) => s.id === slotId);
  const pax = adults + children;
  const overCapacity = (useSlots && selectedSlot && pax > selectedSlot.remaining) || pax > p.maxPax;
  const errorText =
    state.error === "soldOut" ? p.b.soldOut : state.error === "rateLimited" ? p.rateLimited : state.error === "validation" ? (fe.date === "pastDate" ? p.s.errors.pastDate : p.c.error) : state.error ? p.c.error : null;

  return (
    <form action={action} className="grid grid-cols-1 gap-4" data-testid="booking-form">
      <input type="hidden" name="locale" value={p.locale} />
      <input type="hidden" name="slug" value={p.slug} />
      <input type="hidden" name="adults" value={adults} />
      <input type="hidden" name="children" value={children} />
      {requestOnly && <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900" data-testid="no-slots">{p.b.noSlots}</p>}
      {useSlots ? (
        <>
          <div>
            <label className="field-label" htmlFor="bk-date">{p.b.date}</label>
            <select
              id="bk-date"
              name="date"
              className="field"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSlotId(p.slots.find((s) => s.date === e.target.value)?.id ?? "");
              }}
            >
              {dates.map((d) => (
                <option key={d} value={d}>
                  {new Date(`${d}T00:00:00`).toLocaleDateString(p.locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                </option>
              ))}
            </select>
          </div>
          <fieldset>
            <legend className="field-label">{p.b.slot}</legend>
            <div className="flex flex-wrap gap-2">
              {daySlots.map((s) => (
                <label key={s.id} className={`chip cursor-pointer border ${slotId === s.id ? "border-noor-red bg-red-50 text-noor-red" : "border-noor-line bg-white"} ${s.remaining <= 0 ? "opacity-40" : ""}`}>
                  <input type="radio" name="slotId" value={s.id} checked={slotId === s.id} onChange={() => setSlotId(s.id)} disabled={s.remaining <= 0} className="sr-only" />
                  {s.startTime} · {s.remaining}
                </label>
              ))}
            </div>
          </fieldset>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="bk-date">{p.kind === "car" ? p.s.pickupDate : p.b.date}</label>
            <input id="bk-date" name="date" type="date" min={p.today} className="field" required defaultValue={p.today} />
          </div>
          <div>
            <label className="field-label" htmlFor="bk-time">{p.kind === "car" ? p.s.pickupTime : p.s.time}</label>
            <input id="bk-time" name="time" type="time" className="field" required defaultValue="10:00" />
          </div>
          {p.kind === "car" && (
            <div>
              <label className="field-label" htmlFor="bk-days">{p.c.perDay}</label>
              <input id="bk-days" name="days" type="number" min={1} max={60} defaultValue={3} className="field" />
            </div>
          )}
        </div>
      )}

      {p.kind === "transfer" && p.airports && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="bk-airport">{p.s.airport}</label>
            <select id="bk-airport" name="airport" className="field">
              {p.airports.map((a) => (
                <option key={a.code} value={a.code}>{a.code} · {a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="bk-flight">Flight no.</label>
            <input id="bk-flight" name="flightNumber" className="field" maxLength={12} placeholder="EK123" />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="bk-drop">{p.s.address}</label>
            <input id="bk-drop" name="dropoff" className="field" required maxLength={200} />
          </div>
          <div>
            <label className="field-label" htmlFor="bk-lug">{p.c.luggage}</label>
            <input id="bk-lug" name="luggage" type="number" min={0} max={60} defaultValue={2} className="field" />
          </div>
        </div>
      )}
      {p.kind === "car" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="bk-pick">{p.s.pickupLocation}</label>
            <input id="bk-pick" name="pickup" className="field" required maxLength={200} />
          </div>
          <div>
            <label className="field-label" htmlFor="bk-drop">{p.s.dropoffLocation}</label>
            <input id="bk-drop" name="dropoff" className="field" maxLength={200} />
          </div>
        </div>
      )}
      {p.kind === "experience" && (
        <div>
          <label className="field-label" htmlFor="bk-pick">{p.s.address}</label>
          <input id="bk-pick" name="pickup" className="field" maxLength={200} />
        </div>
      )}

      <div className="rounded-xl border border-noor-line p-3">
        <Counter label={p.b.adults} hint={p.s.adultsHint} value={adults} min={1} max={Math.min(50, p.maxPax)} onChange={setAdults} />
        {p.kind !== "car" && <Counter label={p.b.children} hint={p.s.childrenHint} value={children} min={0} max={Math.max(0, p.maxPax - adults)} onChange={setChildren} />}
      </div>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-extrabold text-noor-ink">{p.b.contact}</legend>
        <div>
          <label className="field-label" htmlFor="bk-name">{p.c.name}</label>
          <input id="bk-name" name="name" className="field" required defaultValue={p.user.name} autoComplete="name" />
        </div>
        <div>
          <label className="field-label" htmlFor="bk-email">{p.c.email}</label>
          <input id="bk-email" name="email" type="email" className="field" required defaultValue={p.user.email} autoComplete="email" />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="bk-phone">{p.c.phone}</label>
          <input id="bk-phone" name="phone" type="tel" className="field" required minLength={6} defaultValue={p.user.phone ?? ""} autoComplete="tel" />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="bk-notes">{p.c.notes}</label>
          <textarea id="bk-notes" name="notes" className="field min-h-20" maxLength={2000} />
        </div>
      </fieldset>

      <p className="text-xs text-noor-muted">{canPay ? p.b.payNote : p.b.requestNote}</p>
      {errorText && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-noor-red" data-testid="booking-error">{errorText}</p>}
      <button className="btn btn-primary w-full" disabled={pending || overCapacity || (useSlots && !slotId)} data-testid="booking-submit">
        {pending ? p.c.loading : canPay ? p.b.submit : p.b.submitRequest}
      </button>
    </form>
  );
}
