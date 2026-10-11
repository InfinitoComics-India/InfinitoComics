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
    const Admin      = (await import('../models/Admin.js')).default;
    const Employee   = (await import('../models/Employee.js')).default;
    const dateStr = req.query.date;
    if (!dateStr) return res.status(400).json({ success: false, message: "date query param required (YYYY-MM-DD)." });
    // Use a wide date range to handle timezone offsets
    const start = new Date(dateStr + "T00:00:00.000+05:30");
    const end   = new Date(dateStr + "T23:59:59.999+05:30");
    const records = await Attendance.find({ date: { $gte: start, $lte: end } }).sort({ createdAt: 1 });

    // Enrich with name: try Employee model first, then Admin model, then snapshot
    const ids = [...new Set(records.map(r => r.employeeId?.toString()).filter(Boolean))];
    const [empDocs, adminDocs] = await Promise.all([
      Employee.find({ _id: { $in: ids } }).select("_id firstName lastName designation department employeeId"),
      Admin.find({ _id: { $in: ids } }).select("_id name email employeeId designation department"),
    ]);
    const nameMap = {};
    empDocs.forEach(e => { nameMap[e._id.toString()] = { firstName: e.firstName, lastName: e.lastName, designation: e.designation, department: e.department, employeeId: e.employeeId }; });
    adminDocs.forEach(a => {
      if (!nameMap[a._id.toString()]) {
        const p = (a.name||"").trim().split(" ");
        nameMap[a._id.toString()] = { firstName: p[0]||a.email, lastName: p.slice(1).join(" ")||"", designation: a.designation||"", department: a.department||"", employeeId: a.employeeId||"" };
      }
    });

    const enriched = records.map(r => {
      const eid  = r.employeeId?.toString();
      const info = nameMap[eid] || { firstName: r.employeeName?.split(" ")[0]||"", lastName: r.employeeName?.split(" ").slice(1).join(" ")||"", designation:"", department:"", employeeId: r.employeeEmpId||"" };
      return { ...r.toObject(), employeeId: { _id: eid, ...info } };
    });

    res.status(200).json({ success: true, data: enriched, count: enriched.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET today's attendance for all employees
router.get("/today", adminauthenticate, checkRole(HR_ALL), AttendanceController.getTodayAll);

// GET last 7 days attendance for all employees
router.get("/last7days", adminauthenticate, checkRole(HR_ALL), async (req, res) => {
  try {
    const Attendance = (await import('../models/Attendance.js')).default;
    const Admin      = (await import('../models/Admin.js')).default;
    const Employee   = (await import('../models/Employee.js')).default;
    const today = new Date(); today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); sevenDaysAgo.setHours(0, 0, 0, 0);
    const records = await Attendance.find({ date: { $gte: sevenDaysAgo, $lte: today } }).sort({ date: 1 });

    const ids = [...new Set(records.map(r => r.employeeId?.toString()).filter(Boolean))];
    const [empDocs, adminDocs] = await Promise.all([
      Employee.find({ _id: { $in: ids } }).select("_id firstName lastName designation department employeeId"),
      Admin.find({ _id: { $in: ids } }).select("_id name email employeeId designation department"),
    ]);
    const nameMap = {};
    empDocs.forEach(e => { nameMap[e._id.toString()] = { firstName: e.firstName, lastName: e.lastName, designation: e.designation, department: e.department, employeeId: e.employeeId }; });
    adminDocs.forEach(a => {
      if (!nameMap[a._id.toString()]) {
        const p = (a.name||"").trim().split(" ");
        nameMap[a._id.toString()] = { firstName: p[0]||a.email, lastName: p.slice(1).join(" ")||"", designation: a.designation||"", department: a.department||"", employeeId: a.employeeId||"" };
      }
    });
    const enriched = records.map(r => {
      const eid  = r.employeeId?.toString();
      const info = nameMap[eid] || { firstName: r.employeeName?.split(" ")[0]||"", lastName: r.employeeName?.split(" ").slice(1).join(" ")||"", designation:"", department:"", employeeId: r.employeeEmpId||"" };
      return { ...r.toObject(), employeeId: { _id: eid, ...info } };
    });
    res.status(200).json({ success: true, data: enriched, count: enriched.length });
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
  try {
    const Attendance = (await import('../models/Attendance.js')).default;
    const Admin      = (await import('../models/Admin.js')).default;
    const empId = req.user._id;
    const now   = new Date();

    // Search today using a very wide window (yesterday UTC midnight to tomorrow UTC midnight)
    // to catch any timezone-stored record
    const start = new Date(now); start.setUTCHours(0,0,0,0); start.setDate(start.getUTCDate()-1);
    const end   = new Date(now); end.setUTCHours(23,59,59,999); end.setDate(end.getUTCDate()+1);

    let existing = await Attendance.findOne({ employeeId: empId, date: { $gte: start, $lte: end } });
    console.log(`[me/clockin] user=${empId} existing=${existing?._id} date=${existing?.date} sessions=${JSON.stringify(existing?.sessions?.map(s=>({in:s.clockIn,out:s.clockOut})))}`);

    // Check not already clocked in
    if (existing) {
      const openSession = (existing.sessions||[]).find(s => s.clockIn && !s.clockOut);
      const legacyOpen  = !existing.sessions?.length && existing.clockIn && !existing.clockOut;
      if (openSession || legacyOpen) {
        return res.status(409).json({ success: false, message: "Already clocked in. Please clock out first." });
      }
      // Add new session via $push
      const updated = await Attendance.findByIdAndUpdate(
        existing._id,
        { $push: { sessions: { clockIn: now, clockOut: null, hoursWorked: 0 } }, $set: { status: "present" } },
        { new: true }
      );
      console.log(`[me/clockin] pushed new session, sessions now=${updated.sessions?.length}`);
      return res.status(200).json({ success: true, message: "Clocked in successfully.", data: updated });
    }

    // No existing record — create new
    const adm    = await Admin.findById(empId).select("name employeeId").catch(()=>null);
    const eName  = adm?.name || "";
    const eEmpId = adm?.employeeId || "";

    // Use IST midnight as the date
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    istNow.setUTCHours(0, 0, 0, 0);
    const dayStart = new Date(istNow.getTime() - istOffset);

    const record = await Attendance.create({
      employeeId: empId,
      date: dayStart,
      sessions: [{ clockIn: now, clockOut: null, hoursWorked: 0 }],
      clockIn: now,
      employeeName: eName,
      employeeEmpId: eEmpId,
      status: "present",
      isLate: false,
      lateByMinutes: 0,
    });
    console.log(`[me/clockin] created new record ${record._id}`);
    return res.status(200).json({ success: true, message: "Clocked in successfully.", data: record });
  } catch (e) {
    console.error("[me/clockin] error:", e.message);
    if (e.code === 11000) {
      // Duplicate key — find and update the existing one
      const Attendance = (await import('../models/Attendance.js')).default;
      const empId = req.user._id;
      const now = new Date();
      const rec = await Attendance.findOne({ employeeId: empId }).sort({ date: -1 });
      if (rec) {
        const updated = await Attendance.findByIdAndUpdate(rec._id,
          { $push: { sessions: { clockIn: now, clockOut: null, hoursWorked: 0 } }, $set: { status: "present" } },
          { new: true }
        );
        return res.status(200).json({ success: true, message: "Clocked in successfully.", data: updated });
      }
    }
    res.status(500).json({ success: false, message: e.message });
  }
});
router.post("/me/clockout", adminauthenticate, checkRole(HR_ALL), async (req, res) => {
  try {
    const Attendance = (await import('../models/Attendance.js')).default;
    const empId = req.user._id;
    const now   = new Date();

    const start = new Date(now); start.setUTCHours(0,0,0,0); start.setDate(start.getUTCDate()-1);
    const end   = new Date(now); end.setUTCHours(23,59,59,999); end.setDate(end.getUTCDate()+1);

    const existing = await Attendance.findOne({ employeeId: empId, date: { $gte: start, $lte: end } });
    if (!existing) return res.status(404).json({ success: false, message: "No clock-in record found for today." });

    const sessions = existing.sessions || [];
    // Find last open session
    const lastOpenIdx = [...sessions].reverse().findIndex(s => s.clockIn && !s.clockOut);
    const actualIdx   = lastOpenIdx === -1 ? -1 : sessions.length - 1 - lastOpenIdx;

    if (actualIdx === -1) {
      // Legacy mode
      if (!existing.clockIn) return res.status(400).json({ success: false, message: "Not clocked in." });
      if (existing.clockOut) return res.status(400).json({ success: false, message: "Already clocked out." });
      const hours = parseFloat(((now - existing.clockIn) / (1000*60*60)).toFixed(2));
      const updated = await Attendance.findByIdAndUpdate(existing._id,
        { $set: { clockOut: now, hoursWorked: hours, totalHours: hours, status: "present" } },
        { new: true }
      );
      return res.status(200).json({ success: true, message: "Clocked out.", data: updated });
    }

    const sessionHours = parseFloat(((now - sessions[actualIdx].clockIn) / (1000*60*60)).toFixed(2));
    const totalHours   = parseFloat((sessions.reduce((s,x,i) => s + (i===actualIdx ? sessionHours : (x.hoursWorked||0)), 0)).toFixed(2));

    // Update the specific session using positional operator
    const fieldPath = `sessions.${actualIdx}`;
    const updated = await Attendance.findByIdAndUpdate(existing._id,
      { $set: { [`${fieldPath}.clockOut`]: now, [`${fieldPath}.hoursWorked`]: sessionHours, clockOut: now, hoursWorked: totalHours, totalHours, status: "present" } },
      { new: true }
    );
    return res.status(200).json({ success: true, message: "Clocked out.", data: updated });
  } catch (e) {
    console.error("[me/clockout] error:", e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});
router.get("/me/today", adminauthenticate, checkRole(HR_ALL), async (req, res) => {
  try {
    const Attendance = (await import('../models/Attendance.js')).default;
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    istNow.setUTCHours(0, 0, 0, 0);
    const start = new Date(istNow.getTime() - istOffset);
    const utcStart = new Date(new Date(now).setHours(0, 0, 0, 0));
    const searchStart = utcStart < start ? utcStart : start;
    const searchEnd = new Date(searchStart.getTime() + 30 * 60 * 60 * 1000); // 30h window
    const record = await Attendance.findOne({ employeeId: req.user._id, date: { $gte: searchStart, $lte: searchEnd } });
    res.status(200).json({ success: true, data: record || null });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
router.get("/me/monthly", adminauthenticate, checkRole(HR_ALL), async (req, res) => {
  req.params.employeeId = req.user._id;
  AttendanceController.getMonthly(req, res);
});

export default router;
