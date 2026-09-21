import mongoose from "mongoose";

const LeaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    // ── Leave Type ────────────────────────────────────────────
    leaveType: {
      type: String,
      enum: ["casual", "sick", "earned", "unpaid", "maternity", "paternity", "bereavement"],
      required: true,
    },

    // ── Dates ─────────────────────────────────────────────────
    fromDate:   { type: Date, required: true },
    toDate:     { type: Date, required: true },
    totalDays:  { type: Number, required: true }, // calculated on create

    isHalfDay:  { type: Boolean, default: false },
    halfDaySession: {
      type: String,
      enum: ["morning", "afternoon"],
    },

    // ── Reason & Documents ────────────────────────────────────
    reason:      { type: String, required: true },
    attachments: { type: [String], default: [] }, // S3 URLs for sick notes etc.

    // ── Approval Flow ─────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },

    approvedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    approvedAt:    { type: Date },
    rejectionNote: { type: String, default: "" },

    // ── Admin note ────────────────────────────────────────────
    adminNote: { type: String, default: "" },

    // ── Flags ─────────────────────────────────────────────────
    // Set to true once attendance records are updated for leave days
    attendanceUpdated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

LeaveSchema.index({ employeeId: 1, status: 1 });
LeaveSchema.index({ fromDate: 1, toDate: 1 });
LeaveSchema.index({ status: 1, createdAt: -1 });

const Leave = mongoose.model("Leave", LeaveSchema);
export default Leave;
