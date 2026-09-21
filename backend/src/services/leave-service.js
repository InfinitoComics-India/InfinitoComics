import LeaveRepository from "../repository/leave-repository.js";
import AttendanceRepository from "../repository/attendance-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";
import NotificationRepository from "../repository/notification-repository.js";
import EmployeeRepository from "../repository/employee-repository.js";
import CalendarEventRepository from "../repository/calendarEvent-repository.js";

class LeaveService {
  constructor() {
    this.leaveRepo        = new LeaveRepository();
    this.attendanceRepo   = new AttendanceRepository();
    this.auditRepo        = new AuditLogRepository();
    this.notificationRepo = new NotificationRepository();
    this.employeeRepo     = new EmployeeRepository();
    this.calendarRepo     = new CalendarEventRepository();
  }

  // ── Calculate working days between two dates ──────────────
  _calcWorkingDays(fromDate, toDate, isHalfDay = false) {
    if (isHalfDay) return 0.5;
    let count = 0;
    const cur = new Date(fromDate);
    const end = new Date(toDate);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++; // skip Sun=0, Sat=6
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }

  // ── Apply for leave ───────────────────────────────────────
  async applyLeave(data, performedBy, performedByName) {
    try {
      const { employeeId, leaveType, fromDate, toDate, reason, isHalfDay, halfDaySession } = data;

      // Check for overlap
      const overlap = await this.leaveRepo.getOverlapping(employeeId, fromDate, toDate);
      if (overlap) throw new Error("You already have a leave request overlapping these dates.");

      const totalDays = this._calcWorkingDays(fromDate, toDate, isHalfDay);
      if (totalDays <= 0) throw new Error("Invalid date range — no working days selected.");

      // Check leave balance
      const employee = await this.employeeRepo.getById(employeeId);
      if (!employee) throw new Error("Employee not found.");

      const balance = employee.leaveBalance?.[leaveType];
      if (balance !== undefined && balance < totalDays) {
        throw new Error(`Insufficient ${leaveType} leave balance. Available: ${balance} days, Requested: ${totalDays} days.`);
      }

      const leave = await this.leaveRepo.create({
        employeeId,
        leaveType,
        fromDate: new Date(fromDate),
        toDate:   new Date(toDate),
        totalDays,
        reason,
        isHalfDay:      isHalfDay || false,
        halfDaySession: halfDaySession || undefined,
        attachments:    data.attachments || [],
      });

      // Audit
      await this.auditRepo.create({
        performedBy,
        performedByModel: "Employee",
        performedByName,
        action:      "CREATE",
        entity:      "Leave",
        entityId:    leave._id,
        description: `Leave applied: ${leaveType} from ${new Date(fromDate).toDateString()} to ${new Date(toDate).toDateString()} (${totalDays} days)`,
      });

      // Notify the employee's manager
      if (employee.reportingManager) {
        await this.notificationRepo.create({
          recipientId:    employee.reportingManager,
          recipientModel: "Employee",
          type:           "leave_applied",
          title:          "New Leave Request",
          message:        `${employee.firstName} ${employee.lastName} has applied for ${leaveType} leave from ${new Date(fromDate).toDateString()} to ${new Date(toDate).toDateString()}.`,
          link:           "/hr/leaves",
          triggeredBy:    employeeId,
          entity:         "Leave",
          entityId:       leave._id,
        });
      }

      return leave;
    } catch (error) {
      console.error("LeaveService.applyLeave:", error);
      throw error;
    }
  }

  // ── Approve leave ─────────────────────────────────────────
  async approveLeave(leaveId, adminNote, performedBy, performedByName) {
    try {
      const leave = await this.leaveRepo.getById(leaveId);
      if (!leave) throw new Error("Leave request not found.");
      if (leave.status !== "pending") throw new Error("Only pending leave requests can be approved.");

      const updated = await this.leaveRepo.findByIdandUpdate(leaveId, {
        status:     "approved",
        approvedBy: performedBy,
        approvedAt: new Date(),
        adminNote:  adminNote || "",
      });

      // Deduct from leave balance
      const employee = await this.employeeRepo.getById(leave.employeeId);
      if (employee && employee.leaveBalance?.[leave.leaveType] !== undefined) {
        const newBalance = Math.max(0, employee.leaveBalance[leave.leaveType] - leave.totalDays);
        await this.employeeRepo.findByIdandUpdate(leave.employeeId, {
          [`leaveBalance.${leave.leaveType}`]: newBalance,
        });
      }

      // Update attendance records for leave days
      await this._markAttendanceForLeave(leave);

      // Add calendar event
      await this.calendarRepo.create({
        title:         `${employee?.firstName} ${employee?.lastName} — ${leave.leaveType} leave`,
        type:          "leave",
        startDate:     leave.fromDate,
        endDate:       leave.toDate,
        isAllDay:      true,
        isCompanyWide: false,
        participants:  [leave.employeeId],
        createdBy:     performedBy,
        relatedEntity: "Leave",
        relatedEntityId: leaveId,
      });

      // Notify employee
      await this.notificationRepo.create({
        recipientId:    leave.employeeId,
        recipientModel: "Employee",
        type:           "leave_approved",
        title:          "Leave Approved",
        message:        `Your ${leave.leaveType} leave from ${leave.fromDate.toDateString()} to ${leave.toDate.toDateString()} has been approved.`,
        link:           "/hr/my-leaves",
        triggeredBy:    performedBy,
      });

      await this.auditRepo.create({
        performedBy,
        performedByName,
        action:      "APPROVE",
        entity:      "Leave",
        entityId:    leaveId,
        description: `Approved ${leave.leaveType} leave for employee (${leave.totalDays} days)`,
      });

      return updated;
    } catch (error) {
      console.error("LeaveService.approveLeave:", error);
      throw error;
    }
  }

