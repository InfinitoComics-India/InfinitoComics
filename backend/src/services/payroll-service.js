import PayrollRepository from "../repository/payroll-repository.js";
import SalaryRepository from "../repository/salary-repository.js";
import AttendanceRepository from "../repository/attendance-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";
import NotificationRepository from "../repository/notification-repository.js";
import DailyWorkLog from "../models/DailyWorkLog.js";

const WORKING_DAYS = 30; // Fixed 30 working days per month

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

      // Build a set of dates where employee was present (from attendance)
      const presentDates   = new Set();
      const leaveDates     = new Set();
      let sundayWorkedDays = 0;

      for (const rec of attendance) {
        const d    = new Date(rec.date);
        const iso  = d.toISOString().split("T")[0];
        const isSunday = d.getDay() === 0;

        if (["present","late"].includes(rec.status)) {
          presentDates.add(iso);
          if (isSunday) sundayWorkedDays++;
        } else if (rec.status === "on_leave") {
          leaveDates.add(iso);
        }
      }

      // Also check work log — if employee submitted work log for a day, count as present
      // (even if attendance not marked — covers remote/async workers)
      const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
      const endOfMonth   = new Date(Date.UTC(year, month, 0, 23, 59, 59));

      // DailyWorkLog is linked to adminId — look up by admin email matching employee
      // We query by adminEmail using the employee's linked admin account
      const worklogs = await DailyWorkLog.find({
        date: { $gte: startOfMonth, $lte: endOfMonth },
        status: { $in: ["submitted", "edited"] },
        $or: [
          { adminId: employeeId },   // if linked as admin directly
          { employeeId: employeeId } // legacy link
        ]
      }).select("date");

      for (const wl of worklogs) {
        const d   = new Date(wl.date);
        const iso = d.toISOString().split("T")[0];
        if (!presentDates.has(iso) && !leaveDates.has(iso)) {
          presentDates.add(iso);
          if (d.getDay() === 0) sundayWorkedDays++; // Sunday work log
        }
      }

      const presentDays = presentDates.size;
      const leaveDays   = leaveDates.size;

      // Absent = 30 - present - leave (can't go below 0)
      const absentDays  = Math.max(0, WORKING_DAYS - presentDays - leaveDays);

      // ── Salary calculation ──────────────────────────────────
      // Per day rate based on gross / 30
      const perDayRate = salary.grossSalary / WORKING_DAYS;

      // Loss of pay for absent days
      const lossOfPay = Math.round(perDayRate * absentDays);

      // Sunday overtime bonus: 1.5x per day rate - 1x (the extra 0.5x)
      const sundayBonus = Math.round(perDayRate * 0.5 * sundayWorkedDays);

      const totalDeductions = salary.pf + salary.esic + salary.tds + salary.otherDeductions + lossOfPay;
      const netSalary       = Math.max(0, salary.grossSalary - totalDeductions + sundayBonus);

      const payslip = await this.payrollRepo.upsert(employeeId, month, year, {
        basic:           salary.basic,
        hra:             salary.hra,
        ta:              salary.ta,
        medical:         salary.medical,
        special:         salary.special,
        otherAllowances: salary.otherAllowances + sundayBonus, // add sunday bonus to allowances
        grossSalary:     salary.grossSalary + sundayBonus,
        pf:              salary.pf,
        esic:            salary.esic,
        tds:             salary.tds,
        otherDeductions: salary.otherDeductions,
        lossOfPay,
        workingDays:     WORKING_DAYS,
        presentDays,
        absentDays,
        leaveDays,
        totalDeductions,
        netSalary,
        status: "draft",
        generatedBy: performedBy,
        // Store extra info in remarks for transparency
        remarks: `PerDay:₹${Math.round(perDayRate)} | Present:${presentDays} | Absent:${absentDays} | Leave:${leaveDays} | SundayBonus(${sundayWorkedDays}days):₹${sundayBonus}`,
      });

      await this.auditRepo.create({ performedBy, performedByName, action: "CREATE", entity: "Payroll", entityId: payslip._id, description: `Generated payslip for ${month}/${year}. Present:${presentDays}/30, Sunday:${sundayWorkedDays}days, Net:₹${netSalary}` });
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
