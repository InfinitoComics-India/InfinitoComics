import Channel from "../models/Channel.js";
import CrudRepository from "./crud-repository.js";

class ChannelRepository extends CrudRepository {
  constructor() { super(Channel); }

  async getPublicChannels() {
    return await Channel.find({ type: { $in: ["public","announcement"] }, isArchived: false })
      .sort({ lastActivity: -1 });
  }

  async getForUser(userId) {
    return await Channel.find({
      isArchived: false,
      $or: [
        { type: "public" },
        { type: "announcement" },
        { members: userId },
        { dmParticipants: userId },
      ],
    }).sort({ lastActivity: -1 });
  }

  async getDM(userId1, userId2) {
    return await Channel.findOne({
      type: "direct",
      dmParticipants: { $all: [userId1, userId2], $size: 2 },
    });
  }

  async updateLastMessage(channelId, content, sentBy) {
    return await Channel.findByIdAndUpdate(
      channelId,
      { lastMessage: { content, sentAt: new Date(), sentBy }, lastActivity: new Date() },
      { new: true }
    );
  }

  async addMember(channelId, userId) {
    return await Channel.findByIdAndUpdate(
      channelId,
      { $addToSet: { members: userId } },
      { new: true }
    );
  }

  async removeMember(channelId, userId) {
    return await Channel.findByIdAndUpdate(
      channelId,
      { $pull: { members: userId } },
      { new: true }
    );
  }
}

export default ChannelRepository;
