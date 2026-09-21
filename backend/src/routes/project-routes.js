import express from "express";
const router = express.Router();
import ProjectController from "../controller/project-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const ALL = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin"];
const MGR = ["superadmin","hr_manager","manager"];

router.post  ("/create",                          adminauthenticate, checkRole(MGR), ProjectController.createProject);
router.get   ("/getall",                          adminauthenticate, checkRole(ALL), ProjectController.getAllProjects);
router.get   ("/stats",                           adminauthenticate, checkRole(MGR), ProjectController.getStats);
router.get   ("/:id",                             adminauthenticate, checkRole(ALL), ProjectController.getProjectDetail);
router.put   ("/update/:id",                      adminauthenticate, checkRole(MGR), ProjectController.updateProject);
router.post  ("/milestone/:id",                   adminauthenticate, checkRole(MGR), ProjectController.addMilestone);
router.put   ("/milestone/:id/:milestoneId",      adminauthenticate, checkRole(MGR), ProjectController.updateMilestone);
router.delete("/delete/:id",                      adminauthenticate, checkRole(["superadmin","manager"]), ProjectController.deleteProject);

export default router;
