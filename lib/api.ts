"use client";

import type { Report } from "@/data/demo-reports";

export interface Stats {
  total: number;
  active: number;
  resolved: number;
  pending: number;
  confirmations: number;
  districts: number;
}

export interface ReportDetail {
  report: Report;
  timeline: {
    status: string;
    note: string;
    actorName: string;
    createdAt: string;
  }[];
  nearby: { report: Report; distanceKm: number }[];
  myActions: string[];
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const err = new Error(`GET ${url} failed: ${res.status}`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }
  return (await res.json()) as T;
}

export async function fetchReports(params?: {
  category?: string;
  status?: string;
  q?: string;
  sort?: string;
  lat?: number;
  lng?: number;
  limit?: number;
}): Promise<{ reports: Report[]; total: number }> {
  const sp = new URLSearchParams();
  if (params?.category) sp.set("category", params.category);
  if (params?.status) sp.set("status", params.status);
  if (params?.q) sp.set("q", params.q);
  if (params?.sort) sp.set("sort", params.sort);
  if (params?.lat !== undefined) sp.set("lat", String(params.lat));
  if (params?.lng !== undefined) sp.set("lng", String(params.lng));
  if (params?.limit) sp.set("limit", String(params.limit));
  const qs = sp.toString();
  return getJson(`/api/reports${qs ? `?${qs}` : ""}`);
}

export async function fetchStats(): Promise<Stats> {
  return getJson("/api/stats");
}

export async function fetchReportDetail(id: string): Promise<ReportDetail> {
  return getJson(`/api/reports/${encodeURIComponent(id)}`);
}

export interface SubmitReportInput {
  title: string;
  category: string;
  description: string;
  area: string;
  district: string;
  lat: number;
  lng: number;
  severity?: number;
  photoUrl?: string | null;
  force?: boolean;
}

export async function submitReport(
  input: SubmitReportInput
): Promise<{ report: Report; duplicateOf?: string }> {
  const res = await fetch("/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || data.error || "submit failed") as Error & {
      status?: number;
      duplicateOf?: string;
    };
    err.status = res.status;
    err.duplicateOf = data.duplicateOf;
    throw err;
  }
  return data;
}

export async function confirmReport(
  id: string,
  kind: "confirm" | "resolved" | "flag"
): Promise<{ report: Report; kind: string }> {
  const res = await fetch(`/api/reports/${encodeURIComponent(id)}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || data.error || "action failed") as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }
  return data;
}

/** Upload a photo file to Cloudinary via the API. Returns the public URL. */
export async function uploadPhoto(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || data.error || "upload failed") as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }
  return data.url as string;
}

export async function fetchMyReports(): Promise<{ reports: Report[] }> {
  return getJson("/api/my/reports");
}

export interface ActivityItem {
  kind: string;
  createdAt: string;
  reportId: string;
  reportTitle?: string;
  reportArea?: string;
}

export async function fetchMyActivity(): Promise<{ activity: ActivityItem[] }> {
  return getJson("/api/my/activity");
}

export async function updateProfile(name: string): Promise<void> {
  const res = await fetch("/api/my/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("profile update failed");
}
