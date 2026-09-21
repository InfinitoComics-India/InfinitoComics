import express from "express";
const router = express.Router();
import LeaveController from "../controller/leave-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const HR_ALL    = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin"];
const HR_MANAGE = ["superadmin","hr_manager","manager"];

// POST apply for leave
router.post("/apply",                         adminauthenticate, checkRole(HR_ALL),    LeaveController.applyLeave);

// GET pending leave queue (approval screen)
router.get("/pending",                        adminauthenticate, checkRole(HR_MANAGE), LeaveController.getPending);

// GET all leaves for one employee   ?status=
router.get("/employee/:employeeId",           adminauthenticate, checkRole(HR_ALL),    LeaveController.getByEmployee);

// GET leave balance for one employee
router.get("/balance/:employeeId",            adminauthenticate, checkRole(HR_ALL),    LeaveController.getBalance);

// PATCH approve
router.patch("/approve/:id",                  adminauthenticate, checkRole(HR_MANAGE), LeaveController.approveLeave);

// PATCH reject
router.patch("/reject/:id",                   adminauthenticate, checkRole(HR_MANAGE), LeaveController.rejectLeave);

// PATCH cancel (employee can cancel their own)
router.patch("/cancel/:id",                   adminauthenticate, checkRole(HR_ALL),    LeaveController.cancelLeave);

export default router;
