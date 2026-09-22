import Onboarding from "../models/Onboarding.js";
import CrudRepository from "./crud-repository.js";

class OnboardingRepository extends CrudRepository {
  constructor() { super(Onboarding); }

  async getByEmployee(employeeId) {
    return await Onboarding.findOne({ employeeId })
      .populate("employeeId", "firstName lastName designation department joiningDate");
  }

  async getAllActive() {
    return await Onboarding.find({ status: { $in: ["pending","in_progress"] } })
      .populate("employeeId", "firstName lastName designation joiningDate")
      .sort({ createdAt: -1 });
  }

  async getByType(type) {
    return await Onboarding.find({ type })
      .populate("employeeId", "firstName lastName designation")
      .sort({ createdAt: -1 });
  }

  async updateChecklistItem(onboardingId, itemId, data) {
    return await Onboarding.findOneAndUpdate(
      { _id: onboardingId, "checklist._id": itemId },
      {
        $set: {
          "checklist.$.isCompleted": data.isCompleted,
          "checklist.$.completedAt": data.isCompleted ? new Date() : null,
          "checklist.$.completedBy": data.completedBy || null,
        },
      },
      { new: true }
    );
  }

  async recalcProgress(onboardingId) {
    const doc = await Onboarding.findById(onboardingId);
    if (!doc) return null;
    const total     = doc.checklist.length;
    const completed = doc.checklist.filter(i => i.isCompleted).length;
    const progress  = total > 0 ? Math.round((completed / total) * 100) : 0;
    const status    = progress === 100 ? "completed" : progress > 0 ? "in_progress" : "pending";
    return await Onboarding.findByIdAndUpdate(
      onboardingId,
      { progress, status, ...(status === "completed" ? { completedAt: new Date() } : {}) },
      { new: true }
    );
  }
}

export default OnboardingRepository;
