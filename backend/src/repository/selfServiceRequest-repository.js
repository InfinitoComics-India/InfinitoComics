import SelfServiceRequest from "../models/SelfServiceRequest.js";
import CrudRepository from "./crud-repository.js";

class SelfServiceRequestRepository extends CrudRepository {
  constructor() { super(SelfServiceRequest); }

  async getByEmployee(employeeId, status = null) {
    const filter = { employeeId };
    if (status) filter.status = status;
    return await SelfServiceRequest.find(filter).sort({ createdAt: -1 });
  }

  async getAll(status = null) {
    const filter = {};
    if (status) filter.status = status;
    return await SelfServiceRequest.find(filter)
      .populate("employeeId", "firstName lastName designation department")
      .sort({ priority: -1, createdAt: -1 });
  }

  async getOpen() {
    return await SelfServiceRequest.find({ status: { $in: ["open","in_progress"] } })
      .populate("employeeId", "firstName lastName designation")
      .sort({ priority: -1, createdAt: 1 });
  }

  async resolve(id, resolution, resolvedBy) {
    return await SelfServiceRequest.findByIdAndUpdate(
      id,
      { status: "resolved", resolution, resolvedBy, resolvedAt: new Date() },
      { new: true }
    );
  }

  async addComment(id, comment) {
    return await SelfServiceRequest.findByIdAndUpdate(
      id,
      { $push: { comments: comment } },
      { new: true }
    );
  }

  async getStats() {
    return await SelfServiceRequest.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
  }
}

export default SelfServiceRequestRepository;
