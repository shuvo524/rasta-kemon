import type { Report as ClientReport } from "@/data/demo-reports";
import type { ReportDoc } from "@/models/Report";

/**
 * Convert a Mongoose Report doc to the shape the client already uses.
 * Never includes reporterId, emails or anything private.
 */
export function serializeReport(doc: ReportDoc): ClientReport {
  const raw = doc.toObject({ virtuals: false }) as unknown as Record<
    string,
    unknown
  >;
  return {
    id: String(raw._id),
    title: raw.title as string,
    category: raw.category as ClientReport["category"],
    description: (raw.description as string) || "",
    area: raw.area as string,
    district: (raw.district as string) || "",
    lat: raw.lat as number,
    lng: raw.lng as number,
    status: raw.status as ClientReport["status"],
    confirmCount: (raw.confirmCount as number) ?? 0,
    severity: (raw.severity as 1 | 2 | 3) ?? 2,
    createdAt: new Date(raw.createdAt as string | Date).toISOString(),
    isDemo: Boolean(raw.isDemo),
    photoUrl: (raw.photoUrl as string | null) ?? null,
    reporterName: (raw.reporterName as string) || "",
    resolvedVotes: (raw.resolvedVotes as number) ?? 0,
    flagCount: (raw.flagCount as number) ?? 0,
  };
}
