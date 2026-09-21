import EmployeeRepository from "../repository/employee-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";
import NotificationRepository from "../repository/notification-repository.js";

class EmployeeService {
  constructor() {
    this.employeeRepo     = new EmployeeRepository();
    this.auditRepo        = new AuditLogRepository();
    this.notificationRepo = new NotificationRepository();
  }

  // ── Create ────────────────────────────────────────────────
  async createEmployee(data, performedBy, performedByName) {
    try {
      // Check duplicate email
      const existing = await this.employeeRepo.findByEmail(data.email);
      if (existing) throw new Error("An employee with this email already exists.");

      const employee = await this.employeeRepo.create(data);

      // Audit log
      await this.auditRepo.create({
        performedBy,
        performedByModel: "Admin",
        performedByName,
        action: "CREATE",
        entity: "Employee",
        entityId: employee._id,
        entityLabel: `${employee.firstName} ${employee.lastName}`,
        description: `Created employee ${employee.employeeId} — ${employee.firstName} ${employee.lastName}`,
      });

      // Welcome notification
      await this.notificationRepo.create({
        recipientId:    employee._id,
        recipientModel: "Employee",
        type:           "system",
        title:          "Welcome to InfinitoComics!",
        message:        `Hi ${employee.firstName}, your employee account has been created. Welcome aboard!`,
        link:           "/hr/employees",
      });

      return employee;
    } catch (error) {
      console.error("EmployeeService.createEmployee:", error);
      throw error;
    }
  }

  // ── Get All ───────────────────────────────────────────────
  async getAllEmployees(filters = {}) {
    try {
      if (filters.search) return await this.employeeRepo.search(filters.search);
      if (filters.department) return await this.employeeRepo.getByDepartment(filters.department);
      if (filters.hrRole) return await this.employeeRepo.getByRole(filters.hrRole);
      if (filters.all) return await this.employeeRepo.getAll();
      return await this.employeeRepo.getAllActive();
    } catch (error) {
      console.error("EmployeeService.getAllEmployees:", error);
      throw error;
    }
  }

  // ── Get One ───────────────────────────────────────────────
  async getEmployeeById(id) {
    try {
      const emp = await this.employeeRepo.getById(id);
      if (!emp) throw new Error("Employee not found.");
      return emp;
    } catch (error) {
      console.error("EmployeeService.getEmployeeById:", error);
      throw error;
    }
  }

  // ── Update ────────────────────────────────────────────────
  async updateEmployee(id, data, performedBy, performedByName) {
    try {
      const before = await this.employeeRepo.getById(id);
      if (!before) throw new Error("Employee not found.");

      const updated = await this.employeeRepo.findByIdandUpdate(id, data);

      // Audit log — capture what changed
      const changedFields = Object.keys(data).join(", ");
      await this.auditRepo.create({
        performedBy,
        performedByModel: "Admin",
        performedByName,
        action: "UPDATE",
        entity: "Employee",
        entityId: id,
        entityLabel: `${before.firstName} ${before.lastName}`,
        oldValue: before.toObject(),
        newValue: data,
        description: `Updated fields: ${changedFields} for ${before.employeeId}`,
      });

      return updated;
    } catch (error) {
      console.error("EmployeeService.updateEmployee:", error);
      throw error;
    }
  }

  // ── Change Status (activate / deactivate / terminate) ─────
  async changeStatus(id, newStatus, performedBy, performedByName) {
    try {
      const emp = await this.employeeRepo.getById(id);
      if (!emp) throw new Error("Employee not found.");

      const updated = await this.employeeRepo.findByIdandUpdate(id, {
        status: newStatus,
        ...(newStatus === "terminated" ? { endDate: new Date() } : {}),
      });

      await this.auditRepo.create({
        performedBy,
        performedByModel: "Admin",
        performedByName,
        action: "STATUS_CHANGE",
        entity: "Employee",
        entityId: id,
        entityLabel: `${emp.firstName} ${emp.lastName}`,
        oldValue: { status: emp.status },
        newValue: { status: newStatus },
        description: `Status changed from ${emp.status} to ${newStatus} for ${emp.employeeId}`,
      });

      return updated;
    } catch (error) {
      console.error("EmployeeService.changeStatus:", error);
      throw error;
    }
  }

  // ── Change HR Role ────────────────────────────────────────
  async changeRole(id, newRole, performedBy, performedByName) {
    try {
      const emp = await this.employeeRepo.getById(id);
      if (!emp) throw new Error("Employee not found.");

      const updated = await this.employeeRepo.findByIdandUpdate(id, { hrRole: newRole });

      await this.auditRepo.create({
        performedBy,
        performedByModel: "Admin",
        performedByName,
        action: "ROLE_CHANGE",
        entity: "Employee",
        entityId: id,
        entityLabel: `${emp.firstName} ${emp.lastName}`,
        oldValue: { hrRole: emp.hrRole },
        newValue: { hrRole: newRole },
        description: `HR role changed from ${emp.hrRole} to ${newRole} for ${emp.employeeId}`,
      });

      // Notify employee
      await this.notificationRepo.create({
        recipientId:    emp._id,
        recipientModel: "Employee",
        type:           "system",
        title:          "Your role has been updated",
        message:        `Your role has been changed to ${newRole}.`,
        link:           "/hr/profile",
      });

      return updated;
    } catch (error) {
      console.error("EmployeeService.changeRole:", error);
      throw error;
    }
  }

  // ── Delete (hard delete — admin only, use carefully) ──────
  async deleteEmployee(id, performedBy, performedByName) {
    try {
      const emp = await this.employeeRepo.getById(id);
      if (!emp) throw new Error("Employee not found.");

      await this.employeeRepo.findByIdandDelete(id);

      await this.auditRepo.create({
        performedBy,
        performedByModel: "Admin",
        performedByName,
        action: "DELETE",
        entity: "Employee",
        entityId: id,
        entityLabel: `${emp.firstName} ${emp.lastName}`,
        oldValue: emp.toObject(),
        description: `Deleted employee ${emp.employeeId} — ${emp.firstName} ${emp.lastName}`,
      });

      return { success: true };
    } catch (error) {
      console.error("EmployeeService.deleteEmployee:", error);
      throw error;
    }
  }

  // ── Get Direct Reports ────────────────────────────────────
  async getDirectReports(managerId) {
    try {
      return await this.employeeRepo.getDirectReports(managerId);
    } catch (error) {
      console.error("EmployeeService.getDirectReports:", error);
      throw error;
    }
  }
}

export default EmployeeService;
