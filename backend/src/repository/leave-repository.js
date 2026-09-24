import Leave from "../models/Leave.js";
import CrudRepository from "./crud-repository.js";

class LeaveRepository extends CrudRepository {
  constructor() {
    super(Leave);
  }

  // All leaves for an employee
  async getByEmployee(employeeId, status = null) {
    const filter = { employeeId };
    if (status) filter.status = status;
    return await Leave.find(filter)
      .sort({ createdAt: -1 })
      .populate("approvedBy", "firstName lastName");
  }

  // All pending leaves — for manager/HR approval queue
  async getPending() {
    return await Leave.find({ status: "pending" })
      .sort({ createdAt: 1 })
      .populate("employeeId", "firstName lastName designation department");
  }

  // All leaves in a date range — for calendar
  async getInRange(startDate, endDate) {
    return await Leave.find({
      status: "approved",
      fromDate: { $lte: new Date(endDate) },
      toDate:   { $gte: new Date(startDate) },
    }).populate("employeeId", "firstName lastName designation");
  }

  // Count days used per type for an employee in a year
  async getUsedDays(employeeId, year) {
    const start = new Date(year, 0, 1);
    const end   = new Date(year, 11, 31, 23, 59, 59);
    return await Leave.aggregate([
      {
        $match: {
          employeeId: employeeId,
          status: "approved",
          fromDate: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$leaveType",
          totalDaysUsed: { $sum: "$totalDays" },
        },
      },
    ]);
  }

  // Check for overlapping leave requests
  async getOverlapping(employeeId, fromDate, toDate, excludeId = null) {
    const filter = {
      employeeId,
      status: { $in: ["pending", "approved"] },
      fromDate: { $lte: new Date(toDate) },
      toDate:   { $gte: new Date(fromDate) },
    };
    if (excludeId) filter._id = { $ne: excludeId };
    return await Leave.findOne(filter);
  }
}

export default LeaveRepository;
