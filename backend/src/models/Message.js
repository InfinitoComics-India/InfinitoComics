import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },

    // ── Sender ────────────────────────────────────────────────
    senderId:   { type: mongoose.Schema.Types.ObjectId, required: true },
    senderName: { type: String, required: true }, // snapshot
    senderRole: { type: String, default: "" },

    // ── Content ───────────────────────────────────────────────
    content:    { type: String, default: "" },
    type: {
      type: String,
      enum: ["text", "image", "file", "announcement", "system"],
      default: "text",
    },

    // ── Attachments ───────────────────────────────────────────
    attachments: [{
      fileName: String,
      fileUrl:  String,
      mimeType: String,
      fileSize: Number,
    }],

    // ── Reactions ────────────────────────────────────────────
    reactions: [{
      emoji:   { type: String },
      userIds: [{ type: mongoose.Schema.Types.ObjectId }],
      count:   { type: Number, default: 0 },
    }],

    // ── Thread / Reply ────────────────────────────────────────
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },

    // ── Read receipts ─────────────────────────────────────────
    readBy: [{ type: mongoose.Schema.Types.ObjectId }],

    // ── Edit / Delete ─────────────────────────────────────────
    isEdited:   { type: Boolean, default: false },
    editedAt:   { type: Date },
    isDeleted:  { type: Boolean, default: false },
    deletedAt:  { type: Date },

    // ── Mentions ──────────────────────────────────────────────
    mentions: [{ type: mongoose.Schema.Types.ObjectId }],
  },
  { timestamps: true }
);

MessageSchema.index({ channelId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ mentions: 1 });

const Message = mongoose.model("Message", MessageSchema);
export default Message;
