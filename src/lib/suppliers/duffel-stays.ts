/**
 * Duffel Stays hotel search (https://duffel.com/docs/api/v2/search/stays-search).
 * Search only: the customer picks a hotel and sends a request; NOOR confirms, takes payment and books.
 * Uses the same DUFFEL_ACCESS_TOKEN as flights. Stays must be enabled on the Duffel account.
 */
import type { HotelOffer, HotelQuery, HotelSupplier, SupplierResult } from "./types";

/** Known NOOR hotel areas (centre point, search radius). Other places are geocoded with Duffel Places. */
export const AREAS: { match: RegExp; lat: number; lng: number; radiusKm: number; label: string }[] = [
  { match: /downtown|burj khalifa|dubai mall|وسط/i, lat: 25.1972, lng: 55.2744, radiusKm: 3, label: "Downtown Dubai" },
  { match: /palm|نخلة/i, lat: 25.1124, lng: 55.139, radiusKm: 5, label: "Palm Jumeirah" },
  { match: /marina|jbr|مرسى/i, lat: 25.0805, lng: 55.1403, radiusKm: 3, label: "Dubai Marina & JBR" },
  { match: /jumeirah|jumeira|جميرا/i, lat: 25.1838, lng: 55.2386, radiusKm: 5, label: "Jumeirah" },
  { match: /deira|creek|bur dubai|ديرة|خور/i, lat: 25.2632, lng: 55.3009, radiusKm: 4, label: "Deira & Dubai Creek" },
  { match: /abu ?dhabi|abou ?dhabi|أبوظبي/i, lat: 24.4539, lng: 54.3773, radiusKm: 15, label: "Abu Dhabi" },
  { match: /^(dubai|dubaï|دبي)$/i, lat: 25.2048, lng: 55.2708, radiusKm: 15, label: "Dubai" },
];

type DStay = {
  id: string;
  cheapest_rate_total_amount: string;
  cheapest_rate_currency: string;
  accommodation: {
    id: string;
    name: string;
    rating?: number | null;
    review_score?: number | null;
    review_count?: number | null;
    photos?: { url: string }[];
    location?: { address?: { line_one?: string | null; city_name?: string | null; country_code?: string | null } | null } | null;
  };
};

export function mapStay(r: DStay): HotelOffer {
  const a = r.accommodation;
  const addr = a.location?.address;
  return {
    id: r.id,
    supplier: "duffel",
    accommodationId: a.id,
    name: a.name,
    stars: a.rating ?? null,
    reviewScore: a.review_score ?? null,
    reviewCount: a.review_count ?? null,
    photo: a.photos?.[0]?.url ?? null,
    address: [addr?.line_one, addr?.city_name].filter(Boolean).join(", "),
    city: addr?.city_name ?? null,
    totalMinor: Math.round(Number(r.cheapest_rate_total_amount) * 100),
    currency: r.cheapest_rate_currency,
  };
}

export class DuffelStays implements HotelSupplier {
  readonly name = "duffel";
  constructor(private token: string, private base = "https://api.duffel.com") {}

  private headers() {
    return { authorization: `Bearer ${this.token}`, "duffel-version": "v2", "content-type": "application/json", accept: "application/json" };
  }

  async geocode(query: string) {
    const q = query.trim();
    const area = AREAS.find((a) => a.match.test(q));
    if (area) return { lat: area.lat, lng: area.lng, radiusKm: area.radiusKm, label: area.label };
    try {
      const res = await fetch(`${this.base}/places/suggestions?query=${encodeURIComponent(q)}`, { headers: this.headers(), signal: AbortSignal.timeout(8000), cache: "no-store" });
      if (!res.ok) return null;
      const j = (await res.json()) as { data?: { type: string; name: string; latitude?: number | null; longitude?: number | null; city_name?: string | null }[] };
      const p = j.data?.find((x) => x.type === "city" && x.latitude != null) ?? j.data?.find((x) => x.latitude != null);
      if (!p || p.latitude == null || p.longitude == null) return null;
      return { lat: p.latitude, lng: p.longitude, radiusKm: p.type === "city" ? 10 : 5, label: p.name };
    } catch {
      return null;
    }
  }

  async search(q: HotelQuery): Promise<SupplierResult<HotelOffer>> {
    const body = {
      data: {
        location: { radius: q.radiusKm, geographic_coordinates: { latitude: q.lat, longitude: q.lng } },
        check_in_date: q.checkin,
        check_out_date: q.checkout,
        rooms: q.rooms,
        guests: Array.from({ length: q.adults }, () => ({ type: "adult" })),
      },
    };
    try {
      const res = await fetch(`${this.base}/stays/search`, { method: "POST", headers: this.headers(), body: JSON.stringify(body), signal: AbortSignal.timeout(28_000), cache: "no-store" });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { errors?: { title?: string }[] } | null;
        return { status: "error", message: `Duffel Stays ${res.status} ${j?.errors?.[0]?.title ?? ""}`.trim() };
      }
      const j = (await res.json()) as { data?: { results?: DStay[] } };
      const items = (j.data?.results ?? [])
        .filter((r) => r.cheapest_rate_total_amount && r.accommodation?.name)
        .map(mapStay)
        .sort((a, b) => a.totalMinor - b.totalMinor)
        .slice(0, 40);
      return { status: "ok", items };
    } catch (err) {
      return { status: "error", message: String(err).slice(0, 200) };
    }
  }
}
