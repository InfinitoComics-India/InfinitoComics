import mongoose from "mongoose";

const RecognitionSchema = new mongoose.Schema(
  {
    // ── Who receives it ───────────────────────────────────────
    recipientId:   { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    recipientName: { type: String }, // snapshot

    // ── Who gives it ─────────────────────────────────────────
    givenBy:       { type: mongoose.Schema.Types.ObjectId, required: true },
    givenByName:   { type: String },

    // ── Type ──────────────────────────────────────────────────
    type: {
      type: String,
      enum: ["shoutout", "badge", "award"],
      required: true,
    },

    // ── Content ───────────────────────────────────────────────
    title:   { type: String, required: true },
    message: { type: String, default: "" },

    // ── Badge details (if type === badge) ─────────────────────
    badge: {
      icon:  { type: String, default: "⭐" }, // emoji or icon name
      color: { type: String, default: "#DD1215" },
    },

    // ── Visibility ────────────────────────────────────────────
    isPublic: { type: Boolean, default: true }, // shown on recognition wall
    isPinned: { type: Boolean, default: false }, // pinned to employee profile
  },
  { timestamps: true }
);

RecognitionSchema.index({ recipientId: 1, createdAt: -1 });
RecognitionSchema.index({ isPublic: 1, createdAt: -1 });

const Recognition = mongoose.model("Recognition", RecognitionSchema);
export default Recognition;
