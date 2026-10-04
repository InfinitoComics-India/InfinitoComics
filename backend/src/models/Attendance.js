import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  clockIn:     { type: Date, required: true },
  clockOut:    { type: Date },
  hoursWorked: { type: Number, default: 0 },
}, { _id: false });

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

    // ── Multiple Clock In/Out Sessions ────────────────────────
    sessions: { type: [SessionSchema], default: [] },

    // Total hours across all sessions
    totalHours: { type: Number, default: 0 },

    // ── Legacy single clock in/out (kept for backward compat) ─
    clockIn:     { type: Date },
    clockOut:    { type: Date },
    hoursWorked: { type: Number, default: 0 },

    // ── Status ────────────────────────────────────────────────
    // present = totalHours >= 4, half_day = totalHours > 0 but < 4
    status: {
      type: String,
      enum: ["present", "absent", "late", "half_day", "on_leave", "holiday", "weekend"],
      default: "absent",
    },

    isLate:        { type: Boolean, default: false },
    lateByMinutes: { type: Number,  default: 0 },

    note:        { type: String,  default: "" },
    markedBy:    { type: mongoose.Schema.Types.ObjectId },
    isCorrected: { type: Boolean, default: false },

    shiftStart: { type: String, default: "09:00" },
    shiftEnd:   { type: String, default: "18:00" },
  },
  { timestamps: true }
);

AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ date: 1, status: 1 });

const Attendance = mongoose.model("Attendance", AttendanceSchema);
export default Attendance;
