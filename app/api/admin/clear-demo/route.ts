import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Report } from "@/models/Report";
import { Confirmation } from "@/models/Confirmation";
import { StatusEvent } from "@/models/StatusEvent";
import { requireAdmin, authErrorStatus } from "@/lib/server-auth";

/** POST /api/admin/clear-demo — admin only. Deletes ONLY isDemo reports. */
export async function POST() {
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
  const demos = await Report.find({ isDemo: true }).select("_id").lean();
  const ids = demos.map((d) => d._id);
  const [deleted] = await Promise.all([
    Report.deleteMany({ isDemo: true }),
    Confirmation.deleteMany({ reportId: { $in: ids } }),
    StatusEvent.deleteMany({ reportId: { $in: ids } }),
  ]);
  return NextResponse.json({ ok: true, deleted: deleted.deletedCount ?? 0 });
}
