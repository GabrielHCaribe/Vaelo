"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("../components/MapView"), { ssr: false });

type Lot = {
  id: string;
  address: string;
  ratePerHalfHour: number;
  estimatedCost: number;
  type: string;
  capacity: string;
  distanceKm: number;
  slug: string;
  lat: number;
  lng: number;
};

function ParkingContent() {
  const params = useSearchParams();
  const router = useRouter();
  const location = params.get("location");
  const duration = params.get("duration");

  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [center, setCenter] = useState<[number, number] | null>(null);

  useEffect(() => {
    async function fetchParking() {
      try {
        // Geocode the typed address
        const geoRes = await fetch(`/api/geocode?address=${encodeURIComponent(location ?? "")}`);
        const geoData = await geoRes.json();

        if (geoData.error) {
          setError("Could not find that location. Try a more specific address.");
          setLoading(false);
          return;
        }

        const { lat, lng } = geoData;
        setCenter([lat, lng]);

        // Fetch nearby lots around that point
        const parkRes = await fetch(`/api/greenp?lat=${lat}&lng=${lng}&duration=${duration}`);
        const parkData = await parkRes.json();

        if (parkData.error) { setError(parkData.error); setLoading(false); return; }
        setLots(parkData.lots);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchParking();
  }, [location, duration]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.push("/")} className="text-sm text-indigo-500 hover:underline mb-4 block">
          ← Back to search
        </button>
        <h1 className="text-2xl font-bold text-indigo-600 mb-1">Nearby Green P Lots</h1>
        <p className="text-gray-500 text-sm mb-2">
          Near {location} · {duration}h · sorted by estimated cost
        </p>
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          ⚠️ Rates are approximate. Always confirm the posted rate before parking.
        </p>

        {loading && <p className="text-gray-400 text-sm">Finding nearby lots...</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Map */}
        {center && lots.length > 0 && (
          <div className="rounded-2xl overflow-hidden shadow-md mb-6 h-64">
            <MapView center={center} lots={lots} />
          </div>
        )}

        {/* Results */}
        {lots.map((lot, index) => (
          <div key={lot.id} className={`bg-white rounded-2xl shadow-md p-5 mb-4 flex items-center justify-between ${index === 0 ? "ring-2 ring-indigo-400" : ""}`}>
            <div>
              {index === 0 && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full mb-1 inline-block">
                  Best Value
                </span>
              )}
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

        {!loading && !error && lots.length === 0 && (
          <p className="text-gray-500 text-sm">No lots found within 1km of that location.</p>
        )}
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