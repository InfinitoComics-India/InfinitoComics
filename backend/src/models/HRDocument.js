import mongoose from "mongoose";

const HRDocumentSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },

    // ── Category ──────────────────────────────────────────────
    category: {
      type: String,
      enum: ["offer_letter","nda","contract","certificate","id_proof","payslip","appraisal","warning","resignation","experience_letter","other"],
      required: true,
    },

    // ── File ─────────────────────────────────────────────────
    fileName:    { type: String, required: true },
    fileUrl:     { type: String, required: true }, // S3 URL
    fileSize:    { type: Number, default: 0 },     // bytes
    mimeType:    { type: String, default: "" },

    // ── Version ───────────────────────────────────────────────
    version:     { type: Number, default: 1 },
    previousVersions: [{
      version:   Number,
      fileUrl:   String,
      updatedAt: Date,
    }],

    // ── Status ────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending_signature", "signed", "active", "expired", "revoked"],
      default: "active",
    },

    // ── Dates ─────────────────────────────────────────────────
    issueDate:   { type: Date, default: Date.now },
    expiryDate:  { type: Date },  // for contracts/IDs that expire

    // ── Access ────────────────────────────────────────────────
    // Which HR roles can see this document
    accessRoles: {
      type: [String],
      default: ["superadmin", "hr_manager"],
    },

    // ── Notes ─────────────────────────────────────────────────
    notes:       { type: String, default: "" },
    uploadedBy:  { type: mongoose.Schema.Types.ObjectId },
    title:       { type: String, default: "" }, // display name
  },
  { timestamps: true }
);

HRDocumentSchema.index({ employeeId: 1, category: 1 });
HRDocumentSchema.index({ expiryDate: 1, status: 1 });

const HRDocument = mongoose.model("HRDocument", HRDocumentSchema);
export default HRDocument;
