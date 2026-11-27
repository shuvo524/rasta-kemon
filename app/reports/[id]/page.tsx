"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLang, t } from "@/lib/i18n";
import { nearbyReports, type Report } from "@/data/demo-reports";
import {
  findReportById,
  formatDate,
  formatNumber,
  hasConfirmed,
  loadAllReports,
  markConfirmed,
} from "@/lib/store";
import { CategoryBadge, StatusBadge, DemoBadge } from "@/components/Badges";
import ReportCard from "@/components/ReportCard";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[280px] items-center justify-center rounded-2xl bg-navy-900/5 text-sm text-slate2">
      Loading…
    </div>
  ),
});

const TIMELINE: { status: "pending" | "verified" | "resolved"; bn: string; en: string }[] = [
  { status: "pending", bn: "রিপোর্ট জমা হয়েছে", en: "Report submitted" },
  { status: "verified", bn: "কমিউনিটি ও অ্যাডমিন যাচাই করেছেন", en: "Verified by community & admin" },
  { status: "resolved", bn: "সমস্যার সমাধান হয়েছে", en: "Issue resolved" },
];

export default function ReportDetailPage() {
  const { lang } = useLang();
  const params = useParams();
  const id = String(params.id);
  const [report, setReport] = useState<Report | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [extraConfirms, setExtraConfirms] = useState(0);

  useEffect(() => {
    setReport(findReportById(id));
    setConfirmed(hasConfirmed(id));
    setLoaded(true);
  }, [id]);

  const nearby = useMemo(() => {
    if (!report) return [];
    return nearbyReports(loadAllReports(), report.lat, report.lng, report.id, 4);
  }, [report]);

  if (!loaded) {
    return <p className="p-8 text-center text-slate2">{t(lang, "common.loading")}</p>;
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 text-center sm:px-6">
        <h1 className="text-2xl font-extrabold text-ink">404</h1>
        <p className="mt-2 text-slate2">
          {lang === "bn" ? "এই রিপোর্টটি পাওয়া যায়নি।" : "This report was not found."}
        </p>
        <Link
          href="/explore"
          className="mt-6 inline-block rounded-full bg-forest-900 px-5 py-3 text-sm font-bold text-white"
        >
          ← {t(lang, "common.back")}
        </Link>
      </div>
    );
  }

  const timelineIdx =
    report.status === "resolved"
      ? 3
      : report.status === "verified" || report.status === "in_progress"
        ? 2
        : 1;

  const onConfirm = () => {
    if (confirmed) return;
    markConfirmed(id);
    setConfirmed(true);
    setExtraConfirms((n) => n + 1);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link
        href="/explore"
        className="text-sm font-bold text-forest-800 hover:underline"
      >
        ← {t(lang, "common.back")}
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-navy-900/5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={report.category} />
            <StatusBadge status={report.status} />
            {report.isDemo ? <DemoBadge /> : null}
          </div>
          <h1 className="mt-4 text-2xl font-extrabold leading-snug text-ink sm:text-3xl">
            {report.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate2">
            <span>📍 {report.area}</span>
            <span>
              {t(lang, "detail.reportedOn")}: {formatDate(report.createdAt, lang)}
            </span>
            <span>
              {t(lang, "detail.reportedBy")}: {report.reporterName ?? "—"}
            </span>
          </div>
          <p className="mt-5 text-[15px] leading-relaxed text-ink/90">
            {report.description}
          </p>

          {report.photoUrl ? (
            <div className="mt-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={report.photoUrl}
                alt={report.title}
                className="max-h-96 w-full rounded-2xl object-cover ring-1 ring-navy-900/10"
              />
            </div>
          ) : (
            <p className="mt-5 rounded-2xl bg-cream px-4 py-3 text-sm text-slate2">
              {t(lang, "detail.noPhoto")}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-forest-50 p-4 ring-1 ring-forest-900/10">
            <span className="text-2xl font-extrabold text-forest-900">
              {formatNumber(report.confirmCount + extraConfirms, lang)}
            </span>
            <span className="text-sm font-semibold text-forest-900">
              {t(lang, "common.confirmed")}
            </span>
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirmed}
              className={`ml-auto rounded-full px-5 py-2.5 text-sm font-bold transition ${
                confirmed
                  ? "cursor-default bg-emerald-100 text-emerald-800"
                  : "bg-forest-900 text-white hover:bg-forest-800"
              }`}
            >
              {confirmed
                ? `✓ ${t(lang, "detail.confirm")}`
                : t(lang, "detail.confirm")}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate2">{t(lang, "detail.confirmNote")}</p>

          <h2 className="mt-8 text-lg font-bold text-ink">
            {t(lang, "detail.timeline")}
          </h2>
          <ol className="mt-4 space-y-0">
            {TIMELINE.map((step, i) => {
              const done = i < timelineIdx;
              const current = i === timelineIdx - 1;
              return (
                <li key={step.status} className="relative flex gap-3 pb-5 last:pb-0">
                  <span className="flex flex-col items-center">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white ${
                        done ? "bg-forest-700" : "bg-navy-900/20"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    {i < TIMELINE.length - 1 ? (
                      <span
                        className={`mt-1 w-0.5 flex-1 ${done ? "bg-forest-700" : "bg-navy-900/15"}`}
                        aria-hidden="true"
                      />
                    ) : null}
                  </span>
                  <span className="pt-0.5">
                    <span
                      className={`block text-sm font-bold ${done ? "text-ink" : "text-slate2"}`}
                    >
                      {lang === "bn" ? step.bn : step.en}
                    </span>
                    {current ? (
                      <span className="mt-0.5 block text-xs font-semibold text-forest-800">
                        {lang === "bn" ? "বর্তমান অবস্থা" : "Current status"}
                      </span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ol>
        </article>

        <aside className="space-y-6">
          <div>
            <MapView
              reports={[report]}
              selectedId={report.id}
              center={[report.lat, report.lng]}
              zoom={14}
              height="280px"
              scrollWheelZoom={false}
            />
            <p className="mt-2 text-xs text-slate2">
              📍 {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">{t(lang, "detail.nearby")}</h2>
            <div className="mt-3 space-y-3">
              {nearby.map(({ report: n, distanceKm }) => (
                <div key={String(n.id)}>
                  <ReportCard report={n} />
                  <p className="-mt-2 px-1 text-xs font-semibold text-slate2">
                    ≈ {distanceKm.toFixed(1)} km
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
