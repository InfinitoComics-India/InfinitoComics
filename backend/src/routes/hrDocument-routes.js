import express from "express";
const router = express.Router();
import HRDocumentController from "../controller/hrDocument-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const ALL = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin"];
const HR  = ["superadmin","hr_manager"];

router.post  ("/upload",                adminauthenticate, checkRole(HR),  HRDocumentController.upload);
router.get   ("/expiring",              adminauthenticate, checkRole(HR),  HRDocumentController.getExpiring);
router.get   ("/all",                   adminauthenticate, checkRole(HR),  HRDocumentController.getAllForAdmin);
router.get   ("/employee/:employeeId",  adminauthenticate, checkRole(ALL), HRDocumentController.getByEmployee);
router.put   ("/update/:id",            adminauthenticate, checkRole(HR),  HRDocumentController.updateDocument);
router.delete("/delete/:id",            adminauthenticate, checkRole(HR),  HRDocumentController.deleteDocument);

export default router;
