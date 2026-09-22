import Message from "../models/Message.js";
import CrudRepository from "./crud-repository.js";

class MessageRepository extends CrudRepository {
  constructor() { super(Message); }

  async getForChannel(channelId, limit = 50, before = null) {
    const filter = { channelId, isDeleted: false };
    if (before) filter.createdAt = { $lt: new Date(before) };
    return await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .then(msgs => msgs.reverse()); // return oldest-first
  }

  async markRead(channelId, userId) {
    return await Message.updateMany(
      { channelId, readBy: { $ne: userId }, isDeleted: false },
      { $addToSet: { readBy: userId } }
    );
  }

  async getUnreadCount(channelId, userId) {
    return await Message.countDocuments({
      channelId,
      readBy: { $ne: userId },
      senderId: { $ne: userId },
      isDeleted: false,
    });
  }

  async softDelete(messageId) {
    return await Message.findByIdAndUpdate(
      messageId,
      { isDeleted: true, deletedAt: new Date(), content: "This message was deleted." },
      { new: true }
    );
  }

  async addReaction(messageId, emoji, userId) {
    const msg = await Message.findById(messageId);
    if (!msg) throw new Error("Message not found.");
    const existing = msg.reactions.find(r => r.emoji === emoji);
    if (existing) {
      const alreadyReacted = existing.userIds.includes(userId);
      if (alreadyReacted) {
        // Remove reaction
        return await Message.findOneAndUpdate(
          { _id: messageId, "reactions.emoji": emoji },
          { $pull: { "reactions.$.userIds": userId }, $inc: { "reactions.$.count": -1 } },
          { new: true }
        );
      } else {
        return await Message.findOneAndUpdate(
          { _id: messageId, "reactions.emoji": emoji },
          { $addToSet: { "reactions.$.userIds": userId }, $inc: { "reactions.$.count": 1 } },
          { new: true }
        );
      }
    } else {
      return await Message.findByIdAndUpdate(
        messageId,
        { $push: { reactions: { emoji, userIds: [userId], count: 1 } } },
        { new: true }
      );
    }
  }

  async searchInChannel(channelId, query) {
    return await Message.find({
      channelId,
      isDeleted: false,
      content: { $regex: query, $options: "i" },
    }).sort({ createdAt: -1 }).limit(30);
  }
}

export default MessageRepository;
