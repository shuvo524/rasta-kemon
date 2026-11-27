import mongoose from "mongoose";

/**
 * Cached Mongoose connection (Next.js serverless-safe pattern).
 * Throws a clear error when MONGODB_URI is not set — API routes catch
 * this and answer 503, so the app never crashes and never leaks the URI.
 */
const MONGODB_URI = process.env.MONGODB_URI;

declare global {
  // eslint-disable-next-line no-var
  var __rkMongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const cached = globalThis.__rkMongoose ?? { conn: null, promise: null };
globalThis.__rkMongoose = cached;

export function isDbConfigured(): boolean {
  return Boolean(MONGODB_URI);
}

export async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local (see .env.example) or Vercel env vars."
    );
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      // Keep the pool small: this is a hobby-tier Atlas cluster.
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
