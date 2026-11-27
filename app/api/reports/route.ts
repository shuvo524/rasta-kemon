import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Report } from "@/models/Report";
import { StatusEvent } from "@/models/StatusEvent";
import { serializeReport } from "@/lib/serialize";
import { reportSchema, zodErrorMessage } from "@/lib/validation";
import { getSessionUser } from "@/lib/server-auth";
import { CATEGORY_KEYS, STATUS_KEYS } from "@/data/demo-reports";

/** GET /api/reports?category=&status=&q=&sort=newest|confirmed|nearest&lat=&lng=&page=&limit= */
export async function GET(req: Request) {
  try {
    await dbConnect();
  } catch (err) {
    return NextResponse.json(
      { error: "database_unavailable", message: (err as Error).message },
      { status: 503 }
    );
  }
  const url = new URL(req.url);
  const category = url.searchParams.get("category") || "";
  const status = url.searchParams.get("status") || "";
  const q = (url.searchParams.get("q") || "").trim();
  const sort = url.searchParams.get("sort") || "newest";
  const page = Math.max(1, Number(url.searchParams.get("page") || "1") || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("limit") || "50") || 50)
  );
  const lat = Number(url.searchParams.get("lat") || "");
  const lng = Number(url.searchParams.get("lng") || "");

  const filter: Record<string, unknown> = {};
  if (category && (CATEGORY_KEYS as string[]).includes(category)) {
    filter.category = category;
  }
  if (status && (STATUS_KEYS as string[]).includes(status)) {
    filter.status = status;
  }
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { area: { $regex: q, $options: "i" } },
      { district: { $regex: q, $options: "i" } },
    ];
  }

  let query = Report.find(filter);
  if (sort === "confirmed") {
    query = query.sort({ confirmCount: -1, createdAt: -1 });
  } else if (
    sort === "nearest" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  ) {
    // Geo-near sort (needs the 2dsphere index on location).
    query = query.sort({ createdAt: -1 });
    const docs = await Report.find({
      ...filter,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
        },
      },
    })
      .limit(limit)
      .skip((page - 1) * limit);
    const total = await Report.countDocuments(filter);
    return NextResponse.json({
      reports: docs.map(serializeReport),
      total,
      page,
      limit,
    });
  } else {
    query = query.sort({ createdAt: -1 });
  }

  const total = await Report.countDocuments(filter);
  const docs = await query
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  // lean() docs are plain objects — serializeReport expects a doc; map manually.
  const reports = docs.map((d) => {
    const raw = d as unknown as Record<string, unknown>;
    return {
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
    };
  });
  return NextResponse.json({ reports, total, page, limit });
}

/** POST /api/reports — auth required, Zod validation, duplicate check. */
export async function POST(req: Request) {
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
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", message: zodErrorMessage(parsed.error) },
      { status: 400 }
    );
  }
  const data = parsed.data;
  try {
    await dbConnect();
  } catch (err) {
    return NextResponse.json(
      { error: "database_unavailable", message: (err as Error).message },
      { status: 503 }
    );
  }

  // Duplicate check: same category, still active, within ~150 m.
  const duplicate = await Report.findOne({
    category: data.category,
    status: { $nin: ["resolved", "rejected"] },
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [data.lng, data.lat] },
        $maxDistance: 150,
      },
    },
  });
  if (duplicate && !data.force) {
    return NextResponse.json(
      { error: "duplicate", duplicateOf: String(duplicate._id) },
      { status: 409 }
    );
  }

  const doc = await Report.create({
    title: data.title,
    category: data.category,
    description: data.description || "",
    area: data.area,
    district: data.district || "",
    location: { type: "Point", coordinates: [data.lng, data.lat] },
    lat: data.lat,
    lng: data.lng,
    photoUrl: data.photoUrl ?? null,
    reporterId: user.id,
    reporterName: user.name || user.email,
    status: "pending",
    severity: data.severity,
    confirmCount: 0,
    resolvedVotes: 0,
    flagCount: 0,
    isDemo: false,
  });
  await StatusEvent.create({
    reportId: doc._id,
    status: "pending",
    note: "",
    actorName: user.name || user.email,
  });
  return NextResponse.json({ report: serializeReport(doc) }, { status: 201 });
}
