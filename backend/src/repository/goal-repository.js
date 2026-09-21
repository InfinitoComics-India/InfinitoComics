import Goal from "../models/Goal.js";
import CrudRepository from "./crud-repository.js";

class GoalRepository extends CrudRepository {
  constructor() { super(Goal); }

  async getByEmployee(employeeId, status = null) {
    const filter = { employeeId };
    if (status) filter.status = status;
    return await Goal.find(filter).sort({ deadline: 1 });
  }

  async getActive(employeeId) {
    return await Goal.find({ employeeId, status: "active" }).sort({ weight: -1, deadline: 1 });
  }

  async getOverdue() {
    return await Goal.find({
      status: "active",
      deadline: { $lt: new Date() },
    }).populate("employeeId", "firstName lastName");
  }

  async updateProgress(goalId, currentValue) {
    const goal = await Goal.findById(goalId);
    if (!goal) throw new Error("Goal not found.");
    const status = currentValue >= goal.targetValue ? "completed" : "active";
    return await Goal.findByIdAndUpdate(
      goalId,
      { currentValue, status, ...(status === "completed" ? { completedAt: new Date() } : {}) },
      { new: true }
    );
  }

  async getCompletionSummary(employeeId) {
    return await Goal.aggregate([
      { $match: { employeeId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
  }
}

export default GoalRepository;
