import Salary from "../models/Salary.js";
import CrudRepository from "./crud-repository.js";

class SalaryRepository extends CrudRepository {
  constructor() { super(Salary); }

  async getByEmployee(employeeId) {
    return await Salary.findOne({ employeeId })
      .populate("employeeId", "firstName lastName designation department");
  }

  async upsert(employeeId, data) {
    return await Salary.findOneAndUpdate(
      { employeeId },
      { ...data, employeeId },
      { upsert: true, new: true }
    );
  }

  async getAllWithEmployees() {
    return await Salary.find({})
      .populate("employeeId", "firstName lastName designation department employmentType status")
      .sort({ "employeeId.firstName": 1 });
  }
}

export default SalaryRepository;
