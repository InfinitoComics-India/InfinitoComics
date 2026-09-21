import AuditLog from "../models/AuditLog.js";
import CrudRepository from "./crud-repository.js";

class AuditLogRepository extends CrudRepository {
  constructor() {
    super(AuditLog);
  }

  // Get logs with filters + pagination
  async getFiltered({ entity, action, performedBy, startDate, endDate, page = 1, limit = 50 }) {
    const filter = {};
    if (entity)      filter.entity = entity;
    if (action)      filter.action = action;
    if (performedBy) filter.performedBy = performedBy;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(filter),
    ]);

    return { logs, total, page, totalPages: Math.ceil(total / limit) };
  }

  // Get all logs for a specific entity (e.g. all changes to Employee EMP-001)
  async getForEntity(entity, entityId) {
    return await AuditLog.find({ entity, entityId }).sort({ createdAt: -1 });
  }

  // Get recent activity for a user
  async getByUser(performedBy, limit = 20) {
    return await AuditLog.find({ performedBy }).sort({ createdAt: -1 }).limit(limit);
  }

  // IMPORTANT: No update or delete methods — audit logs are append-only
  // Override base class methods to prevent misuse
  async findByIdandUpdate() {
    throw new Error("Audit logs cannot be modified.");
  }
  async findByIdandDelete() {
    throw new Error("Audit logs cannot be deleted.");
  }
}

export default AuditLogRepository;
