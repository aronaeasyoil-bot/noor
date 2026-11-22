import { z } from "zod";
import { IATA_RE, parseAirport } from "@/lib/airports";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date");
const count = (min: number, max: number) => z.coerce.number().int().min(min).max(max);
const iata = z
  .string()
  .transform((v) => parseAirport(v) ?? "")
  .refine((v) => IATA_RE.test(v), "airport");

export const cabinClasses = ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"] as const;

export type SearchIssue = "required" | "sameCity" | "dateOrder" | "pastDate" | "infants" | "maxTravellers";

function checkTravellers(v: { adults: number; children: number; infants: number }, ctx: z.RefinementCtx) {
  if (v.infants > v.adults) ctx.addIssue({ code: "custom", path: ["infants"], message: "infants" });
  if (v.adults + v.children > 9) ctx.addIssue({ code: "custom", path: ["adults"], message: "maxTravellers" });
}

function notPast(today: string) {
  return (d: string) => d >= today;
}

export function flightSearchSchema(today: string) {
  return z
    .object({
      trip: z.enum(["oneway", "round", "multi"]).default("round"),
      from: iata,
      to: iata,
      depart: isoDate.refine(notPast(today), "pastDate"),
      return: isoDate.optional().or(z.literal("").transform(() => undefined)),
      // Multi-city extra legs: "FROM-TO-YYYY-MM-DD" separated by commas
      legs: z.string().optional(),
      adults: count(1, 9).default(1),
      children: count(0, 8).default(0),
      infants: count(0, 9).default(0),
      cabin: z.enum(cabinClasses).default("ECONOMY"),
      direct: z
        .union([z.literal("1"), z.literal("on"), z.literal("true"), z.literal("")])
        .optional()
        .transform((v) => v === "1" || v === "on" || v === "true"),
    })
    .superRefine((v, ctx) => {
      if (v.from === v.to) ctx.addIssue({ code: "custom", path: ["to"], message: "sameCity" });
      if (v.trip === "round") {
        if (!v.return) ctx.addIssue({ code: "custom", path: ["return"], message: "required" });
        else if (v.return < v.depart) ctx.addIssue({ code: "custom", path: ["return"], message: "dateOrder" });
      }
      checkTravellers(v, ctx);
    });
}
export type FlightSearch = z.infer<ReturnType<typeof flightSearchSchema>>;

export function hotelSearchSchema(today: string) {
  return z
    .object({
      destination: z.string().trim().min(2, "required").max(120),
      checkin: isoDate.refine(notPast(today), "pastDate"),
      checkout: isoDate,
      rooms: count(1, 8).default(1),
      adults: count(1, 16).default(2),
      children: count(0, 8).default(0),
    })
    .superRefine((v, ctx) => {
      if (v.checkout <= v.checkin) ctx.addIssue({ code: "custom", path: ["checkout"], message: "dateOrder" });
      if (v.adults < v.rooms) ctx.addIssue({ code: "custom", path: ["adults"], message: "required" });
    });
}
export type HotelSearch = z.infer<ReturnType<typeof hotelSearchSchema>>;

export function packageSearchSchema(today: string) {
  return z
    .object({
      from: iata,
      destination: z.string().trim().min(2, "required").max(120),
      depart: isoDate.refine(notPast(today), "pastDate"),
      return: isoDate,
      rooms: count(1, 8).default(1),
      adults: count(1, 16).default(2),
      children: count(0, 8).default(0),
    })
    .superRefine((v, ctx) => {
      if (v.return <= v.depart) ctx.addIssue({ code: "custom", path: ["return"], message: "dateOrder" });
    });
}

export function carSearchSchema(today: string) {
  return z
    .object({
      pickup: z.string().trim().min(2, "required").max(160),
      dropoff: z.string().trim().max(160).optional(),
      pickupDate: isoDate.refine(notPast(today), "pastDate"),
      pickupTime: z.string().regex(/^\d{2}:\d{2}$/),
      dropoffDate: isoDate,
      dropoffTime: z.string().regex(/^\d{2}:\d{2}$/),
      category: z.string().max(40).optional(),
    })
    .superRefine((v, ctx) => {
      if (`${v.dropoffDate}T${v.dropoffTime}` <= `${v.pickupDate}T${v.pickupTime}`)
        ctx.addIssue({ code: "custom", path: ["dropoffDate"], message: "dateOrder" });
    });
}

export function transferSearchSchema(today: string) {
  return z.object({
    airport: z.enum(["DXB", "DWC", "AUH"]),
    direction: z.enum(["from", "to"]).default("from"),
    address: z.string().trim().min(2, "required").max(200),
    date: isoDate.refine(notPast(today), "pastDate"),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    passengers: count(1, 30).default(1),
  });
}

/** Turns a zod error into { field: issueKey } using the first issue per field. */
export function issuesByField(error: z.ZodError): Record<string, SearchIssue> {
  const out: Record<string, SearchIssue> = {};
  for (const i of error.issues) {
    const k = String(i.path[0] ?? "form");
    if (out[k]) continue;
    const known: SearchIssue[] = ["required", "sameCity", "dateOrder", "pastDate", "infants", "maxTravellers"];
    out[k] = (known as string[]).includes(i.message) ? (i.message as SearchIssue) : "required";
  }
  return out;
}

export function searchParamsToObject(sp: Record<string, string | string[] | undefined>): Record<string, string> {
  const o: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) if (typeof v === "string") o[k] = v;
  return o;
}
