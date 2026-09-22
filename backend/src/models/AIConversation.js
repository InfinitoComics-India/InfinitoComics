import mongoose from "mongoose";

const AIMessageSchema = new mongoose.Schema({
  role:      { type: String, enum: ["user","assistant","system"], required: true },
  content:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const AIConversationSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, required: true },
    userName: { type: String, default: "" },

    title:    { type: String, default: "New Conversation" },
    messages: [AIMessageSchema],

    // Context injected into the AI for this conversation
    contextSummary: { type: String, default: "" },

    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AIConversationSchema.index({ userId: 1, createdAt: -1 });

const AIConversation = mongoose.model("AIConversation", AIConversationSchema);
export default AIConversation;
