import mongoose from "mongoose";

const DailyWorkLogSchema = new mongoose.Schema(
  {
    // ── Who submitted — linked to Admin login ─────────────────
    adminId:      { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    adminEmail:   { type: String, default: "" }, // snapshot of email
    adminName:    { type: String, default: "" }, // snapshot of name
    adminEmployeeId: { type: String, default: "" }, // snapshot of employee ID

    // ── Also link to Employee record if exists ────────────────
    employeeId:   { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },

    // ── Date ──────────────────────────────────────────────────
    date: { type: Date, required: true }, // stored as start of day (midnight IST)

    // ── Work Entry ────────────────────────────────────────────
    workDescription: { type: String, default: "" },
    hoursWorked:     { type: Number, default: 0, min: 0, max: 24 },

    // ── Status ────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending","submitted","edited","auto_leave"],
      default: "pending",
    },

    // ── Lock — after midnight no more edits ───────────────────
    isLocked:    { type: Boolean, default: false },
    lockedAt:    { type: Date },

    // ── Auto-leave flag (set by cron) ─────────────────────────
    isAutoLeave: { type: Boolean, default: false },

    // ── Admin review ──────────────────────────────────────────
    reviewedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    reviewerName:  { type: String, default: "" },
    reviewComment: { type: String, default: "" },
    reviewedAt:    { type: Date },
    reviewStatus:  {
      type: String,
      enum: ["", "approved", "needs_improvement", "rejected"],
      default: "",
    },

    // ── Submission time ───────────────────────────────────────
    submittedAt:  { type: Date },
    lastEditedAt: { type: Date },
  },
  { timestamps: true }
);

// Unique: one log per admin per day
DailyWorkLogSchema.index({ adminId: 1, date: 1 }, { unique: true });
DailyWorkLogSchema.index({ date: 1, status: 1 });

const DailyWorkLog = mongoose.model("DailyWorkLog", DailyWorkLogSchema);
export default DailyWorkLog;
