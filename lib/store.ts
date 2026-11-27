"use client";

import { demoReports, type Report } from "@/data/demo-reports";

const USER_REPORTS_KEY = "rasta-kemon-user-reports";
const CONFIRMS_KEY = "rasta-kemon-confirms";

/** Read the user's own Phase-A reports from browser localStorage. */
export function loadUserReports(): Report[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USER_REPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Report[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUserReport(report: Report): void {
  if (typeof window === "undefined") return;
  const existing = loadUserReports();
  window.localStorage.setItem(
    USER_REPORTS_KEY,
    JSON.stringify([report, ...existing])
  );
}

/** All reports visible in the app: demo data + the user's own reports. */
export function loadAllReports(): Report[] {
  return [...loadUserReports(), ...demoReports];
}

export function findReportById(id: string): Report | undefined {
  return loadAllReports().find((r) => String(r.id) === id);
}

/** Local "আমিও দেখেছি" confirmations (Phase A: browser only). */
export function hasConfirmed(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(CONFIRMS_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    return list.includes(id);
  } catch {
    return false;
  }
}

export function markConfirmed(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(CONFIRMS_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(id)) {
      list.push(id);
      window.localStorage.setItem(CONFIRMS_KEY, JSON.stringify(list));
    }
  } catch {
    /* ignore storage errors */
  }
}

/** Format an ISO date in Bangla or English. */
export function formatDate(iso: string, lang: "bn" | "en"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat(lang === "bn" ? "bn-BD" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

/** Localise a number (Bangla digits in BN mode). */
export function formatNumber(n: number, lang: "bn" | "en"): string {
  try {
    return new Intl.NumberFormat(lang === "bn" ? "bn-BD" : "en-GB").format(n);
  } catch {
    return String(n);
  }
}
