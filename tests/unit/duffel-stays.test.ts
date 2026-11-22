import { afterEach, describe, expect, it, vi } from "vitest";
import fixture from "../fixtures/duffel-stays.json";
import { DuffelStays } from "@/lib/suppliers/duffel-stays";

afterEach(() => vi.unstubAllGlobals());

describe("duffel stays adapter", () => {
  it("resolves NOOR hotel areas without a network call", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const g = await new DuffelStays("duffel_test_x").geocode("Dubai Marina et JBR");
    expect(g).toMatchObject({ label: "Dubai Marina & JBR", radiusKm: 3 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("searches stays and maps results sorted by price", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(fixture), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const r = await new DuffelStays("duffel_test_x").search({ lat: 25.08, lng: 55.14, radiusKm: 3, checkin: "2027-01-10", checkout: "2027-01-13", rooms: 1, adults: 2 });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.duffel.com/stays/search");
    const body = JSON.parse(String(init.body));
    expect(body.data).toMatchObject({ check_in_date: "2027-01-10", check_out_date: "2027-01-13", rooms: 1, guests: [{ type: "adult" }, { type: "adult" }], location: { radius: 3, geographic_coordinates: { latitude: 25.08, longitude: 55.14 } } });
    expect(r.status).toBe("ok");
    if (r.status !== "ok") return;
    expect(r.items.map((h) => h.name)).toEqual(["Test Creek Inn", "Test Marina Hotel"]);
    expect(r.items[1]).toMatchObject({ totalMinor: 145000, currency: "AED", stars: 4, reviewScore: 8.6, address: "Al Marsa Street, Dubai" });
  });

  it("reports an error when Stays is not enabled", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ errors: [{ title: "Forbidden" }] }), { status: 403 })));
    const r = await new DuffelStays("duffel_test_x").search({ lat: 1, lng: 1, radiusKm: 1, checkin: "2027-01-10", checkout: "2027-01-11", rooms: 1, adults: 1 });
    expect(r).toEqual({ status: "error", message: "Duffel Stays 403 Forbidden" });
  });
});
