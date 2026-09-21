import TaskRepository from "../repository/task-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";
import NotificationRepository from "../repository/notification-repository.js";
import ProjectRepository from "../repository/project-repository.js";

class TaskService {
  constructor() {
    this.taskRepo         = new TaskRepository();
    this.auditRepo        = new AuditLogRepository();
    this.notificationRepo = new NotificationRepository();
    this.projectRepo      = new ProjectRepository();
  }

  async createTask(data, performedBy, performedByName) {
    try {
      const task = await this.taskRepo.create(data);
      await this.auditRepo.create({ performedBy, performedByName, action: "CREATE", entity: "Task", entityId: task._id, entityLabel: task.taskId, description: `Created task "${task.title}"` });
      if (data.assignedTo) {
        await this.notificationRepo.create({ recipientId: data.assignedTo, recipientModel: "Employee", type: "task_assigned", title: "New Task Assigned", message: `You have been assigned task "${task.title}" (${task.taskId}).`, link: "/hr/tasks", triggeredBy: performedBy, entity: "Task", entityId: task._id });
      }
      if (data.projectId) await this._recalcProjectProgress(data.projectId);
      return task;
    } catch (e) { console.error("TaskService.createTask:", e); throw e; }
  }

  async getKanbanBoard(projectId) {
    try { return await this.taskRepo.getKanbanBoard(projectId); }
    catch (e) { console.error("TaskService.getKanbanBoard:", e); throw e; }
  }

  async getByEmployee(employeeId, status) {
    try { return await this.taskRepo.getByEmployee(employeeId, status); }
    catch (e) { console.error("TaskService.getByEmployee:", e); throw e; }
  }

  async getByProject(projectId) {
    try { return await this.taskRepo.getByProject(projectId); }
    catch (e) { console.error("TaskService.getByProject:", e); throw e; }
  }

  async getOverdue() {
    try { return await this.taskRepo.getOverdue(); }
    catch (e) { console.error("TaskService.getOverdue:", e); throw e; }
  }

  async getById(id) {
    try {
      const task = await this.taskRepo.getById(id);
      if (!task) throw new Error("Task not found.");
      return task;
    } catch (e) { console.error("TaskService.getById:", e); throw e; }
  }

  async updateTask(id, data, performedBy, performedByName) {
    try {
      const before = await this.taskRepo.getById(id);
      if (!before) throw new Error("Task not found.");
      const updated = await this.taskRepo.findByIdandUpdate(id, data);
      await this.auditRepo.create({ performedBy, performedByName, action: "UPDATE", entity: "Task", entityId: id, entityLabel: before.taskId, description: `Updated task "${before.title}"` });
      if (data.progress !== undefined || data.status) {
        if (before.projectId) await this._recalcProjectProgress(before.projectId);
      }
      return updated;
    } catch (e) { console.error("TaskService.updateTask:", e); throw e; }
  }

  async moveStatus(id, newStatus, performedBy, performedByName, note = "") {
    try {
      const task = await this.taskRepo.getById(id);
      if (!task) throw new Error("Task not found.");
      const oldStatus = task.status;
      const updated = await this.taskRepo.updateStatus(id, oldStatus, newStatus, performedBy, note);
      await this.auditRepo.create({ performedBy, performedByName, action: "STATUS_CHANGE", entity: "Task", entityId: id, entityLabel: task.taskId, oldValue: { status: oldStatus }, newValue: { status: newStatus }, description: `Task "${task.title}" moved from ${oldStatus} → ${newStatus}` });
      // Notify assignee when task goes to revision
      if (newStatus === "revision" && task.assignedTo) {
        await this.notificationRepo.create({ recipientId: task.assignedTo, recipientModel: "Employee", type: "task_updated", title: "Task Sent for Revision", message: `Your task "${task.title}" (${task.taskId}) has been sent back for revision. ${note ? `Note: ${note}` : ""}`, link: "/hr/tasks", triggeredBy: performedBy });
      }
      // Notify reviewers when task is ready for review
      if (newStatus === "review" && task.reviewers?.length) {
        for (const rid of task.reviewers) {
          await this.notificationRepo.create({ recipientId: rid, recipientModel: "Employee", type: "task_updated", title: "Task Ready for Review", message: `Task "${task.title}" (${task.taskId}) is ready for your review.`, link: "/hr/tasks", triggeredBy: performedBy });
        }
      }
      if (task.projectId) await this._recalcProjectProgress(task.projectId);
      return updated;
    } catch (e) { console.error("TaskService.moveStatus:", e); throw e; }
  }

  async addComment(id, comment, performedBy, performedByName) {
    try {
      return await this.taskRepo.addComment(id, comment);
    } catch (e) { console.error("TaskService.addComment:", e); throw e; }
  }

  async deleteTask(id, performedBy, performedByName) {
    try {
      const task = await this.taskRepo.getById(id);
      if (!task) throw new Error("Task not found.");
      await this.taskRepo.findByIdandDelete(id);
      await this.auditRepo.create({ performedBy, performedByName, action: "DELETE", entity: "Task", entityId: id, entityLabel: task.taskId, description: `Deleted task "${task.title}"` });
      if (task.projectId) await this._recalcProjectProgress(task.projectId);
      return { success: true };
    } catch (e) { console.error("TaskService.deleteTask:", e); throw e; }
  }

  async getMetrics(employeeId, startDate, endDate) {
    try { return await this.taskRepo.getMetrics(employeeId, startDate, endDate); }
    catch (e) { console.error("TaskService.getMetrics:", e); throw e; }
  }

  // Recalculate project progress from task completion %
  async _recalcProjectProgress(projectId) {
    try {
      const tasks = await this.taskRepo.getByProject(projectId);
      if (!tasks.length) return;
      const totalProgress = tasks.reduce((sum, t) => sum + (t.status === "completed" ? 100 : t.progress), 0);
      const avgProgress = Math.round(totalProgress / tasks.length);
      await this.projectRepo.updateProgress(projectId, avgProgress);
      // Auto-update health
      const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== "completed");
      const health = overdue.length > tasks.length * 0.3 ? "delayed" : overdue.length > 0 ? "at_risk" : "on_track";
      await this.projectRepo.updateHealth(projectId, health);
    } catch (e) { console.error("TaskService._recalcProjectProgress:", e); }
  }
}

export default TaskService;
