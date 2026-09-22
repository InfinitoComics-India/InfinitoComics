import express from "express";
const router = express.Router();
import WikiController from "../controller/wiki-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const ALL = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin"];
const MGR = ["superadmin","hr_manager","manager","blog_admin"];

router.get   ("/published",        adminauthenticate, checkRole(ALL), WikiController.getPublished);
router.get   ("/popular",          adminauthenticate, checkRole(ALL), WikiController.getPopular);
router.get   ("/stats",            adminauthenticate, checkRole(MGR), WikiController.getCategoryStats);
router.get   ("/search",           adminauthenticate, checkRole(ALL), WikiController.searchArticles);
router.get   ("/all",              adminauthenticate, checkRole(MGR), WikiController.getAllArticles);
router.get   ("/slug/:slug",       adminauthenticate, checkRole(ALL), WikiController.getBySlug);
router.get   ("/:id",             adminauthenticate, checkRole(MGR), WikiController.getById);
router.post  ("/create",           adminauthenticate, checkRole(MGR), WikiController.createArticle);
router.put   ("/update/:id",       adminauthenticate, checkRole(MGR), WikiController.updateArticle);
router.delete("/delete/:id",       adminauthenticate, checkRole(MGR), WikiController.deleteArticle);
router.post  ("/vote/:id",         adminauthenticate, checkRole(ALL), WikiController.vote);

export default router;
