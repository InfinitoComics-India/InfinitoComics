import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    // ── Clock In / Out ────────────────────────────────────────
    clockIn:  { type: Date },
    clockOut: { type: Date },

    // Calculated on clockOut — stored so reports don't recompute
    hoursWorked: { type: Number, default: 0 }, // in decimal hours e.g. 7.5

    // ── Status ────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["present", "absent", "late", "half_day", "on_leave", "holiday", "weekend"],
      default: "absent",
    },

    // Auto-flagged if clockIn > shift start + 15 min grace
    isLate:       { type: Boolean, default: false },
    lateByMinutes: { type: Number, default: 0 },

    // ── Notes ─────────────────────────────────────────────────
    note:         { type: String, default: "" }, // admin can add notes
    markedBy:     { type: mongoose.Schema.Types.ObjectId }, // who marked/corrected it
    isCorrected:  { type: Boolean, default: false }, // was it manually corrected

    // ── Shift (for future shift management) ──────────────────
    shiftStart: { type: String, default: "09:00" }, // "HH:MM"
    shiftEnd:   { type: String, default: "18:00" },
  },
  { timestamps: true }
);

// Compound index — one record per employee per day
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ date: 1, status: 1 });

const Attendance = mongoose.model("Attendance", AttendanceSchema);
export default Attendance;
