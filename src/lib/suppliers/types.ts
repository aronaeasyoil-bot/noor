export type FlightSegment = {
  from: string;
  to: string;
  departAt: string;
  arriveAt: string;
  carrier: string;
  carrierName: string;
  operatedBy: string | null;
  flightNumber: string;
  durationMin: number | null;
  aircraft: string | null;
};

export type FlightSlice = { from: string; to: string; departAt: string; arriveAt: string; durationMin: number | null; segments: FlightSegment[] };

export type FlightOffer = {
  id: string;
  supplier: string;
  /** false for supplier test-environment fares, which are never real prices. */
  live: boolean;
  totalMinor: number;
  currency: string;
  airline: { code: string; name: string; logo: string | null };
  slices: FlightSlice[];
  stops: number;
  cabin: string;
  fareName: string | null;
  baggage: { checked: number | null; carryOn: number | null };
  refundable: boolean | null;
  changeable: boolean | null;
  expiresAt: string | null;
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

export type HotelOffer = {
  /** Duffel search result id (srr_…), used by NOOR to look up rates. */
  id: string;
  supplier: string;
  accommodationId: string;
  name: string;
  stars: number | null;
  reviewScore: number | null;
  reviewCount: number | null;
  photo: string | null;
  address: string;
  city: string | null;
  totalMinor: number;
  currency: string;
};

export type HotelQuery = { lat: number; lng: number; radiusKm: number; checkin: string; checkout: string; rooms: number; adults: number };

export interface HotelSupplier {
  readonly name: string;
  search(q: HotelQuery): Promise<SupplierResult<HotelOffer>>;
  /** Finds coordinates for a free-text destination (city or area). */
  geocode(query: string): Promise<{ lat: number; lng: number; radiusKm: number; label: string } | null>;
}
