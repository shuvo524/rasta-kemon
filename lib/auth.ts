import { MongoClient } from "mongodb";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

/**
 * Better Auth configuration.
 *
 * - Email + password sign-up / login.
 * - Google OAuth only when GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET are set;
 *   otherwise it is silently disabled (no crash).
 * - `role` is a server-side field (default "user"). It is NOT an input
 *   field, so a client can never set its own role — admins are created
 *   only with `npm run make-admin <email>` (see scripts/make-admin.ts).
 *
 * The auth tables live in the same MongoDB database as the Mongoose
 * models (same MONGODB_URI). The native client below is created lazily —
 * it does not connect at import time, so `next build` works without env
 * vars. When MONGODB_URI is unset, API routes answer 503 before auth
 * ever runs.
 *
 * BETTER_AUTH_SECRET must be set in production. The fallback below is a
 * dev-only placeholder so `next build` works without env vars. In
 * production the auth handler route (/api/auth) refuses to run until a
 * real secret is set (see app/api/auth/[...all]/route.ts) — never
 * deploy with the fallback.
 */
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const mongoClient = new MongoClient(
  process.env.MONGODB_URI ?? "mongodb://localhost:27017/rasta-kemon",
  { maxPoolSize: 10, serverSelectionTimeoutMS: 8000 }
);

export const auth = betterAuth({
  database: mongodbAdapter(mongoClient.db(), { client: mongoClient }),
  secret:
    process.env.BETTER_AUTH_SECRET || "dev-only-insecure-secret-change-me",
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
  ...(googleClientId && googleClientSecret
    ? {
        socialProviders: {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        },
      }
    : {}),
});

export type Session = typeof auth.$Infer.Session;
