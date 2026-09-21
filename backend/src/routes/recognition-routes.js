import express from "express";
const router = express.Router();
import RecognitionController from "../controller/recognition-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const ALL = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin"];
const MGR = ["superadmin","hr_manager","manager","team_lead"];

router.post  ("/give",                      adminauthenticate, checkRole(MGR), RecognitionController.give);
router.get   ("/wall",                      adminauthenticate, checkRole(ALL), RecognitionController.getWall);
router.get   ("/employee/:employeeId",      adminauthenticate, checkRole(ALL), RecognitionController.getForEmployee);
router.get   ("/badges/:employeeId",        adminauthenticate, checkRole(ALL), RecognitionController.getBadges);
router.delete("/delete/:id",                adminauthenticate, checkRole(MGR), RecognitionController.deleteRec);

export default router;
