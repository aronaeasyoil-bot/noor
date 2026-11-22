import "server-only";

/**
 * Supplier adapters. Each adapter returns REAL supplier data or reports that it is not configured.
 * There is no mock inventory: when no supplier is connected, pages offer to send the search to an adviser.
 */
import { DuffelFlights } from "./duffel";
import { DuffelStays } from "./duffel-stays";
import { LiteApiHotels } from "./liteapi";
import type { FlightSupplier, HotelSupplier } from "./types";

export type { FlightOffer, FlightQuery, FlightSlice, FlightSegment, FlightSupplier, HotelOffer, HotelQuery, HotelSupplier, SupplierResult } from "./types";

/**
 * Flight search supplier. Duffel gives live fares from many airlines; booking stays manual
 * (the customer sends the chosen flight to NOOR, an adviser confirms, takes payment and tickets).
 * Needs DUFFEL_ACCESS_TOKEN as a runtime secret. A "duffel_test_" token returns test fares, labelled as such.
 */
export function getFlightSupplier(): (FlightSupplier & { testMode: boolean }) | null {
  const token = process.env.DUFFEL_ACCESS_TOKEN;
  if (!token) return null;
  return new DuffelFlights(token, process.env.DUFFEL_API_URL || undefined); // DUFFEL_API_URL: only for local tests
}

/**
 * Hotel prices: LiteAPI when LITEAPI_KEY is set (self-serve), otherwise Duffel Stays (same token as flights,
 * needs Stays enabled by Duffel). Booking stays manual, like flights.
 */
export function getHotelSupplier(): HotelSupplier | null {
  const duffel = process.env.DUFFEL_ACCESS_TOKEN ? new DuffelStays(process.env.DUFFEL_ACCESS_TOKEN, process.env.DUFFEL_API_URL || undefined) : null;
  if (process.env.LITEAPI_KEY) return new LiteApiHotels(process.env.LITEAPI_KEY, duffel, process.env.LITEAPI_URL || undefined);
  return duffel;
}

/** Live status of every external integration, shown in admin › Suppliers. Never exposes secret values. */
export function integrationStatus() {
  const set = (...k: string[]) => k.every((x) => !!process.env[x]);
  return [
    { key: "flights.duffel", configured: set("DUFFEL_ACCESS_TOKEN"), env: ["DUFFEL_ACCESS_TOKEN"] },
    { key: "flights.sabre", configured: false, env: ["(adapter to build once a Sabre contract exists)"] },
    { key: "flights.travelport", configured: false, env: ["(adapter to build once a Travelport contract exists)"] },
    { key: "hotels.liteapi", configured: set("LITEAPI_KEY"), env: ["LITEAPI_KEY"] },
    { key: "hotels.duffel-stays", configured: set("DUFFEL_ACCESS_TOKEN"), env: ["DUFFEL_ACCESS_TOKEN (Stays must be enabled on the Duffel account)"] },
    { key: "payments.stripe", configured: set("STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"), env: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] },
    { key: "email.resend", configured: set("RESEND_API_KEY", "EMAIL_FROM"), env: ["RESEND_API_KEY", "EMAIL_FROM", "OPS_EMAIL"] },
    { key: "assistant.llm", configured: set("ANTHROPIC_API_KEY"), env: ["ANTHROPIC_API_KEY", "ASSISTANT_MODEL"] },
    { key: "rates", configured: true, env: ["EXCHANGE_RATE_URL (optional)"] },
  ];
}
