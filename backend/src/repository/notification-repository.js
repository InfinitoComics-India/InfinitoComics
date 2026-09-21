import Notification from "../models/Notification.js";
import CrudRepository from "./crud-repository.js";

class NotificationRepository extends CrudRepository {
  constructor() {
    super(Notification);
  }

  // Get all notifications for a user (newest first)
  async getForUser(recipientId, limit = 50) {
    return await Notification.find({ recipientId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // Get only unread count for a user (used for the bell badge)
  async getUnreadCount(recipientId) {
    return await Notification.countDocuments({ recipientId, isRead: false });
  }

  // Mark one notification as read
  async markRead(notificationId) {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  // Mark ALL notifications as read for a user
  async markAllRead(recipientId) {
    return await Notification.updateMany(
      { recipientId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  // Delete old read notifications older than 30 days (cleanup)
  async deleteOldRead(recipientId) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return await Notification.deleteMany({
      recipientId,
      isRead: true,
      createdAt: { $lt: thirtyDaysAgo },
    });
  }
}

export default NotificationRepository;
