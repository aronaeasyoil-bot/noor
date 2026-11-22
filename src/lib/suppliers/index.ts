import "server-only";

/**
 * Supplier adapters. Each adapter returns REAL supplier data or reports that it is not configured.
 * There is no mock inventory: when no supplier is connected, pages offer to send the search to an adviser.
 */
export type FlightOffer = {
  id: string;
  supplier: string;
  totalMinor: number;
  currency: string;
  segments: { from: string; to: string; departAt: string; arriveAt: string; carrier: string; flightNumber: string }[];
  stops: number;
  cabin: string;
};

export type FlightQuery = {
  legs: { from: string; to: string; date: string }[];
  adults: number;
  children: number;
  infants: number;
  cabin: string;
  direct: boolean;
};

export type SupplierResult<T> = { status: "ok"; items: T[] } | { status: "not_configured" } | { status: "error"; message: string };

export interface FlightSupplier {
  readonly name: string;
  search(q: FlightQuery): Promise<SupplierResult<FlightOffer>>;
}

/** Amadeus Self-Service / Enterprise adapter. Needs AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET (server-side only). */
class AmadeusFlights implements FlightSupplier {
  readonly name = "amadeus";
  private token: { value: string; exp: number } | null = null;
  constructor(private id: string, private secret: string, private base: string) {}

  private async auth(): Promise<string> {
    if (this.token && this.token.exp > Date.now() + 30_000) return this.token.value;
    const res = await fetch(`${this.base}/v1/security/oauth2/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "client_credentials", client_id: this.id, client_secret: this.secret }),
    });
    if (!res.ok) throw new Error(`Amadeus auth ${res.status}`);
    const j = (await res.json()) as { access_token: string; expires_in: number };
    this.token = { value: j.access_token, exp: Date.now() + j.expires_in * 1000 };
    return j.access_token;
  }

  async search(q: FlightQuery): Promise<SupplierResult<FlightOffer>> {
    try {
      const token = await this.auth();
      const travelers = [
        ...Array.from({ length: q.adults }, (_, i) => ({ id: String(i + 1), travelerType: "ADULT" })),
        ...Array.from({ length: q.children }, (_, i) => ({ id: String(q.adults + i + 1), travelerType: "CHILD" })),
        ...Array.from({ length: q.infants }, (_, i) => ({ id: String(q.adults + q.children + i + 1), travelerType: "HELD_INFANT", associatedAdultId: String(i + 1) })),
      ];
      const body = {
        currencyCode: "AED",
        originDestinations: q.legs.map((l, i) => ({ id: String(i + 1), originLocationCode: l.from, destinationLocationCode: l.to, departureDateTimeRange: { date: l.date } })),
        travelers,
        sources: ["GDS"],
        searchCriteria: { maxFlightOffers: 30, flightFilters: { cabinRestrictions: [{ cabin: q.cabin, coverage: "MOST_SEGMENTS", originDestinationIds: q.legs.map((_, i) => String(i + 1)) }], connectionRestriction: q.direct ? { maxNumberOfConnections: 0 } : undefined } },
      };
      const res = await fetch(`${this.base}/v2/shopping/flight-offers`, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) return { status: "error", message: `Amadeus ${res.status}` };
      type Seg = { departure: { iataCode: string; at: string }; arrival: { iataCode: string; at: string }; carrierCode: string; number: string };
      const j = (await res.json()) as { data?: { id: string; price: { grandTotal: string; currency: string }; itineraries: { segments: Seg[] }[] }[] };
      const items = (j.data ?? []).map((o) => {
        const segs = o.itineraries.flatMap((it) => it.segments);
        return {
          id: o.id,
          supplier: this.name,
          totalMinor: Math.round(Number(o.price.grandTotal) * 100),
          currency: o.price.currency,
          segments: segs.map((s) => ({ from: s.departure.iataCode, to: s.arrival.iataCode, departAt: s.departure.at, arriveAt: s.arrival.at, carrier: s.carrierCode, flightNumber: `${s.carrierCode}${s.number}` })),
          stops: Math.max(0, ...o.itineraries.map((it) => it.segments.length - 1)),
          cabin: q.cabin,
        };
      });
      return { status: "ok", items };
    } catch (err) {
      return { status: "error", message: String(err).slice(0, 200) };
    }
  }
}

export function getFlightSupplier(): FlightSupplier | null {
  const id = process.env.AMADEUS_CLIENT_ID;
  const secret = process.env.AMADEUS_CLIENT_SECRET;
  if (!id || !secret) return null;
  return new AmadeusFlights(id, secret, process.env.AMADEUS_BASE_URL ?? "https://test.api.amadeus.com");
}

/** Hotel inventory (e.g. a bedbank or channel manager). No adapter is enabled until a contract and credentials exist. */
export function getHotelSupplier(): null {
  return null;
}

/** Live status of every external integration, shown in admin › Suppliers. Never exposes secret values. */
export function integrationStatus() {
  const set = (...k: string[]) => k.every((x) => !!process.env[x]);
  return [
    { key: "flights.amadeus", configured: set("AMADEUS_CLIENT_ID", "AMADEUS_CLIENT_SECRET"), env: ["AMADEUS_CLIENT_ID", "AMADEUS_CLIENT_SECRET", "AMADEUS_BASE_URL"] },
    { key: "flights.sabre", configured: false, env: ["(adapter to build once a Sabre contract exists)"] },
    { key: "flights.travelport", configured: false, env: ["(adapter to build once a Travelport contract exists)"] },
    { key: "hotels", configured: false, env: ["(adapter to build once a hotel supplier contract exists)"] },
    { key: "payments.stripe", configured: set("STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"), env: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] },
    { key: "email.resend", configured: set("RESEND_API_KEY", "EMAIL_FROM"), env: ["RESEND_API_KEY", "EMAIL_FROM", "OPS_EMAIL"] },
    { key: "assistant.llm", configured: set("ANTHROPIC_API_KEY"), env: ["ANTHROPIC_API_KEY", "ASSISTANT_MODEL"] },
    { key: "rates", configured: true, env: ["EXCHANGE_RATE_URL (optional)"] },
  ];
}
