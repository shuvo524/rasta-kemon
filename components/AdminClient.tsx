"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import type { Report } from "@/data/demo-reports";
import { formatDate, formatNumber } from "@/lib/store";
import { CategoryBadge, StatusBadge, DemoBadge } from "@/components/Badges";
import type { SessionUser } from "@/lib/server-auth";
import { STATUS_KEYS } from "@/data/demo-reports";

type AdminStats = {
  total: number;
  active: number;
  resolved: number;
  rejected: number;
  pending: number;
  demo: number;
  flagged: number;
  confirmations: number;
};

export default function AdminClient({
  user,
  pending,
  flagged,
  stats,
  dbDown,
}: {
  user: SessionUser;
  pending: Report[];
  flagged: Report[];
  stats: AdminStats;
  dbDown: boolean;
}) {
  const { lang } = useLang();
  const [queue, setQueue] = useState<Report[]>(pending);
  const [flagList, setFlagList] = useState<Report[]>(flagged);
  const [tab, setTab] = useState<"pending" | "flagged">("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [clearing, setClearing] = useState(false);
  const [demoLeft, setDemoLeft] = useState(stats.demo);

  const setStatus = async (id: string | number, status: string) => {
    setBusyId(String(id));
    setMessage("");
    try {
      const res = await fetch(`/api/admin/reports/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      const updated = data.report as Report;
      setQueue((q) => q.filter((r) => String(r.id) !== String(id)));
      setFlagList((q) =>
        q.map((r) => (String(r.id) === String(id) ? updated : r))
      );
      setMessage(
        lang === "bn" ? "স্ট্যাটাস বদলানো হয়েছে।" : "Status updated."
      );
    } catch {
      setMessage(lang === "bn" ? "আবার চেষ্টা করুন।" : "Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const clearDemo = async () => {
    if (
      !window.confirm(
        lang === "bn"
          ? "সব Demo রিপোর্ট মুছে যাবে — আসল রিপোর্ট থাকবে। নিশ্চিত?"
          : "All Demo reports will be deleted — real reports stay. Sure?"
      )
    ) {
      return;
    }
    setClearing(true);
    try {
      const res = await fetch("/api/admin/clear-demo", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      setDemoLeft(0);
      setQueue((q) => q.filter((r) => !r.isDemo));
      setFlagList((q) => q.filter((r) => !r.isDemo));
      setMessage(t(lang, "admin.cleared"));
    } catch {
      setMessage(lang === "bn" ? "আবার চেষ্টা করুন।" : "Please try again.");
    } finally {
      setClearing(false);
    }
  };

  const list = tab === "pending" ? queue : flagList;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {t(lang, "admin.title")}
      </h1>
      <p className="mt-1.5 text-slate2">
        {user.name} · {user.email} — {t(lang, "admin.subtitle")}
      </p>
      {dbDown ? (
        <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">
          {t(lang, "auth.dbMissing")}
        </p>
      ) : null}
      {message ? (
        <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
          {message}
        </p>
      ) : null}

      {/* Platform stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: t(lang, "stats.total"), value: stats.total },
          { label: t(lang, "admin.reviewQueue"), value: stats.pending },
          { label: t(lang, "admin.flagCount"), value: stats.flagged },
          { label: t(lang, "admin.demoCount"), value: demoLeft },
          { label: t(lang, "stats.active"), value: stats.active },
          { label: t(lang, "stats.confirmations"), value: stats.confirmations },
          { label: t(lang, "dash.resolved"), value: stats.resolved },
          { label: t(lang, "status.rejected"), value: stats.rejected },
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

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("pending")}
            className={`rounded-full px-4 py-2 text-sm font-bold ring-1 transition ${
              tab === "pending"
                ? "bg-forest-900 text-white ring-forest-900"
                : "bg-white text-slate2 ring-navy-900/10 hover:text-ink"
            }`}
          >
            {t(lang, "admin.reviewQueue")} ({queue.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("flagged")}
            className={`rounded-full px-4 py-2 text-sm font-bold ring-1 transition ${
              tab === "flagged"
                ? "bg-forest-900 text-white ring-forest-900"
                : "bg-white text-slate2 ring-navy-900/10 hover:text-ink"
            }`}
          >
            {t(lang, "admin.flagged")} ({flagList.length})
          </button>
        </div>
        <button
          type="button"
          onClick={clearDemo}
          disabled={clearing || demoLeft === 0}
          className="ml-auto rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {t(lang, "admin.clearDemo")} ({demoLeft})
        </button>
      </div>
      <p className="mt-2 text-xs text-slate2">{t(lang, "admin.clearDemoConfirm")}</p>

      <div className="mt-4">
        <label
          htmlFor="rk-admin-note"
          className="mb-1.5 block text-sm font-bold text-ink"
        >
          {t(lang, "admin.note")}
        </label>
        <input
          id="rk-admin-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={lang === "bn" ? "যেমন: ছবি দেখে যাচাই করা হয়েছে" : "e.g. Verified from the photo"}
          className="w-full max-w-xl rounded-xl border border-navy-900/15 px-4 py-3 text-[15px] outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
        />
      </div>

      {list.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-white px-4 py-10 text-center text-sm text-slate2 shadow-card ring-1 ring-navy-900/5">
          {t(lang, "admin.noQueue")}
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {list.map((r) => (
            <article
              key={String(r.id)}
              className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy-900/5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={r.category} />
                <StatusBadge status={r.status} />
                {r.isDemo ? <DemoBadge /> : null}
                {(r.flagCount ?? 0) > 0 ? (
                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800">
                    ⚑ {formatNumber(r.flagCount ?? 0, lang)}
                  </span>
                ) : null}
              </div>
              <Link href={`/reports/${r.id}`}>
                <h2 className="mt-3 text-lg font-bold text-ink hover:text-forest-800">
                  {r.title}
                </h2>
              </Link>
              <p className="mt-1 line-clamp-2 text-sm text-slate2">{r.description}</p>
              <p className="mt-2 text-[13px] text-slate2">
                📍 {r.area} · {formatDate(r.createdAt, lang)} · {r.reporterName} · ✓{" "}
                {formatNumber(r.confirmCount, lang)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStatus(r.id, "verified")}
                  disabled={busyId === String(r.id)}
                  className="rounded-full bg-forest-900 px-4 py-2 text-[13px] font-bold text-white transition hover:bg-forest-800 disabled:opacity-60"
                >
                  {t(lang, "admin.approve")}
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(r.id, "rejected")}
                  disabled={busyId === String(r.id)}
                  className="rounded-full bg-red-600 px-4 py-2 text-[13px] font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  {t(lang, "admin.reject")}
                </button>
                <select
                  aria-label={t(lang, "admin.setStatus")}
                  value=""
                  onChange={(e) => {
                    if (e.target.value) setStatus(r.id, e.target.value);
                  }}
                  disabled={busyId === String(r.id)}
                  className="rounded-full border border-navy-900/15 bg-white px-3 py-2 text-[13px] font-bold outline-none focus:border-forest-700"
                >
                  <option value="">{t(lang, "admin.setStatus")}</option>
                  {STATUS_KEYS.map((s) => (
                    <option key={s} value={s}>
                      {t(lang, `status.${s}`)}
                    </option>
                  ))}
                </select>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
