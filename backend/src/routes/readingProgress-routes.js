import express from "express";
const router = express.Router();
import ReadingProgressController from "../controller/readingProgress-controller.js";
import { authenticate } from "../middleware/auth.js";

router.get("/",                              authenticate, ReadingProgressController.getAllProgress);
router.get("/:comicId/:chapId",              authenticate, ReadingProgressController.getProgress);
router.post("/:comicId/:chapId",             authenticate, ReadingProgressController.saveProgress);

export default router;
