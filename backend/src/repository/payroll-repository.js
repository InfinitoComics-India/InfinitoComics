import Payroll from "../models/Payroll.js";
import CrudRepository from "./crud-repository.js";

class PayrollRepository extends CrudRepository {
  constructor() { super(Payroll); }

  async getForEmployee(employeeId) {
    return await Payroll.find({ employeeId }).sort({ year: -1, month: -1 });
  }

  async getForPeriod(month, year) {
    return await Payroll.find({ month, year })
      .populate("employeeId", "firstName lastName designation department")
      .sort({ "employeeId.firstName": 1 });
  }

  async getSlip(employeeId, month, year) {
    return await Payroll.findOne({ employeeId, month, year })
      .populate("employeeId", "firstName lastName designation department employmentType");
  }

  async upsert(employeeId, month, year, data) {
    return await Payroll.findOneAndUpdate(
      { employeeId, month, year },
      { ...data, employeeId, month, year },
      { upsert: true, new: true }
    );
  }

  async markPaid(id, paidBy) {
    return await Payroll.findByIdAndUpdate(
      id,
      { status: "paid", paidAt: new Date(), paidBy },
      { new: true }
    );
  }

  async getPeriodSummary(month, year) {
    return await Payroll.aggregate([
      { $match: { month, year } },
      {
        $group: {
          _id: "$status",
          count:      { $sum: 1 },
          totalNet:   { $sum: "$netSalary" },
          totalGross: { $sum: "$grossSalary" },
        },
      },
    ]);
  }
}

export default PayrollRepository;
