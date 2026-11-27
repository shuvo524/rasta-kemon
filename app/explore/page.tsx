"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLang, t, categoryLabel } from "@/lib/i18n";
import {
  demoReports,
  CATEGORY_KEYS,
  CATEGORY_COLORS,
  distanceMetres,
  type Category,
  type Report,
} from "@/data/demo-reports";
import { formatNumber } from "@/lib/store";
import { fetchReports } from "@/lib/api";
import ReportCard from "@/components/ReportCard";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl bg-navy-900/5 text-sm text-slate2">
      Loading…
    </div>
  ),
});

type SortKey = "newest" | "confirmed" | "nearest";

function ExploreContent() {
  const { lang } = useLang();
  const searchParams = useSearchParams();
  const [reports, setReports] = useState<Report[]>(demoReports);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [refPoint, setRefPoint] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchReports({ limit: 100 })
      .then((d) => {
        if (!cancelled) setReports(d.reports.length > 0 ? d.reports : demoReports);
      })
      .catch(() => {
        if (!cancelled) setReports(demoReports);
      });
    const preset = searchParams.get("category");
    if (preset && (CATEGORY_KEYS as string[]).includes(preset)) {
      setCategory(preset as Category);
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = reports.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.area.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q)
      );
    });
    const ref = refPoint ?? { lat: 23.8103, lng: 90.4125 };
    if (sort === "confirmed") {
      list = [...list].sort((a, b) => b.confirmCount - a.confirmCount);
    } else if (sort === "nearest") {
      list = [...list].sort(
        (a, b) =>
          distanceMetres(ref.lat, ref.lng, a.lat, a.lng) -
          distanceMetres(ref.lat, ref.lng, b.lat, b.lng)
      );
    } else {
      list = [...list].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return list;
  }, [reports, query, category, sort, refPoint]);

  const selected = useMemo(
    () => reports.find((r) => String(r.id) === String(selectedId)),
    [reports, selectedId]
  );

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setRefPoint({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSort("nearest");
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {t(lang, "explore.title")}
      </h1>
      <p className="mt-1.5 text-slate2">{t(lang, "explore.subtitle")}</p>

      {/* Desktop split / mobile stacked */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[400px_minmax(0,1fr)]">
        {/* LEFT: filters + list (desktop) / bottom sheet (mobile, below map) */}
        <aside className="order-2 flex flex-col gap-4 lg:order-1">
          <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-navy-900/5">
            <label className="sr-only" htmlFor="explore-search">
              {t(lang, "common.search")}
            </label>
            <input
              id="explore-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(lang, "common.search")}
              className="w-full rounded-xl border border-navy-900/15 px-4 py-3 text-[15px] outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory("all")}
                className={`rounded-full px-3 py-1.5 text-[13px] font-bold ring-1 transition ${
                  category === "all"
                    ? "bg-forest-900 text-white ring-forest-900"
                    : "bg-cream text-slate2 ring-navy-900/10 hover:text-ink"
                }`}
              >
                {t(lang, "common.all")}
              </button>
              {CATEGORY_KEYS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(category === c ? "all" : c)}
                  className={`rounded-full px-3 py-1.5 text-[13px] font-bold ring-1 transition ${
                    category === c
                      ? "text-white"
                      : "bg-cream text-slate2 ring-navy-900/10 hover:text-ink"
                  }`}
                  style={
                    category === c
                      ? { backgroundColor: CATEGORY_COLORS[c], borderColor: CATEGORY_COLORS[c] }
                      : undefined
                  }
                >
                  {categoryLabel(lang, c)}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <label htmlFor="explore-sort" className="text-[13px] font-semibold text-slate2">
                {t(lang, "common.sort")}
              </label>
              <select
                id="explore-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="flex-1 rounded-xl border border-navy-900/15 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-forest-700"
              >
                <option value="newest">{t(lang, "common.sortNewest")}</option>
                <option value="confirmed">{t(lang, "common.sortConfirmed")}</option>
                <option value="nearest">{t(lang, "common.sortNearest")}</option>
              </select>
              <button
                type="button"
                onClick={useMyLocation}
                disabled={locating}
                className="rounded-xl bg-forest-50 px-3 py-2 text-[13px] font-bold text-forest-900 ring-1 ring-forest-900/15 transition hover:bg-forest-100 disabled:opacity-60"
              >
                {locating ? "…" : "📍 " + (lang === "bn" ? "আমার অবস্থান" : "My location")}
              </button>
            </div>
          </div>

          {/* Bottom-sheet style list on mobile */}
          <div className="rounded-t-3xl bg-white shadow-card ring-1 ring-navy-900/5 lg:rounded-2xl">
            <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-navy-900/15 lg:hidden" aria-hidden="true" />
            <div className="flex items-center justify-between px-4 pb-2 pt-3">
              <h2 className="font-bold text-ink">{t(lang, "explore.listTitle")}</h2>
              <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-bold text-slate2">
                {formatNumber(filtered.length, lang)}
              </span>
            </div>
            <div className="max-h-[480px] space-y-3 overflow-y-auto px-4 pb-4 lg:max-h-[560px]">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate2">
                  {t(lang, "reports.empty")}
                </p>
              ) : (
                filtered.map((r) => (
                  <div
                    key={String(r.id)}
                    onClick={() => setSelectedId(r.id)}
                    className={`cursor-pointer rounded-2xl transition ${
                      String(selectedId) === String(r.id)
                        ? "ring-2 ring-forest-700"
                        : ""
                    }`}
                  >
                    <ReportCard report={r} />
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT: map */}
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-20">
            <MapView
              reports={filtered}
              selectedId={selectedId}
              onSelect={(r) => setSelectedId(r.id)}
              center={[23.685, 90.3563]}
              zoom={7}
              height="560px"
            />
            {/* Legend */}
            <div className="mt-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-navy-900/5">
              <p className="text-[13px] font-bold text-ink">{t(lang, "common.legend")}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                {CATEGORY_KEYS.map((c, i) => (
                  <span key={c} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate2">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
                      style={{ backgroundColor: CATEGORY_COLORS[c] }}
                    >
                      {i + 1}
                    </span>
                    {categoryLabel(lang, c)}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate2">{t(lang, "explore.pickOnMap")}</p>
            </div>
            {selected ? (
              <div className="mt-3 rounded-2xl bg-forest-900 p-4 text-white shadow-card">
                <p className="text-sm font-bold">{selected.title}</p>
                <p className="mt-1 text-xs text-white/75">
                  {selected.area} · {formatNumber(selected.confirmCount, lang)}{" "}
                  {t(lang, "common.confirmed")}
                </p>
                <Link
                  href={`/reports/${selected.id}`}
                  className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-[13px] font-bold text-forest-900"
                >
                  {t(lang, "common.details")} →
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate2">Loading…</div>}>
      <ExploreContent />
    </Suspense>
  );
}
