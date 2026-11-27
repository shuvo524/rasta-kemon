"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLang, t } from "@/lib/i18n";
import { signIn, signUp } from "@/lib/auth-client";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { lang } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [googleEnabled, setGoogleEnabled] = useState(false);
  useEffect(() => {
    fetch("/api/auth/config")
      .then((r) => r.json())
      .then((d) => setGoogleEnabled(Boolean(d.google)))
      .catch(() => setGoogleEnabled(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "register" && name.trim().length < 1) {
      setError(lang === "bn" ? "নাম লিখতে হবে।" : "Please enter your name.");
      return;
    }
    if (password.length < 8) {
      setError(
        lang === "bn"
          ? "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।"
          : "Password must be at least 8 characters."
      );
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") {
        const res = await signIn.email({ email: email.trim(), password });
        if (res.error) throw new Error(res.error.message || "login failed");
      } else {
        const res = await signUp.email({
          name: name.trim(),
          email: email.trim(),
          password,
        });
        if (res.error) throw new Error(res.error.message || "signup failed");
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      const msg = (err as Error).message || "";
      setError(
        /database|503|fetch failed|Failed to fetch/i.test(msg)
          ? t(lang, "auth.dbMissing")
          : msg
      );
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    setError("");
    try {
      await signIn.social({
        provider: "google",
        callbackURL: next,
      });
    } catch (err) {
      setError((err as Error).message || "");
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy-900/5 sm:p-8">
        <h1 className="text-2xl font-extrabold text-ink">
          {mode === "login" ? t(lang, "auth.loginTitle") : t(lang, "auth.registerTitle")}
        </h1>
        <p className="mt-1.5 text-sm text-slate2">
          {mode === "login" ? t(lang, "auth.loginSubtitle") : t(lang, "auth.registerSubtitle")}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
              {error}
            </p>
          ) : null}
          {mode === "register" ? (
            <div>
              <label htmlFor="rk-name" className="mb-1.5 block text-sm font-bold text-ink">
                {t(lang, "auth.name")}
              </label>
              <input
                id="rk-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t(lang, "auth.namePh")}
                autoComplete="name"
                className="w-full rounded-xl border border-navy-900/15 px-4 py-3 text-[15px] outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
              />
            </div>
          ) : null}
          <div>
            <label htmlFor="rk-email" className="mb-1.5 block text-sm font-bold text-ink">
              {t(lang, "auth.email")}
            </label>
            <input
              id="rk-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t(lang, "auth.emailPh")}
              autoComplete="email"
              required
              className="w-full rounded-xl border border-navy-900/15 px-4 py-3 text-[15px] outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
            />
          </div>
          <div>
            <label htmlFor="rk-password" className="mb-1.5 block text-sm font-bold text-ink">
              {t(lang, "auth.password")}
            </label>
            <input
              id="rk-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t(lang, "auth.passwordPh")}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              className="w-full rounded-xl border border-navy-900/15 px-4 py-3 text-[15px] outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-forest-900 py-3.5 text-sm font-bold text-white shadow-card transition hover:bg-forest-800 disabled:opacity-60"
          >
            {busy
              ? mode === "login"
                ? t(lang, "auth.signingIn")
                : t(lang, "auth.creating")
              : mode === "login"
                ? t(lang, "auth.loginBtn")
                : t(lang, "auth.registerBtn")}
          </button>
        </form>

        {googleEnabled ? (
          <>
            <div className="my-5 flex items-center gap-3 text-xs font-semibold text-slate2">
              <span className="h-px flex-1 bg-navy-900/10" />
              {lang === "bn" ? "অথবা" : "or"}
              <span className="h-px flex-1 bg-navy-900/10" />
            </div>
            <button
              type="button"
              onClick={google}
              disabled={busy}
              className="w-full rounded-full bg-white py-3 text-sm font-bold text-ink ring-1 ring-navy-900/15 transition hover:bg-cream disabled:opacity-60"
            >
              {t(lang, "auth.google")}
            </button>
          </>
        ) : null}

        <p className="mt-6 text-center text-sm text-slate2">
          {mode === "login" ? t(lang, "auth.noAccount") : t(lang, "auth.hasAccount")}{" "}
          <Link
            href={
              mode === "login"
                ? `/register?next=${encodeURIComponent(next)}`
                : `/login?next=${encodeURIComponent(next)}`
            }
            className="font-bold text-forest-800 underline"
          >
            {mode === "login"
              ? lang === "bn"
                ? "অ্যাকাউন্ট খুলুন"
                : "Create an account"
              : t(lang, "auth.loginBtn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
