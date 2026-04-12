"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useRef, useCallback } from "react";

type Trip = {
  uid: string;
  departure: { date: string };
  arrival: { date: string };
  duration: { hours: number; minutes: number };
  price: { total: number };
};

const BUS_CITIES = ["Toronto", "London", "Ottawa", "Hamilton", "Kitchener"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_OF_WEEK = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-CA", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function formatDisplayDate(dateStr: string) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${MONTHS[parseInt(month) - 1].slice(0, 3)} ${parseInt(day)}, ${year}`;
}

async function fetchTrips(from: string, to: string, date: string, adults: number): Promise<Trip[]> {
  const res = await fetch(`/api/flixbus?from=${from}&to=${to}&date=${date}&adults=${adults}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  const seen = new Map<string, Trip>();
  const results = Object.values(data.trips[0].results) as Trip[];
  for (const trip of results) {
    const rideId = trip.uid.split(":")[1];
    if (!seen.has(rideId) || trip.price.total < seen.get(rideId)!.price.total) {
      seen.set(rideId, trip);
    }
  }
  return Array.from(seen.values()).sort(
    (a, b) => new Date(a.departure.date).getTime() - new Date(b.departure.date).getTime()
  );
}

const FLIXBUS_CITY_IDS: Record<string, string> = {
  toronto:   "41d79c93-0374-47f3-8f3a-bd154f55153a",
  london:    "347f9e9d-0c48-4770-90f6-cc6a18802bfa",
  ottawa:    "b8027c62-7ade-4dc0-a96f-ae3ef99c9de5",
  hamilton:  "cf3d4161-7afb-43aa-bb11-160b9fbdebed",
  kitchener: "ef72022c-7325-4c6f-981b-953232e59fe7",
};

function buildBookingUrl(from: string, to: string, departureDate: string, adults: number, children: number) {
  const fromId = FLIXBUS_CITY_IDS[from.toLowerCase()];
  const toId = FLIXBUS_CITY_IDS[to.toLowerCase()];
  const [year, month, day] = departureDate.split("T")[0].split("-");
  return `https://shop.flixbus.ca/search?departureCity=${fromId}&arrivalCity=${toId}&rideDate=${day}.${month}.${year}&adult=${adults}&children=${children}&_locale=en_CA&currency=CAD`;
}

// ── Calendar Picker ─────────────────────────────────────────────────
function CalendarPicker({ value, onChange, label, minDate, grow }: {
  value: string; onChange: (d: string) => void; label: string; minDate?: string; grow?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = value ? new Date(value + "T12:00:00") : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  const prevMonth = () => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
  const nextMonth = () => viewMonth === 11 ? (setViewMonth(0), setViewYear(y => y + 1)) : setViewMonth(m => m + 1);

  const selectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    onChange(`${viewYear}-${m}-${d}`);
    setOpen(false);
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const [y, m, d] = value.split("-");
    return parseInt(y) === viewYear && parseInt(m) === viewMonth + 1 && parseInt(d) === day;
  };

  const isDisabled = (day: number) => {
    if (!minDate) return false;
    const cell = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return cell < minDate;
  };

  const cells = [
    ...Array.from({ length: firstDayOfWeek }, (_, i) => ({ day: 0, key: `e${i}` })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, key: `d${i + 1}` })),
  ];

  return (
    <div className={`flex flex-col gap-1 relative ${grow ? "flex-1 min-w-0" : ""}`} ref={ref}>
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</label>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 flex items-center gap-2"
      >
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span className={`truncate ${value ? "text-gray-900" : "text-gray-400"}`}>
          {value ? formatDisplayDate(value) : "Select date"}
        </span>
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 w-72">
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-800">{MONTHS[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map(({ day, key }) => (
              <div key={key} className="flex items-center justify-center">
                {day === 0 ? null : (
                  <button
                    onClick={() => !isDisabled(day) && selectDay(day)}
                    disabled={isDisabled(day)}
                    className={`w-8 h-8 rounded-full text-sm transition-colors
                      ${isSelected(day) ? "bg-indigo-600 text-white font-semibold" : ""}
                      ${!isSelected(day) && !isDisabled(day) ? "hover:bg-indigo-50 text-gray-800" : ""}
                      ${isDisabled(day) ? "text-gray-300 cursor-not-allowed" : ""}
                    `}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Passengers Picker ───────────────────────────────────────────────
function PassengersPicker({ adults, children, onAdultsChange, onChildrenChange }: {
  adults: number; children: number;
  onAdultsChange: (n: number) => void; onChildrenChange: (n: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const total = adults + children;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="flex flex-col gap-1 relative shrink-0" ref={ref}>
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Passengers</label>
      <button
        onClick={() => setOpen(o => !o)}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 flex items-center gap-2 w-[195px]"
      >
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
        <span className="text-gray-900">{total} Passenger{total !== 1 ? "s" : ""}</span>
        <svg className="w-3 h-3 text-gray-400 ml-auto" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 w-64">
          {[
            { label: "Adults", sub: "16+ years", value: adults, min: 1, onChange: onAdultsChange },
            { label: "Children", sub: "2–15 years", value: children, min: 0, onChange: onChildrenChange },
          ].map(({ label, sub, value, min, onChange }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onChange(Math.max(min, value - 1))}
                  disabled={value <= min}
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4"/>
                  </svg>
                </button>
                <span className="w-4 text-center text-sm font-semibold text-gray-800">{value}</span>
                <button
                  onClick={() => onChange(value + 1)}
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Trip Card ───────────────────────────────────────────────────────
function TripCard({ trip, bookingUrl, adults, children }: {
  trip: Trip; bookingUrl: string; adults: number; children: number;
}) {
  const totalPassengers = adults + children;
  const total = trip.price.total;
  const perPerson = total / totalPassengers;

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 mb-4 flex items-center justify-between">
      <div>
        <p className="font-semibold text-gray-800">Flixbus</p>
        <p className="text-sm text-gray-500">
          {formatTime(trip.departure.date)} → {formatTime(trip.arrival.date)} · {trip.duration.hours}h {trip.duration.minutes}m
        </p>
      </div>
      <div className="text-right">
        {totalPassengers > 1 && (
          <p className="text-xs text-gray-400 mb-0.5">${perPerson.toFixed(2)} × {totalPassengers}</p>
        )}
        <p className="text-lg font-bold text-indigo-600">${total.toFixed(2)}</p>
        <a href={bookingUrl} target="_blank" className="text-xs text-indigo-400 hover:underline">Book →</a>
      </div>
    </div>
  );
}

const selectClass = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400";

// ── Search Bar ──────────────────────────────────────────────────────
function SearchBar({ initialFrom, initialTo, initialDate, initialReturnDate, initialTripType, initialAdults, initialChildren }: {
  initialFrom: string; initialTo: string; initialDate: string;
  initialReturnDate: string | null; initialTripType: string;
  initialAdults: number; initialChildren: number;
}) {
  const router = useRouter();
  const [tripType, setTripType] = useState<"one-way" | "round-trip">(
    initialTripType === "round-trip" ? "round-trip" : "one-way"
  );
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [date, setDate] = useState(initialDate);
  const [returnDate, setReturnDate] = useState(initialReturnDate ?? "");
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const mounted = useRef(false);

  const navigate = useCallback((
    tt: string, f: string, t: string, d: string, rd: string, a: number, c: number
  ) => {
    if (!f || !t || !d) return;
    if (tt === "round-trip" && !rd) return;
    const p = new URLSearchParams({ from: f, to: t, date: d, tripType: tt, adults: String(a), children: String(c) });
    if (tt === "round-trip") p.set("returnDate", rd);
    router.push(`/results?${p.toString()}`);
  }, [router]);

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    navigate(tripType, from, to, date, returnDate, adults, children);
  }, [tripType, from, to, date, returnDate, adults, children, navigate]);

  const swapCities = () => { setFrom(to); setTo(from); };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
      {/* Trip type toggle */}
      <div className="flex gap-2 mb-4">
        {(["one-way", "round-trip"] as const).map((type) => (
          <button
            key={type}
            onClick={() => { setTripType(type); if (type === "one-way") setReturnDate(""); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              tripType === type
                ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {type === "one-way" ? "One Way" : "Round Trip"}
          </button>
        ))}
      </div>

      {/* Row 1 on mobile, all one row on desktop */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-end">

        {/* Group 1: From / Swap / To — full width on mobile, auto on desktop */}
        <div className="flex gap-2 items-end w-full sm:w-auto">
          <div className="flex flex-col gap-1 flex-1 sm:w-48 sm:flex-none">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">From</label>
            <select value={from} onChange={(e) => setFrom(e.target.value)} className={selectClass}>
              <option value="">City</option>
              {BUS_CITIES.filter(c => c !== to).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button onClick={swapCities} className="mb-0.5 p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
            </svg>
          </button>

          <div className="flex flex-col gap-1 flex-1 sm:w-48 sm:flex-none">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">To</label>
            <select value={to} onChange={(e) => setTo(e.target.value)} className={selectClass}>
              <option value="">City</option>
              {BUS_CITIES.filter(c => c !== from).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Group 2: Date(s) + Passengers — full width on mobile, auto on desktop */}
        <div className="flex gap-2 items-end w-full sm:w-auto sm:flex-1">
          <div className="flex gap-2 flex-1 min-w-0">
            <CalendarPicker
              label={tripType === "round-trip" ? "Departure" : "Date"}
              value={date}
              onChange={setDate}
              grow
            />
            {tripType === "round-trip" && (
              <CalendarPicker
                label="Return"
                value={returnDate}
                onChange={setReturnDate}
                minDate={date}
                grow
              />
            )}
          </div>
          <PassengersPicker
            adults={adults} children={children}
            onAdultsChange={setAdults} onChildrenChange={setChildren}
          />
        </div>

      </div>
    </div>
  );
}

// ── Results Page ────────────────────────────────────────────────────
function ResultsContent() {
  const params = useSearchParams();
  const router = useRouter();

  const from = params.get("from")!;
  const to = params.get("to")!;
  const date = params.get("date")!;
  const returnDate = params.get("returnDate");
  const tripType = params.get("tripType") ?? "one-way";
  const adults = parseInt(params.get("adults") ?? "1");
  const children = parseInt(params.get("children") ?? "0");
  const isRoundTrip = tripType === "round-trip" && !!returnDate;

  const [outboundTrips, setOutboundTrips] = useState<Trip[]>([]);
  const [returnTrips, setReturnTrips] = useState<Trip[]>([]);
  const [loadingOutbound, setLoadingOutbound] = useState(true);
  const [loadingReturn, setLoadingReturn] = useState(isRoundTrip);
  const [errorOutbound, setErrorOutbound] = useState("");
  const [errorReturn, setErrorReturn] = useState("");

  useEffect(() => {
    setOutboundTrips([]);
    setReturnTrips([]);
    setLoadingOutbound(true);
    setLoadingReturn(isRoundTrip);
    setErrorOutbound("");
    setErrorReturn("");

    fetchTrips(from, to, date, adults)
      .then(setOutboundTrips)
      .catch((e) => setErrorOutbound(e.message))
      .finally(() => setLoadingOutbound(false));

    if (isRoundTrip && returnDate) {
      fetchTrips(to, from, returnDate, adults)
        .then(setReturnTrips)
        .catch((e) => setErrorReturn(e.message))
        .finally(() => setLoadingReturn(false));
    }
  }, [from, to, date, returnDate, isRoundTrip, adults]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.push("/")} className="text-sm text-indigo-500 hover:underline mb-4 block">
          ← Back to search
        </button>

        <SearchBar
          initialFrom={from} initialTo={to} initialDate={date}
          initialReturnDate={returnDate} initialTripType={tripType}
          initialAdults={adults} initialChildren={children}
        />

        <h1 className="text-2xl font-bold text-indigo-600 mb-1">Flixbus Results</h1>
        <p className="text-gray-500 text-sm mb-6">
          {isRoundTrip
            ? `${from} → ${to} · ${formatDisplayDate(date)}  ·  Return ${to} → ${from} · ${formatDisplayDate(returnDate!)}`
            : `${from} → ${to} · ${formatDisplayDate(date)}`}
        </p>

        {/* On mobile, stack columns; on desktop, side by side */}
        {isRoundTrip ? (
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-1 min-w-0 w-full">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Outbound · {from} → {to}
              </h2>
              {loadingOutbound && <p className="text-gray-400 text-sm mb-4">Loading trips...</p>}
              {errorOutbound && <p className="text-red-500 text-sm mb-4">{errorOutbound}</p>}
              {outboundTrips.map((trip) => (
                <TripCard key={trip.uid} trip={trip} adults={adults} children={children}
                  bookingUrl={buildBookingUrl(from, to, trip.departure.date, adults, children)} />
              ))}
            </div>
            <div className="flex-1 min-w-0 w-full">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Return · {to} → {from}
              </h2>
              {loadingReturn && <p className="text-gray-400 text-sm mb-4">Loading return trips...</p>}
              {errorReturn && <p className="text-red-500 text-sm mb-4">{errorReturn}</p>}
              {returnTrips.map((trip) => (
                <TripCard key={trip.uid} trip={trip} adults={adults} children={children}
                  bookingUrl={buildBookingUrl(to, from, trip.departure.date, adults, children)} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {loadingOutbound && <p className="text-gray-400 text-sm mb-4">Loading trips...</p>}
            {errorOutbound && <p className="text-red-500 text-sm mb-4">{errorOutbound}</p>}
            {outboundTrips.map((trip) => (
              <TripCard key={trip.uid} trip={trip} adults={adults} children={children}
                bookingUrl={buildBookingUrl(from, to, trip.departure.date, adults, children)} />
            ))}
          </>
        )}
      </div>
    </main>
  );
}

export default function Results() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  );
}