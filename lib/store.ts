/**
 * Formatting helpers shared by client components.
 * (Phase B: reports and confirmations live in MongoDB via the API —
 * the old localStorage persistence was removed. The language choice
 * is still kept in localStorage by LanguageProvider.)
 */

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
