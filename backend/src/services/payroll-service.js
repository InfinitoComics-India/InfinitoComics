import PayrollRepository from "../repository/payroll-repository.js";
import SalaryRepository from "../repository/salary-repository.js";
import AttendanceRepository from "../repository/attendance-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";
import NotificationRepository from "../repository/notification-repository.js";
import EmployeeRepository from "../repository/employee-repository.js";
import DailyWorkLog from "../models/DailyWorkLog.js";

const WORKING_DAYS = 26; // All days working — use 26 as monthly base (avg working days)

class PayrollService {
  constructor() {
    this.payrollRepo      = new PayrollRepository();
    this.salaryRepo       = new SalaryRepository();
    this.attendanceRepo   = new AttendanceRepository();
    this.auditRepo        = new AuditLogRepository();
    this.notificationRepo = new NotificationRepository();
    this.employeeRepo     = new EmployeeRepository();
  }

  // ── Generate payslip for one employee for a month ─────────
  async generatePayslip(employeeId, month, year, performedBy, performedByName) {
    try {
      // Get salary structure
      const salary = await this.salaryRepo.getByEmployee(employeeId);
      if (!salary) throw new Error("No salary structure found. Set salary first.");

      // Get attendance for the month — check both Employee ID and Admin ID
      const Attendance = (await import('../models/Attendance.js')).default;
      const attStart = new Date(Date.UTC(year, month - 1, 1));
      const attEnd   = new Date(Date.UTC(year, month, 0, 23, 59, 59));
      const attendance   = await Attendance.find({
        employeeId: employeeId,
        date: { $gte: attStart, $lte: attEnd }
      });

      // Build a set of dates where employee was present (from attendance)
      const presentDates   = new Set();
      const leaveDates     = new Set();
      let sundayWorkedDays = 0;

      for (const rec of attendance) {
        const d    = new Date(rec.date);
        // Add IST offset to get correct day of week
        const istD = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
        const iso  = istD.toISOString().split("T")[0];
        const isSunday = istD.getUTCDay() === 0;

        if (["present","late","half_day"].includes(rec.status)) {
          presentDates.add(iso);
          if (isSunday) sundayWorkedDays++;
        } else if (rec.status === "on_leave") {
          leaveDates.add(iso);
        }
        // NOTE: Every day is a working day — Sunday is NOT a weekend
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
        const d    = new Date(wl.date);
        const istD = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
        const iso  = istD.toISOString().split("T")[0];
        if (!presentDates.has(iso) && !leaveDates.has(iso)) {
          presentDates.add(iso);
          if (istD.getUTCDay() === 0) sundayWorkedDays++;
        }
      }

      const presentDays = presentDates.size;
      const leaveDays   = leaveDates.size;

      // ── Determine how many days should actually be counted ───
      // Days that haven't happened yet (future days in the current month) and days
      // before the employee's joining date must NOT be treated as absent — otherwise
      // a brand-new employee or an employee with no attendance marked yet gets the
      // full month counted as absent, wiping out their net pay.
      const employee = await this.employeeRepo.getById(employeeId);
      const today    = new Date();
      const monthEnd = new Date(year, month, 0); // last calendar day of the payroll month
      const isCurrentOrFutureMonth =
        year > today.getFullYear() ||
        (year === today.getFullYear() && month - 1 >= today.getMonth());

      // Last day of the period that has actually elapsed (inclusive).
      let lastElapsedDay = monthEnd.getDate(); // default: whole month has elapsed (past period)
      if (isCurrentOrFutureMonth) {
        const sameMonth = today.getFullYear() === year && today.getMonth() === month - 1;
        lastElapsedDay = sameMonth ? today.getDate() : 0; // future month → nothing elapsed yet
      }

      // First day of the period the employee was actually employed (inclusive).
      let firstEmployedDay = 1;
      if (employee?.joiningDate) {
        const join = new Date(employee.joiningDate);
        if (join.getFullYear() === year && join.getMonth() === month - 1) {
          firstEmployedDay = join.getDate();
        } else if (join.getFullYear() > year || (join.getFullYear() === year && join.getMonth() > month - 1)) {
          // Employee joins after this payroll period entirely — no days to count.
          firstEmployedDay = monthEnd.getDate() + 1;
        }
      }

      // Days in this period that count toward attendance (elapsed AND employed).
      // ALL days including Sundays are working days.
      const countableDays = Math.max(0, lastElapsedDay - firstEmployedDay + 1);

      // Absent = countable days - present - leave (can't go below 0)
      const absentDays = Math.max(0, countableDays - presentDays - leaveDays);

      // ── Salary calculation ──────────────────────────────────
      // Per day rate based on gross / WORKING_DAYS
      const perDayRate = salary.grossSalary / WORKING_DAYS;

      // Loss of pay for absent days (each absent day = 1x per day rate)
      const lossOfPay = Math.round(perDayRate * absentDays);

      // Sunday bonus: extra 0.5x for each Sunday worked (total 1.5x instead of 1x)
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
        remarks: `PerDay:₹${Math.round(perDayRate)} | Countable:${countableDays} | Present:${presentDays} | Absent:${absentDays} | Leave:${leaveDays} | SundayBonus(${sundayWorkedDays}days):₹${sundayBonus}`,
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
