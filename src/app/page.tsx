"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

  const handleBusSearch = () => {
    if (!from || !to || !date) return;
    router.push(`/results?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`);
  };

  const handleParkingSearch = () => {
    if (!location || !duration) return;
    router.push(`/parking?location=${encodeURIComponent(location)}&duration=${encodeURIComponent(duration)}`);
  };

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
              tab === "parking"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            🅿️ Parking
          </button>
          <button
            onClick={() => setTab("buses")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === "buses"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            🚌 Buses
          </button>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
          {tab === "parking" && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  placeholder="e.g. King St & Bay St, Toronto"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
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
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">To</label>
                <input
                  type="text"
                  placeholder="e.g. London"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
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