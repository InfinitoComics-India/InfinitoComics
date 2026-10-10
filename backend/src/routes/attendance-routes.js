import express from "express";
const router = express.Router();
import AttendanceController from "../controller/attendance-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const HR_ALL    = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin","shop_admin","employee"];
const HR_MANAGE = ["superadmin","hr_manager","manager"];

// GET attendance for all employees for a specific date  ?date=YYYY-MM-DD
router.get("/bydate", adminauthenticate, checkRole(HR_ALL), async (req, res) => {
  try {
    const Attendance = (await import('../models/Attendance.js')).default;
    const dateStr = req.query.date;
    if (!dateStr) return res.status(400).json({ success: false, message: "date query param required (YYYY-MM-DD)." });
    const start = new Date(dateStr + "T00:00:00.000Z");
    const end   = new Date(dateStr + "T23:59:59.999Z");
    const records = await Attendance.find({ date: { $gte: start, $lte: end } })
      .populate("employeeId", "firstName lastName designation department employeeId")
      .sort({ "employeeId.firstName": 1 });
    res.status(200).json({ success: true, data: records, count: records.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET today's attendance for all employees
router.get("/today", adminauthenticate, checkRole(HR_ALL), AttendanceController.getTodayAll);

// GET last 7 days attendance for all employees
router.get("/last7days", adminauthenticate, checkRole(HR_ALL), async (req, res) => {
  try {
    const Attendance = (await import('../models/Attendance.js')).default;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const records = await Attendance.find({ date: { $gte: sevenDaysAgo, $lte: today } })
      .populate("employeeId", "firstName lastName designation department employeeId")
      .sort({ date: 1 });
    res.status(200).json({ success: true, data: records, count: records.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET today's attendance for one employee
router.get("/today/:employeeId", adminauthenticate, checkRole(HR_ALL), AttendanceController.getTodayForEmployee);

// GET monthly records for one employee  ?year=&month=
router.get("/monthly/:employeeId", adminauthenticate, checkRole(HR_ALL), AttendanceController.getMonthly);

// GET monthly summary all employees  ?year=&month=
router.get("/summary", adminauthenticate, checkRole(HR_MANAGE), AttendanceController.getMonthlySummary);

// GET full monthly records all employees ?year=&month=
router.get("/monthly-all", adminauthenticate, checkRole(HR_ALL), async (req, res) => {
  try {
    const Attendance = (await import('../models/Attendance.js')).default;
    const Employee   = (await import('../models/Employee.js')).default;
    const Admin      = (await import('../models/Admin.js')).default;
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ success: false, message: "year and month required." });
    const start = new Date(parseInt(year), parseInt(month) - 1, 1);
    const end   = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    // Fetch all attendance records for the month
    const records = await Attendance.find({ date: { $gte: start, $lte: end } }).sort({ date: 1 });

    // Build unique employeeId set from records
    const empIds = [...new Set(records.map(r => r.employeeId?.toString()).filter(Boolean))];

    // Try to look up each id in both Employee and Admin models
    const [empDocs, adminDocs] = await Promise.all([
      Employee.find({ _id: { $in: empIds } }).select("firstName lastName designation department employeeId"),
      Admin.find({ _id: { $in: empIds } }).select("name email employeeId designation department"),
    ]);

    // Build a unified employee map: id → { _id, firstName, lastName, employeeId, designation, department }
    const empMap = {};
    empDocs.forEach(e => { empMap[e._id.toString()] = { _id: e._id, firstName: e.firstName, lastName: e.lastName, employeeId: e.employeeId, designation: e.designation, department: e.department }; });
    adminDocs.forEach(a => {
      if (!empMap[a._id.toString()]) {
        const parts = (a.name||"").trim().split(" ");
        empMap[a._id.toString()] = { _id: a._id, firstName: parts[0]||a.email, lastName: parts.slice(1).join(" ")||"", employeeId: a.employeeId||"", designation: a.designation||"", department: a.department||"" };
      }
    });

    // Attach employee info to records + fall back to snapshot
    const enriched = records.map(r => {
      const eid  = r.employeeId?.toString();
      const info = empMap[eid] || { firstName: r.employeeName?.split(" ")[0]||"Unknown", lastName: r.employeeName?.split(" ").slice(1).join(" ")||"", employeeId: r.employeeEmpId||"", designation:"", department:"" };
      return { ...r.toObject(), _empInfo: info };
    });

    // Build employee list from empMap (only those who have records this month)
    const employees = empIds.map(id => empMap[id]).filter(Boolean);

    res.status(200).json({ success: true, data: { records: enriched, employees } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST clock in
router.post("/clockin/:employeeId", adminauthenticate, checkRole(HR_ALL), AttendanceController.clockIn);

// POST clock out
router.post("/clockout/:employeeId", adminauthenticate, checkRole(HR_ALL), AttendanceController.clockOut);

// PATCH manual mark (HR/manager only)
router.patch("/mark/:employeeId", adminauthenticate, checkRole(HR_MANAGE), AttendanceController.markAttendance);

// PATCH correct attendance by record ID
router.patch("/correct/:recordId", adminauthenticate, checkRole(HR_MANAGE), async (req, res) => {
  try {
    const Attendance = (await import('../models/Attendance.js')).default;
    const { status, note } = req.body;
    if (!status) return res.status(400).json({ success: false, message: "status is required." });
    const updated = await Attendance.findByIdAndUpdate(
      req.params.recordId,
      { $set: { status, note: note || "", markedBy: req.user._id, isCorrected: true } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Record not found." });
    res.status(200).json({ success: true, message: "Attendance corrected.", data: updated });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Employee self-service ──────────────────────────────────────
router.post("/me/clockin", adminauthenticate, checkRole(HR_ALL), async (req, res) => {
  req.params.employeeId = req.user._id;
  AttendanceController.clockIn(req, res);
});
router.post("/me/clockout", adminauthenticate, checkRole(HR_ALL), async (req, res) => {
  req.params.employeeId = req.user._id;
  AttendanceController.clockOut(req, res);
});
router.get("/me/today", adminauthenticate, checkRole(HR_ALL), async (req, res) => {
  req.params.employeeId = req.user._id;
  AttendanceController.getTodayForEmployee(req, res);
});
router.get("/me/monthly", adminauthenticate, checkRole(HR_ALL), async (req, res) => {
  req.params.employeeId = req.user._id;
  AttendanceController.getMonthly(req, res);
});

export default router;
