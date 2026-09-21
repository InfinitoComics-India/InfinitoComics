import express from "express";
const router = express.Router();
import GoalController from "../controller/goal-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const ALL = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin"];
const MGR = ["superadmin","hr_manager","manager","team_lead"];

router.post  ("/create",                    adminauthenticate, checkRole(MGR), GoalController.createGoal);
router.get   ("/overdue",                   adminauthenticate, checkRole(MGR), GoalController.getOverdue);
router.get   ("/employee/:employeeId",      adminauthenticate, checkRole(ALL), GoalController.getByEmployee);
router.get   ("/summary/:employeeId",       adminauthenticate, checkRole(ALL), GoalController.getSummary);
router.patch ("/progress/:id",              adminauthenticate, checkRole(ALL), GoalController.updateProgress);
router.put   ("/update/:id",                adminauthenticate, checkRole(MGR), GoalController.updateGoal);
router.delete("/delete/:id",                adminauthenticate, checkRole(MGR), GoalController.deleteGoal);

export default router;
