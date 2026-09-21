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

export default router;
