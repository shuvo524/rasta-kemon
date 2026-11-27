"use client";

import Link from "next/link";
import { useLang, t } from "@/lib/i18n";

export default function Footer() {
  const { lang } = useLang();
  return (
    <footer id="about" className="bg-navy-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="text-xl font-extrabold">রাস্তা কেমন</p>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
              Rasta Kemon
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
              {t(lang, "footer.tagline")}
            </p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-white/50">
              {t(lang, "footer.explore")}
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/explore" className="text-white/80 hover:text-white">
                  {t(lang, "nav.explore")}
                </Link>
              </li>
              <li>
                <Link href="/reports" className="text-white/80 hover:text-white">
                  {t(lang, "nav.reports")}
                </Link>
              </li>
              <li>
                <Link href="/report/new" className="text-white/80 hover:text-white">
                  {t(lang, "nav.reportCta")}
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-white/80 hover:text-white">
                  {t(lang, "nav.how")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-white/50">
              {t(lang, "footer.contact")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              RASTA KEMON — Bangladesh
              <br />
              {t(lang, "footer.demoNote")}
            </p>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 RASTA KEMON — {t(lang, "footer.rights")}</span>
          <span>{t(lang, "footer.demoNote")}</span>
        </div>
      </div>
    </footer>
  );
}
