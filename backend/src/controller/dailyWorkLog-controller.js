import DailyWorkLog from "../models/DailyWorkLog.js";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";

// ── Helper: get today's date at midnight IST ─────────────────
const getTodayIST = () => {
  const now = new Date();
  // IST = UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  istNow.setUTCHours(0, 0, 0, 0);
  return new Date(istNow.getTime() - istOffset); // back to UTC for storage
};

// ── Helper: check if it's past midnight IST ──────────────────
const isPastMidnightIST = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  const hours = istNow.getUTCHours();
  const mins  = istNow.getUTCMinutes();
  // Past midnight means after 00:00 IST = 18:30 UTC previous day
  // Actually — entries submitted today before midnight are fine.
  // We check: if current IST time is 00:00 to 23:59, still today's window.
  // Entries lock when the day changes (i.e., istNow.date > log.date)
  return false; // Logic handled by isLocked field
};

// ── Submit / Update today's work log ─────────────────────────
export const submitWorkLog = async (req, res) => {
  try {
    const { employeeId, workDescription, hoursWorked } = req.body;
    if (!employeeId) return res.status(400).json({ success: false, message: "employeeId is required." });
    if (!workDescription?.trim()) return res.status(400).json({ success: false, message: "workDescription is required." });
    if (!hoursWorked || hoursWorked <= 0) return res.status(400).json({ success: false, message: "hoursWorked must be greater than 0." });

    const today = getTodayIST();

    // Check if entry exists
    const existing = await DailyWorkLog.findOne({ employeeId, date: today });

    if (existing) {
      // If locked — cannot edit
      if (existing.isLocked) {
        return res.status(403).json({ success: false, message: "Today's work log is locked. Submissions are closed after midnight." });
      }
      // Update existing
      existing.workDescription = workDescription.trim();
      existing.hoursWorked     = hoursWorked;
      existing.status          = existing.status === "submitted" ? "edited" : "submitted";
      existing.lastEditedAt    = new Date();
      if (!existing.submittedAt) existing.submittedAt = new Date();
      await existing.save();
      return res.status(200).json({ success: true, message: "Work log updated.", data: existing });
    }

    // Get employee name
    const emp = await Employee.findById(employeeId).select("firstName lastName");
    const employeeName = emp ? `${emp.firstName} ${emp.lastName}` : "";

    // Create new entry
    const log = await DailyWorkLog.create({
      employeeId,
      employeeName,
      date:            today,
      workDescription: workDescription.trim(),
      hoursWorked,
      status:          "submitted",
      submittedAt:     new Date(),
    });

    res.status(201).json({ success: true, message: "Work log submitted successfully.", data: log });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ success: false, message: "Work log already exists for today." });
    res.status(500).json({ success: false, message: e.message });
  }
};

// ── Get today's log for one employee ─────────────────────────
export const getTodayLog = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const today = getTodayIST();
    const log = await DailyWorkLog.findOne({ employeeId, date: today });
    res.status(200).json({ success: true, data: log || null });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ── Get all logs for a date (admin view) ─────────────────────
export const getLogsForDate = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : getTodayIST();

    // Normalise to start of day
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const logs = await DailyWorkLog.find({
      date: { $gte: targetDate, $lt: nextDay },
    }).populate("employeeId", "firstName lastName designation department")
      .sort({ status: 1, employeeName: 1 });

    res.status(200).json({ success: true, data: logs, count: logs.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ── Get all logs for an employee ─────────────────────────────
export const getLogsForEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { limit = 30 } = req.query;
    const logs = await DailyWorkLog.find({ employeeId })
      .sort({ date: -1 })
      .limit(parseInt(limit));
    res.status(200).json({ success: true, data: logs, count: logs.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ── Get summary stats for a date (admin) ─────────────────────
export const getSummaryForDate = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : getTodayIST();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const logs = await DailyWorkLog.find({ date: { $gte: targetDate, $lt: nextDay } });
    const totalEmployees = await Employee.countDocuments({ status: "active" });

    const summary = {
      total:       totalEmployees,
      submitted:   logs.filter(l => ["submitted","edited"].includes(l.status)).length,
      auto_leave:  logs.filter(l => l.status === "auto_leave").length,
      pending:     totalEmployees - logs.length,
      avgHours:    logs.length > 0
        ? Math.round(logs.reduce((s, l) => s + (l.hoursWorked || 0), 0) / logs.length * 10) / 10
        : 0,
    };

    res.status(200).json({ success: true, data: summary });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ── CRON: Run at 12:00 AM IST to lock and auto-mark leaves ───
export const runMidnightCron = async (req, res) => {
  try {
    const result = await processMidnightAutoLeave();
    res.status(200).json({ success: true, message: "Midnight cron completed.", ...result });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ── Shared cron logic (also called by node-cron) ──────────────
export const processMidnightAutoLeave = async () => {
  const yesterday = getTodayIST();
  yesterday.setDate(yesterday.getDate() - 1);
  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setHours(23, 59, 59, 999);

  // Lock all yesterday's submitted entries
  await DailyWorkLog.updateMany(
    { date: { $gte: yesterday, $lte: endOfYesterday }, isLocked: false },
    { isLocked: true, lockedAt: new Date() }
  );

  // Find all active employees
  const employees = await Employee.find({ status: "active" }).select("_id firstName lastName");

  // Find who already submitted yesterday
  const submitted = await DailyWorkLog.find({
    date: { $gte: yesterday, $lte: endOfYesterday },
    status: { $in: ["submitted", "edited"] },
  }).select("employeeId");

  const submittedIds = new Set(submitted.map(l => l.employeeId.toString()));

  let autoLeaveCount = 0;

  for (const emp of employees) {
    if (!submittedIds.has(emp._id.toString())) {
      // Upsert auto_leave entry for yesterday
      await DailyWorkLog.findOneAndUpdate(
        { employeeId: emp._id, date: yesterday },
        {
          employeeId:      emp._id,
          employeeName:    `${emp.firstName} ${emp.lastName}`,
          date:            yesterday,
          workDescription: "Auto-marked as leave — no work log submitted.",
          hoursWorked:     0,
          status:          "auto_leave",
          isAutoLeave:     true,
          isLocked:        true,
          lockedAt:        new Date(),
        },
        { upsert: true, new: true }
      );

      // Also update attendance to on_leave
      await Attendance.findOneAndUpdate(
        { employeeId: emp._id, date: { $gte: yesterday, $lte: endOfYesterday } },
        { status: "on_leave", note: "Auto-marked: no daily work log submitted.", isCorrected: true },
        { upsert: true, new: true }
      );

      autoLeaveCount++;
    }
  }

  console.log(`✅ Midnight cron: ${autoLeaveCount} employees marked as auto_leave for ${yesterday.toDateString()}`);
  return { autoLeaveCount, date: yesterday.toDateString() };
};

export default { submitWorkLog, getTodayLog, getLogsForDate, getLogsForEmployee, getSummaryForDate, runMidnightCron };
