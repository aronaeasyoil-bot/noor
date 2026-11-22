"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { airportList } from "@/lib/airports";
import {
  carSearchSchema,
  flightSearchSchema,
  hotelSearchSchema,
  issuesByField,
  packageSearchSchema,
  transferSearchSchema,
  type SearchIssue,
} from "@/lib/validation/search";
import { Icon, type IconName } from "@/components/icons";
import { Counter } from "./Counter";

export type SearchTab = "flights" | "hotels" | "flightHotel" | "cars" | "transfers" | "activities";

const tabs: { id: SearchTab; icon: IconName }[] = [
  { id: "flights", icon: "plane" },
  { id: "hotels", icon: "bed" },
  { id: "flightHotel", icon: "suitcase" },
  { id: "cars", icon: "car" },
  { id: "transfers", icon: "transfer" },
  { id: "activities", icon: "ticket" },
];

type Labels = Dictionary["search"];

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function Field({ label, htmlFor, error, children, className = "" }: { label: string; htmlFor: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs font-semibold text-noor-red" role="alert" id={`${htmlFor}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

export function SearchPanel({
  locale,
  labels,
  today,
  initialTab = "flights",
  hideTabs = false,
  areaSuggestions = [],
  initial = {},
}: {
  locale: Locale;
  labels: Labels;
  today: string;
  initialTab?: SearchTab;
  hideTabs?: boolean;
  areaSuggestions?: string[];
  /** Prefill from links such as "Search this route" (values are labels, e.g. "London (LHR)"). */
  initial?: { from?: string; to?: string; destination?: string; query?: string };
}) {
  const [tab, setTab] = useState<SearchTab>(initialTab);
  const router = useRouter();
  const uid = useId();
  const id = (s: string) => `${uid}-${s}`;
  const [errors, setErrors] = useState<Record<string, SearchIssue>>({});
  const errText = (k: string) => (errors[k] ? labels.errors[errors[k]] : undefined);

  // Flights
  const [trip, setTrip] = useState<"oneway" | "round" | "multi">("round");
  const [from, setFrom] = useState(initial.from ?? "Dubai (DXB)");
  const [to, setTo] = useState(initial.to ?? "");
  const [depart, setDepart] = useState(addDays(today, 7));
  const [ret, setRet] = useState(addDays(today, 14));
  const [legs, setLegs] = useState<{ from: string; to: string; date: string }[]>([{ from: "", to: "", date: addDays(today, 10) }]);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabin, setCabin] = useState("ECONOMY");
  const [direct, setDirect] = useState(false);
  // Hotels / packages
  const [destination, setDestination] = useState(initial.destination ?? "Dubai");
  const [checkin, setCheckin] = useState(addDays(today, 7));
  const [checkout, setCheckout] = useState(addDays(today, 11));
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [kids, setKids] = useState(0);
  // Cars
  const [pickup, setPickup] = useState("Dubai International Airport (DXB)");
  const [sameDrop, setSameDrop] = useState(true);
  const [dropoff, setDropoff] = useState("");
  const [pDate, setPDate] = useState(addDays(today, 7));
  const [pTime, setPTime] = useState("10:00");
  const [dDate, setDDate] = useState(addDays(today, 10));
  const [dTime, setDTime] = useState("10:00");
  // Transfers
  const [airport, setAirport] = useState<"DXB" | "DWC" | "AUH">("DXB");
  const [direction, setDirection] = useState<"from" | "to">("from");
  const [address, setAddress] = useState("");
  const [tDate, setTDate] = useState(addDays(today, 7));
  const [tTime, setTTime] = useState("12:00");
  const [pax, setPax] = useState(2);
  // Activities
  const [query, setQuery] = useState(initial.query ?? "");

  const airportOptions = useMemo(() => airportList.map((a) => `${a.city} (${a.code})`), []);

  function go(path: string, params: Record<string, string | number | boolean | undefined>) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "" && v !== false) qs.set(k, String(v === true ? 1 : v));
    router.push(`/${locale}${path}?${qs.toString()}`);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    if (tab === "flights") {
      const legsStr =
        trip === "multi" ? legs.map((l) => `${l.from.match(/\(([A-Z]{3})\)/)?.[1] ?? l.from}-${l.to.match(/\(([A-Z]{3})\)/)?.[1] ?? l.to}-${l.date}`).join(",") : undefined;
      const raw = { trip, from, to, depart, return: trip === "round" ? ret : "", legs: legsStr, adults, children, infants, cabin, direct: direct ? "1" : "" };
      const r = flightSearchSchema(today).safeParse(raw);
      if (!r.success) return setErrors(issuesByField(r.error));
      if (trip === "multi" && legs.some((l) => !l.from || !l.to || !l.date)) return setErrors({ legs: "required" });
      return go("/flights/search", { trip, from: r.data.from, to: r.data.to, depart, return: trip === "round" ? ret : undefined, legs: legsStr, adults, children, infants, cabin, direct });
    }
    if (tab === "hotels") {
      const r = hotelSearchSchema(today).safeParse({ destination, checkin, checkout, rooms, adults: guests, children: kids });
      if (!r.success) return setErrors(issuesByField(r.error));
      return go("/hotels/search", { destination, checkin, checkout, rooms, adults: guests, children: kids });
    }
    if (tab === "flightHotel") {
      const r = packageSearchSchema(today).safeParse({ from, destination, depart: checkin, return: checkout, rooms, adults: guests, children: kids });
      if (!r.success) {
        const e2 = issuesByField(r.error);
        return setErrors({ ...e2, checkin: e2.depart ?? e2.checkin, checkout: e2.return ?? e2.checkout } as Record<string, SearchIssue>);
      }
      return go("/flight-hotel/search", { from: r.data.from, destination, depart: checkin, return: checkout, rooms, adults: guests, children: kids });
    }
    if (tab === "cars") {
      const r = carSearchSchema(today).safeParse({ pickup, dropoff: sameDrop ? pickup : dropoff, pickupDate: pDate, pickupTime: pTime, dropoffDate: dDate, dropoffTime: dTime });
      if (!r.success) return setErrors(issuesByField(r.error));
      return go("/cars/search", { pickup, dropoff: sameDrop ? undefined : dropoff, pickupDate: pDate, pickupTime: pTime, dropoffDate: dDate, dropoffTime: dTime });
    }
    if (tab === "transfers") {
      const r = transferSearchSchema(today).safeParse({ airport, direction, address, date: tDate, time: tTime, passengers: pax });
      if (!r.success) return setErrors(issuesByField(r.error));
      return go("/transfers/book", { airport, direction, address, date: tDate, time: tTime, passengers: pax });
    }
    return go("/activities", { q: query.trim() || undefined });
  }

  const travellersSummary = `${adults + children + infants} · ${labels.cabins[cabin as keyof Labels["cabins"]]}`;
  const guestsSummary = `${rooms} ${labels.rooms.toLowerCase()} · ${guests + kids} ${labels.guests.toLowerCase()}`;

  return (
    <div className="card overflow-visible" data-testid="search-panel">
      {!hideTabs && (
        <div role="tablist" aria-label="Search" className="scroll-row !gap-1 border-b border-noor-line px-2 pt-2 sm:px-4">
          {tabs.map((t) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={id(`tab-${t.id}`)}
                aria-selected={on}
                aria-controls={id("panel")}
                data-testid={`search-tab-${t.id}`}
                onClick={() => {
                  setTab(t.id);
                  setErrors({});
                }}
                className={`flex min-w-[88px] flex-col items-center gap-1 border-b-[3px] px-3 pt-2 pb-2.5 text-[13px] font-bold whitespace-nowrap transition sm:min-w-[110px] ${
                  on ? "border-noor-red text-noor-red" : "border-transparent text-noor-muted hover:text-noor-ink"
                }`}
              >
                <Icon name={t.icon} size={22} />
                {labels.tabs[t.id]}
              </button>
            );
          })}
        </div>
      )}

      <form onSubmit={submit} noValidate id={id("panel")} role="tabpanel" aria-labelledby={id(`tab-${tab}`)} className="p-4 sm:p-5" data-testid={`search-form-${tab}`}>
        <datalist id={id("airports")}>
          {airportOptions.map((a) => (
            <option key={a} value={a} />
          ))}
        </datalist>

        {tab === "flights" && (
          <div className="space-y-4">
            <fieldset className="flex flex-wrap gap-2">
              <legend className="sr-only">{labels.tabs.flights}</legend>
              {(["round", "oneway", "multi"] as const).map((v) => (
                <label key={v} className={`chip cursor-pointer border px-3 py-1.5 text-sm ${trip === v ? "border-noor-navy bg-noor-navy text-white" : "border-noor-line bg-white text-noor-ink"}`}>
                  <input type="radio" name="trip" value={v} checked={trip === v} onChange={() => setTrip(v)} className="sr-only" />
                  {v === "round" ? labels.roundTrip : v === "oneway" ? labels.oneWay : labels.multiCity}
                </label>
              ))}
              <label className="ms-auto flex cursor-pointer items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={direct} onChange={(e) => setDirect(e.target.checked)} className="size-4 accent-noor-red" />
                {labels.direct}
              </label>
            </fieldset>

            <div className="grid gap-3 md:grid-cols-12">
              <div className="relative grid gap-3 sm:grid-cols-2 md:col-span-5">
                <Field label={labels.from} htmlFor={id("from")} error={errText("from")}>
                  <input id={id("from")} name="from" className="field" list={id("airports")} placeholder={labels.fromPlaceholder} value={from} onChange={(e) => setFrom(e.target.value)} aria-invalid={!!errors.from} autoComplete="off" required />
                </Field>
                <button
                  type="button"
                  onClick={() => {
                    setFrom(to);
                    setTo(from);
                  }}
                  aria-label={labels.swap}
                  title={labels.swap}
                  className="absolute end-2 top-[30px] z-10 grid size-8 place-items-center rounded-full border border-noor-line bg-white text-noor-navy shadow-sm sm:start-1/2 sm:end-auto sm:top-[34px] sm:-translate-x-1/2 rtl:sm:translate-x-1/2"
                >
                  <Icon name="swap" size={16} />
                </button>
                <Field label={labels.to} htmlFor={id("to")} error={errText("to")}>
                  <input id={id("to")} name="to" className="field" list={id("airports")} placeholder={labels.toPlaceholder} value={to} onChange={(e) => setTo(e.target.value)} aria-invalid={!!errors.to} autoComplete="off" required />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3 md:col-span-4">
                <Field label={labels.depart} htmlFor={id("depart")} error={errText("depart")}>
                  <input id={id("depart")} type="date" className="field" min={today} value={depart} onChange={(e) => setDepart(e.target.value)} aria-invalid={!!errors.depart} required />
                </Field>
                <Field label={labels.return} htmlFor={id("return")} error={errText("return")}>
                  <input id={id("return")} type="date" className="field disabled:bg-noor-bg disabled:text-noor-muted" min={depart} value={trip === "round" ? ret : ""} disabled={trip !== "round"} onChange={(e) => setRet(e.target.value)} aria-invalid={!!errors.return} />
                </Field>
              </div>
              <div className="md:col-span-3">
                <Popover label={labels.travellers} summary={travellersSummary} doneLabel={labels.done} id={id("travellers")} error={errText("infants") ?? errText("adults")}>
                  <Counter label={labels.adults} hint={labels.adultsHint} value={adults} min={1} max={9} onChange={setAdults} />
                  <Counter label={labels.children} hint={labels.childrenHint} value={children} min={0} max={8} onChange={setChildren} />
                  <Counter label={labels.infants} hint={labels.infantsHint} value={infants} min={0} max={adults} onChange={setInfants} />
                  <label className="mt-3 block">
                    <span className="field-label">{labels.cabin}</span>
                    <select className="field" value={cabin} onChange={(e) => setCabin(e.target.value)}>
                      {Object.entries(labels.cabins).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </label>
                </Popover>
              </div>
            </div>

            {trip === "multi" && (
              <div className="space-y-3 rounded-xl bg-noor-bg p-3">
                {legs.map((leg, i) => (
                  <div key={i} className="grid items-end gap-2 sm:grid-cols-[1fr_1fr_160px_auto]">
                    <Field label={`${labels.flight} ${i + 2} · ${labels.from}`} htmlFor={id(`leg${i}from`)}>
                      <input id={id(`leg${i}from`)} className="field" list={id("airports")} value={leg.from} onChange={(e) => setLegs(legs.map((l, j) => (j === i ? { ...l, from: e.target.value } : l)))} />
                    </Field>
                    <Field label={labels.to} htmlFor={id(`leg${i}to`)}>
                      <input id={id(`leg${i}to`)} className="field" list={id("airports")} value={leg.to} onChange={(e) => setLegs(legs.map((l, j) => (j === i ? { ...l, to: e.target.value } : l)))} />
                    </Field>
                    <Field label={labels.depart} htmlFor={id(`leg${i}date`)}>
                      <input id={id(`leg${i}date`)} type="date" className="field" min={depart} value={leg.date} onChange={(e) => setLegs(legs.map((l, j) => (j === i ? { ...l, date: e.target.value } : l)))} />
                    </Field>
                    <button type="button" className="btn btn-outline !min-h-[46px] !px-3 text-sm" onClick={() => setLegs(legs.filter((_, j) => j !== i))} disabled={legs.length === 1}>
                      {labels.removeFlight}
                    </button>
                  </div>
                ))}
                {errors.legs && <p className="text-xs font-semibold text-noor-red">{labels.errors.required}</p>}
                {legs.length < 4 && (
                  <button type="button" className="text-sm font-bold text-noor-blue hover:underline" onClick={() => setLegs([...legs, { from: legs.at(-1)?.to ?? "", to: "", date: addDays(legs.at(-1)?.date ?? depart, 3) }])}>
                    + {labels.addFlight}
                  </button>
                )}
              </div>
            )}
            <SubmitRow label={labels.searchFlights} />
          </div>
        )}

        {(tab === "hotels" || tab === "flightHotel") && (
          <div className="space-y-4">
            <datalist id={id("areas")}>
              {areaSuggestions.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
            <div className="grid gap-3 md:grid-cols-12">
              {tab === "flightHotel" && (
                <Field label={labels.from} htmlFor={id("pfrom")} error={errText("from")} className="md:col-span-3">
                  <input id={id("pfrom")} className="field" list={id("airports")} value={from} onChange={(e) => setFrom(e.target.value)} placeholder={labels.fromPlaceholder} aria-invalid={!!errors.from} />
                </Field>
              )}
              <Field label={labels.destination} htmlFor={id("dest")} error={errText("destination")} className={tab === "flightHotel" ? "md:col-span-3" : "md:col-span-5"}>
                <input id={id("dest")} className="field" list={id("areas")} value={destination} onChange={(e) => setDestination(e.target.value)} placeholder={labels.destinationPlaceholder} aria-invalid={!!errors.destination} />
              </Field>
              <div className={`grid grid-cols-2 gap-3 ${tab === "flightHotel" ? "md:col-span-3" : "md:col-span-4"}`}>
                <Field label={tab === "flightHotel" ? labels.depart : labels.checkIn} htmlFor={id("cin")} error={errText("checkin")}>
                  <input id={id("cin")} type="date" className="field" min={today} value={checkin} onChange={(e) => setCheckin(e.target.value)} aria-invalid={!!errors.checkin} />
                </Field>
                <Field label={tab === "flightHotel" ? labels.return : labels.checkOut} htmlFor={id("cout")} error={errText("checkout")}>
                  <input id={id("cout")} type="date" className="field" min={addDays(checkin, 1)} value={checkout} onChange={(e) => setCheckout(e.target.value)} aria-invalid={!!errors.checkout} />
                </Field>
              </div>
              <div className="md:col-span-3">
                <Popover label={`${labels.rooms} & ${labels.guests}`} summary={guestsSummary} doneLabel={labels.done} id={id("guests")} error={errText("adults")}>
                  <Counter label={labels.rooms} value={rooms} min={1} max={8} onChange={(v) => { setRooms(v); if (guests < v) setGuests(v); }} />
                  <Counter label={labels.adults} hint={labels.adultsHint} value={guests} min={rooms} max={16} onChange={setGuests} />
                  <Counter label={labels.children} hint={labels.childrenHint} value={kids} min={0} max={8} onChange={setKids} />
                </Popover>
              </div>
            </div>
            <SubmitRow label={tab === "hotels" ? labels.searchHotels : labels.searchPackages} />
          </div>
        )}

        {tab === "cars" && (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-12">
              <Field label={labels.pickupLocation} htmlFor={id("pick")} error={errText("pickup")} className={sameDrop ? "md:col-span-6" : "md:col-span-3"}>
                <input id={id("pick")} className="field" value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder={labels.pickupPlaceholder} aria-invalid={!!errors.pickup} />
              </Field>
              {!sameDrop && (
                <Field label={labels.dropoffLocation} htmlFor={id("drop")} className="md:col-span-3">
                  <input id={id("drop")} className="field" value={dropoff} onChange={(e) => setDropoff(e.target.value)} placeholder={labels.pickupPlaceholder} />
                </Field>
              )}
              <div className="grid grid-cols-2 gap-3 md:col-span-3">
                <Field label={labels.pickupDate} htmlFor={id("pd")} error={errText("pickupDate")}>
                  <input id={id("pd")} type="date" className="field" min={today} value={pDate} onChange={(e) => setPDate(e.target.value)} />
                </Field>
                <Field label={labels.pickupTime} htmlFor={id("pt")}>
                  <input id={id("pt")} type="time" step={900} className="field" value={pTime} onChange={(e) => setPTime(e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3 md:col-span-3">
                <Field label={labels.dropoffDate} htmlFor={id("dd")} error={errText("dropoffDate")}>
                  <input id={id("dd")} type="date" className="field" min={pDate} value={dDate} onChange={(e) => setDDate(e.target.value)} aria-invalid={!!errors.dropoffDate} />
                </Field>
                <Field label={labels.dropoffTime} htmlFor={id("dt")}>
                  <input id={id("dt")} type="time" step={900} className="field" value={dTime} onChange={(e) => setDTime(e.target.value)} />
                </Field>
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={sameDrop} onChange={(e) => setSameDrop(e.target.checked)} className="size-4 accent-noor-red" />
              {labels.sameDropoff}
            </label>
            <SubmitRow label={labels.searchCars} />
          </div>
        )}

        {tab === "transfers" && (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-12">
              <Field label={labels.airport} htmlFor={id("ap")} className="md:col-span-3">
                <select id={id("ap")} className="field" value={airport} onChange={(e) => setAirport(e.target.value as typeof airport)}>
                  <option value="DXB">Dubai International (DXB)</option>
                  <option value="DWC">Al Maktoum (DWC)</option>
                  <option value="AUH">Abu Dhabi (AUH)</option>
                </select>
              </Field>
              <Field label={labels.direction} htmlFor={id("dir")} className="md:col-span-2">
                <select id={id("dir")} className="field" value={direction} onChange={(e) => setDirection(e.target.value as "from" | "to")}>
                  <option value="from">{labels.fromAirport}</option>
                  <option value="to">{labels.toAirport}</option>
                </select>
              </Field>
              <Field label={labels.address} htmlFor={id("addr")} error={errText("address")} className="md:col-span-3">
                <input id={id("addr")} className="field" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={labels.pickupPlaceholder} aria-invalid={!!errors.address} />
              </Field>
              <div className="grid grid-cols-3 gap-3 md:col-span-4">
                <Field label={labels.date} htmlFor={id("td")} error={errText("date")}>
                  <input id={id("td")} type="date" className="field !px-2" min={today} value={tDate} onChange={(e) => setTDate(e.target.value)} />
                </Field>
                <Field label={labels.time} htmlFor={id("tt")}>
                  <input id={id("tt")} type="time" step={900} className="field !px-2" value={tTime} onChange={(e) => setTTime(e.target.value)} />
                </Field>
                <Field label={labels.passengers} htmlFor={id("pax")}>
                  <input id={id("pax")} type="number" inputMode="numeric" min={1} max={30} className="field !px-2" value={pax} onChange={(e) => setPax(Math.max(1, Math.min(30, Number(e.target.value) || 1)))} />
                </Field>
              </div>
            </div>
            <SubmitRow label={labels.searchTransfers} />
          </div>
        )}

        {tab === "activities" && (
          <div className="grid items-end gap-3 md:grid-cols-[1fr_auto]">
            <Field label={labels.activityQuery} htmlFor={id("q")}>
              <input id={id("q")} className="field" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={labels.activityPlaceholder} />
            </Field>
            <button type="submit" className="btn btn-primary !min-h-[46px] w-full md:w-auto md:px-8" data-testid="search-submit">
              <Icon name="search" size={18} />
              {labels.searchActivities}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function SubmitRow({ label }: { label: string }) {
  return (
    <div className="flex justify-end">
      <button type="submit" className="btn btn-primary w-full !min-h-12 text-base sm:w-auto sm:px-10" data-testid="search-submit">
        <Icon name="search" size={18} />
        {label}
      </button>
    </div>
  );
}

function Popover({ label, summary, doneLabel, id, error, children }: { label: string; summary: string; doneLabel: string; id: string; error?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <span className="field-label" id={`${id}-label`}>
        {label}
      </span>
      <button
        type="button"
        className="field flex items-center justify-between text-start"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-summary`}
        onClick={() => setOpen((o) => !o)}
        data-testid="travellers-button"
      >
        <span className="flex items-center gap-2 truncate" id={`${id}-summary`}>
          <Icon name="users" size={18} className="shrink-0 text-noor-muted" />
          {summary}
        </span>
        <Icon name="chevronDown" size={16} />
      </button>
      {error && <p className="mt-1 text-xs font-semibold text-noor-red" role="alert">{error}</p>}
      {open && (
        <div role="dialog" aria-label={label} className="card absolute end-0 z-30 mt-2 w-[min(320px,calc(100vw-48px))] p-4">
          {children}
          <button type="button" className="btn btn-navy mt-3 w-full" onClick={() => setOpen(false)}>
            {doneLabel}
          </button>
        </div>
      )}
    </div>
  );
}
