import { headers } from "next/headers";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

/**
 * Read the current session on the server and return the user with their
 * role read from the database — the role is NEVER taken from the client
 * or from a cookie. Returns null when signed out or the DB is unreachable.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return null;
    await dbConnect();
    const db = mongoose.connection.db;
    if (!db) return null;
    const raw = await db
      .collection("user")
      .findOne({ _id: new mongoose.Types.ObjectId(session.user.id) });
    const role = raw?.role === "admin" ? "admin" : "user";
    return {
      id: session.user.id,
      name: session.user.name || "",
      email: session.user.email,
      role,
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    const err = new Error("Unauthorized") as Error & { status?: number };
    err.status = 401;
    throw err;
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") {
    const err = new Error("Forbidden: admin only") as Error & {
      status?: number;
    };
    err.status = 403;
    throw err;
  }
  return user;
}

/** Map a thrown auth error to an HTTP status (default 500). */
export function authErrorStatus(err: unknown): number {
  if (err instanceof Error) {
    const status = (err as unknown as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }
  return 500;
}
