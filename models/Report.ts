import mongoose, { type InferSchemaType, type Model } from "mongoose";
import { CATEGORY_KEYS, STATUS_KEYS } from "@/data/demo-reports";

const ReportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, required: true, enum: CATEGORY_KEYS },
    description: { type: String, default: "", maxlength: 1000 },
    area: { type: String, required: true, trim: true, maxlength: 120 },
    district: { type: String, default: "", maxlength: 60 },
    // GeoJSON point — coordinates are [lng, lat].
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], required: true },
    },
    // Plain numbers kept alongside for easy reads (never trust client lat/lng
    // without the Zod range checks in the API route).
    lat: { type: Number, required: true, min: 20.4, max: 26.8 },
    lng: { type: Number, required: true, min: 87.9, max: 92.8 },
    photoUrl: { type: String, default: null, maxlength: 500 },
    reporterId: { type: String, required: true, index: true },
    reporterName: { type: String, required: true, maxlength: 60 },
    status: {
      type: String,
      enum: STATUS_KEYS,
      default: "pending",
      index: true,
    },
    severity: { type: Number, min: 1, max: 3, default: 2 },
    confirmCount: { type: Number, default: 0, min: 0 },
    resolvedVotes: { type: Number, default: 0, min: 0 },
    flagCount: { type: Number, default: 0, min: 0 },
    isDemo: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Duplicate detection: same category within ~150 m (geo query).
ReportSchema.index({ location: "2dsphere" });
ReportSchema.index({ category: 1, status: 1 });
ReportSchema.index({ createdAt: -1 });

export type ReportDoc = InferSchemaType<typeof ReportSchema> &
  mongoose.Document;

export const Report: Model<ReportDoc> =
  mongoose.models.Report ??
  mongoose.model<ReportDoc>("Report", ReportSchema);
