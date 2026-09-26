import express from "express";
const router = express.Router();
import AIController from "../controller/ai-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const ALL = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin"];

router.post  ("/chat",            adminauthenticate, checkRole(ALL), AIController.chat);
router.get   ("/conversations",   adminauthenticate, checkRole(ALL), AIController.getConversations);
router.get   ("/conversations/:id", adminauthenticate, checkRole(ALL), AIController.getConversation);
router.delete("/conversations/:id", adminauthenticate, checkRole(ALL), AIController.deleteConversation);
router.delete("/conversations",   adminauthenticate, checkRole(ALL), AIController.clearAll);

export default router;
