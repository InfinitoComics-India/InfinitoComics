import mongoose from "mongoose";

const MilestoneSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: "" },
  dueDate:     { type: Date },
  status:      { type: String, enum: ["pending","in_progress","completed"], default: "pending" },
  completedAt: { type: Date },
});

const ProjectSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────
    projectId: { type: String, unique: true }, // auto: PROJ-001

    // ── Core ──────────────────────────────────────────────────
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    clientName:  { type: String, default: "" },
    clientNotes: { type: String, default: "" },

    // ── Team ──────────────────────────────────────────────────
    projectManager: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    teamMembers:    [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],

    // ── Status ────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["planning", "active", "on_hold", "completed", "cancelled"],
      default: "planning",
    },

    // ── Health (auto-calculated or manually set) ──────────────
    health: {
      type: String,
      enum: ["on_track", "at_risk", "delayed"],
      default: "on_track",
    },

    // ── Dates ─────────────────────────────────────────────────
    startDate:   { type: Date },
    endDate:     { type: Date },
    completedAt: { type: Date },

    // ── Budget ────────────────────────────────────────────────
    budget:      { type: Number, default: 0 }, // planned budget in INR
    spent:       { type: Number, default: 0 }, // actual spent

    // ── Milestones ────────────────────────────────────────────
    milestones: [MilestoneSchema],

    // ── Tags / Category ───────────────────────────────────────
    tags:     [{ type: String }],
    category: { type: String, default: "" },

    // ── Progress (auto-calculated from tasks) ─────────────────
    progress: { type: Number, default: 0, min: 0, max: 100 },

    // ── Created by ────────────────────────────────────────────
    createdBy: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

// Auto-generate projectId
ProjectSchema.pre("save", async function (next) {
  if (!this.projectId) {
    const count = await mongoose.model("Project").countDocuments();
    this.projectId = `PROJ-${String(count + 1).padStart(3, "0")}`;
  }
  next();
});

ProjectSchema.index({ status: 1 });
ProjectSchema.index({ projectManager: 1 });
ProjectSchema.index({ teamMembers: 1 });

const Project = mongoose.model("Project", ProjectSchema);
export default Project;
