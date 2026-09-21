import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    // who did it
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    performedByModel: {
      type: String,
      enum: ["Employee", "Admin"],
      default: "Admin",
    },
    performedByName: { type: String }, // snapshot — so log stays readable even if user deleted

    // what they did
    action: {
      type: String,
      enum: [
        "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT",
        "APPROVE", "REJECT", "ASSIGN", "UNASSIGN",
        "UPLOAD", "DOWNLOAD", "EXPORT", "IMPORT",
        "STATUS_CHANGE", "ROLE_CHANGE", "PASSWORD_CHANGE",
      ],
      required: true,
    },

    // what was affected
    entity:   { type: String, required: true }, // "Employee", "Task", "Leave", etc.
    entityId: { type: mongoose.Schema.Types.ObjectId },
    entityLabel: { type: String }, // human-readable: "Arpit Singh", "TASK-042", etc.

    // what changed
    oldValue: { type: mongoose.Schema.Types.Mixed }, // snapshot before
    newValue: { type: mongoose.Schema.Types.Mixed }, // snapshot after

    // extra context
    description: { type: String }, // e.g. "Changed salary from ₹30,000 to ₹35,000"
    ipAddress:   { type: String },
    userAgent:   { type: String },
  },
  {
    timestamps: true,
    // IMPORTANT: audit logs must NEVER be deleted or updated
    // Enforce this at the service layer — no update/delete methods exposed
  }
);

// Index for fast filtering by entity, action, user, date
AuditLogSchema.index({ performedBy: 1, createdAt: -1 });
AuditLogSchema.index({ entity: 1, entityId: 1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", AuditLogSchema);
export default AuditLog;
