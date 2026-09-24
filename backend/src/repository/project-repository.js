import Project from "../models/Project.js";
import CrudRepository from "./crud-repository.js";

class ProjectRepository extends CrudRepository {
  constructor() {
    super(Project);
  }

  // Get all active projects with team populated
  async getAllActive() {
    return await Project.find({ status: { $in: ["planning", "active"] } })
      .populate("projectManager", "firstName lastName designation")
      .populate("teamMembers", "firstName lastName designation")
      .sort({ createdAt: -1 });
  }

  // Get projects for a specific employee (as manager or team member)
  async getByEmployee(employeeId) {
    return await Project.find({
      status: { $nin: ["cancelled"] },
      $or: [
        { projectManager: employeeId },
        { teamMembers: employeeId },
      ],
    })
      .populate("projectManager", "firstName lastName")
      .sort({ status: 1, createdAt: -1 });
  }

  // Get project with full detail
  async getDetail(id) {
    return await Project.findById(id)
      .populate("projectManager", "firstName lastName designation avatar")
      .populate("teamMembers", "firstName lastName designation avatar");
  }

  // Update project progress (called after task status changes)
  async updateProgress(projectId, progress) {
    return await Project.findByIdAndUpdate(
      projectId,
      { progress },
      { new: true }
    );
  }

  // Update health
  async updateHealth(projectId, health) {
    return await Project.findByIdAndUpdate(
      projectId,
      { health },
      { new: true }
    );
  }

  // Add team member
  async addTeamMember(projectId, employeeId) {
    return await Project.findByIdAndUpdate(
      projectId,
      { $addToSet: { teamMembers: employeeId } },
      { new: true }
    );
  }

  // Remove team member
  async removeTeamMember(projectId, employeeId) {
    return await Project.findByIdAndUpdate(
      projectId,
      { $pull: { teamMembers: employeeId } },
      { new: true }
    );
  }

  // Update a milestone
  async updateMilestone(projectId, milestoneId, data) {
    return await Project.findOneAndUpdate(
      { _id: projectId, "milestones._id": milestoneId },
      {
        $set: {
          "milestones.$.title":       data.title,
          "milestones.$.description": data.description,
          "milestones.$.dueDate":     data.dueDate,
          "milestones.$.status":      data.status,
          ...(data.status === "completed" ? { "milestones.$.completedAt": new Date() } : {}),
        },
      },
      { new: true }
    );
  }

  // Dashboard stats
  async getStats() {
    return await Project.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgProgress: { $avg: "$progress" },
        },
      },
    ]);
  }
}

export default ProjectRepository;
