import express from "express";
import multer from "multer";
import JobApplicationController from "../controller/jobApplication-controller.js";

const router = express.Router();

// Resume stored in memory (max 5 MB); swap for S3 upload middleware when ready
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ["application/pdf",
                         "application/msword",
                         "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        cb(null, allowed.includes(file.mimetype));
    }
});

// Public — candidate submits application
router.post("/apply", upload.single("resume"), JobApplicationController.submitApplication);

// Admin — list all applications (JSON)
router.get("/applications", JobApplicationController.getAllApplications);

// Admin — download all applications as Excel
router.get("/applications/export", JobApplicationController.exportApplicationsExcel);

// Admin — delete a single application
router.delete("/applications/:id", JobApplicationController.deleteApplication);

export default router;
