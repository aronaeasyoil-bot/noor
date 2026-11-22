"use client";

import { useActionState } from "react";
import { subscribeAction, type FormState } from "@/app/actions/commerce";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

export function NewsletterForm({ locale, n, error }: { locale: Locale; n: Dictionary["newsletter"]; error: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribeAction, {});
  return (
    <form action={action} className="flex w-full max-w-md flex-col gap-2 sm:flex-row" data-testid="newsletter-form">
      <input type="hidden" name="locale" value={locale} />
      <label htmlFor="nl-email" className="sr-only">{n.placeholder}</label>
      <input id="nl-email" name="email" type="email" required placeholder={n.placeholder} className="field flex-1" autoComplete="email" />
      <button className="btn btn-primary" disabled={pending}>{n.cta}</button>
      <p role="status" className="text-sm font-semibold sm:basis-full" aria-live="polite">
        {state.ok ? (state.error === "already" ? n.already : n.success) : state.error ? error : ""}
      </p>
    </form>
  );
}
