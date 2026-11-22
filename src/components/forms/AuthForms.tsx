"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, requestResetAction, resetPasswordAction, signInAction, updateProfileAction, type AuthState } from "@/app/actions/auth";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

type A = Dictionary["auth"];
type C = Dictionary["common"];

function ErrorBox({ state, a, c }: { state: AuthState; a: A; c: C }) {
  if (!state.error) return null;
  const msg = { invalid: a.invalid, exists: a.exists, rateLimited: a.rateLimited, validation: a.passwordHint, unavailable: c.error, resetInvalid: a.resetInvalid }[state.error];
  return <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-noor-red" data-testid="auth-error">{msg}</p>;
}

export function SignInForm({ locale, next, a, c, resetDone }: { locale: Locale; next?: string; a: A; c: C; resetDone?: boolean }) {
  const [state, action, pending] = useActionState(signInAction, {});
  return (
    <form action={action} className="grid gap-4" data-testid="signin-form">
      {resetDone && <p className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{a.resetDone}</p>}
      <input type="hidden" name="locale" value={locale} />
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label className="field-label" htmlFor="si-email">{a.email}</label>
        <input id="si-email" name="email" type="email" className="field" required autoComplete="email" defaultValue={state.fields?.email} />
      </div>
      <div>
        <label className="field-label" htmlFor="si-pass">{a.password}</label>
        <input id="si-pass" name="password" type="password" className="field" required autoComplete="current-password" />
      </div>
      <ErrorBox state={state} a={a} c={c} />
      <button className="btn btn-primary" disabled={pending} data-testid="signin-submit">{pending ? c.loading : a.signIn}</button>
      <div className="flex flex-wrap justify-between gap-2 text-sm">
        <Link href={`/${locale}/account/forgot`} className="font-semibold text-noor-blue hover:underline">{a.forgot}</Link>
        <span>
          {a.noAccount} <Link href={`/${locale}/account/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-noor-red hover:underline">{a.register}</Link>
        </span>
      </div>
    </form>
  );
}

export function RegisterForm({ locale, next, a, c }: { locale: Locale; next?: string; a: A; c: C }) {
  const [state, action, pending] = useActionState(registerAction, {});
  return (
    <form action={action} className="grid gap-4" data-testid="register-form">
      <input type="hidden" name="locale" value={locale} />
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label className="field-label" htmlFor="rg-name">{a.name}</label>
        <input id="rg-name" name="name" className="field" required minLength={2} autoComplete="name" defaultValue={state.fields?.name} />
      </div>
      <div>
        <label className="field-label" htmlFor="rg-email">{a.email}</label>
        <input id="rg-email" name="email" type="email" className="field" required autoComplete="email" defaultValue={state.fields?.email} />
      </div>
      <div>
        <label className="field-label" htmlFor="rg-phone">{a.phone} ({c.optional})</label>
        <input id="rg-phone" name="phone" type="tel" className="field" autoComplete="tel" />
      </div>
      <div>
        <label className="field-label" htmlFor="rg-pass">{a.password}</label>
        <input id="rg-pass" name="password" type="password" className="field" required minLength={10} autoComplete="new-password" aria-describedby="rg-pass-hint" />
        <p id="rg-pass-hint" className="mt-1 text-xs text-noor-muted">{a.passwordHint}</p>
      </div>
      <ErrorBox state={state} a={a} c={c} />
      <button className="btn btn-primary" disabled={pending} data-testid="register-submit">{pending ? c.loading : a.register}</button>
      <p className="text-sm">
        {a.haveAccount} <Link href={`/${locale}/account/sign-in`} className="font-bold text-noor-red hover:underline">{a.signIn}</Link>
      </p>
    </form>
  );
}

export function ForgotForm({ locale, a, c }: { locale: Locale; a: A; c: C }) {
  const [state, action, pending] = useActionState(requestResetAction, {});
  if (state.ok) return <p role="status" className="rounded-lg bg-emerald-50 p-4 font-semibold text-emerald-800">{a.resetSent}</p>;
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="locale" value={locale} />
      <p className="text-sm text-noor-muted">{a.resetBody}</p>
      <div>
        <label className="field-label" htmlFor="fg-email">{a.email}</label>
        <input id="fg-email" name="email" type="email" className="field" required autoComplete="email" />
      </div>
      <ErrorBox state={state} a={a} c={c} />
      <button className="btn btn-primary" disabled={pending}>{pending ? c.loading : c.send}</button>
    </form>
  );
}

export function ResetForm({ locale, token, a, c }: { locale: Locale; token: string; a: A; c: C }) {
  const [state, action, pending] = useActionState(resetPasswordAction, {});
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="field-label" htmlFor="rs-pass">{a.resetNew}</label>
        <input id="rs-pass" name="password" type="password" className="field" required minLength={10} autoComplete="new-password" />
        <p className="mt-1 text-xs text-noor-muted">{a.passwordHint}</p>
      </div>
      <ErrorBox state={state} a={a} c={c} />
      <button className="btn btn-primary" disabled={pending}>{pending ? c.loading : c.save}</button>
    </form>
  );
}

export function ProfileForm({ locale, user, labels, c, a }: { locale: Locale; user: { name: string; email: string; phone: string | null; preferredCurrency: string }; labels: { updated: string; currency: string }; c: C; a: A }) {
  const [state, action, pending] = useActionState(updateProfileAction, {});
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2" data-testid="profile-form">
      <input type="hidden" name="locale" value={locale} />
      <div>
        <label className="field-label" htmlFor="pf-name">{a.name}</label>
        <input id="pf-name" name="name" className="field" required defaultValue={user.name} />
      </div>
      <div>
        <label className="field-label" htmlFor="pf-email">{a.email}</label>
        <input id="pf-email" className="field bg-noor-bg" value={user.email} readOnly />
      </div>
      <div>
        <label className="field-label" htmlFor="pf-phone">{a.phone}</label>
        <input id="pf-phone" name="phone" type="tel" className="field" defaultValue={user.phone ?? ""} />
      </div>
      <div>
        <label className="field-label" htmlFor="pf-cur">{labels.currency}</label>
        <select id="pf-cur" name="preferredCurrency" className="field" defaultValue={user.preferredCurrency}>
          {["AED", "USD", "EUR", "XOF", "GBP"].map((x) => <option key={x}>{x}</option>)}
        </select>
      </div>
      {state.ok && <p role="status" className="text-sm font-semibold text-emerald-700 sm:col-span-2">{labels.updated}</p>}
      <ErrorBox state={state} a={a} c={c} />
      <button className="btn btn-primary sm:col-span-2 sm:justify-self-start" disabled={pending}>{c.save}</button>
    </form>
  );
}
