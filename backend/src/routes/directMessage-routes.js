import express from "express";
const router = express.Router();
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";
import * as DM from "../controller/directMessage-controller.js";

const ALL = ["superadmin","hr_manager","manager","team_lead","comics_admin",
             "character_admin","research_admin","blog_admin","career_admin","shop_admin","employee"];

router.post  ("/send",         adminauthenticate, checkRole(ALL), DM.sendMessage);
router.get   ("/inbox",        adminauthenticate, checkRole(ALL), DM.getInbox);
router.get   ("/sent",         adminauthenticate, checkRole(ALL), DM.getSent);
router.get   ("/unread-count", adminauthenticate, checkRole(ALL), DM.getUnreadCount);
router.patch ("/read/:id",     adminauthenticate, checkRole(ALL), DM.markRead);
router.delete("/delete/:id",   adminauthenticate, checkRole(ALL), DM.deleteMessage);
router.get   ("/contacts",     adminauthenticate, checkRole(ALL), DM.getContacts);

export default router;
