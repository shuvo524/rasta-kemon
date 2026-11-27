import mongoose, { type InferSchemaType, type Model } from "mongoose";
import { STATUS_KEYS } from "@/data/demo-reports";

/** Append-only status timeline for a report (shown on the details page). */
const StatusEventSchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
      index: true,
    },
    status: { type: String, required: true, enum: STATUS_KEYS },
    note: { type: String, default: "", maxlength: 300 },
    actorName: { type: String, default: "", maxlength: 60 },
  },
  { timestamps: true }
);

StatusEventSchema.index({ reportId: 1, createdAt: 1 });

export type StatusEventDoc = InferSchemaType<typeof StatusEventSchema> &
  mongoose.Document;

export const StatusEvent: Model<StatusEventDoc> =
  mongoose.models.StatusEvent ??
  mongoose.model<StatusEventDoc>("StatusEvent", StatusEventSchema);
