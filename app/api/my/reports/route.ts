import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Report } from "@/models/Report";
import { serializeReport } from "@/lib/serialize";
import { getSessionUser } from "@/lib/server-auth";

/** GET /api/my/reports — reports submitted by the signed-in user. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    await dbConnect();
  } catch (err) {
    return NextResponse.json(
      { error: "database_unavailable", message: (err as Error).message },
      { status: 503 }
    );
  }
  const docs = await Report.find({ reporterId: user.id }).sort({
    createdAt: -1,
  });
  return NextResponse.json({ reports: docs.map(serializeReport) });
}
