"use client";

import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import type { Report } from "@/data/demo-reports";
import { CategoryBadge, StatusBadge, DemoBadge } from "./Badges";
import { formatDate, formatNumber } from "@/lib/store";

export default function ReportCard({ report }: { report: Report }) {
  const { lang } = useLang();
  return (
    <Link
      href={`/reports/${report.id}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-navy-900/5 transition hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-forest-700"
    >
      <div className="flex items-start justify-between gap-2 px-4 pt-4">
        <CategoryBadge category={report.category} />
        <div className="flex items-center gap-1.5">
          {report.isDemo ? <DemoBadge /> : null}
          <StatusBadge status={report.status} />
        </div>
      </div>
      <div className="px-4 pb-4 pt-3">
        <h3 className="text-[17px] font-bold leading-snug text-ink group-hover:text-forest-800">
          {report.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate2">
          {report.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate2">
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true">📍</span> {report.area}
          </span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true">🕒</span> {formatDate(report.createdAt, lang)}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-forest-800">
            <span aria-hidden="true">✓</span>{" "}
            {formatNumber(report.confirmCount, lang)}{" "}
            {t(lang, "common.confirmed")}
          </span>
        </div>
      </div>
    </Link>
  );
}
