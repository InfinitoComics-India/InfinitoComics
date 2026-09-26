import express from "express";
const router = express.Router();
import SearchController from "../controller/search-controller.js";

// Public — no auth required for search
router.get("/", SearchController.globalSearch);

export default router;
