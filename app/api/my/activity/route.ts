import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Confirmation } from "@/models/Confirmation";
import { getSessionUser } from "@/lib/server-auth";

/** GET /api/my/activity — the user's confirmations / resolved votes / flags. */
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
  const items = await Confirmation.aggregate([
    { $match: { userId: user.id } },
    { $sort: { createdAt: -1 } },
    { $limit: 50 },
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
        reportId: { $toString: "$reportId" },
        reportTitle: "$report.title",
        reportArea: "$report.area",
      },
    },
  ]);
  return NextResponse.json({ activity: items });
}
