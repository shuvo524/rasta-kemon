import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";

const { GET: authGET, POST: authPOST } = toNextJsHandler(auth);

function notConfigured(): Response | null {
  if (process.env.NODE_ENV === "production" && !process.env.BETTER_AUTH_SECRET) {
    return Response.json(
      {
        error: "auth_not_configured",
        message:
          "BETTER_AUTH_SECRET is not set. Set it in Vercel env vars (see README Phase B setup).",
      },
      { status: 503 }
    );
  }
  return null;
}

/** Better Auth handler — connects to MongoDB first (503 if unconfigured). */
export async function GET(req: Request) {
  const blocked = notConfigured();
  if (blocked) return blocked;
  try {
    await dbConnect();
  } catch (err) {
    return Response.json(
      { error: "database_unavailable", message: (err as Error).message },
      { status: 503 }
    );
  }
  return authGET(req);
}

export async function POST(req: Request) {
  const blocked = notConfigured();
  if (blocked) return blocked;
  try {
    await dbConnect();
  } catch (err) {
    return Response.json(
      { error: "database_unavailable", message: (err as Error).message },
      { status: 503 }
    );
  }
  return authPOST(req);
}
