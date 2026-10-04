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
      const Attendance = (await import('../models/Attendance.js')).default;
      const d     = new Date(now);
      const start = new Date(new Date(d).setHours(0, 0, 0, 0));
      const end   = new Date(new Date(d).setHours(23, 59, 59, 999));

      const existing = await Attendance.findOne({ employeeId, date: { $gte: start, $lte: end } });

      // Block if already clocked in (last session open or legacy clockIn without clockOut)
      if (existing?.sessions?.length > 0) {
        const openSession = existing.sessions.find(s => !s.clockOut);
        if (openSession) throw new Error("Already clocked in. Please clock out first.");
      } else if (existing?.clockIn && !existing?.clockOut) {
        throw new Error("Already clocked in. Please clock out first.");
      }

      // Late check
      const shiftStart  = new Date(now);
      shiftStart.setHours(SHIFT_START_HOUR, SHIFT_START_MINUTE, 0, 0);
      const graceCutoff = new Date(shiftStart.getTime() + GRACE_MINUTES * 60 * 1000);
      const isLate        = now > graceCutoff;
      const lateByMinutes = isLate ? Math.floor((now - graceCutoff) / 60000) : 0;

      const newSession = { clockIn: now, clockOut: null, hoursWorked: 0 };
      const sessions   = [...(existing?.sessions || []), newSession];

      let record;
      if (existing) {
        record = await Attendance.findByIdAndUpdate(
          existing._id,
          { $set: { sessions, status: "present", isLate: existing.isLate || isLate, lateByMinutes: existing.lateByMinutes || lateByMinutes } },
          { new: true }
        );
      } else {
        record = await Attendance.create({
          employeeId, date: start, sessions,
          clockIn: now, status: isLate ? "late" : "present", isLate, lateByMinutes,
        });
      }

      await this.auditRepo.create({
        performedBy, performedByName,
        action: "UPDATE", entity: "Attendance", entityId: record._id,
        description: `Clock In #${sessions.length} at ${now.toLocaleTimeString()} ${isLate ? `(Late by ${lateByMinutes} mins)` : ""}`,
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
      const now    = new Date();
      const Attendance = (await import('../models/Attendance.js')).default;
      const d     = new Date(now);
      const start = new Date(new Date(d).setHours(0, 0, 0, 0));
      const end   = new Date(new Date(d).setHours(23, 59, 59, 999));

      const record = await Attendance.findOne({ employeeId, date: { $gte: start, $lte: end } });
      if (!record) throw new Error("No clock-in record found for today.");

      // Find last open session
      const sessions = record.sessions || [];
      const lastIndex = sessions.findLastIndex ? sessions.findLastIndex(s => !s.clockOut) :
        [...sessions].reverse().findIndex(s => !s.clockOut);
      const actualIndex = sessions.findLastIndex ? lastIndex :
        lastIndex === -1 ? -1 : sessions.length - 1 - lastIndex;

      // Also check legacy clockIn/clockOut
      if (actualIndex === -1 && sessions.length === 0) {
        // Legacy mode — no sessions array
        if (!record.clockIn) throw new Error("Not currently clocked in.");
        if (record.clockOut) throw new Error("Already clocked out.");
        const hoursWorked = parseFloat(((now - record.clockIn) / (1000*60*60)).toFixed(2));
        const updated = await Attendance.findByIdAndUpdate(record._id,
          { $set: { clockOut: now, hoursWorked, totalHours: hoursWorked, status: record.isLate ? "late" : "present" } },
          { new: true }
        );
        return updated;
      }

      if (actualIndex === -1) throw new Error("Not currently clocked in. Please clock in first.");

      // Close the last open session
      const sessionClockIn = new Date(sessions[actualIndex].clockIn);
      const sessionHours = parseFloat(((now - sessionClockIn) / (1000*60*60)).toFixed(2));

      // Build updated sessions array
      const updatedSessions = sessions.map((s, i) => {
        if (i === actualIndex) return { clockIn: s.clockIn, clockOut: now, hoursWorked: sessionHours };
        return { clockIn: s.clockIn, clockOut: s.clockOut, hoursWorked: s.hoursWorked || 0 };
      });

      const totalHours = parseFloat(
        updatedSessions.reduce((sum, s) => sum + (s.hoursWorked || 0), 0).toFixed(2)
      );
      const newStatus = record.isLate ? "late" : "present";

      const updated = await Attendance.findByIdAndUpdate(
        record._id,
        { $set: { sessions: updatedSessions, clockOut: now, hoursWorked: totalHours, totalHours, status: newStatus } },
        { new: true }
      );

      await this.auditRepo.create({
        performedBy, performedByName,
        action: "UPDATE", entity: "Attendance", entityId: updated._id,
        description: `Clock Out at ${now.toLocaleTimeString()} — Session: ${sessionHours}h | Total: ${totalHours}h`,
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
