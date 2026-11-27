"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { CATEGORY_COLORS, type Report } from "@/data/demo-reports";

export const DHAKA_CENTER: [number, number] = [23.8103, 90.4125];
export const BANGLADESH_CENTER: [number, number] = [23.685, 90.3563];

function pinIcon(color: string, label: string, selected: boolean) {
  const size = selected ? 38 : 30;
  return L.divIcon({
    className: "rk-pin",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span style="
      display:flex;align-items:center;justify-content:center;
      width:${size}px;height:${size}px;border-radius:9999px;
      background:${color};color:#fff;font-weight:800;font-size:13px;
      border:3px solid #fff;box-shadow:0 2px 8px rgba(15,31,46,.35);
      ${selected ? "outline:3px solid #14532d;outline-offset:2px;" : ""}
    ">${label}</span>`,
  });
}

function FocusController({ target }: { target?: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 14), {
        duration: 0.8,
      });
    }
  }, [target, map]);
  return null;
}

function ClickPicker({
  onPick,
}: {
  onPick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapViewProps {
  reports: Report[];
  selectedId?: string | number | null;
  onSelect?: (report: Report) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  /** When set, clicking the map picks a location instead of selecting a report. */
  onPick?: (lat: number, lng: number) => void;
  pickMarker?: { lat: number; lng: number } | null;
  scrollWheelZoom?: boolean;
}

export default function MapView({
  reports,
  selectedId,
  onSelect,
  center = BANGLADESH_CENTER,
  zoom = 7,
  height = "420px",
  onPick,
  pickMarker,
  scrollWheelZoom = true,
}: MapViewProps) {
  const selected = useMemo(
    () => reports.find((r) => String(r.id) === String(selectedId)),
    [reports, selectedId]
  );

  return (
    <div
      className="overflow-hidden rounded-2xl ring-1 ring-navy-900/10"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={scrollWheelZoom}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reports.map((r, i) => (
          <Marker
            key={String(r.id)}
            position={[r.lat, r.lng]}
            icon={pinIcon(
              CATEGORY_COLORS[r.category],
              String(i + 1),
              String(r.id) === String(selectedId)
            )}
            eventHandlers={{
              click: () => onSelect?.(r),
            }}
          />
        ))}
        {pickMarker ? (
          <Marker
            position={[pickMarker.lat, pickMarker.lng]}
            icon={pinIcon("#14532d", "📍", true)}
          />
        ) : null}
        <FocusController
          target={selected ? { lat: selected.lat, lng: selected.lng } : null}
        />
        <ClickPicker onPick={onPick} />
      </MapContainer>
    </div>
  );
}
