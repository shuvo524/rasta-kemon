import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Report } from "@/models/Report";
import { requireAdmin, authErrorStatus } from "@/lib/server-auth";

/** GET /api/admin/stats — admin only, platform numbers from the DB. */
export async function GET() {
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
  const [total, resolved, rejected, pending, demo, flagged, agg] =
    await Promise.all([
      Report.countDocuments({}),
      Report.countDocuments({ status: "resolved" }),
      Report.countDocuments({ status: "rejected" }),
      Report.countDocuments({ status: "pending" }),
      Report.countDocuments({ isDemo: true }),
      Report.countDocuments({ flagCount: { $gt: 0 } }),
      Report.aggregate([
        { $group: { _id: null, confirmations: { $sum: "$confirmCount" } } },
      ]),
    ]);
  return NextResponse.json({
    total,
    active: total - resolved - rejected,
    resolved,
    rejected,
    pending,
    demo,
    flagged,
    confirmations: agg[0]?.confirmations ?? 0,
  });
}
