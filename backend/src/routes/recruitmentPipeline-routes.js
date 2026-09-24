import express from "express";
const router = express.Router();
import RecruitmentPipelineController from "../controller/recruitmentPipeline-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const ALL = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin"];
const HR  = ["superadmin","hr_manager","manager"];

router.post  ("/add",                                   adminauthenticate, checkRole(HR),  RecruitmentPipelineController.addToPipeline);
router.get   ("/kanban",                                adminauthenticate, checkRole(ALL), RecruitmentPipelineController.getKanbanBoard);
router.get   ("/list",                                  adminauthenticate, checkRole(ALL), RecruitmentPipelineController.getByStage);
router.get   ("/stats",                                 adminauthenticate, checkRole(HR),  RecruitmentPipelineController.getStats);
router.patch ("/stage/:id",                             adminauthenticate, checkRole(HR),  RecruitmentPipelineController.moveStage);
router.put   ("/update/:id",                            adminauthenticate, checkRole(HR),  RecruitmentPipelineController.updateEntry);
router.post  ("/interview/:id",                         adminauthenticate, checkRole(HR),  RecruitmentPipelineController.addInterview);
router.put   ("/interview/:id/:interviewId",            adminauthenticate, checkRole(HR),  RecruitmentPipelineController.updateInterview);
router.delete("/delete/:id",                            adminauthenticate, checkRole(HR),  RecruitmentPipelineController.deleteEntry);

export default router;
