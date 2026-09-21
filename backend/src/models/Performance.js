import mongoose from "mongoose";

const PerformanceSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    period: {
      month: { type: Number, required: true }, // 1-12
      year:  { type: Number, required: true },
    },

    // ── Auto-calculated from task data ────────────────────────
    productivity: {
      tasksCompleted:      { type: Number, default: 0 },
      tasksOverdue:        { type: Number, default: 0 },
      totalAssigned:       { type: Number, default: 0 },
      completionRate:      { type: Number, default: 0 }, // %
      avgCompletionDays:   { type: Number, default: 0 },
    },
    quality: {
      revisionCount:       { type: Number, default: 0 },
      approvalRate:        { type: Number, default: 0 }, // %
      errorRate:           { type: Number, default: 0 }, // %
    },
    reliability: {
      attendanceDays:      { type: Number, default: 0 },
      totalWorkingDays:    { type: Number, default: 0 },
      attendanceRate:      { type: Number, default: 0 }, // %
      deadlineAdherence:   { type: Number, default: 0 }, // %
    },
    contribution: {
      projectsContributed: { type: Number, default: 0 },
      ideasSubmitted:      { type: Number, default: 0 },
    },
    collaboration: {
      tasksReviewed:       { type: Number, default: 0 }, // tasks this employee reviewed for others
    },

    // ── Manager score (manual, 1-10 per category) ────────────
    managerScore: {
      productivity:  { type: Number, min: 0, max: 10 },
      quality:       { type: Number, min: 0, max: 10 },
      reliability:   { type: Number, min: 0, max: 10 },
      contribution:  { type: Number, min: 0, max: 10 },
      collaboration: { type: Number, min: 0, max: 10 },
      comment:       { type: String, default: "" },
      scoredBy:      { type: mongoose.Schema.Types.ObjectId },
      scoredAt:      { type: Date },
    },

    // ── Overall score (0-100, auto-calculated) ────────────────
    overallScore: { type: Number, default: 0, min: 0, max: 100 },

    // ── Status ────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  { timestamps: true }
);

// Unique: one record per employee per month+year
PerformanceSchema.index({ employeeId: 1, "period.month": 1, "period.year": 1 }, { unique: true });

const Performance = mongoose.model("Performance", PerformanceSchema);
export default Performance;
