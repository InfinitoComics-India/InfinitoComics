import mongoose from "mongoose";

const ChecklistItemSchema = new mongoose.Schema({
  title:         { type: String, required: true },
  description:   { type: String, default: "" },
  assignedTo:    { type: String, default: "HR" }, // "HR", "IT", "Manager", "Employee"
  isCompleted:   { type: Boolean, default: false },
  completedAt:   { type: Date },
  completedBy:   { type: mongoose.Schema.Types.ObjectId },
  dueDate:       { type: Date },
  order:         { type: Number, default: 0 },
});

const OnboardingSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, unique: true },

    // ── Type ─────────────────────────────────────────────────
    type: {
      type: String,
      enum: ["onboarding", "offboarding"],
      default: "onboarding",
    },

    // ── Status ────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },

    // ── Dates ─────────────────────────────────────────────────
    startDate:     { type: Date },
    targetDate:    { type: Date }, // expected completion date
    completedAt:   { type: Date },

    // ── Checklist ────────────────────────────────────────────
    checklist: [ChecklistItemSchema],

    // ── Progress (auto-calculated) ───────────────────────────
    progress: { type: Number, default: 0, min: 0, max: 100 },

    // ── Notes ────────────────────────────────────────────────
    welcomeMessage: { type: String, default: "" },
    exitNotes:      { type: String, default: "" }, // for offboarding
    exitReason:     { type: String, default: "" }, // for offboarding

    createdBy: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

const Onboarding = mongoose.model("Onboarding", OnboardingSchema);
export default Onboarding;
