import { NextResponse } from "next/server";

/**
 * GET /api/auth/config — public, non-secret feature flags only.
 * Tells the login form whether Google OAuth is configured.
 */
export async function GET() {
  return NextResponse.json({
    google: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ),
    database: Boolean(process.env.MONGODB_URI),
  });
}
