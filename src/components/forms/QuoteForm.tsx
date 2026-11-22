"use client";

import { useActionState } from "react";
import { submitQuoteAction, type FormState } from "@/app/actions/commerce";
import { whatsappLink } from "@/lib/contact";
import { WhatsAppIcon } from "@/components/icons";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  locale: Locale;
  q: Dictionary["quote"];
  c: Dictionary["common"];
  rateLimited: string;
  services: { value: string; label: string }[];
  defaultService?: string;
  /** Search or page context saved with the request (e.g. the flight search the customer made). */
  context?: Record<string, unknown>;
  defaultMessage?: string;
  whatsappPrefill: string;
  user?: { name: string; email: string; phone: string | null } | null;
  compact?: boolean;
};

/** Every service without a live supplier is sold through this form; requests land in admin › Quote requests. */
export function QuoteForm({ locale, q, c, rateLimited, services, defaultService, context, defaultMessage, whatsappPrefill, user, compact }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitQuoteAction, {});
  const fe = state.fieldErrors ?? {};
  if (state.ok && state.reference) {
    return (
      <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5" data-testid="quote-success">
        <p className="text-lg font-extrabold text-emerald-900">{q.success}</p>
        <p className="mt-1 text-emerald-900">{q.successBody.replace("{ref}", state.reference)}</p>
        <a className="btn btn-whatsapp mt-4" href={whatsappLink(`${whatsappPrefill} (${state.reference})`)} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon size={18} /> {c.whatsappUs}
        </a>
      </div>
    );
  }
  const err = (k: string) => (fe[k] ? <p className="mt-1 text-xs font-semibold text-noor-red">{c.required}</p> : null);
  return (
    <form action={action} className="grid grid-cols-1 gap-4" data-testid="quote-form">
      <input type="hidden" name="locale" value={locale} />
      {context && <input type="hidden" name="context" value={JSON.stringify(context)} />}
      <div className="hidden" aria-hidden="true">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className={`grid grid-cols-1 gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
        <div className={compact ? "" : "sm:col-span-2"}>
          <label className="field-label" htmlFor="q-service">{q.service}</label>
          <select id="q-service" name="service" className="field" defaultValue={defaultService ?? services[0]?.value} required>
            {services.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="q-name">{c.name}</label>
          <input id="q-name" name="name" className="field" required minLength={2} autoComplete="name" defaultValue={user?.name} aria-invalid={!!fe.name} />
          {err("name")}
        </div>
        <div>
          <label className="field-label" htmlFor="q-email">{c.email}</label>
          <input id="q-email" name="email" type="email" className="field" required autoComplete="email" defaultValue={user?.email} aria-invalid={!!fe.email} />
          {err("email")}
        </div>
        <div>
          <label className="field-label" htmlFor="q-phone">{c.phone}</label>
          <input id="q-phone" name="phone" type="tel" className="field" autoComplete="tel" defaultValue={user?.phone ?? undefined} />
        </div>
        <div>
          <label className="field-label" htmlFor="q-travellers">{q.travellers}</label>
          <input id="q-travellers" name="travellers" type="number" min={1} max={500} className="field" defaultValue={2} />
        </div>
        <div>
          <label className="field-label" htmlFor="q-date">{q.travelDate}</label>
          <input id="q-date" name="travelDate" type="date" className="field" />
        </div>
        <div>
          <label className="field-label" htmlFor="q-return">{q.returnDate}</label>
          <input id="q-return" name="returnDate" type="date" className="field" />
        </div>
        <div className={compact ? "" : "sm:col-span-2"}>
          <label className="field-label" htmlFor="q-budget">{q.budget}</label>
          <input id="q-budget" name="budget" className="field" maxLength={60} />
        </div>
        <div className={compact ? "" : "sm:col-span-2"}>
          <label className="field-label" htmlFor="q-message">{q.details}</label>
          <textarea id="q-message" name="message" className="field min-h-28" required minLength={5} maxLength={4000} defaultValue={defaultMessage} aria-invalid={!!fe.message} />
          {err("message")}
        </div>
      </div>
      <label className="flex items-start gap-2 text-sm text-noor-ink">
        <input type="checkbox" name="consent" required className="mt-1 size-4 accent-noor-red" />
        <span>{q.consent}</span>
      </label>
      {state.error && state.error !== "validation" && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-noor-red">
          {state.error === "rateLimited" ? rateLimited : c.error}
        </p>
      )}
      <div className={`flex flex-col gap-3 ${compact ? "" : "sm:flex-row"}`}>
        <button className="btn btn-primary" disabled={pending} data-testid="quote-submit">
          {pending ? c.loading : q.submit}
        </button>
        <a className="btn btn-whatsapp" href={whatsappLink(whatsappPrefill)} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon size={18} /> {c.whatsappUs}
        </a>
      </div>
    </form>
  );
}
