import Recognition from "../models/Recognition.js";
import CrudRepository from "./crud-repository.js";

class RecognitionRepository extends CrudRepository {
  constructor() { super(Recognition); }

  async getForEmployee(employeeId) {
    return await Recognition.find({ recipientId: employeeId }).sort({ createdAt: -1 });
  }

  async getPublicWall(limit = 20) {
    return await Recognition.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("recipientId", "firstName lastName designation avatar");
  }

  async getByType(type) {
    return await Recognition.find({ type, isPublic: true })
      .sort({ createdAt: -1 })
      .populate("recipientId", "firstName lastName designation");
  }

  async getBadgesForEmployee(employeeId) {
    return await Recognition.find({ recipientId: employeeId, type: "badge" })
      .sort({ createdAt: -1 });
  }
}

export default RecognitionRepository;
