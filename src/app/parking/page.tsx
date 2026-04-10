"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { MapViewHandle } from "../components/MapView";

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
  const [highlightedId, setHighlightedId] = useState<string | undefined>();
  const mapRef = useRef<MapViewHandle>(null);
  const [sortBy, setSortBy] = useState<"distance" | "cost" | "recommended">("recommended");

  useEffect(() => {
    async function fetchParking() {
      try {
        let lat: number;
        let lng: number;
        const urlLat = params.get("lat");
        const urlLng = params.get("lng");
        if (urlLat && urlLng) {
          lat = parseFloat(urlLat);
          lng = parseFloat(urlLng);
          setCenter([lat, lng]);
        } else {
          const geoRes = await fetch(`/api/geocode?address=${encodeURIComponent(location ?? "")}`);
          const geoData = await geoRes.json();
          if (geoData.error) {
            setError("Could not find that location.");
            setLoading(false);
            return;
          }
          lat = geoData.lat;
          lng = geoData.lng;
          setCenter([lat, lng]);
        }
        const parkRes = await fetch(`/api/greenp?lat=${lat}&lng=${lng}&duration=${duration}`);
        const parkData = await parkRes.json();
        if (parkData.error) { setError(parkData.error); setLoading(false); return; }
        setLots(parkData.lots);
        if (parkData.lots.length > 0) {
        setHighlightedId(parkData.lots[0].id);
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchParking();
  }, [location, duration]);

  useEffect(() => {
    if (lots.length === 0) return;
    const first = sortedLots[0];
    setHighlightedId(first.id);
    mapRef.current?.focusLot(first);
  }, [sortBy, lots]);

  const handleCardClick = (lot: Lot) => {
    setHighlightedId(lot.id);
    mapRef.current?.focusLot(lot);
  };

  const sortedLots = [...lots].sort((a, b) => {
    if (sortBy === "distance") return a.distanceKm - b.distanceKm;
    if (sortBy === "cost") return a.estimatedCost - b.estimatedCost;
    
    // Recommended: score based on both price and distance
    const maxCost = Math.max(...lots.map(l => l.estimatedCost));
    const maxDist = Math.max(...lots.map(l => l.distanceKm));
    const scoreA = (a.estimatedCost / maxCost) * 0.5 + (a.distanceKm / maxDist) * 0.5;
    const scoreB = (b.estimatedCost / maxCost) * 0.5 + (b.distanceKm / maxDist) * 0.5;
    return scoreA - scoreB;
  });

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">

        <button
          onClick={() => router.push("/")}
          className="text-sm text-indigo-500 hover:underline mb-4 block"
        >
          Back to search
        </button>

        <h1 className="text-2xl font-bold text-indigo-600 mb-1">Nearby Green P Lots</h1>
        <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm">Near {location} · {duration}h</p>
            <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "distance" | "cost" | "recommended")}
                className="font-sans text-sm border border-gray-200 rounded-xl px-2 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                <option value="recommended">Recommended</option>
                <option value="distance">Nearest</option>
                <option value="cost">Cheapest</option>
            </select>
        </div>        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          ⚠️ Rates are approximate. Always confirm the posted rate before parking.
        </p>

        {loading && <p className="text-gray-400 text-sm">Finding nearby lots...</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {center && lots.length > 0 && (
          <div className="rounded-2xl overflow-hidden shadow-md mb-6 h-64">
            <MapView ref={mapRef} center={center} lots={sortedLots} highlightedId={highlightedId} />
          </div>
        )}

        {sortedLots.map((lot, index) => (
        <div
            key={lot.id}
            onClick={() => handleCardClick(lot)}
            className={[
            "bg-white rounded-2xl shadow-md p-5 mb-4 flex items-center justify-between cursor-pointer transition-all",
            lot.id === highlightedId
                ? "ring-2 ring-orange-400 shadow-lg bg-orange-50"
                : "hover:shadow-lg",
            ].join(" ")}
        >
            <div className="flex items-start gap-3">
            <div
                className={[
                "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white",
                lot.id === highlightedId ? "bg-orange-500" : "bg-indigo-600",
                ].join(" ")}
            >
                {index + 1}
            </div>
            <div>
                {sortedLots[0].id === lot.id && (
                    <span className={`text-xs px-2 py-0.5 rounded-full mb-1 inline-block ${
                        lot.id === highlightedId
                        ? "bg-orange-100 text-orange-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}>
                        {sortBy === "recommended" ? "Recommended" : sortBy === "distance" ? "Nearest" : "Best Value"}
                    </span>
                )}
                <p className="font-semibold text-gray-800">{lot.address}</p>
                <p className="text-sm text-gray-500">
                {lot.type} · {(lot.distanceKm * 1000).toFixed(0)}m away · ${lot.ratePerHalfHour.toFixed(2)}/30min
                </p>
            </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
            <p className="text-lg font-bold text-indigo-600">${lot.estimatedCost.toFixed(2)}</p>
            <a href={lot.slug} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-indigo-400 hover:underline">Details</a>
            <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-gray-400">Open with</span>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${lot.lat},${lot.lng}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-gray-500 hover:text-gray-800 underline">Google</a>
                <span className="text-xs text-gray-300">|</span>
                <a href={`http://maps.apple.com/?daddr=${lot.lat},${lot.lng}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-gray-500 hover:text-gray-800 underline">Apple</a>
            </div>
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