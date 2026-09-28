import mongoose from "mongoose";

const DailyWorkLogSchema = new mongoose.Schema(
  {
    employeeId:   { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    employeeName: { type: String, default: "" }, // snapshot

    // ── Date ──────────────────────────────────────────────────
    date: { type: Date, required: true }, // stored as start of day (midnight IST)

    // ── Work Entry ────────────────────────────────────────────
    workDescription: { type: String, default: "" },
    hoursWorked:     { type: Number, default: 0, min: 0, max: 24 },

    // ── Status ────────────────────────────────────────────────
    status: {
      type: String,
      enum: [
        "pending",    // employee hasn't submitted yet (today only)
        "submitted",  // employee submitted on time
        "auto_leave", // system marked as leave because no submission by midnight
        "edited",     // submitted then edited (only allowed before midnight)
      ],
      default: "pending",
    },

    // ── Lock ──────────────────────────────────────────────────
    // After midnight the entry is locked — no more edits allowed
    isLocked: { type: Boolean, default: false },
    lockedAt: { type: Date },

    // ── Auto-leave flag ───────────────────────────────────────
    // Set to true by cron job when employee missed submission
    isAutoLeave: { type: Boolean, default: false },

    // ── Submission time ───────────────────────────────────────
    submittedAt: { type: Date },
    lastEditedAt: { type: Date },
  },
  { timestamps: true }
);

// Unique: one log per employee per day
DailyWorkLogSchema.index({ employeeId: 1, date: 1 }, { unique: true });
DailyWorkLogSchema.index({ date: 1, status: 1 });

const DailyWorkLog = mongoose.model("DailyWorkLog", DailyWorkLogSchema);
export default DailyWorkLog;
