"use client";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default marker icons
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const searchIcon = L.divIcon({
  className: "",
  html: `<div style="background:#4f46e5;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

type Lot = {
  id: string;
  address: string;
  estimatedCost: number;
  ratePerHalfHour: number;
  lat: number;
  lng: number;
  slug: string;
};

export default function MapView({ center, lots }: { center: [number, number]; lots: Lot[] }) {
  return (
    <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Search location marker */}
      <Marker position={center} icon={searchIcon}>
        <Popup>Your search location</Popup>
      </Marker>

      {/* Lot markers */}
      {lots.map((lot) => (
        <Marker key={lot.id} position={[lot.lat, lot.lng]} icon={icon}>
          <Popup>
            <strong>{lot.address}</strong><br />
            ${lot.ratePerHalfHour.toFixed(2)}/30min<br />
            <a href={lot.slug} target="_blank" rel="noreferrer">Details →</a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}