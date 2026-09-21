import Task from "../models/Task.js";
import CrudRepository from "./crud-repository.js";

class TaskRepository extends CrudRepository {
  constructor() {
    super(Task);
  }

  // Get all tasks for Kanban board — grouped by status
  async getKanbanBoard(projectId = null) {
    const filter = projectId ? { projectId } : {};
    const tasks = await Task.find(filter)
      .populate("assignedTo", "firstName lastName designation")
      .populate("assignedBy", "firstName lastName")
      .populate("reviewers", "firstName lastName")
      .populate("projectId", "name projectId")
      .sort({ priority: -1, createdAt: -1 });

    // Group by status
    const board = {
      backlog:     [],
      assigned:    [],
      in_progress: [],
      review:      [],
      revision:    [],
      completed:   [],
    };
    tasks.forEach(t => { if (board[t.status]) board[t.status].push(t); });
    return board;
  }

  // Get all tasks assigned to one employee
  async getByEmployee(employeeId, status = null) {
    const filter = { assignedTo: employeeId };
    if (status) filter.status = status;
    return await Task.find(filter)
      .populate("projectId", "name projectId")
      .populate("assignedBy", "firstName lastName")
      .sort({ deadline: 1, priority: -1 });
  }

  // Get all tasks for a project
  async getByProject(projectId) {
    return await Task.find({ projectId })
      .populate("assignedTo", "firstName lastName")
      .sort({ status: 1, priority: -1 });
  }

  // Get overdue tasks
  async getOverdue() {
    return await Task.find({
      deadline: { $lt: new Date() },
      status: { $nin: ["completed", "cancelled"] },
    })
      .populate("assignedTo", "firstName lastName")
      .populate("projectId", "name")
      .sort({ deadline: 1 });
  }

  // Get tasks for a reviewer
  async getForReview(reviewerId) {
    return await Task.find({
      reviewers: reviewerId,
      status: "review",
    }).populate("assignedTo", "firstName lastName");
  }

  // Add comment to a task
  async addComment(taskId, comment) {
    return await Task.findByIdAndUpdate(
      taskId,
      { $push: { comments: comment } },
      { new: true }
    );
  }

  // Add attachment
  async addAttachment(taskId, attachment) {
    return await Task.findByIdAndUpdate(
      taskId,
      { $push: { attachments: attachment } },
      { new: true }
    );
  }

  // Update status and append to history
  async updateStatus(taskId, from, to, changedBy, note = "") {
    const update = {
      status: to,
      $push: {
        statusHistory: { from, to, changedBy, note, changedAt: new Date() },
      },
    };
    if (to === "in_progress" && from === "assigned") update.startedAt = new Date();
    if (to === "completed") update.completedAt = new Date();
    if (to === "revision") update.$inc = { revisionCount: 1 };
    return await Task.findByIdAndUpdate(taskId, update, { new: true });
  }

  // Performance metrics for an employee
  async getMetrics(employeeId, startDate, endDate) {
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate)   dateFilter.$lte = new Date(endDate);

    const filter = { assignedTo: employeeId };
    if (Object.keys(dateFilter).length) filter.createdAt = dateFilter;

    return await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total:           { $sum: 1 },
          completed:       { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          overdue:         { $sum: { $cond: [{ $and: [{ $lt: ["$deadline", new Date()] }, { $ne: ["$status", "completed"] }] }, 1, 0] } },
          totalRevisions:  { $sum: "$revisionCount" },
          avgProgress:     { $avg: "$progress" },
        },
      },
    ]);
  }
}

export default TaskRepository;
