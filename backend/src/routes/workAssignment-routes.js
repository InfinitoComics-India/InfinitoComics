import express from "express";
const router = express.Router();
import WorkAssignmentController from "../controller/workAssignment-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const ALL = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin"];
const MGR = ["superadmin","hr_manager","manager"];

router.post  ("/assign",                    adminauthenticate, checkRole(MGR), WorkAssignmentController.assign);
router.get   ("/workload",                  adminauthenticate, checkRole(MGR), WorkAssignmentController.getWorkload);
router.get   ("/employee/:employeeId",      adminauthenticate, checkRole(ALL), WorkAssignmentController.getByEmployee);
router.get   ("/project/:projectId",        adminauthenticate, checkRole(ALL), WorkAssignmentController.getByProject);
router.put   ("/update/:id",                adminauthenticate, checkRole(MGR), WorkAssignmentController.updateAssignment);
router.delete("/remove/:id",                adminauthenticate, checkRole(MGR), WorkAssignmentController.removeAssignment);

export default router;
