import NotificationService from "../services/notification-service.js";

const notificationService = new NotificationService();

// ── GET MY NOTIFICATIONS ──────────────────────────────────────
const getMyNotifications = async (req, res) => {
  try {
    const recipientId = req.user._id;
    const limit = parseInt(req.query.limit) || 50;
    const notifications = await notificationService.getForUser(recipientId, limit);
    res.status(200).json({ success: true, data: notifications, count: notifications.length });
  } catch (error) {
    console.error("getMyNotifications:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET UNREAD COUNT (bell badge) ─────────────────────────────
const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user._id);
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("getUnreadCount:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── MARK ONE AS READ ──────────────────────────────────────────
const markRead = async (req, res) => {
  try {
    const updated = await notificationService.markRead(req.params.id);
    res.status(200).json({ success: true, message: "Notification marked as read.", data: updated });
  } catch (error) {
    console.error("markRead:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── MARK ALL AS READ ──────────────────────────────────────────
const markAllRead = async (req, res) => {
  try {
    await notificationService.markAllRead(req.user._id);
    res.status(200).json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    console.error("markAllRead:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE ONE ────────────────────────────────────────────────
const deleteNotification = async (req, res) => {
  try {
    await notificationService.deleteOne(req.params.id);
    res.status(200).json({ success: true, message: "Notification deleted." });
  } catch (error) {
    console.error("deleteNotification:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── SEND NOTIFICATION (admin broadcast) ──────────────────────
const sendNotification = async (req, res) => {
  try {
    const { recipientId, recipientModel, type, title, message, link } = req.body;
    if (!recipientId || !type || !title || !message) {
      return res.status(400).json({ success: false, message: "recipientId, type, title, and message are required." });
    }
    const notification = await notificationService.send({
      recipientId,
      recipientModel,
      type,
      title,
      message,
      link,
      triggeredBy: req.user._id,
    });
    res.status(201).json({ success: true, message: "Notification sent.", data: notification });
  } catch (error) {
    console.error("sendNotification:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getMyNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
  sendNotification,
};
