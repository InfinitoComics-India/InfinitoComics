import express from "express";
const router = express.Router();
import TaskController from "../controller/task-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const ALL   = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin"];
const MGR   = ["superadmin","hr_manager","manager","team_lead"];

router.post  ("/create",                    adminauthenticate, checkRole(MGR), TaskController.createTask);
router.get   ("/kanban",                    adminauthenticate, checkRole(ALL), TaskController.getKanbanBoard);
router.get   ("/overdue",                   adminauthenticate, checkRole(MGR), TaskController.getOverdue);
router.get   ("/employee/:employeeId",      adminauthenticate, checkRole(ALL), TaskController.getByEmployee);
router.get   ("/project/:projectId",        adminauthenticate, checkRole(ALL), TaskController.getByProject);
router.get   ("/metrics/:employeeId",       adminauthenticate, checkRole(MGR), TaskController.getMetrics);
router.get   ("/:id",                       adminauthenticate, checkRole(ALL), TaskController.getById);
router.put   ("/update/:id",                adminauthenticate, checkRole(MGR), TaskController.updateTask);
router.patch ("/status/:id",                adminauthenticate, checkRole(ALL), TaskController.moveStatus);
router.post  ("/comment/:id",               adminauthenticate, checkRole(ALL), TaskController.addComment);
router.delete("/delete/:id",                adminauthenticate, checkRole(MGR), TaskController.deleteTask);

export default router;
