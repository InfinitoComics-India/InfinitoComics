import AttendanceRepository from "../repository/attendance-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";
import NotificationRepository from "../repository/notification-repository.js";

const GRACE_MINUTES = 0; // flexible job — no late marking

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

      // Use IST midnight for date boundary (UTC+5:30)
      // Search a 48-hour window to catch records stored in either UTC or IST midnight
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istNow    = new Date(now.getTime() + istOffset);
      istNow.setUTCHours(0, 0, 0, 0);
      const start = new Date(istNow.getTime() - istOffset); // IST midnight in UTC
      const end   = new Date(start.getTime() + 24*60*60*1000 - 1); // end of IST day
      // Also search UTC midnight start for backwards compat
      const utcStart = new Date(new Date(now).setHours(0, 0, 0, 0));
      const utcEnd   = new Date(new Date(now).setHours(23, 59, 59, 999));
      // Use whichever window is wider
      const searchStart = utcStart < start ? utcStart : start;
      const searchEnd   = utcEnd   > end   ? utcEnd   : end;

      const existing = await Attendance.findOne({ employeeId, date: { $gte: searchStart, $lte: searchEnd } });

      // Block if already clocked in (last session open or legacy clockIn without clockOut)
      if (existing?.sessions?.length > 0) {
        const openSession = existing.sessions.find(s => !s.clockOut);
        if (openSession) throw new Error("Already clocked in. Please clock out first.");
      } else if (existing?.clockIn && !existing?.clockOut) {
        throw new Error("Already clocked in. Please clock out first.");
      }

      // Flexible job — no shift start, no late marking
      const isLate        = false;
      const lateByMinutes = 0;

      const newSession = { clockIn: now, clockOut: null, hoursWorked: 0 };
      // Convert existing sessions to plain objects to avoid Mongoose subdoc issues
      const existingSessions = (existing?.sessions || []).map(s => ({
        clockIn: s.clockIn,
        clockOut: s.clockOut || null,
        hoursWorked: s.hoursWorked || 0,
      }));
      const sessions = [...existingSessions, newSession];

      let record;
      if (existing) {
        record = await Attendance.findByIdAndUpdate(
          existing._id,
          { $push: { sessions: newSession }, $set: { status: "present" } },
          { new: true }
        );
      } else {
        // Look up employee name from Admin account
        let eName = "", eEmpId = "";
        try {
          const Admin = (await import('../models/Admin.js')).default;
          const adm = await Admin.findById(employeeId).select("name employeeId");
          if (adm) { eName = adm.name || ""; eEmpId = adm.employeeId || ""; }
        } catch {}

        record = await Attendance.create({
          employeeId, date: start, sessions,
          employeeName: eName, employeeEmpId: eEmpId,
          clockIn: now, status: isLate ? "late" : "present", isLate, lateByMinutes,
        });
      }

      await this.auditRepo.create({
        performedBy, performedByName,
        action: "UPDATE", entity: "Attendance", entityId: record._id,
        description: `Clock In session at ${now.toLocaleTimeString()}`,
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

      const istOffset = 5.5 * 60 * 60 * 1000;
      const istNow2   = new Date(now.getTime() + istOffset);
      istNow2.setUTCHours(0, 0, 0, 0);
      const start2 = new Date(istNow2.getTime() - istOffset);
      const end2   = new Date(start2.getTime() + 24*60*60*1000 - 1);
      const utcStart2 = new Date(new Date(now).setHours(0, 0, 0, 0));
      const utcEnd2   = new Date(new Date(now).setHours(23, 59, 59, 999));
      const searchStart2 = utcStart2 < start2 ? utcStart2 : start2;
      const searchEnd2   = utcEnd2   > end2   ? utcEnd2   : end2;

      const record = await Attendance.findOne({ employeeId, date: { $gte: searchStart2, $lte: searchEnd2 } });
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
        const legacyStatus = hoursWorked >= 4 ? (record.isLate ? "late" : "present") : "half_day";
        const updated = await Attendance.findByIdAndUpdate(record._id,
          { $set: { clockOut: now, hoursWorked, totalHours: hoursWorked, status: legacyStatus } },
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
      const newStatus = totalHours >= 4 ? (record.isLate ? "late" : "present") : "half_day";

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
