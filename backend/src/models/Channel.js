import mongoose from "mongoose";

const ChannelSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    // ── Type ──────────────────────────────────────────────────
    type: {
      type: String,
      enum: ["public", "private", "direct", "announcement"],
      default: "public",
    },

    // ── Members ───────────────────────────────────────────────
    // Empty = all admins can see (public channels)
    members: [{ type: mongoose.Schema.Types.ObjectId }],

    // ── DM: exactly 2 participants ───────────────────────────
    // For type="direct", store both user IDs here
    dmParticipants: [{ type: mongoose.Schema.Types.ObjectId }],

    // ── Meta ──────────────────────────────────────────────────
    createdBy:   { type: mongoose.Schema.Types.ObjectId },
    icon:        { type: String, default: "💬" },
    isArchived:  { type: Boolean, default: false },

    // ── Last message snapshot (for channel list preview) ──────
    lastMessage: {
      content:   { type: String, default: "" },
      sentAt:    { type: Date },
      sentBy:    { type: String, default: "" },
    },
    lastActivity: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ChannelSchema.index({ type: 1, isArchived: 1 });
// For DM lookups — find channel between two specific users
ChannelSchema.index({ dmParticipants: 1 });

const Channel = mongoose.model("Channel", ChannelSchema);
export default Channel;
