import mongoose from "mongoose";

// Employee Self Service — requests employees submit to HR
const SelfServiceRequestSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    employeeName: { type: String }, // snapshot

    // ── Request type ──────────────────────────────────────────
    type: {
      type: String,
      enum: [
        "leave_application",
        "document_request",    // experience letter, salary slip etc.
        "address_update",
        "bank_update",
        "profile_update",
        "attendance_correction",
        "salary_query",
        "other",
      ],
      required: true,
    },

    // ── Content ───────────────────────────────────────────────
    subject:     { type: String, required: true },
    description: { type: String, default: "" },
    attachments: [{ type: String }], // S3 URLs

    // ── Status ────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    // ── Resolution ────────────────────────────────────────────
    assignedTo:    { type: mongoose.Schema.Types.ObjectId },
    assignedToName:{ type: String, default: "" },
    resolution:    { type: String, default: "" },
    resolvedAt:    { type: Date },
    resolvedBy:    { type: mongoose.Schema.Types.ObjectId },

    // ── Comments thread ───────────────────────────────────────
    comments: [{
      authorId:   { type: mongoose.Schema.Types.ObjectId },
      authorName: { type: String },
      content:    { type: String },
      createdAt:  { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

SelfServiceRequestSchema.index({ employeeId: 1, status: 1 });
SelfServiceRequestSchema.index({ status: 1, createdAt: -1 });

const SelfServiceRequest = mongoose.model("SelfServiceRequest", SelfServiceRequestSchema);
export default SelfServiceRequest;
