import { describe, expect, it } from "vitest";
import { computeAmount } from "@/lib/bookings";
import { convertMinor } from "@/lib/currency";
import { formatMoney } from "@/lib/format";
import { can, isStaff } from "@/lib/auth/roles";
import { makeReference } from "@/lib/references";

describe("booking amounts", () => {
  it("is null when NOOR has not set a price (request only)", () => {
    expect(computeAmount({ priceMinor: null, priceUnit: "per_person", status: "active" }, 2, 0)).toBeNull();
    expect(computeAmount({ priceMinor: 10000, priceUnit: "per_person", status: "inactive" }, 2, 0)).toBeNull();
    expect(computeAmount(null, 2, 0)).toBeNull();
  });
  it("applies the price unit", () => {
    expect(computeAmount({ priceMinor: 25000, priceUnit: "per_person", status: "active" }, 2, 1)).toBe(75000);
    expect(computeAmount({ priceMinor: 30000, priceUnit: "per_vehicle", status: "active" }, 4, 2)).toBe(30000);
    expect(computeAmount({ priceMinor: 20000, priceUnit: "per_day", status: "active" }, 1, 0, 3)).toBe(60000);
  });
});

describe("currency", () => {
  const table = { rates: { USD: 0.2723, XOF: 163.5 }, date: new Date("2026-11-22"), source: "test" };
  it("converts only with a known rate", () => {
    expect(convertMinor(10000, "AED", table)).toBe(10000);
    expect(convertMinor(10000, "USD", table)).toBe(2723);
    expect(convertMinor(10000, "EUR", table)).toBeNull();
  });
  it("formats XOF without decimals", () => {
    expect(formatMoney(1635000, "XOF", "fr")).not.toMatch(/,\d{2}\s/);
    expect(formatMoney(12345, "AED", "en")).toContain("123.45");
  });
});

describe("roles", () => {
  it("enforces back-office permissions", () => {
    expect(can("customer", "dashboard")).toBe(false);
    expect(can("finance", "refunds")).toBe(true);
    expect(can("support_agent", "refunds")).toBe(false);
    expect(can("booking_agent", "settings")).toBe(false);
    expect(can("super_admin", "settings")).toBe(true);
    expect(isStaff("customer")).toBe(false);
    expect(isStaff("supplier")).toBe(true);
  });
  it("makes readable references", () => {
    expect(makeReference("NB")).toMatch(/^NB-[A-Z0-9]{6}$/);
  });
});
