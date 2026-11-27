import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { profileSchema, zodErrorMessage } from "@/lib/validation";
import { getSessionUser } from "@/lib/server-auth";

/** PATCH /api/my/profile — change display name. Role can never change here. */
export async function PATCH(req: Request) {
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
  const parsed = profileSchema.safeParse(body);
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
  const db = mongoose.connection.db;
  if (!db) {
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
  await db
    .collection("user")
    .updateOne(
      { _id: new mongoose.Types.ObjectId(user.id) },
      { $set: { name: parsed.data.name, updatedAt: new Date() } }
    );
  return NextResponse.json({ ok: true, name: parsed.data.name });
}
