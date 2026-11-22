import { describe, expect, it } from "vitest";
import { carSearchSchema, flightSearchSchema, hotelSearchSchema, issuesByField, transferSearchSchema } from "@/lib/validation/search";

const today = "2026-11-22";

describe("flight search", () => {
  const ok = { trip: "round", from: "Dubai (DXB)", to: "LHR", depart: "2026-12-01", return: "2026-12-08", adults: "2" };
  it("accepts a valid round trip and extracts IATA codes", () => {
    const r = flightSearchSchema(today).safeParse(ok);
    expect(r.success).toBe(true);
    if (r.success) expect([r.data.from, r.data.to, r.data.adults]).toEqual(["DXB", "LHR", 2]);
  });
  it("rejects same origin and destination", () => {
    const r = flightSearchSchema(today).safeParse({ ...ok, to: "DXB" });
    expect(r.success).toBe(false);
    if (!r.success) expect(issuesByField(r.error).to).toBe("sameCity");
  });
  it("rejects a return before departure and past dates", () => {
    const r1 = flightSearchSchema(today).safeParse({ ...ok, return: "2026-11-30" });
    const r2 = flightSearchSchema(today).safeParse({ ...ok, depart: "2026-01-01" });
    expect(r1.success || r2.success).toBe(false);
    if (!r1.success) expect(issuesByField(r1.error).return).toBe("dateOrder");
    if (!r2.success) expect(issuesByField(r2.error).depart).toBe("pastDate");
  });
  it("needs one adult per infant and max 9 travellers", () => {
    const r = flightSearchSchema(today).safeParse({ ...ok, adults: "1", infants: "2" });
    expect(r.success).toBe(false);
    const r2 = flightSearchSchema(today).safeParse({ ...ok, adults: "6", children: "4" });
    expect(r2.success).toBe(false);
  });
});

describe("other searches", () => {
  it("hotel checkout must follow checkin", () => {
    expect(hotelSearchSchema(today).safeParse({ destination: "Dubai", checkin: "2026-12-05", checkout: "2026-12-05" }).success).toBe(false);
    expect(hotelSearchSchema(today).safeParse({ destination: "Dubai", checkin: "2026-12-05", checkout: "2026-12-07" }).success).toBe(true);
  });
  it("car drop-off must follow pick-up", () => {
    expect(carSearchSchema(today).safeParse({ pickup: "DXB", pickupDate: "2026-12-05", pickupTime: "10:00", dropoffDate: "2026-12-05", dropoffTime: "09:00" }).success).toBe(false);
  });
  it("transfers only for DXB, DWC and AUH", () => {
    const base = { direction: "from", address: "Marina", date: "2026-12-05", time: "10:00", passengers: "2" };
    expect(transferSearchSchema(today).safeParse({ ...base, airport: "DXB" }).success).toBe(true);
    expect(transferSearchSchema(today).safeParse({ ...base, airport: "SHJ" }).success).toBe(false);
  });
});
