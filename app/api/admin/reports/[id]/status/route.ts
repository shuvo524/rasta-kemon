import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { Report } from "@/models/Report";
import { StatusEvent } from "@/models/StatusEvent";
import { serializeReport } from "@/lib/serialize";
import { statusChangeSchema, zodErrorMessage } from "@/lib/validation";
import { requireAdmin, authErrorStatus } from "@/lib/server-auth";

/** POST /api/admin/reports/[id]/status — admin only, appends a timeline event. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let admin;
  try {
    admin = await requireAdmin();
  } catch (err) {
    return NextResponse.json(
      { error: "forbidden" },
      { status: authErrorStatus(err) }
    );
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = statusChangeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", message: zodErrorMessage(parsed.error) },
      { status: 400 }
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
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const doc = await Report.findByIdAndUpdate(
    id,
    { status: parsed.data.status },
    { new: true }
  );
  if (!doc) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  await StatusEvent.create({
    reportId: doc._id,
    status: parsed.data.status,
    note: parsed.data.note || "",
    actorName: admin.name || admin.email,
  });
  return NextResponse.json({ report: serializeReport(doc) });
}
