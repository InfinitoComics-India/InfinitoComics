import PerformanceRepository from "../repository/performance-repository.js";
import TaskRepository from "../repository/task-repository.js";
import AttendanceRepository from "../repository/attendance-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";
import NotificationRepository from "../repository/notification-repository.js";
import WorkAssignmentRepository from "../repository/workAssignment-repository.js";

class PerformanceService {
  constructor() {
    this.perfRepo         = new PerformanceRepository();
    this.taskRepo         = new TaskRepository();
    this.attendanceRepo   = new AttendanceRepository();
    this.auditRepo        = new AuditLogRepository();
    this.notificationRepo = new NotificationRepository();
    this.waRepo           = new WorkAssignmentRepository();
  }

  // ── Generate / refresh performance record for a period ────
  async generateForEmployee(employeeId, month, year) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate   = new Date(year, month, 0, 23, 59, 59);

      // 1. Task metrics
      const taskMetrics = await this.taskRepo.getMetrics(employeeId, startDate.toISOString(), endDate.toISOString());
      const tm = taskMetrics[0] || {};
      const completionRate = tm.total > 0 ? Math.round((tm.completed / tm.total) * 100) : 0;
      const errorRate      = tm.total > 0 ? Math.round((tm.totalRevisions / tm.total) * 100) : 0;
      const approvalRate   = tm.total > 0 ? Math.round(((tm.total - (tm.totalRevisions || 0)) / tm.total) * 100) : 100;

      // 2. Attendance metrics
      const attendance = await this.attendanceRepo.getMonthlyForEmployee(employeeId, year, month);
      const totalWorkingDays = attendance.filter(a => !["holiday","weekend"].includes(a.status)).length;
      const presentDays      = attendance.filter(a => ["present","late"].includes(a.status)).length;
      const attendanceRate   = totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 0;

      // Tasks completed on or before deadline this period
      const allTasks = await this.taskRepo.getByEmployee(employeeId, "completed");
      const tasksInPeriod = allTasks.filter(t => t.completedAt >= startDate && t.completedAt <= endDate);
      const onTime = tasksInPeriod.filter(t => !t.deadline || new Date(t.completedAt) <= new Date(t.deadline)).length;
      const deadlineAdherence = tasksInPeriod.length > 0 ? Math.round((onTime / tasksInPeriod.length) * 100) : 100;

      // 3. Projects contributed to
      const assignments = await this.waRepo.getByEmployee(employeeId);
      const projectsContributed = assignments.length;

      // 4. Tasks reviewed for others
      const reviewedTasks = await this.taskRepo.getForReview(employeeId);
      const tasksReviewed = reviewedTasks.length;

      // 5. Calc overall score (weighted average across categories)
      const prodScore    = completionRate;
      const qualScore    = approvalRate;
      const relScore     = Math.round((attendanceRate + deadlineAdherence) / 2);
      const contribScore = Math.min(100, projectsContributed * 20);
      const collabScore  = Math.min(100, tasksReviewed * 10);
      const overallScore = Math.round((prodScore * 0.30 + qualScore * 0.25 + relScore * 0.25 + contribScore * 0.10 + collabScore * 0.10));

      const data = {
        productivity: { tasksCompleted: tm.completed || 0, tasksOverdue: tm.overdue || 0, totalAssigned: tm.total || 0, completionRate, avgCompletionDays: 0 },
        quality:      { revisionCount: tm.totalRevisions || 0, approvalRate, errorRate },
        reliability:  { attendanceDays: presentDays, totalWorkingDays, attendanceRate, deadlineAdherence },
        contribution: { projectsContributed, ideasSubmitted: 0 },
        collaboration:{ tasksReviewed },
        overallScore,
        status: "draft",
      };

      return await this.perfRepo.upsertForPeriod(employeeId, month, year, data);
    } catch (e) { console.error("PerformanceService.generateForEmployee:", e); throw e; }
  }

  async getForEmployee(employeeId) {
    try { return await this.perfRepo.getForEmployee(employeeId); }
    catch (e) { console.error("PerformanceService.getForEmployee:", e); throw e; }
  }

  async getForPeriod(employeeId, month, year) {
    try { return await this.perfRepo.getForPeriod(employeeId, month, year); }
    catch (e) { console.error("PerformanceService.getForPeriod:", e); throw e; }
  }

  async getAllForPeriod(month, year) {
    try { return await this.perfRepo.getAllForPeriod(month, year); }
    catch (e) { console.error("PerformanceService.getAllForPeriod:", e); throw e; }
  }

  async addManagerScore(employeeId, month, year, scores, performedBy, performedByName) {
    try {
      const existing = await this.perfRepo.getForPeriod(employeeId, month, year);
      if (!existing) throw new Error("Performance record not found. Generate it first.");

      // Recalc overall including manager score
      const ms = scores;
      const managerAvg = Math.round(((ms.productivity + ms.quality + ms.reliability + ms.contribution + ms.collaboration) / 5) * 10);
      const autoScore  = existing.overallScore;
      const blended    = Math.round(autoScore * 0.7 + managerAvg * 0.3);

      const updated = await this.perfRepo.findByIdandUpdate(existing._id, {
        managerScore: { ...ms, scoredBy: performedBy, scoredAt: new Date() },
        overallScore: blended,
        status: "published",
      });

      await this.auditRepo.create({ performedBy, performedByName, action: "UPDATE", entity: "Performance", entityId: existing._id, description: `Added manager score for ${month}/${year}. Overall: ${blended}/100` });

      await this.notificationRepo.create({
        recipientId: employeeId, recipientModel: "Employee",
        type: "performance_reviewed", title: "Performance Review Published",
        message: `Your performance review for ${month}/${year} has been published. Overall score: ${blended}/100.`,
        link: "/hr/performance",
      });

      return updated;
    } catch (e) { console.error("PerformanceService.addManagerScore:", e); throw e; }
  }

  async getTopPerformers(month, year) {
    try { return await this.perfRepo.getTopPerformers(month, year); }
    catch (e) { console.error("PerformanceService.getTopPerformers:", e); throw e; }
  }

  async getTrend(employeeId, months = 6) {
    try { return await this.perfRepo.getTrend(employeeId, months); }
    catch (e) { console.error("PerformanceService.getTrend:", e); throw e; }
  }
}

export default PerformanceService;
