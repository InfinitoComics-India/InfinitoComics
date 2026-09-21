import express from "express";
const router = express.Router();
import NotificationController from "../controller/notification-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const ALL_ADMINS = ["superadmin", "hr_manager", "manager", "team_lead",
                    "comics_admin", "character_admin", "research_admin",
                    "blog_admin", "career_admin"];

// ── Get my notifications ──────────────────────────────────────
// GET /hr/notifications/mine?limit=50
router.get(
  "/mine",
  adminauthenticate,
  checkRole(ALL_ADMINS),
  NotificationController.getMyNotifications
);

// ── Get unread count for bell badge ──────────────────────────
// GET /hr/notifications/unread-count
router.get(
  "/unread-count",
  adminauthenticate,
  checkRole(ALL_ADMINS),
  NotificationController.getUnreadCount
);

// ── Mark one notification as read ────────────────────────────
// PATCH /hr/notifications/read/:id
router.patch(
  "/read/:id",
  adminauthenticate,
  checkRole(ALL_ADMINS),
  NotificationController.markRead
);

// ── Mark all notifications as read ───────────────────────────
// PATCH /hr/notifications/read-all
router.patch(
  "/read-all",
  adminauthenticate,
  checkRole(ALL_ADMINS),
  NotificationController.markAllRead
);

// ── Delete one notification ───────────────────────────────────
// DELETE /hr/notifications/delete/:id
router.delete(
  "/delete/:id",
  adminauthenticate,
  checkRole(ALL_ADMINS),
  NotificationController.deleteNotification
);

// ── Send a notification (admin broadcast) ────────────────────
// POST /hr/notifications/send
router.post(
  "/send",
  adminauthenticate,
  checkRole(["superadmin", "hr_manager"]),
  NotificationController.sendNotification
);

export default router;
