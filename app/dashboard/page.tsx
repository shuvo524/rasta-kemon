import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/server-auth";
import { dbConnect } from "@/lib/mongodb";
import { Report } from "@/models/Report";
import { Confirmation } from "@/models/Confirmation";
import { serializeReport } from "@/lib/serialize";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

/** Personal dashboard — server-protected, real data only. */
export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");

  let reports: ReturnType<typeof serializeReport>[] = [];
  let activity: { kind: string; createdAt: string; reportTitle?: string }[] = [];
  let dbDown = false;
  try {
    await dbConnect();
    const [docs, acts] = await Promise.all([
      Report.find({ reporterId: user.id }).sort({ createdAt: -1 }),
      Confirmation.aggregate([
        { $match: { userId: user.id } },
        { $sort: { createdAt: -1 } },
        { $limit: 20 },
        {
          $lookup: {
            from: "reports",
            localField: "reportId",
            foreignField: "_id",
            as: "report",
          },
        },
        { $unwind: { path: "$report", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            kind: 1,
            createdAt: 1,
            reportTitle: "$report.title",
          },
        },
      ]),
    ]);
    reports = docs.map(serializeReport);
    activity = acts.map((a) => ({
      kind: a.kind as string,
      createdAt: new Date(a.createdAt as unknown as string).toISOString(),
      reportTitle: a.reportTitle as string | undefined,
    }));
  } catch {
    dbDown = true;
  }

  const pending = reports.filter((r) => r.status === "pending").length;
  const confirmed = reports.filter((r) => r.confirmCount > 0).length;
  const resolved = reports.filter((r) => r.status === "resolved").length;

  return (
    <DashboardClient
      user={user}
      reports={reports}
      activity={activity}
      counts={{
        total: reports.length,
        pending,
        confirmed,
        resolved,
      }}
      dbDown={dbDown}
    />
  );
}
