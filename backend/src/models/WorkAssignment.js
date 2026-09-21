import mongoose from "mongoose";

const WorkAssignmentSchema = new mongoose.Schema(
  {
    // ── Employee assigned ─────────────────────────────────────
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    // ── Project they are assigned to ──────────────────────────
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    // ── Role on this project ──────────────────────────────────
    role: {
      type: String,
      enum: ["lead", "contributor", "reviewer", "observer"],
      default: "contributor",
    },

    // ── Assignment dates ──────────────────────────────────────
    startDate: { type: Date, required: true },
    endDate:   { type: Date },

    // ── Workload ──────────────────────────────────────────────
    hoursPerWeek: { type: Number, default: 40 }, // planned hours/week
    allocatedPercent: { type: Number, default: 100 }, // % of capacity

    // ── Status ────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["active", "completed", "paused", "cancelled"],
      default: "active",
    },

    // ── Notes ─────────────────────────────────────────────────
    note: { type: String, default: "" },

    // ── Who assigned ──────────────────────────────────────────
    assignedBy: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

// Unique: one active assignment per employee per project
WorkAssignmentSchema.index({ employeeId: 1, projectId: 1 });
WorkAssignmentSchema.index({ projectId: 1, status: 1 });
WorkAssignmentSchema.index({ employeeId: 1, status: 1 });

const WorkAssignment = mongoose.model("WorkAssignment", WorkAssignmentSchema);
export default WorkAssignment;
