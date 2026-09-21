import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  authorId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  authorName: { type: String },
  content:    { type: String, required: true },
  createdAt:  { type: Date, default: Date.now },
});

const TaskSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────
    taskId: { type: String, unique: true }, // auto: TASK-001

    // ── Core Fields ───────────────────────────────────────────
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    instructions:{ type: String, default: "" }, // rich text from manager

    // ── Project Link ──────────────────────────────────────────
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },

    // ── Assignment ────────────────────────────────────────────
    assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    assignedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    reviewers:   [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],

    // ── Kanban Status ─────────────────────────────────────────
    status: {
      type: String,
      enum: ["backlog", "assigned", "in_progress", "review", "revision", "completed"],
      default: "backlog",
    },

    // ── Priority ──────────────────────────────────────────────
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    // ── Progress ──────────────────────────────────────────────
    progress: { type: Number, default: 0, min: 0, max: 100 }, // 0–100 %

    // ── Dates ─────────────────────────────────────────────────
    deadline:    { type: Date },
    startedAt:   { type: Date },   // when status → in_progress
    completedAt: { type: Date },   // when status → completed

    // ── Recurring ─────────────────────────────────────────────
    isRecurring:    { type: Boolean, default: false },
    recurringRule:  { type: String, enum: ["daily", "weekly", "monthly"] },
    parentTaskId:   { type: mongoose.Schema.Types.ObjectId, ref: "Task" }, // original recurring task

    // ── Dependencies ──────────────────────────────────────────
    // This task cannot start until all dependency tasks are completed
    dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],

    // ── Attachments ───────────────────────────────────────────
    attachments: [{
      fileName: String,
      fileUrl:  String,  // S3 URL
      uploadedBy: mongoose.Schema.Types.ObjectId,
      uploadedAt: { type: Date, default: Date.now },
    }],

    // ── Comments ──────────────────────────────────────────────
    comments: [CommentSchema],

    // ── Metrics (auto-updated) ────────────────────────────────
    revisionCount: { type: Number, default: 0 }, // increments each time status → revision

    // ── Status change log (for performance tracking) ──────────
    statusHistory: [{
      from:      String,
      to:        String,
      changedBy: mongoose.Schema.Types.ObjectId,
      changedAt: { type: Date, default: Date.now },
      note:      String,
    }],

    // ── Tags ──────────────────────────────────────────────────
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Auto-generate taskId
TaskSchema.pre("save", async function (next) {
  if (!this.taskId) {
    const count = await mongoose.model("Task").countDocuments();
    this.taskId = `TASK-${String(count + 1).padStart(3, "0")}`;
  }
  next();
});

// Indexes
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ projectId: 1, status: 1 });
TaskSchema.index({ deadline: 1, status: 1 });
TaskSchema.index({ status: 1, priority: 1 });

const Task = mongoose.model("Task", TaskSchema);
export default Task;
