import express from "express";
import {
  submitQuery,
  getAllQueries,
  updateStatus,
  deleteQuery,
} from "../controller/contactQuery-controller.js";

const router = express.Router();

// Public — frontend form submission
router.post("/", submitQuery);

// Admin — read all (with filters)
router.get("/", getAllQueries);

// Admin — update status
router.patch("/:id/status", updateStatus);

// Admin — delete
router.delete("/:id", deleteQuery);

export default router;
