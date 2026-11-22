/**
 * Duffel flight search (https://duffel.com/docs/api/v2/offer-requests).
 * Search only: NOOR shows the live fares, the customer sends the chosen flight as a request,
 * and an adviser confirms the price, takes payment and issues the ticket manually.
 * The access token stays on the server (DUFFEL_ACCESS_TOKEN runtime secret).
 */
import type { FlightOffer, FlightQuery, FlightSupplier, SupplierResult } from "./types";

const CABIN: Record<string, string> = { ECONOMY: "economy", PREMIUM_ECONOMY: "premium_economy", BUSINESS: "business", FIRST: "first" };

/** "PT7H35M" / "P1DT2H" → minutes, or null. */
export function isoDurationMinutes(d: string | null | undefined): number | null {
  if (!d) return null;
  const m = d.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/);
  if (!m) return null;
  return Number(m[1] ?? 0) * 1440 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

type DPlace = { iata_code: string; city_name?: string | null; name?: string };
type DCarrier = { name: string; iata_code: string | null; logo_symbol_url?: string | null };
type DSegment = {
  origin: DPlace;
  destination: DPlace;
  departing_at: string;
  arriving_at: string;
  duration?: string | null;
  marketing_carrier: DCarrier;
  operating_carrier?: DCarrier;
  marketing_carrier_flight_number: string;
  aircraft?: { name: string } | null;
  passengers?: { baggages?: { type: string; quantity: number }[]; cabin_class_marketing_name?: string }[];
};
export type DuffelOffer = {
  id: string;
  live_mode: boolean;
  total_amount: string;
  total_currency: string;
  expires_at?: string | null;
  owner: DCarrier;
  slices: { origin: DPlace; destination: DPlace; duration?: string | null; segments: DSegment[] }[];
  conditions?: { refund_before_departure?: { allowed: boolean } | null; change_before_departure?: { allowed: boolean } | null };
};

export function mapDuffelOffer(o: DuffelOffer, cabin: string): FlightOffer {
  const slices = o.slices.map((sl) => {
    const segs = sl.segments;
    const first = segs[0]!;
    const last = segs[segs.length - 1]!;
    return {
      from: sl.origin.iata_code,
      to: sl.destination.iata_code,
      departAt: first.departing_at,
      arriveAt: last.arriving_at,
      durationMin: isoDurationMinutes(sl.duration),
      segments: segs.map((s) => ({
        from: s.origin.iata_code,
        to: s.destination.iata_code,
        departAt: s.departing_at,
        arriveAt: s.arriving_at,
        carrier: s.marketing_carrier.iata_code ?? "",
        carrierName: s.marketing_carrier.name,
        operatedBy: s.operating_carrier && s.operating_carrier.name !== s.marketing_carrier.name ? s.operating_carrier.name : null,
        flightNumber: `${s.marketing_carrier.iata_code ?? ""}${s.marketing_carrier_flight_number}`,
        durationMin: isoDurationMinutes(s.duration),
        aircraft: s.aircraft?.name ?? null,
      })),
    };
  });
  const bags = o.slices[0]?.segments[0]?.passengers?.[0]?.baggages;
  const count = (t: string) => (bags ? bags.filter((b) => b.type === t).reduce((n, b) => n + b.quantity, 0) : null);
  return {
    id: o.id,
    supplier: "duffel",
    live: o.live_mode,
    totalMinor: Math.round(Number(o.total_amount) * 100),
    currency: o.total_currency,
    airline: { code: o.owner.iata_code ?? "", name: o.owner.name, logo: o.owner.logo_symbol_url ?? null },
    slices,
    stops: Math.max(0, ...slices.map((s) => s.segments.length - 1)),
    cabin,
    fareName: o.slices[0]?.segments[0]?.passengers?.[0]?.cabin_class_marketing_name ?? null,
    baggage: { checked: count("checked"), carryOn: count("carry_on") },
    refundable: o.conditions?.refund_before_departure?.allowed ?? null,
    changeable: o.conditions?.change_before_departure?.allowed ?? null,
    expiresAt: o.expires_at ?? null,
  };
}

export class DuffelFlights implements FlightSupplier {
  readonly name = "duffel";
  constructor(private token: string, private base = "https://api.duffel.com") {}

  get testMode(): boolean {
    return this.token.startsWith("duffel_test_");
  }

  async search(q: FlightQuery): Promise<SupplierResult<FlightOffer>> {
    const passengers = [
      ...Array.from({ length: q.adults }, () => ({ type: "adult" })),
      ...Array.from({ length: q.children }, () => ({ type: "child" })),
      ...Array.from({ length: q.infants }, () => ({ type: "infant_without_seat" })),
    ];
    const body = {
      data: {
        slices: q.legs.map((l) => ({ origin: l.from, destination: l.to, departure_date: l.date })),
        passengers,
        cabin_class: CABIN[q.cabin] ?? "economy",
        ...(q.direct ? { max_connections: 0 } : {}),
      },
    };
    try {
      const res = await fetch(`${this.base}/air/offer_requests?return_offers=true&supplier_timeout=20000`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.token}`,
          "duffel-version": "v2",
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(28_000),
        cache: "no-store",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { errors?: { title?: string; message?: string }[] } | null;
        return { status: "error", message: `Duffel ${res.status} ${j?.errors?.[0]?.title ?? ""}`.trim() };
      }
      const j = (await res.json()) as { data?: { offers?: DuffelOffer[] } };
      const items = (j.data?.offers ?? [])
        .filter((o) => o.slices.every((s) => s.segments.length > 0))
        .map((o) => mapDuffelOffer(o, q.cabin))
        .sort((a, b) => a.totalMinor - b.totalMinor)
        .slice(0, 40);
      return { status: "ok", items };
    } catch (err) {
      return { status: "error", message: String(err).slice(0, 200) };
    }
  }
}
