import type { Locale } from "./i18n/config";

/** Replaces {name} placeholders in a translated string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? `{${k}}`));
}

const intlLocale: Record<Locale, string> = { en: "en-AE", fr: "fr-FR", ar: "ar-AE" };

export function formatMoney(amountMinor: number, currency: string, locale: Locale): string {
  const digits = currency === "XOF" ? 0 : 2;
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    numberingSystem: "latn",
  }).format(amountMinor / 100);
}

export function formatDate(value: string | Date, locale: Locale, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }): string {
  const d = typeof value === "string" ? new Date(value.length === 10 ? `${value}T00:00:00Z` : value) : value;
  return new Intl.DateTimeFormat(intlLocale[locale], { ...opts, timeZone: "Asia/Dubai", numberingSystem: "latn" }).format(d);
}

/** Today's date in Dubai as YYYY-MM-DD. */
export function todayInDubai(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(new Date());
}
