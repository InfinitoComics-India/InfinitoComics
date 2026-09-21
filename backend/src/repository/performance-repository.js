import Performance from "../models/Performance.js";
import CrudRepository from "./crud-repository.js";

class PerformanceRepository extends CrudRepository {
  constructor() { super(Performance); }

  async getForEmployee(employeeId) {
    return await Performance.find({ employeeId }).sort({ "period.year": -1, "period.month": -1 });
  }

  async getForPeriod(employeeId, month, year) {
    return await Performance.findOne({ employeeId, "period.month": month, "period.year": year });
  }

  async getAllForPeriod(month, year) {
    return await Performance.find({ "period.month": month, "period.year": year })
      .populate("employeeId", "firstName lastName designation department")
      .sort({ overallScore: -1 });
  }

  async upsertForPeriod(employeeId, month, year, data) {
    return await Performance.findOneAndUpdate(
      { employeeId, "period.month": month, "period.year": year },
      { ...data, employeeId, "period.month": month, "period.year": year },
      { upsert: true, new: true }
    );
  }

  async getTopPerformers(month, year, limit = 5) {
    return await Performance.find({ "period.month": month, "period.year": year, status: "published" })
      .populate("employeeId", "firstName lastName designation department")
      .sort({ overallScore: -1 })
      .limit(limit);
  }

  async getTrend(employeeId, months = 6) {
    return await Performance.find({ employeeId })
      .sort({ "period.year": -1, "period.month": -1 })
      .limit(months)
      .select("period overallScore productivity.completionRate quality.revisionCount reliability.attendanceRate");
  }
}

export default PerformanceRepository;
