import express from "express";
const router = express.Router();
import SalaryController from "../controller/salary-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const ALL = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin"];
const HR  = ["superadmin","hr_manager"];

router.post("/set/:employeeId",       adminauthenticate, checkRole(HR),  SalaryController.setSalary);
router.get ("/getall",                adminauthenticate, checkRole(HR),  SalaryController.getAll);
router.get ("/employee/:employeeId",  adminauthenticate, checkRole(ALL), SalaryController.getByEmployee);

export default router;
