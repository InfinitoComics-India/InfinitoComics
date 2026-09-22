import ChannelRepository from "../repository/channel-repository.js";
import MessageRepository from "../repository/message-repository.js";
import NotificationRepository from "../repository/notification-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";

class ChatService {
  constructor() {
    this.channelRepo      = new ChannelRepository();
    this.messageRepo      = new MessageRepository();
    this.notificationRepo = new NotificationRepository();
    this.auditRepo        = new AuditLogRepository();
  }

  // ── Channels ──────────────────────────────────────────────
  async createChannel(data, performedBy, performedByName) {
    try {
      const channel = await this.channelRepo.create({ ...data, createdBy: performedBy });
      await this.auditRepo.create({ performedBy, performedByName, action: "CREATE", entity: "Channel", entityId: channel._id, entityLabel: channel.name, description: `Created channel #${channel.name}` });
      return channel;
    } catch (e) { console.error("ChatService.createChannel:", e); throw e; }
  }

  async getChannelsForUser(userId) {
    try { return await this.channelRepo.getForUser(userId); }
    catch (e) { console.error("ChatService.getChannelsForUser:", e); throw e; }
  }

  async getAllChannels() {
    try { return await this.channelRepo.getPublicChannels(); }
    catch (e) { console.error("ChatService.getAllChannels:", e); throw e; }
  }

  async getOrCreateDM(userId1, userId2, user1Name, user2Name) {
    try {
      const existing = await this.channelRepo.getDM(userId1, userId2);
      if (existing) return existing;
      const channel = await this.channelRepo.create({
        name: `DM: ${user1Name} & ${user2Name}`,
        type: "direct",
        dmParticipants: [userId1, userId2],
        members: [userId1, userId2],
        createdBy: userId1,
      });
      return channel;
    } catch (e) { console.error("ChatService.getOrCreateDM:", e); throw e; }
  }

  async addMember(channelId, userId) {
    try { return await this.channelRepo.addMember(channelId, userId); }
    catch (e) { console.error("ChatService.addMember:", e); throw e; }
  }

  async deleteChannel(channelId, performedBy, performedByName) {
    try {
      const ch = await this.channelRepo.getById(channelId);
      if (!ch) throw new Error("Channel not found.");
      await this.channelRepo.findByIdandDelete(channelId);
      await this.auditRepo.create({ performedBy, performedByName, action: "DELETE", entity: "Channel", entityId: channelId, entityLabel: ch.name, description: `Deleted channel #${ch.name}` });
      return { success: true };
    } catch (e) { console.error("ChatService.deleteChannel:", e); throw e; }
  }

  // ── Messages ──────────────────────────────────────────────
  async sendMessage(channelId, senderId, senderName, senderRole, content, type = "text", attachments = [], replyTo = null, mentions = []) {
    try {
      const msg = await this.messageRepo.create({ channelId, senderId, senderName, senderRole, content, type, attachments, replyTo, mentions, readBy: [senderId] });

      // Update channel last message preview
      await this.channelRepo.updateLastMessage(channelId, content.substring(0, 80), senderName);

      // Notify mentioned users
      for (const mentionedId of mentions) {
        if (mentionedId.toString() !== senderId.toString()) {
          await this.notificationRepo.create({ recipientId: mentionedId, recipientModel: "Employee", type: "mention", title: `${senderName} mentioned you`, message: content.substring(0, 100), link: `/hr/chat?channel=${channelId}`, triggeredBy: senderId, entity: "Channel", entityId: channelId });
        }
      }
      return msg;
    } catch (e) { console.error("ChatService.sendMessage:", e); throw e; }
  }

  async getMessages(channelId, limit = 50, before = null) {
    try { return await this.messageRepo.getForChannel(channelId, limit, before); }
    catch (e) { console.error("ChatService.getMessages:", e); throw e; }
  }

  async markRead(channelId, userId) {
    try { return await this.messageRepo.markRead(channelId, userId); }
    catch (e) { console.error("ChatService.markRead:", e); throw e; }
  }

  async getUnreadCount(channelId, userId) {
    try { return await this.messageRepo.getUnreadCount(channelId, userId); }
    catch (e) { console.error("ChatService.getUnreadCount:", e); throw e; }
  }

  async deleteMessage(messageId, performedBy) {
    try { return await this.messageRepo.softDelete(messageId); }
    catch (e) { console.error("ChatService.deleteMessage:", e); throw e; }
  }

  async addReaction(messageId, emoji, userId) {
    try { return await this.messageRepo.addReaction(messageId, emoji, userId); }
    catch (e) { console.error("ChatService.addReaction:", e); throw e; }
  }

  async searchMessages(channelId, query) {
    try { return await this.messageRepo.searchInChannel(channelId, query); }
    catch (e) { console.error("ChatService.searchMessages:", e); throw e; }
  }

  // Broadcast announcement to ALL public channels or specific channel
  async sendAnnouncement(channelId, senderId, senderName, content, performedBy, performedByName) {
    try {
      const msg = await this.sendMessage(channelId, senderId, senderName, "Admin", content, "announcement");
      await this.auditRepo.create({ performedBy, performedByName, action: "CREATE", entity: "Message", entityId: msg._id, description: `Sent announcement in channel` });
      return msg;
    } catch (e) { console.error("ChatService.sendAnnouncement:", e); throw e; }
  }
}

export default ChatService;
