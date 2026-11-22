import { getDisplayCurrency, getRates, BILLING_CURRENCY } from "@/lib/currency";
import { formatDate } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/** States the billing currency and the date of the exchange rate used for indicative conversions. */
export async function CurrencyNote({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [currency, rates] = await Promise.all([getDisplayCurrency(), getRates()]);
  const text =
    currency !== BILLING_CURRENCY && rates.date && rates.rates[currency]
      ? dict.common.currencyNote.replace("{date}", formatDate(rates.date, locale, { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dubai" }))
      : dict.common.currencyNoRate;
  return <p className="mt-2 text-xs text-noor-muted" data-testid="currency-note">{text}</p>;
}
