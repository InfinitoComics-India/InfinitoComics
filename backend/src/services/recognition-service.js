import RecognitionRepository from "../repository/recognition-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";
import NotificationRepository from "../repository/notification-repository.js";
import EmployeeRepository from "../repository/employee-repository.js";

class RecognitionService {
  constructor() {
    this.recognitionRepo  = new RecognitionRepository();
    this.auditRepo        = new AuditLogRepository();
    this.notificationRepo = new NotificationRepository();
    this.employeeRepo     = new EmployeeRepository();
  }

  async give(data, performedBy, performedByName) {
    try {
      const recipient = await this.employeeRepo.getById(data.recipientId);
      if (!recipient) throw new Error("Employee not found.");

      const recognition = await this.recognitionRepo.create({
        ...data,
        recipientName: `${recipient.firstName} ${recipient.lastName}`,
        givenBy: performedBy,
        givenByName: performedByName,
      });

      await this.auditRepo.create({ performedBy, performedByName, action: "CREATE", entity: "Recognition", entityId: recognition._id, description: `Gave ${data.type} to ${recipient.firstName} ${recipient.lastName}: "${data.title}"` });

      await this.notificationRepo.create({
        recipientId: data.recipientId, recipientModel: "Employee",
        type: "system",
        title: `${data.type === "badge" ? "🏅 New Badge" : data.type === "award" ? "🏆 Award" : "🌟 Shoutout"}`,
        message: `${performedByName} gave you a ${data.type}: "${data.title}". ${data.message || ""}`,
        link: "/hr/recognition",
        triggeredBy: performedBy,
      });

      return recognition;
    } catch (e) { console.error("RecognitionService.give:", e); throw e; }
  }

  async getWall() {
    try { return await this.recognitionRepo.getPublicWall(30); }
    catch (e) { console.error("RecognitionService.getWall:", e); throw e; }
  }

  async getForEmployee(employeeId) {
    try { return await this.recognitionRepo.getForEmployee(employeeId); }
    catch (e) { console.error("RecognitionService.getForEmployee:", e); throw e; }
  }

  async getBadges(employeeId) {
    try { return await this.recognitionRepo.getBadgesForEmployee(employeeId); }
    catch (e) { console.error("RecognitionService.getBadges:", e); throw e; }
  }

  // Auto-award badges based on performance data
  async autoAwardBadges(employeeId, performanceData) {
    try {
      const badges = [];
      const { productivity, quality, reliability } = performanceData;

      if (productivity?.completionRate >= 100) badges.push({ title: "Perfect Sprint", icon: "🎯", message: "Completed 100% of tasks this month!" });
      if (quality?.revisionCount === 0 && productivity?.totalAssigned >= 5) badges.push({ title: "Zero Revisions", icon: "✨", message: "No revisions this month — flawless work!" });
      if (reliability?.attendanceRate >= 100) badges.push({ title: "Perfect Attendance", icon: "📅", message: "100% attendance this month!" });
      if (productivity?.completionRate >= 90) badges.push({ title: "High Achiever", icon: "🚀", message: "Completed over 90% of tasks!" });

      for (const b of badges) {
        await this.give({ recipientId: employeeId, type: "badge", title: b.title, message: b.message, badge: { icon: b.icon, color: "#DD1215" }, isPublic: true }, "system", "InfinitoComics System");
      }

      return badges;
    } catch (e) { console.error("RecognitionService.autoAwardBadges:", e); }
  }

  async deleteRecognition(id, performedBy, performedByName) {
    try {
      await this.recognitionRepo.findByIdandDelete(id);
      await this.auditRepo.create({ performedBy, performedByName, action: "DELETE", entity: "Recognition", entityId: id, description: "Deleted recognition" });
      return { success: true };
    } catch (e) { console.error("RecognitionService.delete:", e); throw e; }
  }
}

export default RecognitionService;
