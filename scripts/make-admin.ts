/**
 * Give a registered user the admin role. The role can ONLY be set here
 * (server-side) — never from any client request.
 *
 *   npm run make-admin -- you@example.com
 *
 * Requires MONGODB_URI in .env.local. The user must already exist
 * (register on the site first, then run this).
 */
import "dotenv/config";
import mongoose from "mongoose";
import { dbConnect } from "../lib/mongodb";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: npm run make-admin -- <email>");
    process.exit(1);
  }
  await dbConnect();
  const db = mongoose.connection.db;
  if (!db) throw new Error("No database connection.");
  const result = await db
    .collection("user")
    .updateOne({ email }, { $set: { role: "admin", updatedAt: new Date() } });
  if (result.matchedCount === 0) {
    console.error(`No user found with email ${email}. Register first, then retry.`);
    process.exit(1);
  }
  console.log(`${email} is now an admin.`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("make-admin failed:", (err as Error).message);
  process.exit(1);
});
