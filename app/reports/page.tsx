"use client";

import { useEffect, useState } from "react";
import { useLang, t } from "@/lib/i18n";
import { demoReports, type Report } from "@/data/demo-reports";
import { loadAllReports } from "@/lib/store";
import ReportCard from "@/components/ReportCard";

export default function ReportsPage() {
  const { lang } = useLang();
  const [reports, setReports] = useState<Report[]>(demoReports);

  useEffect(() => {
    setReports(loadAllReports());
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
