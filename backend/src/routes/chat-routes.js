import express from "express";
const router = express.Router();
import ChatController from "../controller/chat-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const ALL = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin"];
const MGR = ["superadmin","hr_manager","manager"];

// ── Channels ──────────────────────────────────────────────────
router.post  ("/channels/create",                  adminauthenticate, checkRole(MGR), ChatController.createChannel);
router.get   ("/channels/all",                     adminauthenticate, checkRole(ALL), ChatController.getAllChannels);
router.get   ("/channels/mine",                    adminauthenticate, checkRole(ALL), ChatController.getMyChannels);
router.post  ("/channels/dm",                      adminauthenticate, checkRole(ALL), ChatController.getOrCreateDM);
router.post  ("/channels/:id/member",              adminauthenticate, checkRole(MGR), ChatController.addMember);
router.delete("/channels/:id",                     adminauthenticate, checkRole(MGR), ChatController.deleteChannel);

// ── Messages ──────────────────────────────────────────────────
router.post  ("/messages/:channelId",              adminauthenticate, checkRole(ALL), ChatController.sendMessage);
router.get   ("/messages/:channelId",              adminauthenticate, checkRole(ALL), ChatController.getMessages);
router.patch ("/messages/:channelId/read",         adminauthenticate, checkRole(ALL), ChatController.markRead);
router.get   ("/messages/:channelId/search",       adminauthenticate, checkRole(ALL), ChatController.searchMessages);
router.delete("/messages/:id",                     adminauthenticate, checkRole(ALL), ChatController.deleteMessage);
router.post  ("/messages/:id/react",               adminauthenticate, checkRole(ALL), ChatController.addReaction);
router.post  ("/announce",                         adminauthenticate, checkRole(MGR), ChatController.sendAnnouncement);

export default router;
