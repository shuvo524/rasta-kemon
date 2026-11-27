"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useLang, t, categoryLabel } from "@/lib/i18n";
import {
  demoReports,
  computeStats,
  CATEGORY_KEYS,
  CATEGORY_COLORS,
  type Report,
} from "@/data/demo-reports";
import { loadAllReports, formatNumber } from "@/lib/store";
import ReportCard from "@/components/ReportCard";
import { DemoBadge } from "@/components/Badges";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-2xl bg-navy-900/5 text-sm text-slate2">
      {t("bn", "common.loading")}
    </div>
  ),
});

const CATEGORY_GLYPHS: Record<string, string> = {
  damage: "🕳️",
  waterlogging: "🌊",
  construction: "🚧",
  closure: "⛔",
  obstruction: "🚗",
  other: "⚠️",
};

export default function HomePage() {
  const { lang } = useLang();
  const [reports, setReports] = useState<Report[]>(demoReports);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  useEffect(() => {
    setReports(loadAllReports());
  }, []);

  const stats = useMemo(() => computeStats(reports), [reports]);
  const recent = useMemo(() => reports.slice(0, 6), [reports]);
  const selected = useMemo(
    () => reports.find((r) => String(r.id) === String(selectedId)),
    [reports, selectedId]
  );

  const statItems = [
    { label: t(lang, "stats.total"), value: stats.total },
    { label: t(lang, "stats.active"), value: stats.active },
    { label: t(lang, "stats.confirmations"), value: stats.confirmations },
    { label: t(lang, "stats.districts"), value: stats.districts },
  ];

  const steps = [
    { n: "01", title: t(lang, "how.1.title"), text: t(lang, "how.1.text") },
    { n: "02", title: t(lang, "how.2.title"), text: t(lang, "how.2.text") },
    { n: "03", title: t(lang, "how.3.title"), text: t(lang, "how.3.text") },
  ];

  const trustItems = [
    { title: t(lang, "trust.1.title"), text: t(lang, "trust.1.text") },
    { title: t(lang, "trust.2.title"), text: t(lang, "trust.2.text") },
    { title: t(lang, "trust.3.title"), text: t(lang, "trust.3.text") },
    { title: t(lang, "trust.4.title"), text: t(lang, "trust.4.text") },
  ];

  return (
    <div>
      {/* ---------- HERO: text + live map, side by side ---------- */}
      <section className="border-b border-navy-900/8 bg-cream">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:py-14">
          <div className="flex flex-col justify-center lg:col-span-5">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-forest-50 px-3 py-1.5 text-xs font-bold text-forest-900 ring-1 ring-forest-900/15">
              <span className="h-2 w-2 rounded-full bg-forest-600" aria-hidden="true" />
              {t(lang, "hero.badge")}
            </span>
            <h1 className="mt-5 text-[34px] font-extrabold leading-[1.15] tracking-tight text-ink sm:text-5xl">
              {t(lang, "hero.title")}
            </h1>
            <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-slate2">
              {t(lang, "hero.subtitle")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/explore"
                className="rounded-full bg-forest-900 px-6 py-3.5 text-sm font-bold text-white shadow-card transition hover:bg-forest-800"
              >
                {t(lang, "hero.explore")} →
              </Link>
              <Link
                href="/report/new"
                className="rounded-full bg-white px-6 py-3.5 text-sm font-bold text-forest-900 ring-1 ring-forest-900/20 transition hover:bg-forest-50"
              >
                {t(lang, "hero.report")}
              </Link>
            </div>
            {/* Stats strip — computed from data, never invented */}
            <dl className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {statItems.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl bg-white px-3 py-3 shadow-card ring-1 ring-navy-900/5"
                >
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate2">
                    {s.label}
                  </dt>
                  <dd className="mt-1 text-2xl font-extrabold text-forest-900">
                    {formatNumber(s.value, lang)}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-slate2">{t(lang, "stats.note")}</p>
          </div>

          <div className="lg:col-span-7">
            <div className="relative">
              <MapView
                reports={reports}
                selectedId={selectedId}
                onSelect={(r) => setSelectedId(r.id)}
                center={[23.685, 90.3563]}
                zoom={7}
                height="480px"
              />
              <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-ink shadow-card">
                {t(lang, "hero.mapCaption")} <DemoBadge />
              </div>
              {selected ? (
                <Link
                  href={`/reports/${selected.id}`}
                  className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 rounded-2xl bg-white/95 p-3 shadow-lift backdrop-blur sm:right-auto sm:min-w-[320px]"
                >
                  <span>
                    <span className="block text-sm font-bold text-ink">
                      {selected.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate2">
                      {selected.area} · {formatNumber(selected.confirmCount, lang)}{" "}
                      {t(lang, "common.confirmed")}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-bold text-forest-800">→</span>
                </Link>
              ) : (
                <p className="absolute bottom-3 left-3 rounded-full bg-navy-950/80 px-3 py-1.5 text-xs font-semibold text-white">
                  {t(lang, "hero.mapNote")}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how-it-works" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                {t(lang, "how.title")}
              </h2>
              <p className="mt-2 text-slate2">{t(lang, "how.subtitle")}</p>
            </div>
            <span className="hidden text-sm font-bold text-forest-800 sm:block">
              01 → 02 → 03
            </span>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((s) => (
              <article
                key={s.n}
                className="relative overflow-hidden rounded-2xl bg-cream p-6 ring-1 ring-navy-900/5"
              >
                <span className="text-5xl font-extrabold text-forest-900/15">
                  {s.n}
                </span>
                <h3 className="mt-3 text-lg font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate2">{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CATEGORIES ---------- */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {t(lang, "cat.title")}
          </h2>
          <p className="mt-2 text-slate2">{t(lang, "cat.subtitle")}</p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORY_KEYS.map((c) => (
              <Link
                key={c}
                href={`/explore?category=${c}`}
                className="group rounded-2xl bg-white p-4 shadow-card ring-1 ring-navy-900/5 transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-xl text-white"
                  style={{ backgroundColor: CATEGORY_COLORS[c] }}
                  aria-hidden="true"
                >
                  {CATEGORY_GLYPHS[c]}
                </span>
                <span className="mt-3 block text-[15px] font-bold text-ink group-hover:text-forest-800">
                  {categoryLabel(lang, c)}
                </span>
                <span className="mt-1 block text-xs text-slate2">
                  {formatNumber(
                    reports.filter((r) => r.category === c).length,
                    lang
                  )}{" "}
                  · {t(lang, "stats.total")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- RECENT REPORTS ---------- */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                {t(lang, "reports.title")}
              </h2>
              <p className="mt-2 text-slate2">{t(lang, "reports.subtitle")}</p>
            </div>
            <Link
              href="/explore"
              className="rounded-full bg-forest-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-forest-800"
            >
              {t(lang, "reports.viewAll")} →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((r) => (
              <ReportCard key={String(r.id)} report={r} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- TRUST ---------- */}
      <section className="bg-navy-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {t(lang, "trust.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-white/70">{t(lang, "trust.subtitle")}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((item, i) => (
              <article
                key={item.title}
                className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-600 text-sm font-extrabold">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-bold">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="bg-forest-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6">
          <h2 className="mx-auto max-w-2xl text-2xl font-extrabold leading-snug sm:text-3xl">
            {t(lang, "cta.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">{t(lang, "cta.subtitle")}</p>
          <Link
            href="/report/new"
            className="mt-7 inline-block rounded-full bg-white px-7 py-3.5 text-sm font-bold text-forest-900 shadow-lift transition hover:bg-cream"
          >
            {t(lang, "cta.button")} →
          </Link>
        </div>
      </section>
    </div>
  );
}
