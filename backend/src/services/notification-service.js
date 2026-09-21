import NotificationRepository from "../repository/notification-repository.js";

class NotificationService {
  constructor() {
    this.notificationRepo = new NotificationRepository();
  }

  // ── Send a notification ───────────────────────────────────
  async send({ recipientId, recipientModel = "Employee", type, title, message, link = "", triggeredBy, entity, entityId }) {
    try {
      return await this.notificationRepo.create({
        recipientId,
        recipientModel,
        type,
        title,
        message,
        link,
        triggeredBy,
        entity,
        entityId,
      });
    } catch (error) {
      console.error("NotificationService.send:", error);
      throw error;
    }
  }

  // ── Get all notifications for a user ──────────────────────
  async getForUser(recipientId, limit = 50) {
    try {
      return await this.notificationRepo.getForUser(recipientId, limit);
    } catch (error) {
      console.error("NotificationService.getForUser:", error);
      throw error;
    }
  }

  // ── Get unread count (for bell badge) ─────────────────────
  async getUnreadCount(recipientId) {
    try {
      return await this.notificationRepo.getUnreadCount(recipientId);
    } catch (error) {
      console.error("NotificationService.getUnreadCount:", error);
      throw error;
    }
  }

  // ── Mark one as read ──────────────────────────────────────
  async markRead(notificationId) {
    try {
      return await this.notificationRepo.markRead(notificationId);
    } catch (error) {
      console.error("NotificationService.markRead:", error);
      throw error;
    }
  }

  // ── Mark all as read ──────────────────────────────────────
  async markAllRead(recipientId) {
    try {
      return await this.notificationRepo.markAllRead(recipientId);
    } catch (error) {
      console.error("NotificationService.markAllRead:", error);
      throw error;
    }
  }

  // ── Delete one ────────────────────────────────────────────
  async deleteOne(notificationId) {
    try {
      return await this.notificationRepo.findByIdandDelete(notificationId);
    } catch (error) {
      console.error("NotificationService.deleteOne:", error);
      throw error;
    }
  }

  // ── Cleanup old read notifications ───────────────────────
  async cleanup(recipientId) {
    try {
      return await this.notificationRepo.deleteOldRead(recipientId);
    } catch (error) {
      console.error("NotificationService.cleanup:", error);
      throw error;
    }
  }
}

export default NotificationService;
