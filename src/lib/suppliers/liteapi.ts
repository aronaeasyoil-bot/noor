/**
 * LiteAPI (Nuitée) hotel prices (https://docs.liteapi.travel). Self-serve sign-up; search only.
 * The customer picks a hotel and sends a request; NOOR confirms, takes payment and books.
 * Needs LITEAPI_KEY (server-side secret). Sandbox keys start with "sand_".
 */
import type { HotelOffer, HotelQuery, HotelSupplier, SupplierResult } from "./types";
import { AREAS, DuffelStays } from "./duffel-stays";

type LRate = { name?: string; boardName?: string; refundableTag?: string; retailRate?: { total?: { amount: number; currency: string }[] } };
type LRoomType = { offerId?: string; offerRetailRate?: { amount: number; currency: string }; rates?: LRate[] };
type LHotelRates = { hotelId: string; roomTypes?: LRoomType[] };
type LHotel = { id: string; name: string; main_photo?: string | null; thumbnail?: string | null; address?: string | null; city?: string | null; stars?: number | null; starRating?: number | null; rating?: number | null; reviewCount?: number | null };

/** Cheapest total for a hotel across its room types. */
export function cheapest(h: LHotelRates): { amount: number; currency: string } | null {
  let best: { amount: number; currency: string } | null = null;
  for (const rt of h.roomTypes ?? []) {
    const candidates = [rt.offerRetailRate, ...(rt.rates ?? []).map((r) => r.retailRate?.total?.[0])].filter((x): x is { amount: number; currency: string } => !!x && Number.isFinite(Number(x.amount)));
    for (const c of candidates) if (!best || Number(c.amount) < best.amount) best = { amount: Number(c.amount), currency: c.currency };
  }
  return best;
}

export class LiteApiHotels implements HotelSupplier {
  readonly name = "liteapi";
  constructor(
    private key: string,
    private geocoder: DuffelStays | null,
    private base = "https://api.liteapi.travel/v3.0",
  ) {}

  private headers() {
    return { "x-api-key": this.key, "content-type": "application/json", accept: "application/json" };
  }

  async geocode(query: string) {
    const area = AREAS.find((a) => a.match.test(query.trim()));
    if (area) return { lat: area.lat, lng: area.lng, radiusKm: area.radiusKm, label: area.label };
    return this.geocoder ? this.geocoder.geocode(query) : null;
  }

  async search(q: HotelQuery): Promise<SupplierResult<HotelOffer>> {
    const perRoom = Math.max(1, Math.floor(q.adults / q.rooms));
    const extra = q.adults - perRoom * q.rooms;
    const body = {
      checkin: q.checkin,
      checkout: q.checkout,
      currency: "AED",
      guestNationality: "AE",
      occupancies: Array.from({ length: q.rooms }, (_, i) => ({ adults: perRoom + (i < extra ? 1 : 0) })),
      latitude: q.lat,
      longitude: q.lng,
      radius: Math.round(q.radiusKm * 1000),
      limit: 60,
      maxRatesPerHotel: 1,
      includeHotelData: true,
      timeout: 15,
    };
    try {
      const res = await fetch(`${this.base}/hotels/rates`, { method: "POST", headers: this.headers(), body: JSON.stringify(body), signal: AbortSignal.timeout(28_000), cache: "no-store" });
      const j = (await res.json().catch(() => null)) as { data?: LHotelRates[]; hotels?: LHotel[]; error?: { code?: number; message?: string } } | null;
      if (!res.ok) return { status: "error", message: `LiteAPI ${res.status} ${j?.error?.message ?? ""}`.trim() };
      if (!j?.data?.length) return j?.error && j.error.code !== 2001 ? { status: "error", message: `LiteAPI ${j.error.code} ${j.error.message ?? ""}` } : { status: "ok", items: [] };

      const priced = j.data.map((h) => ({ h, p: cheapest(h) })).filter((x): x is { h: LHotelRates; p: { amount: number; currency: string } } => !!x.p);
      const info = new Map<string, LHotel>((j.hotels ?? []).map((h) => [h.id, h]));
      const missing = priced.map((x) => x.h.hotelId).filter((id) => !info.has(id));
      if (missing.length) {
        const r2 = await fetch(`${this.base}/data/hotels?hotelIds=${encodeURIComponent(missing.slice(0, 60).join(","))}&limit=60`, { headers: this.headers(), signal: AbortSignal.timeout(10_000), cache: "no-store" });
        if (r2.ok) {
          const d = (await r2.json()) as { data?: LHotel[] };
          for (const h of d.data ?? []) info.set(h.id, h);
        }
      }
      const items: HotelOffer[] = priced
        .filter((x) => info.get(x.h.hotelId)?.name)
        .map(({ h, p }) => {
          const d = info.get(h.hotelId)!;
          return {
            id: h.roomTypes?.[0]?.offerId ?? h.hotelId,
            supplier: "liteapi",
            accommodationId: h.hotelId,
            name: d.name,
            stars: d.stars ?? d.starRating ?? null,
            reviewScore: d.rating ?? null,
            reviewCount: d.reviewCount ?? null,
            photo: d.main_photo || d.thumbnail || null,
            address: [d.address, d.city].filter(Boolean).join(", "),
            city: d.city ?? null,
            totalMinor: Math.round(p.amount * 100),
            currency: p.currency,
          };
        })
        .sort((a, b) => a.totalMinor - b.totalMinor)
        .slice(0, 40);
      return { status: "ok", items };
    } catch (err) {
      return { status: "error", message: String(err).slice(0, 200) };
    }
  }
}
