import express from "express";
const router = express.Router();
import DailyWorkLogController from "../controller/dailyWorkLog-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const ALL = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin"];
const HR  = ["superadmin","hr_manager","manager"];

// Employee submits/updates their own work log for today
router.post  ("/submit",                    adminauthenticate, checkRole(ALL), DailyWorkLogController.submitWorkLog);

// Employee gets their own today's log
router.get   ("/today/:employeeId",         adminauthenticate, checkRole(ALL), DailyWorkLogController.getTodayLog);

// Employee gets their own history
router.get   ("/history/:employeeId",       adminauthenticate, checkRole(ALL), DailyWorkLogController.getLogsForEmployee);

// Admin views all logs for a specific date  ?date=YYYY-MM-DD
router.get   ("/date",                      adminauthenticate, checkRole(HR),  DailyWorkLogController.getLogsForDate);

// Admin gets summary stats for a date
router.get   ("/summary",                   adminauthenticate, checkRole(HR),  DailyWorkLogController.getSummaryForDate);

// Manual trigger for midnight cron (admin only — for testing)
router.post  ("/run-cron",                  adminauthenticate, checkRole(["superadmin"]), DailyWorkLogController.runMidnightCron);

export default router;
