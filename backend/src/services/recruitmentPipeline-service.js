import RecruitmentPipelineRepository from "../repository/recruitmentPipeline-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";
import NotificationRepository from "../repository/notification-repository.js";
import EmployeeRepository from "../repository/employee-repository.js";
import { sendEmail } from "../utils/sendEmail.js";

// ── Interview email template ──────────────────────────────────
const buildInterviewEmail = (candidate, interview, jobTitle) => {
  const dateStr = interview.scheduledAt
    ? new Date(interview.scheduledAt).toLocaleString("en-IN", {
        weekday: "long", day: "2-digit", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      })
    : "To be confirmed";

  const typeLabel = {
    phone:     "Phone Screening",
    video:     "Video Interview",
    technical: "Technical Interview",
    hr:        "HR Interview",
    final:     "Final Interview",
  }[interview.type] || "Interview";

  return `Dear ${candidate.candidateName},

We are pleased to inform you that you have been shortlisted for the position of ${jobTitle} at InfinitoComics.

We would like to schedule a ${typeLabel} (Round ${interview.round}) with you.

Interview Details:
- Type: ${typeLabel}
- Round: ${interview.round}
- Date & Time: ${dateStr}
${interview.conductedBy ? `- Interviewer: ${interview.conductedBy}` : ""}
${interview.notes ? `- Additional Notes: ${interview.notes}` : ""}

Please ensure you are available at the scheduled time. If you have any questions or need to reschedule, please reply to this email.

We look forward to speaking with you.

Best regards,
Talent Acquisition Team
InfinitoComics India
careers@infinitohq.com`;
};

class RecruitmentPipelineService {
  constructor() {
    this.pipelineRepo     = new RecruitmentPipelineRepository();
    this.auditRepo        = new AuditLogRepository();
    this.notificationRepo = new NotificationRepository();
    this.employeeRepo     = new EmployeeRepository();
  }

  async checkExists(applicationId) {
    try { return await this.pipelineRepo.findByApplication(applicationId); }
    catch (e) { console.error("RecruitmentPipelineService.checkExists:", e); throw e; }
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

      // ── Send stage-change email to candidate ──────────────
      if (entry.candidateEmail) {
        if (newStage === "offer_sent") {
          await sendEmail(
            entry.candidateEmail,
            `Offer Letter — ${entry.jobTitle} | InfinitoComics`,
            `Dear ${entry.candidateName},\n\nWe are delighted to inform you that we would like to extend an offer for the position of ${entry.jobTitle} at InfinitoComics.\n\nOur HR team will be in touch shortly with the formal offer letter and next steps.\n\nCongratulations and welcome to the InfinitoComics family!\n\nBest regards,\nTalent Acquisition Team\nInfinitoComics India`
          );
        } else if (newStage === "hired") {
          await sendEmail(
            entry.candidateEmail,
            `Welcome to InfinitoComics! — ${entry.jobTitle}`,
            `Dear ${entry.candidateName},\n\nCongratulations! We are thrilled to confirm your selection for the role of ${entry.jobTitle} at InfinitoComics.\n\nPlease check your inbox for further onboarding details from our HR team.\n\nWelcome aboard!\n\nBest regards,\nTalent Acquisition Team\nInfinitoComics India`
          );
        } else if (newStage === "rejected") {
          await sendEmail(
            entry.candidateEmail,
            `Application Update — ${entry.jobTitle} | InfinitoComics`,
            `Dear ${entry.candidateName},\n\nThank you for your interest in the ${entry.jobTitle} position at InfinitoComics and for taking the time to go through our interview process.\n\nAfter careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current requirements.\n\nWe truly appreciate your effort and wish you all the best in your career journey. We will keep your profile on file for future opportunities.\n\nBest regards,\nTalent Acquisition Team\nInfinitoComics India`
          );
        }
      }

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
      const entry   = await this.pipelineRepo.getById(id);
      if (!entry) throw new Error("Pipeline entry not found.");

      const updated = await this.pipelineRepo.addInterview(id, interview);

      await this.auditRepo.create({
        performedBy, performedByName,
        action: "UPDATE", entity: "RecruitmentPipeline", entityId: id,
        description: `Scheduled ${interview.type} interview round ${interview.round} for ${entry.candidateName}`,
      });

      // ── Send interview email to candidate ─────────────────
      if (entry.candidateEmail) {
        const typeLabel = {
          phone: "Phone Screening", video: "Video Interview",
          technical: "Technical Interview", hr: "HR Interview", final: "Final Interview",
        }[interview.type] || "Interview";

        const subject = `Interview Invitation — ${typeLabel} (Round ${interview.round}) | ${entry.jobTitle} | InfinitoComics`;
        const body    = buildInterviewEmail(entry, interview, entry.jobTitle);

        await sendEmail(entry.candidateEmail, subject, body);
      }

      // Move stage to interview_scheduled if still at applied/screening
      if (["applied","screening"].includes(entry.stage)) {
        await this.pipelineRepo.moveStage(id, "interview_scheduled", performedBy, "Interview scheduled");
      }

      return updated;
    } catch (e) {
      console.error("RecruitmentPipelineService.addInterview:", e);
      throw e;
    }
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
