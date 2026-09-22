import OnboardingRepository from "../repository/onboarding-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";
import NotificationRepository from "../repository/notification-repository.js";

const DEFAULT_ONBOARDING = [
  { title: "Send welcome email", assignedTo: "HR", order: 1 },
  { title: "Set up company email account", assignedTo: "IT", order: 2 },
  { title: "Grant GitHub repository access", assignedTo: "IT", order: 3 },
  { title: "Share Figma design file access", assignedTo: "IT", order: 4 },
  { title: "Share Notion / project board access", assignedTo: "IT", order: 5 },
  { title: "Send NDA for signature", assignedTo: "HR", order: 6 },
  { title: "Send offer letter", assignedTo: "HR", order: 7 },
  { title: "Schedule onboarding call with manager", assignedTo: "Manager", order: 8 },
  { title: "Add to relevant Slack / Discord channels", assignedTo: "Manager", order: 9 },
  { title: "Complete salary setup", assignedTo: "HR", order: 10 },
  { title: "Introduction to the team", assignedTo: "Manager", order: 11 },
];

const DEFAULT_OFFBOARDING = [
  { title: "Revoke GitHub access", assignedTo: "IT", order: 1 },
  { title: "Revoke company email access", assignedTo: "IT", order: 2 },
  { title: "Revoke Figma / Notion access", assignedTo: "IT", order: 3 },
  { title: "Collect company assets", assignedTo: "HR", order: 4 },
  { title: "Conduct exit interview", assignedTo: "HR", order: 5 },
  { title: "Generate final payslip", assignedTo: "HR", order: 6 },
  { title: "Issue experience letter", assignedTo: "HR", order: 7 },
  { title: "Update employee status to Terminated", assignedTo: "HR", order: 8 },
];

class OnboardingService {
  constructor() {
    this.onboardingRepo   = new OnboardingRepository();
    this.auditRepo        = new AuditLogRepository();
    this.notificationRepo = new NotificationRepository();
  }

  async initiate(employeeId, type, options = {}, performedBy, performedByName) {
    try {
      const existing = await this.onboardingRepo.getByEmployee(employeeId);
      if (existing) throw new Error(`${type === "onboarding" ? "Onboarding" : "Offboarding"} already initiated for this employee.`);

      const checklist = (type === "onboarding" ? DEFAULT_ONBOARDING : DEFAULT_OFFBOARDING).map(item => ({
        ...item,
        dueDate: options.targetDate || null,
      }));

      const record = await this.onboardingRepo.create({
        employeeId,
        type,
        status: "pending",
        checklist,
        startDate:      options.startDate || new Date(),
        targetDate:     options.targetDate || null,
        welcomeMessage: options.welcomeMessage || "",
        exitReason:     options.exitReason || "",
        exitNotes:      options.exitNotes || "",
        createdBy:      performedBy,
      });

      await this.auditRepo.create({ performedBy, performedByName, action: "CREATE", entity: "Onboarding", entityId: record._id, description: `Initiated ${type} for employee` });

      if (type === "onboarding") {
        await this.notificationRepo.create({ recipientId: employeeId, recipientModel: "Employee", type: "system", title: "Welcome to InfinitoComics! 🎉", message: `Your onboarding process has been started. ${options.welcomeMessage || "Welcome aboard!"}`, link: "/hr/onboarding" });
      }

      return record;
    } catch (e) { console.error("OnboardingService.initiate:", e); throw e; }
  }

  async getByEmployee(employeeId) {
    try { return await this.onboardingRepo.getByEmployee(employeeId); }
    catch (e) { console.error("OnboardingService.getByEmployee:", e); throw e; }
  }

  async getAllActive() {
    try { return await this.onboardingRepo.getAllActive(); }
    catch (e) { console.error("OnboardingService.getAllActive:", e); throw e; }
  }

  async getByType(type) {
    try { return await this.onboardingRepo.getByType(type); }
    catch (e) { console.error("OnboardingService.getByType:", e); throw e; }
  }

  async toggleChecklistItem(onboardingId, itemId, isCompleted, performedBy, performedByName) {
    try {
      await this.onboardingRepo.updateChecklistItem(onboardingId, itemId, { isCompleted, completedBy: performedBy });
      const updated = await this.onboardingRepo.recalcProgress(onboardingId);
      await this.auditRepo.create({ performedBy, performedByName, action: "UPDATE", entity: "Onboarding", entityId: onboardingId, description: `Checklist item ${isCompleted ? "completed" : "unchecked"}` });
      return updated;
    } catch (e) { console.error("OnboardingService.toggleChecklistItem:", e); throw e; }
  }

  async addChecklistItem(onboardingId, item, performedBy, performedByName) {
    try {
      const updated = await this.onboardingRepo.findByIdandUpdate(onboardingId, { $push: { checklist: item } });
      await this.auditRepo.create({ performedBy, performedByName, action: "UPDATE", entity: "Onboarding", entityId: onboardingId, description: `Added checklist item: ${item.title}` });
      return updated;
    } catch (e) { console.error("OnboardingService.addChecklistItem:", e); throw e; }
  }

  async delete(onboardingId, performedBy, performedByName) {
    try {
      await this.onboardingRepo.findByIdandDelete(onboardingId);
      await this.auditRepo.create({ performedBy, performedByName, action: "DELETE", entity: "Onboarding", entityId: onboardingId, description: "Deleted onboarding record" });
      return { success: true };
    } catch (e) { console.error("OnboardingService.delete:", e); throw e; }
  }
}

export default OnboardingService;