  // ── Reject leave ──────────────────────────────────────────
  async rejectLeave(leaveId, rejectionNote, performedBy, performedByName) {
    try {
      const leave = await this.leaveRepo.getById(leaveId);
      if (!leave) throw new Error("Leave request not found.");
      if (leave.status !== "pending") throw new Error("Only pending leave requests can be rejected.");

      const updated = await this.leaveRepo.findByIdandUpdate(leaveId, {
        status:        "rejected",
        rejectionNote: rejectionNote || "",
        approvedBy:    performedBy,
        approvedAt:    new Date(),
      });

      // Notify employee
      await this.notificationRepo.create({
        recipientId:    leave.employeeId,
        recipientModel: "Employee",
        type:           "leave_rejected",
        title:          "Leave Rejected",
        message:        `Your ${leave.leaveType} leave request has been rejected. ${rejectionNote ? `Reason: ${rejectionNote}` : ""}`,
        link:           "/hr/my-leaves",
        triggeredBy:    performedBy,
      });

      await this.auditRepo.create({
        performedBy,
        performedByName,
        action:      "REJECT",
        entity:      "Leave",
        entityId:    leaveId,
        description: `Rejected ${leave.leaveType} leave. Reason: ${rejectionNote || "none"}`,
      });

      return updated;
    } catch (error) {
      console.error("LeaveService.rejectLeave:", error);
      throw error;
    }
  }

  // ── Cancel leave (by employee) ────────────────────────────
  async cancelLeave(leaveId, performedBy, performedByName) {
    try {
      const leave = await this.leaveRepo.getById(leaveId);
      if (!leave) throw new Error("Leave request not found.");
      if (!["pending", "approved"].includes(leave.status)) {
        throw new Error("Only pending or approved leaves can be cancelled.");
      }

      // Restore balance if was approved
      if (leave.status === "approved") {
        const employee = await this.employeeRepo.getById(leave.employeeId);
        if (employee && employee.leaveBalance?.[leave.leaveType] !== undefined) {
          await this.employeeRepo.findByIdandUpdate(leave.employeeId, {
            [`leaveBalance.${leave.leaveType}`]: employee.leaveBalance[leave.leaveType] + leave.totalDays,
          });
        }
      }

      const updated = await this.leaveRepo.findByIdandUpdate(leaveId, { status: "cancelled" });

      await this.auditRepo.create({
        performedBy,
        performedByName,
        action:      "STATUS_CHANGE",
        entity:      "Leave",
        entityId:    leaveId,
        description: `Leave cancelled`,
      });

      return updated;
    } catch (error) {
      console.error("LeaveService.cancelLeave:", error);
      throw error;
    }
  }

  // ── Get all leaves for an employee ───────────────────────
  async getByEmployee(employeeId, status) {
    try {
      return await this.leaveRepo.getByEmployee(employeeId, status);
    } catch (error) {
      console.error("LeaveService.getByEmployee:", error);
      throw error;
    }
  }

  // ── Get pending leaves queue ──────────────────────────────
  async getPending() {
    try {
      return await this.leaveRepo.getPending();
    } catch (error) {
      console.error("LeaveService.getPending:", error);
      throw error;
    }
  }

  // ── Get leave balance for an employee ────────────────────
  async getBalance(employeeId) {
    try {
      const employee = await this.employeeRepo.getById(employeeId);
      if (!employee) throw new Error("Employee not found.");
      const usedDays = await this.leaveRepo.getUsedDays(employeeId, new Date().getFullYear());
      return {
        balance: employee.leaveBalance,
        used: usedDays,
      };
    } catch (error) {
      console.error("LeaveService.getBalance:", error);
      throw error;
    }
  }

  // ── Private: mark attendance as on_leave ─────────────────
  async _markAttendanceForLeave(leave) {
    try {
      const cur = new Date(leave.fromDate);
      const end = new Date(leave.toDate);
      while (cur <= end) {
        const day = cur.getDay();
        if (day !== 0 && day !== 6) {
          await this.attendanceRepo.upsert(leave.employeeId, new Date(cur), {
            status: "on_leave",
          });
        }
        cur.setDate(cur.getDate() + 1);
      }
      await this.leaveRepo.findByIdandUpdate(leave._id, { attendanceUpdated: true });
    } catch (error) {
      console.error("LeaveService._markAttendanceForLeave:", error);
    }
  }
}

export default LeaveService;
