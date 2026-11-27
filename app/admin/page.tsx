import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/server-auth";
import { dbConnect } from "@/lib/mongodb";
import { Report } from "@/models/Report";
import { serializeReport } from "@/lib/serialize";
import AdminClient from "@/components/AdminClient";

export const dynamic = "force-dynamic";

/** Admin panel — server-protected by role check. */
export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/dashboard");

  let pending: ReturnType<typeof serializeReport>[] = [];
  let flagged: ReturnType<typeof serializeReport>[] = [];
  let stats = {
    total: 0,
    active: 0,
    resolved: 0,
    rejected: 0,
    pending: 0,
    demo: 0,
    flagged: 0,
    confirmations: 0,
  };
  let dbDown = false;
  try {
    await dbConnect();
    const [pDocs, fDocs, total, resolved, rejected, demoCount, agg] =
      await Promise.all([
        Report.find({ status: "pending" }).sort({ createdAt: -1 }).limit(100),
        Report.find({ flagCount: { $gt: 0 } }).sort({ createdAt: -1 }).limit(100),
        Report.countDocuments({}),
        Report.countDocuments({ status: "resolved" }),
        Report.countDocuments({ status: "rejected" }),
        Report.countDocuments({ isDemo: true }),
        Report.aggregate([
          { $group: { _id: null, confirmations: { $sum: "$confirmCount" } } },
        ]),
      ]);
    pending = pDocs.map(serializeReport);
    flagged = fDocs.map(serializeReport);
    stats = {
      total,
      active: total - resolved - rejected,
      resolved,
      rejected,
      pending: pDocs.length,
      demo: demoCount,
      flagged: fDocs.length,
      confirmations: agg[0]?.confirmations ?? 0,
    };
  } catch {
    dbDown = true;
  }

  return (
    <AdminClient
      user={user}
      pending={pending}
      flagged={flagged}
      stats={stats}
      dbDown={dbDown}
    />
  );
}
