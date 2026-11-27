import { z } from "zod";
import type { Category, Status } from "@/data/demo-reports";

const CATEGORY_TUPLE = [
  "damage",
  "waterlogging",
  "construction",
  "closure",
  "obstruction",
  "other",
] as const satisfies readonly Category[];

const STATUS_TUPLE = [
  "pending",
  "verified",
  "in_progress",
  "resolved",
  "rejected",
] as const satisfies readonly Status[];

export const reportSchema = z.object({
  title: z.string().trim().min(4).max(120),
  category: z.enum(CATEGORY_TUPLE),
  description: z.string().trim().max(1000).default(""),
  area: z.string().trim().min(2).max(120),
  district: z.string().trim().max(60).default(""),
  lat: z.number().min(20.4).max(26.8),
  lng: z.number().min(87.9).max(92.8),
  severity: z.number().int().min(1).max(3).default(2),
  photoUrl: z.string().url().max(500).nullable().optional(),
  force: z.boolean().default(false),
});

export const confirmSchema = z.object({
  kind: z.enum(["confirm", "resolved", "flag"]),
});

export const statusChangeSchema = z.object({
  status: z.enum(STATUS_TUPLE),
  note: z.string().trim().max(300).default(""),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(60),
});

export function zodErrorMessage(err: z.ZodError): string {
  return err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
}
