import mongoose, { type InferSchemaType, type Model } from "mongoose";

/**
 * One community action per user per report per kind.
 * kind: "confirm" = আমিও দেখেছি, "resolved" = মিটে গেছে,
 * "flag" = ভুল তথ্য. Enforced by a unique index — a repeat is rejected
 * by the API with 409, and it can NEVER auto-change official status.
 */
const ConfirmationSchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
      index: true,
    },
    userId: { type: String, required: true, index: true },
    kind: {
      type: String,
      required: true,
      enum: ["confirm", "resolved", "flag"],
    },
  },
  { timestamps: true }
);

ConfirmationSchema.index({ reportId: 1, userId: 1, kind: 1 }, { unique: true });

export type ConfirmationDoc = InferSchemaType<typeof ConfirmationSchema> &
  mongoose.Document;

export const Confirmation: Model<ConfirmationDoc> =
  mongoose.models.Confirmation ??
  mongoose.model<ConfirmationDoc>("Confirmation", ConfirmationSchema);
