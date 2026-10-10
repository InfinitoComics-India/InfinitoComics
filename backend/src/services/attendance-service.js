import AttendanceRepository from "../repository/attendance-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";
import NotificationRepository from "../repository/notification-repository.js";

const SHIFT_START_HOUR   = 9;  // 9:00 AM
const SHIFT_START_MINUTE = 0;
const GRACE_MINUTES      = 15; // 15 min grace before marking late

class AttendanceService {
  constructor() {
    this.attendanceRepo   = new AttendanceRepository();
    this.auditRepo        = new AuditLogRepository();
    this.notificationRepo = new NotificationRepository();
  }

  // ── Clock In ──────────────────────────────────────────────
  async clockIn(employeeId, performedBy, performedByName) {
    try {
      const now  = new Date();
      const date = new Date(now);

      // Check if already clocked in today
      const existing = await this.attendanceRepo.getByEmployeeAndDate(employeeId, date);
      if (existing && existing.clockIn) {
        throw new Error("Already clocked in today.");
      }

      // Determine if late
      const shiftStart = new Date(now);
      shiftStart.setHours(SHIFT_START_HOUR, SHIFT_START_MINUTE, 0, 0);
      const graceCutoff = new Date(shiftStart.getTime() + GRACE_MINUTES * 60 * 1000);

      const isLate       = now > graceCutoff;
      const lateByMinutes = isLate ? Math.floor((now - graceCutoff) / 60000) : 0;

      const record = await this.attendanceRepo.upsert(employeeId, date, {
        clockIn:  now,
        status:   isLate ? "late" : "present",
        isLate,
        lateByMinutes,
      });

      await this.auditRepo.create({
        performedBy,
        performedByName,
        action:      "UPDATE",
        entity:      "Attendance",
        entityId:    record._id,
        description: `Clock In at ${now.toLocaleTimeString()} ${isLate ? `(Late by ${lateByMinutes} mins)` : ""}`,
      });

      return record;
    } catch (error) {
      console.error("AttendanceService.clockIn:", error);
      throw error;
    }
  }

  // ── Clock Out ─────────────────────────────────────────────
  async clockOut(employeeId, performedBy, performedByName) {
    try {
      const now  = new Date();
      const record = await this.attendanceRepo.getByEmployeeAndDate(employeeId, now);

      if (!record) throw new Error("No clock-in record found for today.");
      if (record.clockOut) throw new Error("Already clocked out today.");

      const hoursWorked = parseFloat(
        ((now - record.clockIn) / (1000 * 60 * 60)).toFixed(2)
      );

      const updated = await this.attendanceRepo.upsert(employeeId, now, {
        clockOut: now,
        hoursWorked,
        status: hoursWorked < 4 ? "half_day" : record.status,
      });

      await this.auditRepo.create({
        performedBy,
        performedByName,
        action:      "UPDATE",
        entity:      "Attendance",
        entityId:    updated._id,
        description: `Clock Out at ${now.toLocaleTimeString()} — ${hoursWorked} hrs worked`,
      });

      return updated;
    } catch (error) {
      console.error("AttendanceService.clockOut:", error);
      throw error;
    }
  }

  // ── Manual Mark (admin/HR) ────────────────────────────────
  async markAttendance(employeeId, date, status, note, performedBy, performedByName) {
    try {
      const record = await this.attendanceRepo.upsert(employeeId, date, {
        status,
        note,
        markedBy:    performedBy,
        isCorrected: true,
      });

      await this.auditRepo.create({
        performedBy,
        performedByName,
        action:      "UPDATE",
        entity:      "Attendance",
        entityId:    record._id,
        description: `Manually marked attendance as ${status} for ${new Date(date).toDateString()}. Note: ${note || "none"}`,
      });

      // Notify employee
      await this.notificationRepo.create({
        recipientId:    employeeId,
        recipientModel: "Employee",
        type:           "system",
        title:          "Attendance Updated",
        message:        `Your attendance for ${new Date(date).toDateString()} has been updated to "${status}".`,
        link:           "/hr/attendance",
      });

      return record;
    } catch (error) {
      console.error("AttendanceService.markAttendance:", error);
      throw error;
    }
  }

  // ── Get Today for all employees ───────────────────────────
  async getTodayAll() {
    try {
      return await this.attendanceRepo.getByDate(new Date());
    } catch (error) {
      console.error("AttendanceService.getTodayAll:", error);
      throw error;
    }
  }

  // ── Get monthly records for one employee ──────────────────
  async getMonthlyForEmployee(employeeId, year, month) {
    try {
      return await this.attendanceRepo.getMonthlyForEmployee(employeeId, year, month);
    } catch (error) {
      console.error("AttendanceService.getMonthlyForEmployee:", error);
      throw error;
    }
  }

  // ── Get monthly summary (all employees) ──────────────────
  async getMonthlySummary(year, month) {
    try {
      return await this.attendanceRepo.getMonthlySummary(year, month);
    } catch (error) {
      console.error("AttendanceService.getMonthlySummary:", error);
      throw error;
    }
  }

  // ── Get today's record for one employee ───────────────────
  async getTodayForEmployee(employeeId) {
    try {
      return await this.attendanceRepo.getByEmployeeAndDate(employeeId, new Date());
    } catch (error) {
      console.error("AttendanceService.getTodayForEmployee:", error);
      throw error;
    }
  }
}

export default AttendanceService;
