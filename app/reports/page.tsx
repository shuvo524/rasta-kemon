"use client";

import { useEffect, useState } from "react";
import { useLang, t } from "@/lib/i18n";
import { demoReports, type Report } from "@/data/demo-reports";
import { fetchReports } from "@/lib/api";
import ReportCard from "@/components/ReportCard";

export default function ReportsPage() {
  const { lang } = useLang();
  const [reports, setReports] = useState<Report[]>(demoReports);

  useEffect(() => {
    let cancelled = false;
    fetchReports({ limit: 100 })
      .then((d) => {
        if (!cancelled) setReports(d.reports.length > 0 ? d.reports : demoReports);
      })
      .catch(() => {
        if (!cancelled) setReports(demoReports);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {t(lang, "reports.title")}
      </h1>
      <p className="mt-1.5 text-slate2">{t(lang, "reports.subtitle")}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <ReportCard key={String(r.id)} report={r} />
        ))}
      </div>
    </div>
  );
}
