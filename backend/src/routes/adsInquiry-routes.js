import express from "express";
import {
  submitAdsInquiry,
  getAllAdsInquiries,
  updateInquiryStatus,
  deleteAdsInquiry,
  exportToExcel,
  exportToCSV,
} from "../controller/adsInquiry-controller.js";

const router = express.Router();

router.post("/", submitAdsInquiry);
router.get("/admin/all", getAllAdsInquiries);
router.patch("/admin/:id", updateInquiryStatus);
router.delete("/admin/:id", deleteAdsInquiry);

// Export routes
router.get("/admin/export/excel", exportToExcel);
router.get("/admin/export/csv", exportToCSV);

export default router;