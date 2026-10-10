import express from "express";
const router = express.Router();
import PayrollController from "../controller/payroll-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const ALL = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin"];
const HR  = ["superadmin","hr_manager"];

router.post("/generate/:employeeId",  adminauthenticate, checkRole(HR),  PayrollController.generatePayslip);
router.post("/generate-all",          adminauthenticate, checkRole(HR),  PayrollController.generateForAll);
router.get ("/period",                adminauthenticate, checkRole(HR),  PayrollController.getForPeriod);
router.get ("/summary",               adminauthenticate, checkRole(HR),  PayrollController.getPeriodSummary);
router.get ("/employee/:employeeId",  adminauthenticate, checkRole(ALL), PayrollController.getForEmployee);
router.get ("/slip/:employeeId",      adminauthenticate, checkRole(ALL), PayrollController.getSlip);
router.patch("/approve/:id",          adminauthenticate, checkRole(HR),  PayrollController.approvePayslip);
router.patch("/paid/:id",             adminauthenticate, checkRole(HR),  PayrollController.markPaid);

export default router;
