import { afterEach, describe, expect, it, vi } from "vitest";
import { LiteApiHotels, cheapest } from "@/lib/suppliers/liteapi";

afterEach(() => vi.unstubAllGlobals());

const rates = {
  data: [
    { hotelId: "lpA", roomTypes: [{ offerId: "offA", offerRetailRate: { amount: 1200, currency: "AED" }, rates: [{ retailRate: { total: [{ amount: 1200, currency: "AED" }] } }] }] },
    { hotelId: "lpB", roomTypes: [{ offerId: "offB", rates: [{ retailRate: { total: [{ amount: 640.5, currency: "AED" }] } }] }, { offerId: "offB2", rates: [{ retailRate: { total: [{ amount: 900, currency: "AED" }] } }] }] },
    { hotelId: "lpC", roomTypes: [] },
  ],
  hotels: [{ id: "lpA", name: "Hotel A", main_photo: "https://static.cupid.travel/a.jpg", address: "Marina Walk", stars: 5, rating: 8.9 }],
};

describe("liteapi adapter", () => {
  it("takes the cheapest total across room types", () => {
    expect(cheapest(rates.data[1]!)).toEqual({ amount: 640.5, currency: "AED" });
    expect(cheapest(rates.data[2]!)).toBeNull();
  });

  it("searches by coordinates and completes missing hotel data", async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url.includes("/hotels/rates")
        ? new Response(JSON.stringify(rates), { status: 200 })
        : new Response(JSON.stringify({ data: [{ id: "lpB", name: "Hotel B", thumbnail: "https://static.cupid.travel/b.jpg", address: "Deira", stars: 3 }] }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const r = await new LiteApiHotels("sand_key", null).search({ lat: 25.08, lng: 55.14, radiusKm: 3, checkin: "2027-01-10", checkout: "2027-01-13", rooms: 2, adults: 3 });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.liteapi.travel/v3.0/hotels/rates");
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe("sand_key");
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({ latitude: 25.08, longitude: 55.14, radius: 3000, currency: "AED", occupancies: [{ adults: 2 }, { adults: 1 }] });
    expect(String(fetchMock.mock.calls[1]![0])).toContain("/data/hotels?hotelIds=lpB");
    expect(r.status).toBe("ok");
    if (r.status !== "ok") return;
    expect(r.items.map((h) => [h.name, h.totalMinor, h.photo])).toEqual([
      ["Hotel B", 64050, "https://static.cupid.travel/b.jpg"],
      ["Hotel A", 120000, "https://static.cupid.travel/a.jpg"],
    ]);
  });

  it("treats 'no availability' as an empty result, not an error", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: { code: 2001, message: "no availability found" } }), { status: 200 })));
    const r = await new LiteApiHotels("k", null).search({ lat: 1, lng: 1, radiusKm: 1, checkin: "2027-01-10", checkout: "2027-01-11", rooms: 1, adults: 1 });
    expect(r).toEqual({ status: "ok", items: [] });
  });
});
