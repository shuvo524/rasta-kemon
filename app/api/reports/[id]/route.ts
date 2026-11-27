import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { Report } from "@/models/Report";
import { Confirmation } from "@/models/Confirmation";
import { StatusEvent } from "@/models/StatusEvent";
import { serializeReport } from "@/lib/serialize";
import { getSessionUser } from "@/lib/server-auth";

/** GET /api/reports/[id] — report + status timeline + nearby + my actions. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
  const [events, nearby, user] = await Promise.all([
    StatusEvent.find({ reportId: doc._id }).sort({ createdAt: 1 }).lean(),
    Report.find({
      _id: { $ne: doc._id },
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [doc.lng, doc.lat] },
        },
      },
    })
      .limit(4)
      .lean(),
    getSessionUser(),
  ]);
  let myActions: string[] = [];
  if (user) {
    const mine = await Confirmation.find({
      reportId: doc._id,
      userId: user.id,
    }).lean();
    myActions = mine.map((c) => c.kind as string);
  }
  const haversineKm = (a: number, b: number, c: number, d: number) => {
    const R = 6371;
    const toRad = (x: number) => (x * Math.PI) / 180;
    const dLat = toRad(c - a);
    const dLng = toRad(d - b);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  return NextResponse.json({
    report: serializeReport(doc),
    timeline: events.map((e) => ({
      status: e.status,
      note: e.note || "",
      actorName: e.actorName || "",
      createdAt: new Date(e.createdAt as unknown as string).toISOString(),
    })),
    nearby: nearby.map((n) => {
      const raw = n as unknown as Record<string, unknown>;
      return {
        report: {
          id: String(raw._id),
          title: raw.title as string,
          category: raw.category as never,
          description: (raw.description as string) || "",
          area: raw.area as string,
          district: (raw.district as string) || "",
          lat: raw.lat as number,
          lng: raw.lng as number,
          status: raw.status as never,
          confirmCount: (raw.confirmCount as number) ?? 0,
          severity: (raw.severity as 1 | 2 | 3) ?? 2,
          createdAt: new Date(raw.createdAt as string | Date).toISOString(),
          isDemo: Boolean(raw.isDemo),
          photoUrl: (raw.photoUrl as string | null) ?? null,
          reporterName: (raw.reporterName as string) || "",
          resolvedVotes: (raw.resolvedVotes as number) ?? 0,
          flagCount: (raw.flagCount as number) ?? 0,
        },
        distanceKm: haversineKm(doc.lat, doc.lng, raw.lat as number, raw.lng as number),
      };
    }),
    myActions,
  });
}
