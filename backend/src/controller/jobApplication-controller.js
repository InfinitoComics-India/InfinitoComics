import JobApplicationService from "../services/jobApplication-service.js";
import ExcelJS from "exceljs";

const jobApplicationService = new JobApplicationService();

// POST /career/apply  — public, accepts multipart/form-data (resume file optional)
const submitApplication = async (req, res) => {
    try {
        const {
            jobId,
            jobTitle,
            department,
            jobType,
            fullName,
            email,
            phone,
            linkedin,
            portfolio,
            coverLetter,
        } = req.body;

        if (!fullName || !email || !jobTitle) {
            return res.status(400).json({
                success: false,
                message: "fullName, email, and jobTitle are required"
            });
        }

        const applicationData = {
            jobId: jobId || null,
            jobTitle,
            department: department || "",
            jobType: jobType || "",
            fullName,
            email,
            phone: phone || "",
            linkedin: linkedin || "",
            portfolio: portfolio || "",
            coverLetter: coverLetter || "",
            resumeFileName: req.file ? req.file.originalname : "",
            // resumeUrl can be filled later if you wire S3 upload
            resumeUrl: "",
        };

        const saved = await jobApplicationService.createApplication(applicationData);

        res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            data: saved
        });
    } catch (error) {
        console.error("Error submitting application:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// GET /career/applications  — admin: list all applications as JSON
const getAllApplications = async (req, res) => {
    try {
        const applications = await jobApplicationService.getAllApplications();
        res.status(200).json({
            success: true,
            data: applications
        });
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// GET /career/applications/export  — admin: stream Excel file
const exportApplicationsExcel = async (req, res) => {
    try {
        const applications = await jobApplicationService.getAllApplications();

        const workbook = new ExcelJS.Workbook();
        workbook.creator = "Infinito Comics Admin";
        workbook.created = new Date();

        const sheet = workbook.addWorksheet("Applications");

        // Column definitions
        sheet.columns = [
            { header: "S.No",         key: "sno",          width: 7  },
            { header: "Applied On",   key: "appliedAt",    width: 20 },
            { header: "Full Name",    key: "fullName",     width: 22 },
            { header: "Email",        key: "email",        width: 28 },
            { header: "Phone",        key: "phone",        width: 16 },
            { header: "Job Title",    key: "jobTitle",     width: 25 },
            { header: "Department",   key: "department",   width: 20 },
            { header: "Job Type",     key: "jobType",      width: 15 },
            { header: "LinkedIn",     key: "linkedin",     width: 35 },
            { header: "Portfolio",    key: "portfolio",    width: 35 },
            { header: "Resume File",  key: "resumeFile",   width: 30 },
            { header: "Cover Letter", key: "coverLetter",  width: 50 },
            { header: "Status",       key: "status",       width: 14 },
        ];

        // Style header row
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
        headerRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDD1215" }  // Infinito red
        };
        headerRow.alignment = { vertical: "middle", horizontal: "center" };
        headerRow.height = 22;

        // Populate rows
        applications.forEach((app, index) => {
            const row = sheet.addRow({
                sno:         index + 1,
                appliedAt:   app.createdAt ? new Date(app.createdAt).toLocaleString("en-IN") : "",
                fullName:    app.fullName,
                email:       app.email,
                phone:       app.phone || "",
                jobTitle:    app.jobTitle,
                department:  app.department || "",
                jobType:     app.jobType || "",
                linkedin:    app.linkedin || "",
                portfolio:   app.portfolio || "",
                resumeFile:  app.resumeFileName || "",
                coverLetter: app.coverLetter || "",
                status:      app.status || "pending",
            });

            // Zebra striping
            if (index % 2 === 1) {
                row.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFF5F5F5" }
                };
            }

            row.alignment = { vertical: "middle", wrapText: false };
        });

        // Auto-filter on header row
        sheet.autoFilter = {
            from: { row: 1, column: 1 },
            to:   { row: 1, column: sheet.columns.length }
        };

        // Freeze header row
        sheet.views = [{ state: "frozen", ySplit: 1 }];

        const filename = `career-applications-${Date.now()}.xlsx`;

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Error exporting applications:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate Excel file",
            error: error.message
        });
    }
};

// DELETE /career/applications/:id  — admin: remove a single application
const deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await jobApplicationService.deleteApplication(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }
        res.status(200).json({ success: true, message: "Application deleted successfully" });
    } catch (error) {
        console.error("Error deleting application:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export default {
    submitApplication,
    getAllApplications,
    exportApplicationsExcel,
    deleteApplication,
};
