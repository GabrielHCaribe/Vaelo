"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Lot = {
  id: string;
  address: string;
  ratePerHalfHour: number;
  estimatedCost: number;
  type: string;
  capacity: string;
  distanceKm: number;
  slug: string;
};

function ParkingContent() {
  const params = useSearchParams();
  const router = useRouter();
  const location = params.get("location");
  const duration = params.get("duration");

  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `/api/greenp?lat=${latitude}&lng=${longitude}&duration=${duration}`
        );
        const data = await res.json();
        if (data.error) { setError(data.error); setLoading(false); return; }
        setLots(data.lots);
        setLoading(false);
      },
      () => {
        setError("Location access denied. Please allow location to find nearby parking.");
        setLoading(false);
      }
    );
  }, [duration]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto">
        <button onClick={() => router.push("/")} className="text-sm text-indigo-500 hover:underline mb-4 block">
          ← Back to search
        </button>
        <h1 className="text-2xl font-bold text-indigo-600 mb-1">Nearby Green P Lots</h1>
        <p className="text-gray-500 text-sm mb-6">
          Near {location} · {duration}h · sorted by estimated cost
        </p>

        {loading && <p className="text-gray-400 text-sm">Finding nearby lots...</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {!loading && !error && lots.length === 0 && (
          <p className="text-gray-500 text-sm">No lots found within 1km.</p>
        )}

        {lots.map((lot) => (
          <div key={lot.id} className="bg-white rounded-2xl shadow-md p-5 mb-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">{lot.address}</p>
              <p className="text-sm text-gray-500">
                {lot.type} · {(lot.distanceKm * 1000).toFixed(0)}m away · ${lot.ratePerHalfHour.toFixed(2)}/30min
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-indigo-600">${lot.estimatedCost.toFixed(2)}</p>
              <a href={lot.slug} target="_blank" className="text-xs text-indigo-400 hover:underline">
                Details →
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default function ParkingPage() {
  return (
    <Suspense>
      <ParkingContent />
    </Suspense>
  );
}