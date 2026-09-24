import AttendanceService from "../services/attendance-service.js";

const attendanceService = new AttendanceService();

const getPerformer = (req) => ({
  performedBy:     req.user._id,
  performedByName: req.user.name || req.user.username || req.user.email || "Admin",
});

// ── Clock In ──────────────────────────────────────────────────
const clockIn = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { performedBy, performedByName } = getPerformer(req);
    const record = await attendanceService.clockIn(employeeId, performedBy, performedByName);
    res.status(200).json({ success: true, message: "Clocked in successfully.", data: record });
  } catch (error) {
    const status = error.message.includes("Already") ? 409 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// ── Clock Out ─────────────────────────────────────────────────
const clockOut = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { performedBy, performedByName } = getPerformer(req);
    const record = await attendanceService.clockOut(employeeId, performedBy, performedByName);
    res.status(200).json({ success: true, message: "Clocked out successfully.", data: record });
  } catch (error) {
    const status = error.message.includes("Already") ? 409 : error.message.includes("No clock") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// ── Manual Mark ───────────────────────────────────────────────
const markAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date, status, note } = req.body;
    if (!date || !status) return res.status(400).json({ success: false, message: "date and status are required." });
    const { performedBy, performedByName } = getPerformer(req);
    const record = await attendanceService.markAttendance(employeeId, date, status, note, performedBy, performedByName);
    res.status(200).json({ success: true, message: "Attendance marked.", data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Today — all employees ─────────────────────────────────────
const getTodayAll = async (req, res) => {
  try {
    const records = await attendanceService.getTodayAll();
    res.status(200).json({ success: true, data: records, count: records.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Today — one employee ──────────────────────────────────────
const getTodayForEmployee = async (req, res) => {
  try {
    const record = await attendanceService.getTodayForEmployee(req.params.employeeId);
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Monthly — one employee ────────────────────────────────────
const getMonthly = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ success: false, message: "year and month are required." });
    const records = await attendanceService.getMonthlyForEmployee(employeeId, parseInt(year), parseInt(month));
    res.status(200).json({ success: true, data: records, count: records.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Monthly summary — all employees ──────────────────────────
const getMonthlySummary = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ success: false, message: "year and month are required." });
    const summary = await attendanceService.getMonthlySummary(parseInt(year), parseInt(month));
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default { clockIn, clockOut, markAttendance, getTodayAll, getTodayForEmployee, getMonthly, getMonthlySummary };
