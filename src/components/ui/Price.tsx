import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/lib/db/schema";
import { convertMinor, getDisplayCurrency, getRates, BILLING_CURRENCY } from "@/lib/currency";
import { formatMoney } from "@/lib/format";
import { isBookableOnline } from "@/lib/products";

/**
 * Shows a price ONLY when NOOR staff have set one in the administration.
 * The billed amount is always AED; another display currency is labelled as approximate.
 */
export async function Price({ product, dict, locale, size = "md" }: { product: Product | null | undefined; dict: Dictionary; locale: Locale; size?: "md" | "lg" }) {
  if (!isBookableOnline(product)) {
    return <p className={`font-bold text-noor-navy ${size === "lg" ? "text-lg" : "text-sm"}`}>{dict.common.priceOnRequest}</p>;
  }
  const [currency, rates] = await Promise.all([getDisplayCurrency(), getRates()]);
  const converted = convertMinor(product.priceMinor, currency, rates);
  const showCurrency = converted === null ? BILLING_CURRENCY : currency;
  const amount = converted ?? product.priceMinor;
  const unit = {
    per_person: dict.common.perPerson,
    per_vehicle: dict.common.perVehicle,
    per_group: dict.common.perGroup,
    per_day: dict.common.perDay,
  }[product.priceUnit];
  return (
    <div>
      <p className="text-xs text-noor-muted">{dict.common.from}</p>
      <p className={`font-extrabold text-noor-red ${size === "lg" ? "text-2xl" : "text-lg"}`} data-testid="price">
        {showCurrency !== BILLING_CURRENCY && "≈ "}
        {formatMoney(amount, showCurrency, locale)}
        <span className="ms-1 text-xs font-semibold text-noor-muted">{unit}</span>
      </p>
      {showCurrency !== BILLING_CURRENCY && (
        <p className="text-[11px] text-noor-muted">{formatMoney(product.priceMinor, BILLING_CURRENCY, locale)}</p>
      )}
    </div>
  );
}
