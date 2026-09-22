import SelfServiceRequestRepository from "../repository/selfServiceRequest-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";
import NotificationRepository from "../repository/notification-repository.js";
import EmployeeRepository from "../repository/employee-repository.js";

class SelfServiceService {
  constructor() {
    this.ssRepo           = new SelfServiceRequestRepository();
    this.auditRepo        = new AuditLogRepository();
    this.notificationRepo = new NotificationRepository();
    this.employeeRepo     = new EmployeeRepository();
  }

  async submitRequest(data, performedBy, performedByName) {
    try {
      const emp = await this.employeeRepo.getById(data.employeeId);
      const req = await this.ssRepo.create({ ...data, employeeName: emp ? `${emp.firstName} ${emp.lastName}` : "" });
      await this.auditRepo.create({ performedBy, performedByName, action: "CREATE", entity: "SelfServiceRequest", entityId: req._id, description: `Submitted ${req.type} request: "${req.subject}"` });
      // Notify HR managers
      const hrs = await this.employeeRepo.getByRole("hr_manager");
      for (const hr of hrs) {
        await this.notificationRepo.create({ recipientId: hr._id, recipientModel: "Employee", type: "system", title: `New ${req.type.replace(/_/g," ")} Request`, message: `${req.employeeName || "Employee"} submitted a request: "${req.subject}"`, link: "/hr/self-service", triggeredBy: performedBy });
      }
      return req;
    } catch (e) { console.error("SelfServiceService.submitRequest:", e); throw e; }
  }

  async getByEmployee(employeeId, status) {
    try { return await this.ssRepo.getByEmployee(employeeId, status); }
    catch (e) { console.error("SelfServiceService.getByEmployee:", e); throw e; }
  }

  async getAll(status) {
    try { return await this.ssRepo.getAll(status); }
    catch (e) { console.error("SelfServiceService.getAll:", e); throw e; }
  }

  async getOpen() {
    try { return await this.ssRepo.getOpen(); }
    catch (e) { console.error("SelfServiceService.getOpen:", e); throw e; }
  }

  async updateStatus(id, status, assignedTo, assignedToName, performedBy, performedByName) {
    try {
      const updated = await this.ssRepo.findByIdandUpdate(id, { status, ...(assignedTo ? { assignedTo, assignedToName } : {}) });
      await this.auditRepo.create({ performedBy, performedByName, action: "STATUS_CHANGE", entity: "SelfServiceRequest", entityId: id, description: `Request status → ${status}` });
      // Notify employee
      if (updated?.employeeId) {
        await this.notificationRepo.create({ recipientId: updated.employeeId, recipientModel: "Employee", type: "system", title: "Request Status Updated", message: `Your request "${updated.subject}" has been updated to: ${status}.`, link: "/hr/my-requests", triggeredBy: performedBy });
      }
      return updated;
    } catch (e) { console.error("SelfServiceService.updateStatus:", e); throw e; }
  }

  async resolve(id, resolution, performedBy, performedByName) {
    try {
      const updated = await this.ssRepo.resolve(id, resolution, performedBy);
      await this.auditRepo.create({ performedBy, performedByName, action: "UPDATE", entity: "SelfServiceRequest", entityId: id, description: `Resolved request: ${resolution.substring(0,80)}` });
      if (updated?.employeeId) {
        await this.notificationRepo.create({ recipientId: updated.employeeId, recipientModel: "Employee", type: "system", title: "Request Resolved ✅", message: `Your request "${updated.subject}" has been resolved. ${resolution}`, link: "/hr/my-requests", triggeredBy: performedBy });
      }
      return updated;
    } catch (e) { console.error("SelfServiceService.resolve:", e); throw e; }
  }

  async addComment(id, content, authorId, authorName) {
    try {
      return await this.ssRepo.addComment(id, { authorId, authorName, content, createdAt: new Date() });
    } catch (e) { console.error("SelfServiceService.addComment:", e); throw e; }
  }

  async getStats() {
    try { return await this.ssRepo.getStats(); }
    catch (e) { console.error("SelfServiceService.getStats:", e); throw e; }
  }
}

export default SelfServiceService;
