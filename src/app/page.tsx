"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

type Suggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

type Tab = "parking" | "buses";

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("parking");
  const [menuOpen, setMenuOpen] = useState(false);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("one-way");

  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedLat, setSelectedLat] = useState<string | null>(null);
  const [selectedLng, setSelectedLng] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.length < 3 || selectedLat) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(location)}`);
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    }, 350);
  }, [location]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleSelectSuggestion = (s: Suggestion) => {
    setLocation(s.display_name.split(",")[0]);
    setSelectedLat(s.lat);
    setSelectedLng(s.lon);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleBusSearch = () => {
    if (!from || !to || !date) return;
    if (tripType === "round-trip" && !returnDate) return;
    const params = new URLSearchParams({ from, to, date, tripType });
    if (tripType === "round-trip") params.set("returnDate", returnDate);
    router.push(`/results?${params.toString()}`);
  };  

  const handleParkingSearch = () => {
    if (!location || !duration) return;
    if (selectedLat && selectedLng) {
      router.push(`/parking?location=${encodeURIComponent(location)}&duration=${encodeURIComponent(duration)}&lat=${selectedLat}&lng=${selectedLng}`);
    } else {
      router.push(`/parking?location=${encodeURIComponent(location)}&duration=${encodeURIComponent(duration)}`);
    }
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50";
  const selectClass = "flex-1 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400";

  const dateParts = date.split("-");
  const dateYear = dateParts[0] || "";
  const dateMonth = dateParts[1] || "";
  const dateDay = dateParts[2] || "";

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const busCities = ["Toronto", "London", "Ottawa", "Hamilton", "Kitchener"];

  return (
    <div className="min-h-screen bg-white flex flex-col" ref={topRef}>

      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 w-full px-8 py-4 flex items-center justify-between border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <button onClick={scrollToTop} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Vaelo</span>
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2.5 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-colors"
            aria-label="Menu"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Navigate</p>
              </div>
              <button
                onClick={() => { setTab("parking"); setMenuOpen(false); scrollToTop(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16H5v-4l2-5h8l2 5v4h-4z" />
                </svg>
                Parking
              </button>
              <button
                onClick={() => { setTab("buses"); setMenuOpen(false); scrollToTop(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-t border-gray-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 6v6m8-6v6M3 10h18M5 18h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2zm2 0v2m10-2v2M7 6h10a1 1 0 011 1v1H6V7a1 1 0 011-1z" />
                </svg>
                Buses
              </button>
              <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Coming Soon</p>
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Food Delivery
                </p>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl text-center mb-10">
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
            Find the best deal,<br />
            <span className="text-indigo-600">instantly.</span>
          </h1>
          <p className="text-lg text-gray-500">
            Compare parking and bus options across Ontario — all in one place.
          </p>
        </div>

        {/* Tabs */}
        <div className="w-full max-w-xl mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setTab("parking")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === "parking"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 8h3a2 2 0 010 4h-3V8zm0 4v4" />
              </svg>
              Parking
            </button>
            <button
              onClick={() => setTab("buses")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === "buses"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 6v6m8-6v6M3 10h18M5 18h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2zm2 0v2m10-2v2M7 6h10a1 1 0 011 1v1H6V7a1 1 0 011-1z" />
              </svg>
              Buses
            </button>
          </div>
        </div>

        {/* Search Card */}
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col gap-4">
          {tab === "parking" && (
            <>
              <div className="flex flex-col gap-1 relative">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Rogers Centre, King St & Bay St"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setSelectedLat(null); setSelectedLng(null); }}
                  onFocus={() => setShowSuggestions(true)}
                  className={inputClass}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-xl shadow-xl mt-1 overflow-hidden">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectSuggestion(s)}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 border-b border-gray-50 last:border-0"
                      >
                        {s.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Duration (hours)</label>
                <input
                  type="number"
                  placeholder="e.g. 2"
                  min="1"
                  max="24"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button
                onClick={handleParkingSearch}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-sm"
              >
                Find Parking
              </button>
            </>
          )}

          {tab === "buses" && (
            <>
              {/* Trip type toggle */}
              <div className="flex gap-2">
                {(["one-way", "round-trip"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => { setTripType(type); setReturnDate(""); }}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      tripType === type
                        ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {type === "one-way" ? "One Way" : "Round Trip"}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">From</label>
                <select value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass}>
                  <option value="">Select city</option>
                  {busCities.filter(c => c !== to).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">To</label>
                <select value={to} onChange={(e) => setTo(e.target.value)} className={inputClass}>
                  <option value="">Select city</option>
                  {busCities.filter(c => c !== from).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Outbound date */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {tripType === "round-trip" ? "Departure Date" : "Date"}
                </label>
                <div className="flex gap-2">
                  <select value={dateDay} onChange={(e) => setDate(`${dateYear || new Date().getFullYear()}-${dateMonth || "01"}-${e.target.value}`)} className={selectClass}>
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={String(d).padStart(2, "0")}>{d}</option>
                    ))}
                  </select>
                  <select value={dateMonth} onChange={(e) => setDate(`${dateYear || new Date().getFullYear()}-${e.target.value}-${dateDay || "01"}`)} className={selectClass}>
                    <option value="">Month</option>
                    {months.map((m, i) => (
                      <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>
                    ))}
                  </select>
                  <select value={dateYear} onChange={(e) => setDate(`${e.target.value}-${dateMonth || "01"}-${dateDay || "01"}`)} className={selectClass}>
                    <option value="">Year</option>
                    {[2026, 2027].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Return date — only shown for round trip */}
              {tripType === "round-trip" && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Return Date</label>
                  <div className="flex gap-2">
                    <select
                      value={returnDate.split("-")[2] || ""}
                      onChange={(e) => {
                        const [y, m] = returnDate.split("-");
                        setReturnDate(`${y || new Date().getFullYear()}-${m || "01"}-${e.target.value}`);
                      }}
                      className={selectClass}
                    >
                      <option value="">Day</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                        <option key={d} value={String(d).padStart(2, "0")}>{d}</option>
                      ))}
                    </select>
                    <select
                      value={returnDate.split("-")[1] || ""}
                      onChange={(e) => {
                        const [y, , d] = returnDate.split("-");
                        setReturnDate(`${y || new Date().getFullYear()}-${e.target.value}-${d || "01"}`);
                      }}
                      className={selectClass}
                    >
                      <option value="">Month</option>
                      {months.map((m, i) => (
                        <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={returnDate.split("-")[0] || ""}
                      onChange={(e) => {
                        const [, m, d] = returnDate.split("-");
                        setReturnDate(`${e.target.value}-${m || "01"}-${d || "01"}`);
                      }}
                      className={selectClass}
                    >
                      <option value="">Year</option>
                      {[2026, 2027].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button
                onClick={handleBusSearch}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-sm"
              >
                Search Buses
              </button>
            </>
          )}
        </div>

        {/* Trust bar */}
        <div className="w-full max-w-xl mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">Free</p>
            <p className="text-xs text-gray-400 mt-0.5">Always free to use</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">Live</p>
            <p className="text-xs text-gray-400 mt-0.5">Real-time results</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">Ontario</p>
            <p className="text-xs text-gray-400 mt-0.5">Built for Canadians</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">V</span>
                </div>
                <span className="font-bold text-gray-900 text-lg">Vaelo</span>
              </div>
              <p className="text-sm text-gray-400 max-w-xs">The smartest way to compare parking and transit options in Ontario.</p>
              <p className="text-xs text-gray-400 mt-2">Built in Toronto, Ontario 🍁</p>
            </div>

            <div className="grid grid-cols-3 gap-32 text-sm">
              <div>
                <p className="font-semibold text-gray-700 mb-3">Product</p>
                <ul className="space-y-2">
                  <li><button onClick={() => { setTab("parking"); scrollToTop(); }} className="text-gray-400 hover:text-indigo-600 transition-colors">Parking</button></li>
                  <li><button onClick={() => { setTab("buses"); scrollToTop(); }} className="text-gray-400 hover:text-indigo-600 transition-colors">Buses</button></li>
                  <li><span className="text-gray-300">Food Delivery</span></li>
                  <li><span className="text-gray-300">Ride Sharing</span></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-3">Company</p>
                <ul className="space-y-2">
                  <li><a href="/about" className="text-gray-400 hover:text-indigo-600 transition-colors">About</a></li>
                  <li><a href="mailto:gabriel@vaelo.ca" className="text-gray-400 hover:text-indigo-600 transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-3">Legal</p>
                <ul className="space-y-2">
                  <li><a href="/privacy" className="text-gray-400 hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                  <li><a href="/terms" className="text-gray-400 hover:text-indigo-600 transition-colors">Terms of Use</a></li>
                  <li><a href="/disclaimer" className="text-gray-400 hover:text-indigo-600 transition-colors">Disclaimer</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 flex items-center justify-between">
            <p className="text-xs text-gray-400">© 2026 Vaelo. All rights reserved.</p>
            <p className="text-xs text-gray-400">Rates are approximate. Always verify before parking.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}