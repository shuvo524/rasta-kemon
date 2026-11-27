"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { CATEGORY_COLORS, type Report } from "@/data/demo-reports";
import { DHAKA_CENTER } from "@/lib/geo";

export { DHAKA_CENTER } from "@/lib/geo";
export { BANGLADESH_CENTER } from "@/lib/geo";

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

/**
 * Imperative marker clustering (leaflet.markercluster) — the Dhaka pins
 * no longer overlap at country zoom. Markers are rebuilt whenever the
 * report list or the selection changes.
 */
function ClusterLayer({
  reports,
  selectedId,
  onSelect,
}: {
  reports: Report[];
  selectedId?: string | number | null;
  onSelect?: (report: Report) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 55,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        const size = count < 5 ? 36 : count < 10 ? 42 : 48;
        return L.divIcon({
          className: "rk-cluster-wrap",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          html: `<span class="rk-cluster" style="width:${size}px;height:${size}px;">${count}</span>`,
        });
      },
    });
    reports.forEach((r, i) => {
      const marker = L.marker([r.lat, r.lng], {
        icon: pinIcon(
          CATEGORY_COLORS[r.category],
          String(i + 1),
          String(r.id) === String(selectedId)
        ),
      });
      marker.on("click", () => onSelect?.(r));
      group.addLayer(marker);
    });
    map.addLayer(group);
    return () => {
      map.removeLayer(group);
    };
    // Rebuild the cluster whenever data or selection changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, reports, selectedId]);

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
  /** Turn clustering off (e.g. the single-report mini map). */
  cluster?: boolean;
}

export default function MapView({
  reports,
  selectedId,
  onSelect,
  center = DHAKA_CENTER,
  zoom = 11,
  height = "420px",
  onPick,
  pickMarker,
  scrollWheelZoom = true,
  cluster = true,
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
        {cluster ? (
          <ClusterLayer
            reports={reports}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ) : (
          reports.map((r, i) => (
            <ClusterlessMarker
              key={String(r.id)}
              report={r}
              label={String(i + 1)}
              selected={String(r.id) === String(selectedId)}
              onSelect={onSelect}
            />
          ))
        )}
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

import { Marker } from "react-leaflet";

function ClusterlessMarker({
  report,
  label,
  selected,
  onSelect,
}: {
  report: Report;
  label: string;
  selected: boolean;
  onSelect?: (report: Report) => void;
}) {
  return (
    <Marker
      position={[report.lat, report.lng]}
      icon={pinIcon(CATEGORY_COLORS[report.category], label, selected)}
      eventHandlers={{ click: () => onSelect?.(report) }}
    />
  );
}
