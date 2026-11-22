"use client";

import { useActionState } from "react";
import { submitVisaAction, type VisaState } from "@/app/actions/visa";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

export function VisaForm({ locale, v, c, name, rateLimited }: { locale: Locale; v: Dictionary["visa"]; c: Dictionary["common"]; name: string; rateLimited: string }) {
  const [state, action, pending] = useActionState<VisaState, FormData>(submitVisaAction, {});
  const err = state.error === "file" ? v.uploadHint : state.error === "rateLimited" ? rateLimited : state.error ? c.error : null;
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2" data-testid="visa-form">
      <input type="hidden" name="locale" value={locale} />
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="v-name">{c.name}</label>
        <input id="v-name" name="applicantName" className="field" required defaultValue={name} />
      </div>
      <div>
        <label className="field-label" htmlFor="v-nat">{v.nationality}</label>
        <input id="v-nat" name="nationality" className="field" required />
      </div>
      <div>
        <label className="field-label" htmlFor="v-res">{v.residence}</label>
        <input id="v-res" name="residence" className="field" />
      </div>
      <div>
        <label className="field-label" htmlFor="v-dest">{v.destination}</label>
        <input id="v-dest" name="destination" className="field" required defaultValue="United Arab Emirates" />
      </div>
      <div>
        <label className="field-label" htmlFor="v-type">{v.type}</label>
        <select id="v-type" name="visaType" className="field">
          {Object.entries(v.types).map(([k, label]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="field-label" htmlFor="v-date">{c.date}</label>
        <input id="v-date" name="travelDate" type="date" className="field" />
      </div>
      <fieldset className="sm:col-span-2">
        <legend className="field-label">{v.upload}</legend>
        <p className="mb-3 text-xs text-noor-muted">{v.uploadHint}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(v.docKinds).map(([k, label]) => (
            <label key={k} className="block rounded-xl border border-dashed border-noor-line p-3 text-sm">
              <span className="font-bold">{label}</span>
              <input type="file" name={`doc_${k}`} accept="application/pdf,image/jpeg,image/png" multiple={k === "other"} className="mt-2 block w-full text-xs" />
            </label>
          ))}
        </div>
      </fieldset>
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="v-msg">{c.message}</label>
        <textarea id="v-msg" name="message" className="field min-h-24" maxLength={2000} />
      </div>
      {err && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-noor-red sm:col-span-2">{err}</p>}
      <button className="btn btn-primary sm:col-span-2" disabled={pending} data-testid="visa-submit">{pending ? c.loading : v.submit}</button>
    </form>
  );
}
