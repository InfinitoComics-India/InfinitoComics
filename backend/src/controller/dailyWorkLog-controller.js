import DailyWorkLog from "../models/DailyWorkLog.js";
import Admin from "../models/Admin.js";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

// ── Helper: today's date at midnight IST ─────────────────────
const getTodayIST = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  istNow.setUTCHours(0, 0, 0, 0);
  return new Date(istNow.getTime() - istOffset);
};

// ── Helper: convert a date string (YYYY-MM-DD) to IST midnight in UTC ──────
const dateToISTMidnight = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utcMidnight = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
  return new Date(utcMidnight - istOffset);
};

// ── SUBMIT / UPDATE today's work log ─────────────────────────
export const submitWorkLog = async (req, res) => {
  try {
    const adminId   = req.user._id;
    const adminName = req.user.name || req.user.username || "";
    const adminEmail= req.user.email || "";
    const adminEmployeeId = req.user.employeeId || "";
    const { workDescription } = req.body;

    if (!workDescription?.trim()) return res.status(400).json({ success: false, message: "Work description is required." });

    const today = getTodayIST();
    const existing = await DailyWorkLog.findOne({ adminId, date: today });

    if (existing) {
      // Allow updating auto_leave records — save work but keep auto_leave status
      // Only superadmin can change status from auto_leave (via review endpoint)
      if (existing.isLocked && existing.status !== "auto_leave") {
        return res.status(403).json({ success: false, message: "Today's work log is locked. Submissions are closed after midnight IST." });
      }
      existing.workDescription = workDescription.trim();
      // If auto_leave, keep the status — superadmin reviews and overrides manually
      if (existing.status !== "auto_leave") {
        existing.status = "edited";
      }
      existing.lastEditedAt = new Date();
      await existing.save();
      const msg = existing.status === "auto_leave"
        ? "Work saved. Note: You are still marked as Auto Leave. Superadmin can change your status."
        : "Work log updated.";
      return res.status(200).json({ success: true, message: msg, data: existing });
    }

    const log = await DailyWorkLog.create({
      adminId,
      adminName,
      adminEmail,
      adminEmployeeId,
      date:            today,
      workDescription: workDescription.trim(),
      status:          "submitted",
      submittedAt:     new Date(),
    });

    res.status(201).json({ success: true, message: "Work log submitted.", data: log });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ success: false, message: "Work log already submitted for today." });
    res.status(500).json({ success: false, message: e.message });
  }
};

// ── GET my today's log (logged-in user) ───────────────────────
export const getMyTodayLog = async (req, res) => {
  try {
    const today = getTodayIST();
    const log = await DailyWorkLog.findOne({ adminId: req.user._id, date: today });
    res.status(200).json({ success: true, data: log || null });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ── GET my history ────────────────────────────────────────────
export const getMyHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 14;
    const logs = await DailyWorkLog.find({ adminId: req.user._id })
      .sort({ date: -1 }).limit(limit);
    res.status(200).json({ success: true, data: logs });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ── GET all logs for a date (admin/manager review) ────────────
export const getLogsForDate = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? dateToISTMidnight(date) : getTodayIST();
    const nextDay = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

    const logs = await DailyWorkLog.find({
      date: { $gte: targetDate, $lt: nextDay },
    }).sort({ status: 1, adminName: 1 });

    res.status(200).json({ success: true, data: logs, count: logs.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ── GET summary stats ─────────────────────────────────────────
export const getSummaryForDate = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? dateToISTMidnight(date) : getTodayIST();
    const nextDay = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

    const logs = await DailyWorkLog.find({ date: { $gte: targetDate, $lt: nextDay } });
    const totalAdmins = await Admin.countDocuments();

    const summary = {
      total:      totalAdmins,
      submitted:  logs.filter(l => ["submitted","edited"].includes(l.status)).length,
      auto_leave: logs.filter(l => l.status === "auto_leave").length,
      pending:    totalAdmins - logs.length,
      avgHours:   logs.length > 0
        ? Math.round(logs.reduce((s,l) => s+(l.hoursWorked||0), 0) / logs.length * 10) / 10
        : 0,
      reviewed:   logs.filter(l => l.reviewStatus).length,
    };

    res.status(200).json({ success: true, data: summary });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ── ADD REVIEW (admin/manager reviews a log) ──────────────────
export const reviewLog = async (req, res) => {
  try {
    const { reviewComment, reviewStatus } = req.body;
    if (!reviewStatus) return res.status(400).json({ success: false, message: "reviewStatus is required." });

    const updated = await DailyWorkLog.findByIdAndUpdate(
      req.params.id,
      {
        reviewedBy:    req.user._id,
        reviewerName:  req.user.name || req.user.email || "Admin",
        reviewComment: reviewComment || "",
        reviewStatus,
        reviewedAt:    new Date(),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Log not found." });
    res.status(200).json({ success: true, message: "Review saved.", data: updated });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ── OVERRIDE STATUS (superadmin only) ─────────────────────────
export const overrideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["submitted","edited","auto_leave","pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }
    const updated = await DailyWorkLog.findByIdAndUpdate(
      req.params.id,
      { $set: { status, isAutoLeave: status === "auto_leave", isLocked: true } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Log not found." });
    res.status(200).json({ success: true, message: `Status updated to ${status}.`, data: updated });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ── MANUAL CRON TRIGGER ───────────────────────────────────────
export const runMidnightCron = async (req, res) => {
  try {
    const result = await processMidnightAutoLeave();
    res.status(200).json({ success: true, message: "Midnight cron completed.", ...result });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// ── CRON LOGIC: runs at 00:01 IST daily ──────────────────────
export const processMidnightAutoLeave = async () => {
  const yesterday = getTodayIST();
  yesterday.setDate(yesterday.getDate() - 1);
  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setHours(23, 59, 59, 999);

  // Lock all yesterday's entries
  await DailyWorkLog.updateMany(
    { date: { $gte: yesterday, $lte: endOfYesterday }, isLocked: false },
    { isLocked: true, lockedAt: new Date() }
  );

  // Get all admins
  const admins = await Admin.find().select("_id name email");

  // Who submitted yesterday
  const submitted = await DailyWorkLog.find({
    date: { $gte: yesterday, $lte: endOfYesterday },
    status: { $in: ["submitted","edited"] },
  }).select("adminId");

  const submittedIds = new Set(submitted.map(l => l.adminId.toString()));
  let autoLeaveCount = 0;

  for (const admin of admins) {
    if (!submittedIds.has(admin._id.toString())) {
      await DailyWorkLog.findOneAndUpdate(
        { adminId: admin._id, date: yesterday },
        {
          adminId:         admin._id,
          adminName:       admin.name,
          adminEmail:      admin.email,
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
      autoLeaveCount++;
    }
  }

  console.log(`✅ Auto-leave cron: ${autoLeaveCount} admins marked for ${yesterday.toDateString()}`);
  return { autoLeaveCount, date: yesterday.toDateString() };
};

export default { submitWorkLog, getMyTodayLog, getMyHistory, getLogsForDate, getSummaryForDate, reviewLog, runMidnightCron };
