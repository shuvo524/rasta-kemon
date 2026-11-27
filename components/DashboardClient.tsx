"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import type { Report } from "@/data/demo-reports";
import { formatDate, formatNumber } from "@/lib/store";
import { updateProfile } from "@/lib/api";
import ReportCard from "@/components/ReportCard";
import type { SessionUser } from "@/lib/server-auth";

const KIND_LABEL: Record<string, { bn: string; en: string }> = {
  confirm: { bn: "নিশ্চিত করেছেন", en: "confirmed" },
  resolved: { bn: "মিটে গেছে বলেছেন", en: "marked resolved" },
  flag: { bn: "ভুল তথ্য ফ্ল্যাগ করেছেন", en: "flagged as wrong" },
};

export default function DashboardClient({
  user,
  reports,
  activity,
  counts,
  dbDown,
}: {
  user: SessionUser;
  reports: Report[];
  activity: { kind: string; createdAt: string; reportTitle?: string }[];
  counts: { total: number; pending: number; confirmed: number; resolved: number };
  dbDown: boolean;
}) {
  const { lang } = useLang();
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"all" | "pending" | "resolved">("all");

  const shown =
    tab === "pending"
      ? reports.filter((r) => r.status === "pending")
      : tab === "resolved"
        ? reports.filter((r) => r.status === "resolved")
        : reports;

  const saveName = async () => {
    setSaving(true);
    try {
      await updateProfile(name.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      /* error shown by the API message; keep it simple */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {t(lang, "dash.title")}
      </h1>
      <p className="mt-1.5 text-slate2">
        {user.name} · {user.email} — {t(lang, "dash.subtitle")}
      </p>
      {dbDown ? (
        <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">
          {t(lang, "auth.dbMissing")}
        </p>
      ) : null}

      {/* Overview counts */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: t(lang, "dash.total"), value: counts.total },
          { label: t(lang, "dash.pending"), value: counts.pending },
          { label: t(lang, "dash.confirmed"), value: counts.confirmed },
          { label: t(lang, "dash.resolved"), value: counts.resolved },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-white px-4 py-4 shadow-card ring-1 ring-navy-900/5"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate2">
              {s.label}
            </p>
            <p className="mt-1 text-3xl font-extrabold text-forest-900">
              {formatNumber(s.value, lang)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-ink">{t(lang, "dash.myReports")}</h2>
            <div className="flex gap-2">
              {(
                [
                  ["all", lang === "bn" ? "সব" : "All"],
                  ["pending", t(lang, "dash.pending")],
                  ["resolved", t(lang, "dash.resolved")],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTab(k)}
                  className={`rounded-full px-3 py-1.5 text-[13px] font-bold ring-1 transition ${
                    tab === k
                      ? "bg-forest-900 text-white ring-forest-900"
                      : "bg-white text-slate2 ring-navy-900/10 hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {shown.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-white px-4 py-8 text-center text-sm text-slate2 shadow-card ring-1 ring-navy-900/5">
              {t(lang, "dash.noReports")}
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {shown.map((r) => (
                <ReportCard key={String(r.id)} report={r} />
              ))}
            </div>
          )}
          <Link
            href="/report/new"
            className="mt-5 inline-block rounded-full bg-forest-900 px-5 py-3 text-sm font-bold text-white"
          >
            {t(lang, "nav.reportCta")} →
          </Link>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy-900/5">
            <h2 className="text-lg font-bold text-ink">{t(lang, "dash.profile")}</h2>
            <label
              htmlFor="rk-profile-name"
              className="mt-3 block text-sm font-bold text-ink"
            >
              {t(lang, "auth.name")}
            </label>
            <input
              id="rk-profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-navy-900/15 px-4 py-3 text-[15px] outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
            />
            <p className="mt-2 text-xs text-slate2">{user.email}</p>
            <button
              type="button"
              onClick={saveName}
              disabled={saving || name.trim().length < 1}
              className="mt-4 w-full rounded-full bg-forest-900 py-3 text-sm font-bold text-white transition hover:bg-forest-800 disabled:opacity-60"
            >
              {t(lang, "dash.saveName")}
            </button>
            {saved ? (
              <p className="mt-2 text-center text-xs font-bold text-emerald-700">
                ✓ {t(lang, "dash.saved")}
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy-900/5">
            <h2 className="text-lg font-bold text-ink">{t(lang, "dash.activity")}</h2>
            {activity.length === 0 ? (
              <p className="mt-3 text-sm text-slate2">{t(lang, "dash.noActivity")}</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {activity.map((a, i) => (
                  <li key={i} className="border-b border-navy-900/5 pb-3 text-sm last:border-0 last:pb-0">
                    <p className="font-semibold text-ink">
                      {KIND_LABEL[a.kind]?.[lang] ?? a.kind}
                      {a.reportTitle ? ` — ${a.reportTitle}` : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-slate2">
                      {formatDate(a.createdAt, lang)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
