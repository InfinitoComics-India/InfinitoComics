import AuditLogRepository from "../repository/auditLog-repository.js";

class AuditLogService {
  constructor() {
    this.auditRepo = new AuditLogRepository();
  }

  // ── Write a log entry (called internally by other services) ──
  async log({ performedBy, performedByModel = "Admin", performedByName, action, entity, entityId, entityLabel, oldValue, newValue, description, ipAddress, userAgent }) {
    try {
      return await this.auditRepo.create({
        performedBy,
        performedByModel,
        performedByName,
        action,
        entity,
        entityId,
        entityLabel,
        oldValue,
        newValue,
        description,
        ipAddress,
        userAgent,
      });
    } catch (error) {
      // Audit logging must never crash the main operation
      console.error("AuditLogService.log (non-fatal):", error);
    }
  }

  // ── Get filtered logs with pagination ─────────────────────
  async getFiltered(filters) {
    try {
      return await this.auditRepo.getFiltered(filters);
    } catch (error) {
      console.error("AuditLogService.getFiltered:", error);
      throw error;
    }
  }

  // ── Get all logs for a specific record ────────────────────
  async getForEntity(entity, entityId) {
    try {
      return await this.auditRepo.getForEntity(entity, entityId);
    } catch (error) {
      console.error("AuditLogService.getForEntity:", error);
      throw error;
    }
  }

  // ── Get recent activity for a user ───────────────────────
  async getByUser(performedBy, limit = 20) {
    try {
      return await this.auditRepo.getByUser(performedBy, limit);
    } catch (error) {
      console.error("AuditLogService.getByUser:", error);
      throw error;
    }
  }
}

export default AuditLogService;
