import express from "express";
const router = express.Router();
import SelfServiceController from "../controller/selfService-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const ALL = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin"];
const HR  = ["superadmin","hr_manager","manager"];

router.post  ("/submit",                    adminauthenticate, checkRole(ALL), SelfServiceController.submitRequest);
router.get   ("/all",                       adminauthenticate, checkRole(HR),  SelfServiceController.getAll);
router.get   ("/open",                      adminauthenticate, checkRole(HR),  SelfServiceController.getOpen);
router.get   ("/stats",                     adminauthenticate, checkRole(HR),  SelfServiceController.getStats);
router.get   ("/employee/:employeeId",      adminauthenticate, checkRole(ALL), SelfServiceController.getByEmployee);
router.patch ("/status/:id",               adminauthenticate, checkRole(HR),  SelfServiceController.updateStatus);
router.patch ("/resolve/:id",              adminauthenticate, checkRole(HR),  SelfServiceController.resolve);
router.post  ("/comment/:id",              adminauthenticate, checkRole(ALL), SelfServiceController.addComment);

export default router;
