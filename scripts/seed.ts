/**
 * Seed the 10 demo reports (data/demo-reports.ts) into MongoDB.
 * Idempotent: reports are upserted by title, so re-running is safe.
 *
 *   npm run seed
 *
 * Requires MONGODB_URI in .env.local. Run AFTER `npm install`.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { demoReports } from "../data/demo-reports";
import { dbConnect } from "../lib/mongodb";
import { Report } from "../models/Report";
import { StatusEvent } from "../models/StatusEvent";

async function main() {
  await dbConnect();
  let created = 0;
  let kept = 0;
  for (const demo of demoReports) {
    const existing = await Report.findOne({ title: demo.title });
    if (existing) {
      kept += 1;
      continue;
    }
    const doc = await Report.create({
      title: demo.title,
      category: demo.category,
      description: demo.description,
      area: demo.area,
      district: demo.district,
      location: { type: "Point", coordinates: [demo.lng, demo.lat] },
      lat: demo.lat,
      lng: demo.lng,
      photoUrl: demo.photoUrl ?? null,
      reporterId: "seed-demo",
      reporterName: demo.reporterName ?? "RASTA KEMON Demo",
      status: demo.status,
      severity: demo.severity,
      confirmCount: demo.confirmCount,
      resolvedVotes: 0,
      flagCount: 0,
      isDemo: true,
      createdAt: new Date(demo.createdAt),
      updatedAt: new Date(demo.createdAt),
    });
    const submittedAt = new Date(demo.createdAt);
    await StatusEvent.create({
      reportId: doc._id,
      status: "pending",
      note: "",
      actorName: "RASTA KEMON Demo",
      createdAt: submittedAt,
    });
    if (demo.status !== "pending") {
      await StatusEvent.create({
        reportId: doc._id,
        status: "verified",
        note: "",
        actorName: "RASTA KEMON Demo",
        createdAt: new Date(submittedAt.getTime() + 2 * 60 * 60 * 1000),
      });
    }
    if (demo.status === "resolved") {
      await StatusEvent.create({
        reportId: doc._id,
        status: "resolved",
        note: "",
        actorName: "RASTA KEMON Demo",
        createdAt: new Date(submittedAt.getTime() + 26 * 60 * 60 * 1000),
      });
    }
    created += 1;
  }
  console.log(`Seed done: ${created} demo reports created, ${kept} already existed.`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", (err as Error).message);
  process.exit(1);
});
