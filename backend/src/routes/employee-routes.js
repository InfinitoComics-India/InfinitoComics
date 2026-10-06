import express from "express";
const router = express.Router();
import EmployeeController from "../controller/employee-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

// Roles allowed to manage employees
const HR_ROLES    = ["superadmin", "hr_manager"];
const ALL_ADMINS  = ["superadmin", "hr_manager", "manager", "team_lead",
                     "comics_admin", "character_admin", "research_admin",
                     "blog_admin", "career_admin"];

// ── Create employee — HR + superadmin only ────────────────────
router.post(
  "/create",
  adminauthenticate,
  checkRole(HR_ROLES),
  EmployeeController.createEmployee
);

// ── Get all employees — all admins can view ───────────────────
router.get(
  "/getall",
  adminauthenticate,
  checkRole(ALL_ADMINS),
  EmployeeController.getAllEmployees
);

// ── Get one employee by ID ────────────────────────────────────
router.get(
  "/get/:id",
  adminauthenticate,
  checkRole(ALL_ADMINS),
  EmployeeController.getEmployeeById
);

// ── Get direct reports of a manager ──────────────────────────
router.get(
  "/reports/:id",
  adminauthenticate,
  checkRole(ALL_ADMINS),
  EmployeeController.getDirectReports
);

// ── Update employee details — HR + superadmin ─────────────────
router.put(
  "/update/:id",
  adminauthenticate,
  checkRole(HR_ROLES),
  EmployeeController.updateEmployee
);

// ── Change status (active/inactive/terminated) ────────────────
router.patch(
  "/status/:id",
  adminauthenticate,
  checkRole(HR_ROLES),
  EmployeeController.changeStatus
);

// ── Change HR role — superadmin only ─────────────────────────
router.patch(
  "/role/:id",
  adminauthenticate,
  checkRole(["superadmin"]),
  EmployeeController.changeRole
);

// ── Delete employee — superadmin only ────────────────────────
router.delete(
  "/delete/:id",
  adminauthenticate,
  checkRole(["superadmin"]),
  EmployeeController.deleteEmployee
);

// ── Employee self-update (bank details + personal info) ──────
// Any authenticated user can update their OWN employee record
router.patch(
  "/me/profile",
  adminauthenticate,
  checkRole([...ALL_ADMINS, "employee"]),
  async (req, res) => {
    try {
      const Employee = (await import('../models/Employee.js')).default;
      // Find employee by their admin account email
      const emp = await Employee.findOne({ email: req.user.email });
      if (!emp) return res.status(404).json({ success: false, message: "Employee record not found." });

      // Only allow safe self-update fields
      const allowed = ["phone","dateOfBirth","gender","address","emergencyContact","bankName","accountNumber","ifscCode","accountHolder"];
      const update  = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) update[key] = req.body[key];
      }

      const updated = await Employee.findByIdAndUpdate(emp._id, { $set: update }, { new: true });
      res.status(200).json({ success: true, message: "Profile updated.", data: updated });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
);

// ── Get my own employee profile ───────────────────────────────
router.get(
  "/me/profile",
  adminauthenticate,
  checkRole([...ALL_ADMINS, "employee"]),
  async (req, res) => {
    try {
      const Employee = (await import('../models/Employee.js')).default;
      const emp = await Employee.findOne({ email: req.user.email });
      if (!emp) return res.status(404).json({ success: false, message: "Employee record not found." });
      res.status(200).json({ success: true, data: emp });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
);

export default router;
