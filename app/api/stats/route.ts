import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Report } from "@/models/Report";

/** GET /api/stats — computed from the DB, never invented. */
export async function GET() {
  try {
    await dbConnect();
  } catch (err) {
    return NextResponse.json(
      { error: "database_unavailable", message: (err as Error).message },
      { status: 503 }
    );
  }
  const [total, resolved, pending, agg, districts] = await Promise.all([
    Report.countDocuments({}),
    Report.countDocuments({ status: "resolved" }),
    Report.countDocuments({ status: "pending" }),
    Report.aggregate([
      { $group: { _id: null, confirmations: { $sum: "$confirmCount" } } },
    ]),
    Report.distinct("district"),
  ]);
  return NextResponse.json({
    total,
    active: total - resolved - (await Report.countDocuments({ status: "rejected" })),
    resolved,
    pending,
    confirmations: agg[0]?.confirmations ?? 0,
    districts: districts.filter(Boolean).length,
  });
}
