import express from "express";
const router = express.Router();
import AttendanceController from "../controller/attendance-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const HR_ALL   = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin"];
const HR_MANAGE = ["superadmin","hr_manager","manager"];

// GET today's attendance for all employees
router.get("/today",                    adminauthenticate, checkRole(HR_ALL),    AttendanceController.getTodayAll);

// GET today's attendance for one employee
router.get("/today/:employeeId",        adminauthenticate, checkRole(HR_ALL),    AttendanceController.getTodayForEmployee);

// GET monthly records for one employee  ?year=&month=
router.get("/monthly/:employeeId",      adminauthenticate, checkRole(HR_ALL),    AttendanceController.getMonthly);

// GET monthly summary all employees     ?year=&month=
router.get("/summary",                  adminauthenticate, checkRole(HR_MANAGE), AttendanceController.getMonthlySummary);

// POST clock in
router.post("/clockin/:employeeId",     adminauthenticate, checkRole(HR_ALL),    AttendanceController.clockIn);

// POST clock out
router.post("/clockout/:employeeId",    adminauthenticate, checkRole(HR_ALL),    AttendanceController.clockOut);

// PATCH manual mark (HR/manager only)
router.patch("/mark/:employeeId",       adminauthenticate, checkRole(HR_MANAGE), AttendanceController.markAttendance);

export default router;
