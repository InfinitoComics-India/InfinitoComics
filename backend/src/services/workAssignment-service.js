import WorkAssignmentRepository from "../repository/workAssignment-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";
import NotificationRepository from "../repository/notification-repository.js";
import ProjectRepository from "../repository/project-repository.js";
import EmployeeRepository from "../repository/employee-repository.js";

class WorkAssignmentService {
  constructor() {
    this.waRepo           = new WorkAssignmentRepository();
    this.auditRepo        = new AuditLogRepository();
    this.notificationRepo = new NotificationRepository();
    this.projectRepo      = new ProjectRepository();
    this.employeeRepo     = new EmployeeRepository();
  }

  async assign(data, performedBy, performedByName) {
    try {
      const { employeeId, projectId, role, startDate, endDate, hoursPerWeek, allocatedPercent, note } = data;
      // Check existing
      const existing = await this.waRepo.findExisting(employeeId, projectId);
      if (existing) throw new Error("Employee is already assigned to this project.");
      // Check over-allocation
      const currentAssignments = await this.waRepo.getByEmployee(employeeId);
      if (currentAssignments.length >= 5) throw new Error("Employee is already assigned to 5 active projects. Consider reassigning.");

      const assignment = await this.waRepo.create({ employeeId, projectId, role: role || "contributor", startDate, endDate, hoursPerWeek: hoursPerWeek || 40, allocatedPercent: allocatedPercent || 100, note: note || "", assignedBy: performedBy, status: "active" });

      // Also add to project teamMembers
      await this.projectRepo.addTeamMember(projectId, employeeId);

      await this.auditRepo.create({ performedBy, performedByName, action: "ASSIGN", entity: "WorkAssignment", entityId: assignment._id, description: `Assigned employee to project as ${role || "contributor"}` });

      const project = await this.projectRepo.getById(projectId);
      const employee = await this.employeeRepo.getById(employeeId);
      await this.notificationRepo.create({ recipientId: employeeId, recipientModel: "Employee", type: "task_assigned", title: "Assigned to Project", message: `You have been assigned to project "${project?.name}" as ${role || "contributor"}.`, link: "/hr/projects", triggeredBy: performedBy });

      return assignment;
    } catch (e) { console.error("WorkAssignmentService.assign:", e); throw e; }
  }

  async getByEmployee(employeeId) {
    try { return await this.waRepo.getByEmployee(employeeId); }
    catch (e) { console.error("WorkAssignmentService.getByEmployee:", e); throw e; }
  }

  async getByProject(projectId) {
    try { return await this.waRepo.getByProject(projectId); }
    catch (e) { console.error("WorkAssignmentService.getByProject:", e); throw e; }
  }

  async getWorkloadSummary() {
    try { return await this.waRepo.getWorkloadSummary(); }
    catch (e) { console.error("WorkAssignmentService.getWorkloadSummary:", e); throw e; }
  }

  async updateAssignment(id, data, performedBy, performedByName) {
    try {
      const updated = await this.waRepo.findByIdandUpdate(id, data);
      await this.auditRepo.create({ performedBy, performedByName, action: "UPDATE", entity: "WorkAssignment", entityId: id, description: `Updated work assignment` });
      return updated;
    } catch (e) { console.error("WorkAssignmentService.updateAssignment:", e); throw e; }
  }

  async removeAssignment(id, performedBy, performedByName) {
    try {
      const wa = await this.waRepo.getById(id);
      if (!wa) throw new Error("Assignment not found.");
      await this.waRepo.findByIdandDelete(id);
      await this.projectRepo.removeTeamMember(wa.projectId, wa.employeeId);
      await this.auditRepo.create({ performedBy, performedByName, action: "UNASSIGN", entity: "WorkAssignment", entityId: id, description: `Removed employee from project` });
      return { success: true };
    } catch (e) { console.error("WorkAssignmentService.removeAssignment:", e); throw e; }
  }
}

export default WorkAssignmentService;
