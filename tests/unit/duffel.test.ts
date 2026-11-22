import { afterEach, describe, expect, it, vi } from "vitest";
import fixture from "../fixtures/duffel-offers.json";
import { DuffelFlights, isoDurationMinutes } from "@/lib/suppliers/duffel";

afterEach(() => vi.unstubAllGlobals());

describe("duffel adapter", () => {
  it("parses ISO durations", () => {
    expect(isoDurationMinutes("PT7H35M")).toBe(455);
    expect(isoDurationMinutes("P1DT2H")).toBe(1560);
    expect(isoDurationMinutes(null)).toBeNull();
  });

  it("sends a search-only offer request and maps offers sorted by price", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(fixture), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const d = new DuffelFlights("duffel_test_abc");
    expect(d.testMode).toBe(true);
    const r = await d.search({ legs: [{ from: "DSS", to: "DXB", date: "2027-01-15" }], adults: 2, children: 1, infants: 1, cabin: "BUSINESS", direct: true });

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.duffel.com/air/offer_requests?return_offers=true&supplier_timeout=20000");
    const h = init.headers as Record<string, string>;
    expect(h.authorization).toBe("Bearer duffel_test_abc");
    expect(h["duffel-version"]).toBe("v2");
    const body = JSON.parse(String(init.body));
    expect(body.data.cabin_class).toBe("business");
    expect(body.data.max_connections).toBe(0);
    expect(body.data.passengers).toEqual([{ type: "adult" }, { type: "adult" }, { type: "child" }, { type: "infant_without_seat" }]);
    expect(body.data.slices).toEqual([{ origin: "DSS", destination: "DXB", departure_date: "2027-01-15" }]);

    expect(r.status).toBe("ok");
    if (r.status !== "ok") return;
    expect(r.items.map((o) => o.id)).toEqual(["off_test_2", "off_test_1"]);
    const [cheap, direct] = r.items;
    expect(cheap).toMatchObject({ live: false, totalMinor: 61240, currency: "USD", stops: 1, fareName: "Economy Light", refundable: false, changeable: true, baggage: { checked: 0, carryOn: 1 } });
    expect(cheap!.slices[0]!.durationMin).toBe(680);
    expect(cheap!.slices[0]!.segments.map((s) => s.flightNumber)).toEqual(["ZZ0101", "ZZ0102"]);
    expect(direct).toMatchObject({ stops: 0, baggage: { checked: 2, carryOn: 1 }, refundable: true, changeable: null });
    expect(direct!.slices[0]!.segments[0]!.operatedBy).toBe("Partner Air");
  });

  it("reports supplier errors instead of inventing results", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ errors: [{ title: "Invalid airport" }] }), { status: 422 })));
    const r = await new DuffelFlights("duffel_live_x").search({ legs: [{ from: "XXX", to: "DXB", date: "2027-01-15" }], adults: 1, children: 0, infants: 0, cabin: "ECONOMY", direct: false });
    expect(r).toEqual({ status: "error", message: "Duffel 422 Invalid airport" });
  });
});
