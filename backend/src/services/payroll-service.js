import PayrollRepository from "../repository/payroll-repository.js";
import SalaryRepository from "../repository/salary-repository.js";
import AttendanceRepository from "../repository/attendance-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";
import NotificationRepository from "../repository/notification-repository.js";

class PayrollService {
  constructor() {
    this.payrollRepo      = new PayrollRepository();
    this.salaryRepo       = new SalaryRepository();
    this.attendanceRepo   = new AttendanceRepository();
    this.auditRepo        = new AuditLogRepository();
    this.notificationRepo = new NotificationRepository();
  }

  // ── Generate payslip for one employee for a month ─────────
  async generatePayslip(employeeId, month, year, performedBy, performedByName) {
    try {
      // Get salary structure
      const salary = await this.salaryRepo.getByEmployee(employeeId);
      if (!salary) throw new Error("No salary structure found. Set salary first.");

      // Get attendance for the month
      const attendance = await this.attendanceRepo.getMonthlyForEmployee(employeeId, year, month);
      const workingDays = attendance.filter(a => !["holiday","weekend"].includes(a.status)).length;
      const presentDays = attendance.filter(a => ["present","late"].includes(a.status)).length;
      const leaveDays   = attendance.filter(a => a.status === "on_leave").length;
      const absentDays  = workingDays - presentDays - leaveDays;

      // Loss of pay for absent days (basic / working days * absent days)
      const lopPerDay = workingDays > 0 ? salary.basic / workingDays : 0;
      const lossOfPay = Math.round(lopPerDay * Math.max(0, absentDays));

      const totalDeductions = salary.pf + salary.esic + salary.tds + salary.otherDeductions + lossOfPay;
      const netSalary       = Math.max(0, salary.grossSalary - totalDeductions);

      const payslip = await this.payrollRepo.upsert(employeeId, month, year, {
        basic:           salary.basic,
        hra:             salary.hra,
        ta:              salary.ta,
        medical:         salary.medical,
        special:         salary.special,
        otherAllowances: salary.otherAllowances,
        grossSalary:     salary.grossSalary,
        pf:              salary.pf,
        esic:            salary.esic,
        tds:             salary.tds,
        otherDeductions: salary.otherDeductions,
        lossOfPay,
        workingDays,
        presentDays,
        absentDays,
        leaveDays,
        totalDeductions,
        netSalary,
        status: "draft",
        generatedBy: performedBy,
      });

      await this.auditRepo.create({ performedBy, performedByName, action: "CREATE", entity: "Payroll", entityId: payslip._id, description: `Generated payslip for ${month}/${year}. Net: ₹${netSalary}` });
      return payslip;
    } catch (e) { console.error("PayrollService.generatePayslip:", e); throw e; }
  }

  // ── Generate for entire team in one call ──────────────────
  async generateForAll(month, year, employeeIds, performedBy, performedByName) {
    try {
      const results = [];
      for (const empId of employeeIds) {
        try {
          const p = await this.generatePayslip(empId, month, year, performedBy, performedByName);
          results.push({ employeeId: empId, success: true, payslip: p });
        } catch (e) {
          results.push({ employeeId: empId, success: false, error: e.message });
        }
      }
      return results;
    } catch (e) { console.error("PayrollService.generateForAll:", e); throw e; }
  }

  // ── Approve payslip ───────────────────────────────────────
  async approvePayslip(payslipId, performedBy, performedByName) {
    try {
      const updated = await this.payrollRepo.findByIdandUpdate(payslipId, { status: "approved" });
      await this.auditRepo.create({ performedBy, performedByName, action: "APPROVE", entity: "Payroll", entityId: payslipId, description: "Payslip approved" });
      return updated;
    } catch (e) { console.error("PayrollService.approvePayslip:", e); throw e; }
  }

  // ── Mark as paid + notify employee ────────────────────────
  async markPaid(payslipId, performedBy, performedByName) {
    try {
      const updated = await this.payrollRepo.markPaid(payslipId, performedBy);
      await this.notificationRepo.create({ recipientId: updated.employeeId, recipientModel: "Employee", type: "payslip_ready", title: "Salary Credited", message: `Your salary for ${updated.month}/${updated.year} of ₹${updated.netSalary.toLocaleString("en-IN")} has been paid.`, link: "/hr/payroll", triggeredBy: performedBy });
      await this.auditRepo.create({ performedBy, performedByName, action: "UPDATE", entity: "Payroll", entityId: payslipId, description: `Marked as paid. Net: ₹${updated.netSalary}` });
      return updated;
    } catch (e) { console.error("PayrollService.markPaid:", e); throw e; }
  }

  async getForPeriod(month, year) {
    try { return await this.payrollRepo.getForPeriod(month, year); }
    catch (e) { console.error("PayrollService.getForPeriod:", e); throw e; }
  }

  async getForEmployee(employeeId) {
    try { return await this.payrollRepo.getForEmployee(employeeId); }
    catch (e) { console.error("PayrollService.getForEmployee:", e); throw e; }
  }

  async getSlip(employeeId, month, year) {
    try { return await this.payrollRepo.getSlip(employeeId, month, year); }
    catch (e) { console.error("PayrollService.getSlip:", e); throw e; }
  }

  async getPeriodSummary(month, year) {
    try { return await this.payrollRepo.getPeriodSummary(month, year); }
    catch (e) { console.error("PayrollService.getPeriodSummary:", e); throw e; }
  }
}

export default PayrollService;
