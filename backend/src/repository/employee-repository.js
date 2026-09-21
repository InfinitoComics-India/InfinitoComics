import Employee from "../models/Employee.js";
import CrudRepository from "./crud-repository.js";

class EmployeeRepository extends CrudRepository {
  constructor() {
    super(Employee);
  }

  // Get all active employees
  async getAllActive() {
    return await Employee.find({ status: "active" }).populate("reportingManager", "firstName lastName designation");
  }

  // Get by department
  async getByDepartment(department) {
    return await Employee.find({ department, status: "active" });
  }

  // Get by hrRole
  async getByRole(hrRole) {
    return await Employee.find({ hrRole, status: "active" });
  }

  // Find by email
  async findByEmail(email) {
    return await Employee.findOne({ email: email.toLowerCase() });
  }

  // Search by name or email
  async search(query) {
    const regex = new RegExp(query, "i");
    return await Employee.find({
      status: "active",
      $or: [{ firstName: regex }, { lastName: regex }, { email: regex }, { designation: regex }],
    }).populate("reportingManager", "firstName lastName");
  }

  // Get direct reports of a manager
  async getDirectReports(managerId) {
    return await Employee.find({ reportingManager: managerId, status: "active" });
  }

  // Soft deactivate (don't delete — keep history)
  async deactivate(id, endDate) {
    return await Employee.findByIdAndUpdate(
      id,
      { status: "terminated", endDate: endDate || new Date() },
      { new: true }
    );
  }
}

export default EmployeeRepository;
