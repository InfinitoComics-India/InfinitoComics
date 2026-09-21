import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema(
  {
    employeeId:  { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    setBy:       { type: mongoose.Schema.Types.ObjectId }, // manager who set it

    // ── Goal definition ───────────────────────────────────────
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["productivity","quality","learning","collaboration","leadership","other"],
      default: "productivity",
    },

    // ── Target ────────────────────────────────────────────────
    targetValue:  { type: Number, required: true }, // e.g. 30 (tasks)
    currentValue: { type: Number, default: 0 },
    unit:         { type: String, default: "" }, // e.g. "tasks", "days", "%"

    // ── Weight (how much this goal contributes to overall) ────
    weight: { type: Number, default: 1, min: 1, max: 5 },

    // ── Period ────────────────────────────────────────────────
    period: {
      type: String,
      enum: ["monthly","quarterly","yearly"],
      default: "monthly",
    },
    deadline: { type: Date, required: true },

    // ── Status ────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["active","completed","missed","cancelled"],
      default: "active",
    },
    completedAt: { type: Date },

    // ── Auto-track flag ───────────────────────────────────────
    // If true, currentValue is auto-filled from task metrics
    isAutoTracked: { type: Boolean, default: false },
    autoTrackField: { type: String, default: "" }, // e.g. "tasksCompleted"

    // ── Notes ─────────────────────────────────────────────────
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

GoalSchema.index({ employeeId: 1, status: 1 });
GoalSchema.index({ deadline: 1, status: 1 });

const Goal = mongoose.model("Goal", GoalSchema);
export default Goal;
