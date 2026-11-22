import type { Product } from "@/lib/db/schema";

/** Total in AED fils for a NOOR-managed product. Returns null when the product has no price (request only). */
export function computeAmount(product: Pick<Product, "priceMinor" | "priceUnit" | "status"> | null | undefined, adults: number, children: number, days = 1): number | null {
  if (!product || product.status !== "active" || !product.priceMinor || product.priceMinor <= 0) return null;
  const pax = Math.max(0, adults) + Math.max(0, children);
  switch (product.priceUnit) {
    case "per_person":
      return product.priceMinor * pax;
    case "per_day":
      return product.priceMinor * Math.max(1, days);
    case "per_vehicle":
    case "per_group":
      return product.priceMinor;
  }
}

export const bookingStatusLabelKey = {
  requested: "statusRequested",
  pending_payment: "statusPending",
  confirmed: "statusConfirmed",
  cancellation_requested: "statusCancellationRequested",
  cancelled: "statusCancelled",
  refunded: "statusRefunded",
  failed: "statusFailed",
} as const;
