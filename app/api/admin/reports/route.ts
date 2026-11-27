import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Report } from "@/models/Report";
import { serializeReport } from "@/lib/serialize";
import { requireAdmin, authErrorStatus } from "@/lib/server-auth";

/**
 * GET /api/admin/reports?filter=pending|flagged|duplicates|all
 * Admin only. flagged = flagCount > 0. duplicates = same category within
 * ~150 m of another active report (checked in the admin page via the
 * reports list; this endpoint returns the flagged + pending sets).
 */
export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    return NextResponse.json(
      { error: "forbidden" },
      { status: authErrorStatus(err) }
    );
  }
  try {
    await dbConnect();
  } catch (err) {
    return NextResponse.json(
      { error: "database_unavailable", message: (err as Error).message },
      { status: 503 }
    );
  }
  const filter = new URL(req.url).searchParams.get("filter") || "pending";
  const docs =
    filter === "flagged"
      ? await Report.find({ flagCount: { $gt: 0 } })
          .sort({ createdAt: -1 })
          .limit(100)
      : filter === "all"
        ? await Report.find({}).sort({ createdAt: -1 }).limit(100)
        : await Report.find({ status: "pending" })
            .sort({ createdAt: -1 })
            .limit(100);
  return NextResponse.json({ reports: docs.map(serializeReport), filter });
}
