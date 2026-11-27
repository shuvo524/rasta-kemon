import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { Report } from "@/models/Report";
import { Confirmation } from "@/models/Confirmation";
import { serializeReport } from "@/lib/serialize";
import { confirmSchema, zodErrorMessage } from "@/lib/validation";
import { getSessionUser } from "@/lib/server-auth";

/**
 * POST /api/reports/[id]/confirm — auth required.
 * Body: { kind: "confirm" | "resolved" | "flag" }.
 * One action of each kind per user (unique index). Community actions
 * NEVER change the official status — only an admin can do that.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = confirmSchema.safeParse(body);
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
  const doc = await Report.findById(id);
  if (!doc) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const kind = parsed.data.kind;
  const existing = await Confirmation.findOne({
    reportId: doc._id,
    userId: user.id,
    kind,
  });
  if (existing) {
    return NextResponse.json(
      { error: "already_recorded", kind },
      { status: 409 }
    );
  }
  try {
    await Confirmation.create({ reportId: doc._id, userId: user.id, kind });
  } catch (err) {
    // Race with another request — the unique index wins.
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: "already_recorded", kind },
        { status: 409 }
      );
    }
    throw err;
  }
  const inc =
    kind === "confirm"
      ? { confirmCount: 1 }
      : kind === "resolved"
        ? { resolvedVotes: 1 }
        : { flagCount: 1 };
  const updated = await Report.findByIdAndUpdate(
    doc._id,
    { $inc: inc },
    { new: true }
  );
  return NextResponse.json({
    report: updated ? serializeReport(updated) : serializeReport(doc),
    kind,
  });
}
