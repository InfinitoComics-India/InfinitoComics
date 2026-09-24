import HRDocument from "../models/HRDocument.js";
import CrudRepository from "./crud-repository.js";

class HRDocumentRepository extends CrudRepository {
  constructor() { super(HRDocument); }

  async getByEmployee(employeeId) {
    return await HRDocument.find({ employeeId }).sort({ createdAt: -1 });
  }

  async getByCategory(employeeId, category) {
    return await HRDocument.find({ employeeId, category }).sort({ version: -1 });
  }

  async getExpiringSoon(days = 30) {
    const future = new Date();
    future.setDate(future.getDate() + days);
    return await HRDocument.find({
      expiryDate: { $lte: future, $gte: new Date() },
      status: { $in: ["active", "signed"] },
    })
      .populate("employeeId", "firstName lastName designation")
      .sort({ expiryDate: 1 });
  }

  async addVersion(docId, oldFileUrl) {
    const doc = await HRDocument.findById(docId);
    if (!doc) throw new Error("Document not found.");
    return await HRDocument.findByIdAndUpdate(
      docId,
      {
        $push: { previousVersions: { version: doc.version, fileUrl: oldFileUrl, updatedAt: new Date() } },
        $inc:  { version: 1 },
      },
      { new: true }
    );
  }

  async getAllForAdmin() {
    return await HRDocument.find({})
      .populate("employeeId", "firstName lastName designation department")
      .sort({ createdAt: -1 });
  }
}

export default HRDocumentRepository;
