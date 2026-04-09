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

  // Bus state
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  // Parking state
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedLat, setSelectedLat] = useState<string | null>(null);
  const [selectedLng, setSelectedLng] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleSelectSuggestion = (s: Suggestion) => {
    setLocation(s.display_name.split(",")[0]);
    setSelectedLat(s.lat);
    setSelectedLng(s.lon);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleBusSearch = () => {
    if (!from || !to || !date) return;
    router.push(`/results?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`);
  };

  const handleParkingSearch = () => {
    if (!location || !duration) return;
    if (selectedLat && selectedLng) {
      router.push(`/parking?location=${encodeURIComponent(location)}&duration=${encodeURIComponent(duration)}&lat=${selectedLat}&lng=${selectedLng}`);
    } else {
      router.push(`/parking?location=${encodeURIComponent(location)}&duration=${encodeURIComponent(duration)}`);
    }
  };

  const inputClass = "border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-2">Vaelo</h1>
        <p className="text-center text-gray-500 mb-6">Find the best deal, instantly</p>

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6">
          <button
            onClick={() => setTab("parking")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === "parking" ? "bg-indigo-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            🅿️ Parking
          </button>
          <button
            onClick={() => setTab("buses")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === "buses" ? "bg-indigo-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            🚌 Buses
          </button>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
          {tab === "parking" && (
            <>
              <div className="flex flex-col gap-1 relative">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Rogers Centre, King St & Bay St"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setSelectedLat(null);
                    setSelectedLng(null);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className={inputClass}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 overflow-hidden">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectSuggestion(s)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-indigo-50 border-b border-gray-100 last:border-0"
                      >
                        {s.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Duration (hours)</label>
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Find Parking
              </button>
            </>
          )}

          {tab === "buses" && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">From</label>
                <input
                  type="text"
                  placeholder="e.g. Toronto"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">To</label>
                <input
                  type="text"
                  placeholder="e.g. London"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button
                onClick={handleBusSearch}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Search Buses
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}