import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    // who receives it
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // can reference Employee OR Admin — we don't enforce ref to keep it flexible
    },
    recipientModel: {
      type: String,
      enum: ["Employee", "Admin"],
      default: "Employee",
    },

    // ── Content ───────────────────────────────────────────────
    type: {
      type: String,
      enum: [
        "task_assigned",
        "task_updated",
        "task_overdue",
        "leave_applied",
        "leave_approved",
        "leave_rejected",
        "payslip_ready",
        "goal_updated",
        "performance_reviewed",
        "announcement",
        "mention",
        "system",
      ],
      required: true,
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    link:    { type: String, default: "" }, // frontend route to navigate to on click

    // ── State ─────────────────────────────────────────────────
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },

    // who/what triggered it
    triggeredBy: { type: mongoose.Schema.Types.ObjectId }, // employeeId or adminId
    entity:      { type: String },                         // "Task", "Leave", etc.
    entityId:    { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

// Index for fast queries: all unread notifications for a user
NotificationSchema.index({ recipientId: 1, isRead: 1 });

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
