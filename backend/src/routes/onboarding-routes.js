import express from "express";
const router = express.Router();
import OnboardingController from "../controller/onboarding-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const ALL = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin"];
const HR  = ["superadmin","hr_manager","manager"];

router.post("/initiate/:employeeId",   adminauthenticate, checkRole(HR),  OnboardingController.initiate);
router.get ("/active",                 adminauthenticate, checkRole(ALL), OnboardingController.getAllActive);
router.get ("/type/:type",             adminauthenticate, checkRole(ALL), OnboardingController.getByType);
router.get ("/employee/:employeeId",   adminauthenticate, checkRole(ALL), OnboardingController.getByEmployee);
router.patch("/toggle/:id",            adminauthenticate, checkRole(ALL), OnboardingController.toggleItem);
router.post ("/additem/:id",           adminauthenticate, checkRole(HR),  OnboardingController.addItem);
router.delete("/delete/:id",           adminauthenticate, checkRole(HR),  OnboardingController.deleteOnboarding);

export default router;
