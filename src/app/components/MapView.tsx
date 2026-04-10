"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

const searchIcon = L.divIcon({
  className: "",
  html: `<div style="background:#4f46e5;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function makeNumberedIcon(number: number, highlighted: boolean) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${highlighted ? "#f97316" : "#4f46e5"};color:white;width:${highlighted ? "34px" : "28px"};height:${highlighted ? "34px" : "28px"};border-radius:50%;border:2px solid white;box-shadow:0 0 6px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;">${number}</div>`,
    iconSize: highlighted ? [34, 34] : [28, 28],
    iconAnchor: highlighted ? [17, 17] : [14, 14],
  });
}

const MAP_STYLES = {
  Street: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  Minimal: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  Satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  Dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

type StyleKey = keyof typeof MAP_STYLES;

type Lot = {
  id: string;
  address: string;
  estimatedCost: number;
  ratePerHalfHour: number;
  lat: number;
  lng: number;
  slug: string;
};

// Inner component that has access to the map instance
function MapController({ focusedLot }: { focusedLot: Lot | null }) {
  const map = useMap();
  useEffect(() => {
    if (focusedLot) {
      map.flyTo([focusedLot.lat, focusedLot.lng], 17, { duration: 0.8 });
    }
  }, [focusedLot, map]);
  return null;
}

export type MapViewHandle = {
  focusLot: (lot: Lot) => void;
};

type Props = {
  center: [number, number];
  lots: Lot[];
  highlightedId?: string;
};

const MapView = forwardRef<MapViewHandle, Props>(function MapView({ center, lots, highlightedId }, ref) {
  const [style, setStyle] = useState<StyleKey>("Street");
  const [focusedLot, setFocusedLot] = useState<Lot | null>(null);

  useImperativeHandle(ref, () => ({
    focusLot: (lot: Lot) => setFocusedLot(lot),
  }));

  return (
    <div className="relative h-full w-full">
      {/* Style switcher */}
      <div className="absolute top-2 right-2 z-[1000] flex gap-1">
        {(Object.keys(MAP_STYLES) as StyleKey[]).map((s) => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            className={`px-2 py-1 text-xs rounded shadow font-medium transition-colors ${
              style === s ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url={MAP_STYLES[style]} />
        <MapController focusedLot={focusedLot} />

        {/* Search location marker */}
        <Marker position={center} icon={searchIcon}>
          <Popup>Your search location</Popup>
        </Marker>

        {/* Numbered lot markers */}
        {lots.map((lot, index) => (
          <Marker
            key={lot.id}
            position={[lot.lat, lot.lng]}
            icon={makeNumberedIcon(index + 1, lot.id === highlightedId)}
          >
            <Popup>
              <strong>{index + 1}. {lot.address}</strong><br />
              ${lot.ratePerHalfHour.toFixed(2)}/30min · Est. ${lot.estimatedCost.toFixed(2)}<br />
              <a href={lot.slug} target="_blank" rel="noreferrer">Details →</a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
});

export default MapView;