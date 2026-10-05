import mongoose from "mongoose";

const DirectMessageSchema = new mongoose.Schema(
  {
    senderId:    { type: mongoose.Schema.Types.ObjectId, required: true },
    senderModel: { type: String, enum: ["Admin"], default: "Admin" },
    senderName:  { type: String, default: "" },
    receiverId:    { type: mongoose.Schema.Types.ObjectId, required: true },
    receiverModel: { type: String, enum: ["Admin"], default: "Admin" },
    receiverName:  { type: String, default: "" },
    subject: { type: String, default: "" },
    body:    { type: String, required: true },
    isRead:   { type: Boolean, default: false },
    readAt:   { type: Date },
    isDeletedBySender:   { type: Boolean, default: false },
    isDeletedByReceiver: { type: Boolean, default: false },
  },
  { timestamps: true }
);

DirectMessageSchema.index({ receiverId: 1, isRead: 1 });
DirectMessageSchema.index({ senderId: 1 });
DirectMessageSchema.index({ receiverId: 1 });

const DirectMessage = mongoose.model("DirectMessage", DirectMessageSchema);
export default DirectMessage;
