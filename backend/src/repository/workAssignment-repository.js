import WorkAssignment from "../models/WorkAssignment.js";
import CrudRepository from "./crud-repository.js";

class WorkAssignmentRepository extends CrudRepository {
  constructor() {
    super(WorkAssignment);
  }

  // Get all active assignments for an employee
  async getByEmployee(employeeId) {
    return await WorkAssignment.find({ employeeId, status: "active" })
      .populate("projectId", "name projectId status health")
      .sort({ startDate: -1 });
  }

  // Get all assignments for a project
  async getByProject(projectId) {
    return await WorkAssignment.find({ projectId })
      .populate("employeeId", "firstName lastName designation department")
      .sort({ role: 1 });
  }

  // Get active assignments for a project
  async getActiveByProject(projectId) {
    return await WorkAssignment.find({ projectId, status: "active" })
      .populate("employeeId", "firstName lastName designation");
  }

  // Workload heatmap — all employees with their active task count
  async getWorkloadSummary() {
    return await WorkAssignment.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$employeeId",
          activeProjects: { $sum: 1 },
          totalHoursPerWeek: { $sum: "$hoursPerWeek" },
        },
      },
    ]);
  }

  // Check if employee is over-allocated (>= 5 active projects)
  async getOverAllocated() {
    return await WorkAssignment.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$employeeId", count: { $sum: 1 } } },
      { $match: { count: { $gte: 5 } } },
    ]);
  }

  // Find existing assignment for employee+project
  async findExisting(employeeId, projectId) {
    return await WorkAssignment.findOne({ employeeId, projectId, status: "active" });
  }
}

export default WorkAssignmentRepository;
