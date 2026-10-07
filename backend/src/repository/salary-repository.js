import Salary from "../models/Salary.js";
import CrudRepository from "./crud-repository.js";

class SalaryRepository extends CrudRepository {
  constructor() { super(Salary); }

  async getByEmployee(employeeId) {
    return await Salary.findOne({ employeeId })
      .populate("employeeId", "firstName lastName designation department");
  }

  async upsert(employeeId, data) {
    // Manually calculate gross/net since findOneAndUpdate skips pre("save") hooks
    const basic           = Number(data.basic || 0);
    const hra             = Number(data.hra || 0);
    const ta              = Number(data.ta || 0);
    const medical         = Number(data.medical || 0);
    const special         = Number(data.special || 0);
    const otherAllowances = Number(data.otherAllowances || 0);
    const pf              = Number(data.pf || 0);
    const esic            = Number(data.esic || 0);
    const tds             = Number(data.tds || 0);
    const otherDeductions = Number(data.otherDeductions || 0);

    const grossSalary = basic + hra + ta + medical + special + otherAllowances;
    const netSalary    = grossSalary - (pf + esic + tds + otherDeductions);

    return await Salary.findOneAndUpdate(
      { employeeId },
      { ...data, employeeId, grossSalary, netSalary },
      { upsert: true, new: true, runValidators: true }
    );
  }

  async getAllWithEmployees() {
    return await Salary.find({})
      .populate("employeeId", "firstName lastName designation department employmentType status")
      .sort({ "employeeId.firstName": 1 });
  }
}

export default SalaryRepository;
