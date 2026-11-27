"use client";

import { useLang, categoryLabel, statusLabel, t } from "@/lib/i18n";
import { CATEGORY_COLORS, type Category, type Status } from "@/data/demo-reports";

export function CategoryBadge({ category }: { category: Category }) {
  const { lang } = useLang();
  const color = CATEGORY_COLORS[category];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-white/90"
        aria-hidden="true"
      />
      {categoryLabel(lang, category)}
    </span>
  );
}

const STATUS_STYLES: Record<Status, string> = {
  pending: "bg-amber-100 text-amber-800 ring-amber-200",
  verified: "bg-sky-100 text-sky-800 ring-sky-200",
  in_progress: "bg-violet-100 text-violet-800 ring-violet-200",
  resolved: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  rejected: "bg-red-100 text-red-800 ring-red-200",
};

export function StatusBadge({ status }: { status: Status }) {
  const { lang } = useLang();
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_STYLES[status]}`}
    >
      {statusLabel(lang, status)}
    </span>
  );
}

export function DemoBadge() {
  const { lang } = useLang();
  return (
    <span className="inline-flex items-center rounded-full bg-navy-900 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
      {t(lang, "common.demo")}
    </span>
  );
}
