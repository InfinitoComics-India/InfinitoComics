import SalaryRepository from "../repository/salary-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";
import NotificationRepository from "../repository/notification-repository.js";

class SalaryService {
  constructor() {
    this.salaryRepo       = new SalaryRepository();
    this.auditRepo        = new AuditLogRepository();
    this.notificationRepo = new NotificationRepository();
  }

  async setSalary(employeeId, data, performedBy, performedByName) {
    try {
      const salary = await this.salaryRepo.upsert(employeeId, { ...data, setBy: performedBy, effectiveFrom: data.effectiveFrom || new Date() });
      await this.auditRepo.create({ performedBy, performedByName, action: "UPDATE", entity: "Salary", entityId: salary._id, description: `Salary set/updated for employee. Gross: ₹${salary.grossSalary}, Net: ₹${salary.netSalary}` });
      await this.notificationRepo.create({ recipientId: employeeId, recipientModel: "Employee", type: "system", title: "Salary Structure Updated", message: `Your salary structure has been updated. Net salary: ₹${salary.netSalary.toLocaleString("en-IN")}.`, link: "/hr/payroll" });
      return salary;
    } catch (e) { console.error("SalaryService.setSalary:", e); throw e; }
  }

  async getByEmployee(employeeId) {
    try { return await this.salaryRepo.getByEmployee(employeeId); }
    catch (e) { console.error("SalaryService.getByEmployee:", e); throw e; }
  }

  async getAll() {
    try { return await this.salaryRepo.getAllWithEmployees(); }
    catch (e) { console.error("SalaryService.getAll:", e); throw e; }
  }
}

export default SalaryService;
