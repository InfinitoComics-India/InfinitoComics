import express from "express";
const router = express.Router();
import AuditLogController from "../controller/auditLog-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

// Audit logs — superadmin and hr_manager only (sensitive data)
const AUDIT_ROLES = ["superadmin", "hr_manager"];

// ── Get filtered logs with pagination ────────────────────────
// GET /hr/audit?entity=Employee&action=UPDATE&startDate=&endDate=&page=1&limit=50
router.get(
  "/",
  adminauthenticate,
  checkRole(AUDIT_ROLES),
  AuditLogController.getFilteredLogs
);

// ── Get all logs for a specific entity record ─────────────────
// GET /hr/audit/entity/:entity/:entityId
// Example: GET /hr/audit/entity/Employee/64abc123...
router.get(
  "/entity/:entity/:entityId",
  adminauthenticate,
  checkRole(AUDIT_ROLES),
  AuditLogController.getForEntity
);

// ── Get logs by the user who performed the action ─────────────
// GET /hr/audit/user/:userId
router.get(
  "/user/:userId",
  adminauthenticate,
  checkRole(AUDIT_ROLES),
  AuditLogController.getByUser
);

export default router;
