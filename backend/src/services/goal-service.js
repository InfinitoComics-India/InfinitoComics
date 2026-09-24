import GoalRepository from "../repository/goal-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";
import NotificationRepository from "../repository/notification-repository.js";

class GoalService {
  constructor() {
    this.goalRepo         = new GoalRepository();
    this.auditRepo        = new AuditLogRepository();
    this.notificationRepo = new NotificationRepository();
  }

  async createGoal(data, performedBy, performedByName) {
    try {
      const goal = await this.goalRepo.create({ ...data, setBy: performedBy });
      await this.auditRepo.create({ performedBy, performedByName, action: "CREATE", entity: "Goal", entityId: goal._id, description: `Created goal "${goal.title}" for employee` });
      await this.notificationRepo.create({ recipientId: data.employeeId, recipientModel: "Employee", type: "goal_updated", title: "New Goal Set", message: `A new goal has been set for you: "${goal.title}". Target: ${goal.targetValue} ${goal.unit}. Deadline: ${new Date(goal.deadline).toDateString()}.`, link: "/hr/goals", triggeredBy: performedBy });
      return goal;
    } catch (e) { console.error("GoalService.createGoal:", e); throw e; }
  }

  async getByEmployee(employeeId, status) {
    try { return await this.goalRepo.getByEmployee(employeeId, status); }
    catch (e) { console.error("GoalService.getByEmployee:", e); throw e; }
  }

  async updateProgress(goalId, currentValue, performedBy, performedByName) {
    try {
      const updated = await this.goalRepo.updateProgress(goalId, currentValue);
      if (updated.status === "completed") {
        await this.notificationRepo.create({ recipientId: updated.employeeId, recipientModel: "Employee", type: "goal_updated", title: "Goal Completed! 🎉", message: `You've completed the goal "${updated.title}"! Great work.`, link: "/hr/goals" });
      }
      await this.auditRepo.create({ performedBy, performedByName, action: "UPDATE", entity: "Goal", entityId: goalId, description: `Updated goal progress: ${currentValue}/${updated.targetValue}` });
      return updated;
    } catch (e) { console.error("GoalService.updateProgress:", e); throw e; }
  }

  async updateGoal(id, data, performedBy, performedByName) {
    try {
      const updated = await this.goalRepo.findByIdandUpdate(id, data);
      await this.auditRepo.create({ performedBy, performedByName, action: "UPDATE", entity: "Goal", entityId: id, description: `Updated goal` });
      return updated;
    } catch (e) { console.error("GoalService.updateGoal:", e); throw e; }
  }

  async deleteGoal(id, performedBy, performedByName) {
    try {
      await this.goalRepo.findByIdandDelete(id);
      await this.auditRepo.create({ performedBy, performedByName, action: "DELETE", entity: "Goal", entityId: id, description: `Deleted goal` });
      return { success: true };
    } catch (e) { console.error("GoalService.deleteGoal:", e); throw e; }
  }

  async getSummary(employeeId) {
    try { return await this.goalRepo.getCompletionSummary(employeeId); }
    catch (e) { console.error("GoalService.getSummary:", e); throw e; }
  }

  async getOverdue() {
    try { return await this.goalRepo.getOverdue(); }
    catch (e) { console.error("GoalService.getOverdue:", e); throw e; }
  }
}

export default GoalService;
