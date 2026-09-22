import RecruitmentPipelineRepository from "../repository/recruitmentPipeline-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";
import NotificationRepository from "../repository/notification-repository.js";
import EmployeeRepository from "../repository/employee-repository.js";

class RecruitmentPipelineService {
  constructor() {
    this.pipelineRepo     = new RecruitmentPipelineRepository();
    this.auditRepo        = new AuditLogRepository();
    this.notificationRepo = new NotificationRepository();
    this.employeeRepo     = new EmployeeRepository();
  }

  async addToPipeline(data, performedBy, performedByName) {
    try {
      const existing = await this.pipelineRepo.findByApplication(data.applicationId);
      if (existing) return existing; // idempotent
      const entry = await this.pipelineRepo.create({ ...data, createdBy: performedBy, stageHistory: [{ stage: "applied", movedBy: performedBy, movedAt: new Date() }] });
      await this.auditRepo.create({ performedBy, performedByName, action: "CREATE", entity: "RecruitmentPipeline", entityId: entry._id, description: `Added ${data.candidateName} to recruitment pipeline for ${data.jobTitle}` });
      return entry;
    } catch (e) { console.error("RecruitmentPipelineService.addToPipeline:", e); throw e; }
  }

  async getKanbanBoard() {
    try { return await this.pipelineRepo.getKanbanBoard(); }
    catch (e) { console.error("RecruitmentPipelineService.getKanbanBoard:", e); throw e; }
  }

  async getByStage(stage) {
    try { return await this.pipelineRepo.getByStage(stage); }
    catch (e) { console.error("RecruitmentPipelineService.getByStage:", e); throw e; }
  }

  async moveStage(id, newStage, note, performedBy, performedByName) {
    try {
      const entry = await this.pipelineRepo.getById(id);
      if (!entry) throw new Error("Pipeline entry not found.");
      const updated = await this.pipelineRepo.moveStage(id, newStage, performedBy, note);
      await this.auditRepo.create({ performedBy, performedByName, action: "STATUS_CHANGE", entity: "RecruitmentPipeline", entityId: id, oldValue: { stage: entry.stage }, newValue: { stage: newStage }, description: `${entry.candidateName} moved from ${entry.stage} → ${newStage}. ${note||""}` });

      // If hired → notify HR to create employee record
      if (newStage === "hired") {
        const hrs = await this.employeeRepo.getByRole("hr_manager");
        for (const hr of hrs) {
          await this.notificationRepo.create({ recipientId: hr._id, recipientModel: "Employee", type: "system", title: "Candidate Hired!", message: `${entry.candidateName} has been marked as hired for "${entry.jobTitle}". Please create their employee record.`, link: "/hr/recruitment", triggeredBy: performedBy });
        }
      }
      return updated;
    } catch (e) { console.error("RecruitmentPipelineService.moveStage:", e); throw e; }
  }

  async addInterview(id, interview, performedBy, performedByName) {
    try {
      const updated = await this.pipelineRepo.addInterview(id, interview);
      await this.auditRepo.create({ performedBy, performedByName, action: "UPDATE", entity: "RecruitmentPipeline", entityId: id, description: `Scheduled ${interview.type} interview round ${interview.round}` });
      return updated;
    } catch (e) { console.error("RecruitmentPipelineService.addInterview:", e); throw e; }
  }

  async updateInterview(pipelineId, interviewId, data, performedBy, performedByName) {
    try {
      const updated = await this.pipelineRepo.updateInterview(pipelineId, interviewId, data);
      await this.auditRepo.create({ performedBy, performedByName, action: "UPDATE", entity: "RecruitmentPipeline", entityId: pipelineId, description: `Updated interview result: ${data.result}` });
      return updated;
    } catch (e) { console.error("RecruitmentPipelineService.updateInterview:", e); throw e; }
  }

  async updateEntry(id, data, performedBy, performedByName) {
    try {
      const updated = await this.pipelineRepo.findByIdandUpdate(id, data);
      await this.auditRepo.create({ performedBy, performedByName, action: "UPDATE", entity: "RecruitmentPipeline", entityId: id, description: "Updated pipeline entry" });
      return updated;
    } catch (e) { console.error("RecruitmentPipelineService.updateEntry:", e); throw e; }
  }

  async getStats() {
    try { return await this.pipelineRepo.getStats(); }
    catch (e) { console.error("RecruitmentPipelineService.getStats:", e); throw e; }
  }

  async deleteEntry(id, performedBy, performedByName) {
    try {
      await this.pipelineRepo.findByIdandDelete(id);
      await this.auditRepo.create({ performedBy, performedByName, action: "DELETE", entity: "RecruitmentPipeline", entityId: id, description: "Deleted pipeline entry" });
      return { success: true };
    } catch (e) { console.error("RecruitmentPipelineService.deleteEntry:", e); throw e; }
  }
}

export default RecruitmentPipelineService;
