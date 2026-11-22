"use client";

import { useActionState, useRef } from "react";
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
  /** Full WhatsApp text (e.g. the chosen flight). Defaults to the generic prefill. */
  whatsappMessage?: string;
  whatsappLabel?: string;
  submitLabel?: string;
  defaultTravellers?: number;
  defaultDate?: string;
  defaultReturn?: string;
  /** Builds the WhatsApp text sent after submission, with the reference and the customer's details. */
  whatsappOnSuccess?: (v: { reference: string; name: string; email: string; phone: string; message: string; travellers: string }) => string;
  successWhatsappHint?: string;
  /** Hide the WhatsApp button before submission (the message is only complete once the request has a reference). */
  whatsappAfterSubmitOnly?: boolean;
  /** Labels for the structured WhatsApp message built after submission when no custom builder is given. */
  waLabels?: Dictionary["supplier"]["fares"]["wa"];
  waTitle?: string;
};

type Sent = { name: string; email: string; phone: string; message: string; travellers: string; service: string };

/** Structured WhatsApp text: title, reference, customer, service and the request details. */
export function genericWhatsapp(w: Dictionary["supplier"]["fares"]["wa"], title: string, reference: string, v: Sent, serviceLabel: string) {
  const out = [`*${title}*`, `${w.reference} : *${reference}*`, "", `*${w.client}*`, `${w.name} : ${v.name}`];
  if (v.phone) out.push(`${w.phone} : ${v.phone}`);
  out.push(`${w.email} : ${v.email}`, "", `${w.service} : ${serviceLabel}`);
  if (v.travellers) out.push(`${w.travellers} : ${v.travellers}`);
  if (v.message) out.push("", `*${w.details}*`, v.message);
  return out.join("\n");
}

/** Every service without a live supplier is sold through this form; requests land in admin › Quote requests. */
export function QuoteForm({ locale, q, c, rateLimited, services, defaultService, context, defaultMessage, whatsappPrefill, user, compact, whatsappMessage, whatsappLabel, submitLabel, defaultTravellers, defaultDate, defaultReturn, whatsappOnSuccess, successWhatsappHint, whatsappAfterSubmitOnly, waLabels, waTitle }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitQuoteAction, {});
  const fe = state.fieldErrors ?? {};
  const sent = useRef<Sent>({ name: "", email: "", phone: "", message: "", travellers: "", service: "" });
  if (state.ok && state.reference) {
    const v = sent.current;
    const waText = whatsappOnSuccess
      ? whatsappOnSuccess({ reference: state.reference, ...v })
      : waLabels
        ? genericWhatsapp(waLabels, waTitle ?? waLabels.genericTitle, state.reference, v, services.find((o) => o.value === v.service)?.label ?? v.service)
        : `${whatsappMessage ?? whatsappPrefill}\n\nRef: ${state.reference}`;
    return (
      <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5" data-testid="quote-success">
        <p className="text-lg font-extrabold text-emerald-900">{q.success}</p>
        <p className="mt-1 text-emerald-900">{q.successBody.replace("{ref}", state.reference)}</p>
        {successWhatsappHint && <p className="mt-3 text-sm font-semibold text-emerald-900">{successWhatsappHint}</p>}
        <a className="btn btn-whatsapp mt-4 w-full whitespace-normal text-center" href={whatsappLink(waText)} target="_blank" rel="noopener noreferrer" data-testid="quote-success-whatsapp">
          <WhatsAppIcon size={18} /> {whatsappLabel ?? c.whatsappUs}
        </a>
      </div>
    );
  }
  const err = (k: string) => (fe[k] ? <p className="mt-1 text-xs font-semibold text-noor-red">{c.required}</p> : null);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        const f = new FormData(e.currentTarget);
        const g = (k: string) => String(f.get(k) ?? "").trim();
        sent.current = { name: g("name"), email: g("email"), phone: g("phone"), message: g("message"), travellers: g("travellers"), service: g("service") };
      }}
      className="grid grid-cols-1 gap-4"
      data-testid="quote-form"
    >
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
          <input id="q-travellers" name="travellers" type="number" min={1} max={500} className="field" defaultValue={defaultTravellers ?? 2} />
        </div>
        <div>
          <label className="field-label" htmlFor="q-date">{q.travelDate}</label>
          <input id="q-date" name="travelDate" type="date" className="field" defaultValue={defaultDate} />
        </div>
        <div>
          <label className="field-label" htmlFor="q-return">{q.returnDate}</label>
          <input id="q-return" name="returnDate" type="date" className="field" defaultValue={defaultReturn} />
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
          {pending ? c.loading : (submitLabel ?? q.submit)}
        </button>
        {!whatsappAfterSubmitOnly && (
        <a className="btn btn-whatsapp" href={whatsappLink(whatsappMessage ?? whatsappPrefill)} target="_blank" rel="noopener noreferrer" data-testid="quote-whatsapp">
          <WhatsAppIcon size={18} /> {whatsappLabel ?? c.whatsappUs}
        </a>
        )}
      </div>
    </form>
  );
}
