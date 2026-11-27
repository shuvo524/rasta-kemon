"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLang, t, type Lang } from "@/lib/i18n";
import { useSession, signOut } from "@/lib/auth-client";

function BrandMark() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-900 text-white shadow-card"
        aria-hidden="true"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21s-6.5-5.4-6.5-10.2A6.5 6.5 0 0 1 12 4.5a6.5 6.5 0 0 1 6.5 6.3C18.5 15.6 12 21 12 21Z"
            fill="#fff"
            opacity="0.95"
          />
          <path
            d="M12 8.2v6.4M12 8.2 10 6.4M12 8.2l2-1.8"
            stroke="#14532d"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="17.4" r="1.1" fill="#14532d" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block text-[17px] font-extrabold tracking-tight text-ink">
          রাস্তা কেমন
        </span>
        <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-forest-800">
          Rasta Kemon
        </span>
      </span>
    </Link>
  );
}

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const btn = (l: Lang, label: string) => (
    <button
      key={l}
      type="button"
      onClick={() => setLang(l)}
      aria-pressed={lang === l}
      className={`rounded-full px-3 py-1.5 text-[13px] font-bold transition ${
        lang === l
          ? "bg-forest-900 text-white shadow-sm"
          : "text-slate2 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
  return (
    <div
      className="flex items-center rounded-full bg-cream p-1 ring-1 ring-navy-900/10"
      role="group"
      aria-label="Language / ভাষা"
    >
      {btn("bn", "বাংলা")}
      {btn("en", "EN")}
    </div>
  );
}

export default function Navbar() {
  const { lang } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const signedIn = Boolean(session?.user);

  const links = [
    { href: "/", key: "nav.home" },
    { href: "/explore", key: "nav.explore" },
    { href: "/reports", key: "nav.reports" },
    { href: "/#how-it-works", key: "nav.how" },
    { href: "/#about", key: "nav.about" },
  ];

  const onLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]);

  return (
    <header className="sticky top-0 z-40 border-b border-navy-900/8 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <BrandMark />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                isActive(l.href)
                  ? "bg-forest-50 text-forest-900"
                  : "text-slate2 hover:bg-cream hover:text-ink"
              }`}
            >
              {t(lang, l.key)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          {signedIn ? (
            <>
              <Link
                href="/dashboard"
                className="hidden rounded-full bg-cream px-3.5 py-2.5 text-sm font-bold text-forest-900 ring-1 ring-forest-900/15 transition hover:bg-forest-50 md:inline-flex"
              >
                {t(lang, "nav.dashboard")}
              </Link>
              {role === "admin" ? (
                <Link
                  href="/admin"
                  className="hidden rounded-full bg-navy-900 px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-navy-800 md:inline-flex"
                >
                  {t(lang, "nav.admin")}
                </Link>
              ) : null}
              <button
                type="button"
                onClick={onLogout}
                className="hidden rounded-full px-3 py-2.5 text-sm font-bold text-slate2 transition hover:text-ink sm:inline-flex"
              >
                {t(lang, "nav.logout")}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-full bg-cream px-4 py-2.5 text-sm font-bold text-forest-900 ring-1 ring-forest-900/15 transition hover:bg-forest-50 sm:inline-flex"
            >
              {t(lang, "nav.login")}
            </Link>
          )}
          <Link
            href="/report/new"
            className="hidden rounded-full bg-forest-900 px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-forest-800 sm:inline-flex"
          >
            {t(lang, "nav.reportCta")}
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink ring-1 ring-navy-900/10 lg:hidden"
            aria-expanded={open}
            aria-label={t(lang, "nav.menu")}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="text-xl leading-none" aria-hidden="true">
              {open ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </div>
      {open ? (
        <nav
          className="border-t border-navy-900/8 bg-white px-4 pb-4 pt-2 lg:hidden"
          aria-label="Mobile"
        >
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-[15px] font-semibold text-ink hover:bg-cream"
              >
                {t(lang, l.key)}
              </Link>
            ))}
            {signedIn ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-[15px] font-semibold text-ink hover:bg-cream"
                >
                  {t(lang, "nav.dashboard")}
                </Link>
                {role === "admin" ? (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-[15px] font-semibold text-ink hover:bg-cream"
                  >
                    {t(lang, "nav.admin")}
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void onLogout();
                  }}
                  className="rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold text-slate2 hover:bg-cream"
                >
                  {t(lang, "nav.logout")}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-[15px] font-semibold text-ink hover:bg-cream"
              >
                {t(lang, "nav.login")}
              </Link>
            )}
            <Link
              href="/report/new"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-forest-900 px-4 py-3 text-center text-sm font-bold text-white"
            >
              {t(lang, "nav.reportCta")}
            </Link>
            <div className="mt-3 flex justify-center">
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
