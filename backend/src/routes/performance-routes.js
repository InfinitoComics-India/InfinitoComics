import express from "express";
const router = express.Router();
import PerformanceController from "../controller/performance-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const ALL = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin"];
const MGR = ["superadmin","hr_manager","manager"];

router.post  ("/generate/:employeeId",        adminauthenticate, checkRole(MGR), PerformanceController.generate);
router.get   ("/top",                         adminauthenticate, checkRole(MGR), PerformanceController.getTopPerformers);
router.get   ("/all",                         adminauthenticate, checkRole(MGR), PerformanceController.getAllForPeriod);
router.get   ("/trend/:employeeId",           adminauthenticate, checkRole(ALL), PerformanceController.getTrend);
router.get   ("/:employeeId",                 adminauthenticate, checkRole(ALL), PerformanceController.getForEmployee);
router.get   ("/:employeeId/period",          adminauthenticate, checkRole(ALL), PerformanceController.getForPeriod);
router.post  ("/score/:employeeId",           adminauthenticate, checkRole(MGR), PerformanceController.addManagerScore);

export default router;
