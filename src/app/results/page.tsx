"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Trip = {
  uid: string;
  departure: { date: string };
  arrival: { date: string };
  duration: { hours: number; minutes: number };
  price: { total: number };
};

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function ResultsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const from = params.get("from");
  const to = params.get("to");
  const date = params.get("date");

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTrips() {
      try {
        const res = await fetch(`/api/flixbus?from=${from}&to=${to}&date=${date}`);
        const data = await res.json();

        if (data.error) { setError(data.error); return; }

        // Deduplicate by ride_id (same bus, different stop combos) — keep cheapest per ride
        const seen = new Map<string, Trip>();
        const results = Object.values(data.trips[0].results) as Trip[];
        for (const trip of results) {
          const rideId = trip.uid.split(":")[1];
          if (!seen.has(rideId) || trip.price.total < seen.get(rideId)!.price.total) {
            seen.set(rideId, trip);
          }
        }

        const sorted = Array.from(seen.values()).sort(
          (a, b) => new Date(a.departure.date).getTime() - new Date(b.departure.date).getTime()
        );
        setTrips(sorted);
      } catch {
        setError("Failed to load results.");
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, [from, to, date]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto">
        <button onClick={() => router.push("/")} className="text-sm text-indigo-500 hover:underline mb-4 block">
          ← Back to search
        </button>
        <h1 className="text-2xl font-bold text-indigo-600 mb-1">Flixbus Results</h1>
        <p className="text-gray-500 text-sm mb-6">{from} → {to} · {date}</p>

        {loading && <p className="text-gray-400 text-sm">Loading trips...</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {trips.map((trip) => (
          <div key={trip.uid} className="bg-white rounded-2xl shadow-md p-5 mb-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">Flixbus</p>
              <p className="text-sm text-gray-500">
                {formatTime(trip.departure.date)} → {formatTime(trip.arrival.date)} · {trip.duration.hours}h {trip.duration.minutes}m
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-indigo-600">${trip.price.total.toFixed(2)}</p>
              <a href="https://www.flixbus.ca" target="_blank" className="text-xs text-indigo-400 hover:underline">
                Book →
              </a>
            </div>
          </div>
        ))}
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