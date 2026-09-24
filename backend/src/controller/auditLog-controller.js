import AuditLogService from "../services/auditLog-service.js";

const auditLogService = new AuditLogService();

// ── GET FILTERED LOGS ─────────────────────────────────────────
// GET /hr/audit?entity=Employee&action=UPDATE&page=1&limit=50
const getFilteredLogs = async (req, res) => {
  try {
    const { entity, action, performedBy, startDate, endDate, page, limit } = req.query;
    const result = await auditLogService.getFiltered({
      entity,
      action,
      performedBy,
      startDate,
      endDate,
      page:  parseInt(page)  || 1,
      limit: parseInt(limit) || 50,
    });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("getFilteredLogs:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET LOGS FOR A SPECIFIC RECORD ───────────────────────────
// GET /hr/audit/entity/:entity/:entityId
const getForEntity = async (req, res) => {
  try {
    const { entity, entityId } = req.params;
    const logs = await auditLogService.getForEntity(entity, entityId);
    res.status(200).json({ success: true, data: logs, count: logs.length });
  } catch (error) {
    console.error("getForEntity:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET LOGS BY USER ──────────────────────────────────────────
// GET /hr/audit/user/:userId
const getByUser = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const logs = await auditLogService.getByUser(req.params.userId, limit);
    res.status(200).json({ success: true, data: logs, count: logs.length });
  } catch (error) {
    console.error("getByUser:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getFilteredLogs,
  getForEntity,
  getByUser,
};
