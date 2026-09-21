import ProjectRepository from "../repository/project-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";
import NotificationRepository from "../repository/notification-repository.js";
import CalendarEventRepository from "../repository/calendarEvent-repository.js";

class ProjectService {
  constructor() {
    this.projectRepo      = new ProjectRepository();
    this.auditRepo        = new AuditLogRepository();
    this.notificationRepo = new NotificationRepository();
    this.calendarRepo     = new CalendarEventRepository();
  }

  async createProject(data, performedBy, performedByName) {
    try {
      const project = await this.projectRepo.create({ ...data, createdBy: performedBy });
      await this.auditRepo.create({ performedBy, performedByName, action: "CREATE", entity: "Project", entityId: project._id, entityLabel: project.projectId, description: `Created project "${project.name}"` });
      // Add deadline to calendar if endDate set
      if (data.endDate) {
        await this.calendarRepo.create({ title: `${project.name} — Deadline`, type: "deadline", startDate: new Date(data.endDate), endDate: new Date(data.endDate), isAllDay: true, isCompanyWide: false, participants: data.teamMembers || [], createdBy: performedBy, relatedEntity: "Project", relatedEntityId: project._id });
      }
      return project;
    } catch (e) { console.error("ProjectService.createProject:", e); throw e; }
  }

  async getAllProjects(filters = {}) {
    try {
      if (filters.employeeId) return await this.projectRepo.getByEmployee(filters.employeeId);
      return await this.projectRepo.getAllActive();
    } catch (e) { console.error("ProjectService.getAllProjects:", e); throw e; }
  }

  async getProjectDetail(id) {
    try {
      const project = await this.projectRepo.getDetail(id);
      if (!project) throw new Error("Project not found.");
      return project;
    } catch (e) { console.error("ProjectService.getProjectDetail:", e); throw e; }
  }

  async updateProject(id, data, performedBy, performedByName) {
    try {
      const before = await this.projectRepo.getById(id);
      if (!before) throw new Error("Project not found.");
      const updated = await this.projectRepo.findByIdandUpdate(id, data);
      await this.auditRepo.create({ performedBy, performedByName, action: "UPDATE", entity: "Project", entityId: id, entityLabel: before.projectId, description: `Updated project "${before.name}"` });
      return updated;
    } catch (e) { console.error("ProjectService.updateProject:", e); throw e; }
  }

  async addMilestone(id, milestone, performedBy, performedByName) {
    try {
      const updated = await this.projectRepo.findByIdandUpdate(id, { $push: { milestones: milestone } });
      await this.auditRepo.create({ performedBy, performedByName, action: "UPDATE", entity: "Project", entityId: id, description: `Added milestone "${milestone.title}"` });
      return updated;
    } catch (e) { console.error("ProjectService.addMilestone:", e); throw e; }
  }

  async updateMilestone(projectId, milestoneId, data, performedBy, performedByName) {
    try {
      const updated = await this.projectRepo.updateMilestone(projectId, milestoneId, data);
      await this.auditRepo.create({ performedBy, performedByName, action: "UPDATE", entity: "Project", entityId: projectId, description: `Updated milestone "${data.title}"` });
      return updated;
    } catch (e) { console.error("ProjectService.updateMilestone:", e); throw e; }
  }

  async deleteProject(id, performedBy, performedByName) {
    try {
      const project = await this.projectRepo.getById(id);
      if (!project) throw new Error("Project not found.");
      await this.projectRepo.findByIdandDelete(id);
      await this.auditRepo.create({ performedBy, performedByName, action: "DELETE", entity: "Project", entityId: id, entityLabel: project.projectId, description: `Deleted project "${project.name}"` });
      return { success: true };
    } catch (e) { console.error("ProjectService.deleteProject:", e); throw e; }
  }

  async getStats() {
    try { return await this.projectRepo.getStats(); }
    catch (e) { console.error("ProjectService.getStats:", e); throw e; }
  }
}

export default ProjectService;
