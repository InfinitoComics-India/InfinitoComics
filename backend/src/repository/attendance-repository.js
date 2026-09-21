import Attendance from "../models/Attendance.js";
import CrudRepository from "./crud-repository.js";

class AttendanceRepository extends CrudRepository {
  constructor() {
    super(Attendance);
  }

  // Get one record for an employee on a specific date
  async getByEmployeeAndDate(employeeId, date) {
    const d = new Date(date);
    const start = new Date(d.setHours(0, 0, 0, 0));
    const end   = new Date(d.setHours(23, 59, 59, 999));
    return await Attendance.findOne({ employeeId, date: { $gte: start, $lte: end } });
  }

  // Get all records for an employee in a month
  async getMonthlyForEmployee(employeeId, year, month) {
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0, 23, 59, 59);
    return await Attendance.find({ employeeId, date: { $gte: start, $lte: end } })
      .sort({ date: 1 });
  }

  // Get all employee records for a specific date (manager/HR view)
  async getByDate(date) {
    const d = new Date(date);
    const start = new Date(d.setHours(0, 0, 0, 0));
    const end   = new Date(d.setHours(23, 59, 59, 999));
    return await Attendance.find({ date: { $gte: start, $lte: end } })
      .populate("employeeId", "firstName lastName designation department")
      .sort({ "employeeId.firstName": 1 });
  }

  // Monthly summary for all employees (for report)
  async getMonthlySummary(year, month) {
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0, 23, 59, 59);
    return await Attendance.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: "$employeeId",
          totalPresent:  { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          totalAbsent:   { $sum: { $cond: [{ $eq: ["$status", "absent"]  }, 1, 0] } },
          totalLate:     { $sum: { $cond: [{ $eq: ["$status", "late"]    }, 1, 0] } },
          totalHalfDay:  { $sum: { $cond: [{ $eq: ["$status", "half_day"]}, 1, 0] } },
          totalOnLeave:  { $sum: { $cond: [{ $eq: ["$status", "on_leave"]}, 1, 0] } },
          totalHours:    { $sum: "$hoursWorked" },
        },
      },
    ]);
  }

  // Upsert — update if exists, create if not
  async upsert(employeeId, date, data) {
    const d = new Date(date);
    const start = new Date(new Date(d).setHours(0, 0, 0, 0));
    const end   = new Date(new Date(d).setHours(23, 59, 59, 999));
    return await Attendance.findOneAndUpdate(
      { employeeId, date: { $gte: start, $lte: end } },
      { ...data, employeeId, date: start },
      { upsert: true, new: true }
    );
  }
}

export default AttendanceRepository;
