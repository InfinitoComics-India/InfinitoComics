import express from "express";
const router = express.Router();
import DailyWorkLogController from "../controller/dailyWorkLog-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const ALL = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin","shop_admin","employee","shop_admin"];
const MGR = ["superadmin","hr_manager","manager"];

// ── Employee actions (uses req.user — auto from JWT) ──────────
router.post  ("/submit",          adminauthenticate, checkRole(ALL), DailyWorkLogController.submitWorkLog);
router.get   ("/my/today",        adminauthenticate, checkRole(ALL), DailyWorkLogController.getMyTodayLog);
router.get   ("/my/history",      adminauthenticate, checkRole(ALL), DailyWorkLogController.getMyHistory);

// ── Manager/Admin review actions ──────────────────────────────
router.get   ("/date",            adminauthenticate, checkRole(MGR), DailyWorkLogController.getLogsForDate);
router.get   ("/summary",         adminauthenticate, checkRole(MGR), DailyWorkLogController.getSummaryForDate);
router.patch ("/review/:id",      adminauthenticate, checkRole(MGR), DailyWorkLogController.reviewLog);
router.patch ("/override/:id",    adminauthenticate, checkRole(["superadmin"]), DailyWorkLogController.overrideStatus);
router.post  ("/run-cron",        adminauthenticate, checkRole(["superadmin"]), DailyWorkLogController.runMidnightCron);

export default router;
