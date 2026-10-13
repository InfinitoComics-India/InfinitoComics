import express from "express";
const router = express.Router();
import AttendanceController from "../controller/attendance-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const HR_ALL    = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin","shop_admin","employee"];
const HR_MANAGE = ["superadmin","hr_manager","manager"];

// Helper: get IST day boundaries for a given JS Date
const getISTDayBounds = (d) => {
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(d.getTime() + IST_OFFSET);
  const y = istNow.getUTCFullYear(), m = istNow.getUTCMonth(), day = istNow.getUTCDate();
  const start = new Date(Date.UTC(y, m, day - 1, 18, 30, 0, 0));   // IST 00:00 in UTC
  const end   = new Date(Date.UTC(y, m, day,     18, 29, 59, 999)); // IST 23:59 in UTC
  const date  = new Date(Date.UTC(y, m, day - 1, 18, 30, 0, 0));   // date to store
  return { start, end, date };
};

// Helper: enrich attendance records with employee/admin name info
const enrichRecords = async (records) => {
  const Employee = (await import('../models/Employee.js')).default;
  const Admin    = (await import('../models/Admin.js')).default;
  const ids = [...new Set(records.map(r => r.employeeId?.toString()).filter(Boolean))];
  const [empDocs, adminDocs] = await Promise.all([
    Employee.find({ _id: { $in: ids } }).select("_id firstName lastName designation department employeeId"),
    Admin.find({ _id: { $in: ids } }).select("_id name email employeeId designation department"),
  ]);
  const nameMap = {};
  empDocs.forEach(e => { nameMap[e._id.toString()] = { firstName: e.firstName, lastName: e.lastName, designation: e.designation||"", department: e.department||"", employeeId: e.employeeId||"" }; });
  adminDocs.forEach(a => {
    if (!nameMap[a._id.toString()]) {
      const p = (a.name||"").trim().split(" ");
      nameMap[a._id.toString()] = { firstName: p[0]||a.email, lastName: p.slice(1).join(" ")||"", designation: a.designation||"", department: a.department||"", employeeId: a.employeeId||"" };
    }
  });
  return records.map(r => {
    const eid  = r.employeeId?.toString();
    const info = nameMap[eid] || { firstName: r.employeeName?.split(" ")[0]||"", lastName: r.employeeName?.split(" ").slice(1).join(" ")||"", designation:"", department:"", employeeId: r.employeeEmpId||"" };
    return { ...(r.toObject ? r.toObject() : r), employeeId: { _id: eid, ...info } };
  });
};

// GET attendance for all employees for a specific date  ?date=YYYY-MM-DD
router.get("/bydate", adminauthenticate, checkRole(HR_ALL), async (req, res) => {
  try {
    const Attendance = (await import('../models/Attendance.js')).default;
    const dateStr = req.query.date;
    if (!dateStr) return res.status(400).json({ success: false, message: "date query param required." });
    const [y, m, d] = dateStr.split("-").map(Number);
    // Use IST day boundaries since records are stored at IST midnight (UTC-5:30)
    const start = new Date(Date.UTC(y, m-1, d-1, 18, 30, 0, 0));   // IST 00:00 = UTC prev day 18:30
    const end   = new Date(Date.UTC(y, m-1, d,   18, 29, 59, 999)); // IST 23:59 = UTC same day 18:29
    const records = await Attendance.find({ date: { $gte: start, $lte: end } }).sort({ createdAt: 1 });
    const enriched = await enrichRecords(records);
    res.status(200).json({ success: true, data: enriched, count: enriched.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET today's attendance for all employees
router.get("/today", adminauthenticate, checkRole(HR_ALL), AttendanceController.getTodayAll);

// GET last 7 days attendance for all employees
router.get("/last7days", adminauthenticate, checkRole(HR_ALL), async (req, res) => {
  try {
    const Attendance = (await import('../models/Attendance.js')).default;
    const today = new Date(); today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); sevenDaysAgo.setHours(0, 0, 0, 0);
    const records = await Attendance.find({ date: { $gte: sevenDaysAgo, $lte: today } }).sort({ date: 1 });
    const enriched = await enrichRecords(records);
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
    const records = await Attendance.find({ date: { $gte: start, $lte: end } }).sort({ date: 1 });
    const empIds = [...new Set(records.map(r => r.employeeId?.toString()).filter(Boolean))];
    const [empDocs, adminDocs] = await Promise.all([
      Employee.find({ _id: { $in: empIds } }).select("firstName lastName designation department employeeId"),
      Admin.find({ _id: { $in: empIds } }).select("name email employeeId designation department"),
    ]);
    const empMap = {};
    empDocs.forEach(e => { empMap[e._id.toString()] = { _id: e._id, firstName: e.firstName, lastName: e.lastName, employeeId: e.employeeId, designation: e.designation, department: e.department }; });
    adminDocs.forEach(a => {
      if (!empMap[a._id.toString()]) {
        const parts = (a.name||"").trim().split(" ");
        empMap[a._id.toString()] = { _id: a._id, firstName: parts[0]||a.email, lastName: parts.slice(1).join(" ")||"", employeeId: a.employeeId||"", designation: a.designation||"", department: a.department||"" };
      }
    });
    const enriched = records.map(r => {
      const eid = r.employeeId?.toString();
      const info = empMap[eid] || { firstName: r.employeeName?.split(" ")[0]||"Unknown", lastName: r.employeeName?.split(" ").slice(1).join(" ")||"", employeeId: r.employeeEmpId||"", designation:"", department:"" };
      return { ...r.toObject(), _empInfo: info };
    });
    const employees = empIds.map(id => empMap[id]).filter(Boolean);
    res.status(200).json({ success: true, data: { records: enriched, employees } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST clock in
router.post("/clockin/:employeeId", adminauthenticate, checkRole(HR_ALL), AttendanceController.clockIn);

// POST clock out
router.post("/clockout/:employeeId", adminauthenticate, checkRole(HR_ALL), AttendanceController.clockOut);

// PATCH manual mark
router.patch("/mark/:employeeId", adminauthenticate, checkRole(HR_MANAGE), AttendanceController.markAttendance);

// PATCH correct attendance by record ID
router.patch("/correct/:recordId", adminauthenticate, checkRole(HR_MANAGE), async (req, res) => {
  try {
    const Attendance = (await import('../models/Attendance.js')).default;
    const { status, note } = req.body;
    if (!status) return res.status(400).json({ success: false, message: "status is required." });
    const updated = await Attendance.findByIdAndUpdate(req.params.recordId,
      { $set: { status, note: note||"", markedBy: req.user._id, isCorrected: true } },
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
    const { start, end, date: dayStart } = getISTDayBounds(now);

    // Find today's record using IST day boundaries
    const existing = await Attendance.findOne({ employeeId: empId, date: { $gte: start, $lte: end } });
    console.log(`[me/clockin] user=${empId} existing=${existing?._id} sessions=${existing?.sessions?.length||0}`);

    if (existing) {
      // Check not already clocked in
      const openSession = (existing.sessions||[]).find(s => s.clockIn && !s.clockOut);
      const legacyOpen  = !(existing.sessions?.length) && existing.clockIn && !existing.clockOut;
      if (openSession || legacyOpen) {
        return res.status(409).json({ success: false, message: "Already clocked in. Please clock out first." });
      }
      // Push new session — don't change status on clock-in, only update on clock-out
      const updated = await Attendance.findByIdAndUpdate(existing._id,
        { $push: { sessions: { clockIn: now, clockOut: null, hoursWorked: 0 } } },
        { new: true }
      );
      return res.status(200).json({ success: true, message: "Clocked in successfully.", data: updated });
    }

    // Create new record for today
    const adm    = await Admin.findById(empId).select("name employeeId").catch(()=>null);
    const record = await Attendance.create({
      employeeId:    empId,
      date:          dayStart,
      sessions:      [{ clockIn: now, clockOut: null, hoursWorked: 0 }],
      clockIn:       now,
      employeeName:  adm?.name  || "",
      employeeEmpId: adm?.employeeId || "",
      status:        "present",
      isLate:        false,
      lateByMinutes: 0,
    });
    return res.status(200).json({ success: true, message: "Clocked in successfully.", data: record });
  } catch (e) {
    console.error("[me/clockin] error:", e.message);
    // Duplicate key — find most recent record and push session
    if (e.code === 11000) {
      try {
        const Attendance = (await import('../models/Attendance.js')).default;
        const { start, end } = getISTDayBounds(new Date());
        const rec = await Attendance.findOne({ employeeId: req.user._id, date: { $gte: start, $lte: end } });
        if (rec) {
          const updated = await Attendance.findByIdAndUpdate(rec._id,
            { $push: { sessions: { clockIn: new Date(), clockOut: null, hoursWorked: 0 } }, $set: { status: "present" } },
            { new: true }
          );
          return res.status(200).json({ success: true, message: "Clocked in successfully.", data: updated });
        }
      } catch (e2) { console.error("[me/clockin] duplicate fallback error:", e2.message); }
    }
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post("/me/clockout", adminauthenticate, checkRole(HR_ALL), async (req, res) => {
  try {
    const Attendance = (await import('../models/Attendance.js')).default;
    const empId = req.user._id;
    const now   = new Date();
    const { start, end } = getISTDayBounds(now);

    const existing = await Attendance.findOne({ employeeId: empId, date: { $gte: start, $lte: end } });
    if (!existing) return res.status(404).json({ success: false, message: "No clock-in record found for today." });

    const sessions = existing.sessions || [];
    // Find FIRST open session (not last — handles cases where sessions are out of order)
    const actualIdx = sessions.findIndex(s => s.clockIn && !s.clockOut);
    console.log(`[me/clockout] sessions=${sessions.length} actualIdx=${actualIdx}`);

    if (actualIdx === -1) {
      if (sessions.length > 0) {
        return res.status(400).json({ success: false, message: "No open session. Clock In first." });
      }
      // Legacy fallback
      if (!existing.clockIn || existing.clockOut) {
        return res.status(400).json({ success: false, message: existing.clockOut ? "Already clocked out." : "Not clocked in." });
      }
      const hours = parseFloat(((now - existing.clockIn) / (1000*60*60)).toFixed(2));
      const updated = await Attendance.findByIdAndUpdate(existing._id,
        { $set: { clockOut: now, hoursWorked: hours, totalHours: hours, status: hours >= 4 ? "present" : "half_day" } },
        { new: true }
      );
      return res.status(200).json({ success: true, message: "Clocked out.", data: updated });
    }

    const sessionHours = parseFloat(((now - new Date(sessions[actualIdx].clockIn)) / (1000*60*60)).toFixed(2));
    const totalHours   = parseFloat(sessions.reduce((s,x,i) => s + (i===actualIdx ? sessionHours : (x.hoursWorked||0)), 0).toFixed(2));
    const fp = `sessions.${actualIdx}`;
    const updated = await Attendance.findByIdAndUpdate(existing._id,
      { $set: { [`${fp}.clockOut`]: now, [`${fp}.hoursWorked`]: sessionHours, clockOut: now, hoursWorked: totalHours, totalHours, status: totalHours >= 4 ? "present" : "half_day" } },
      { new: true }
    );

    // Auto-sync hours to today's work log so employee doesn't have to enter them manually
    try {
      const DailyWorkLog = (await import('../models/DailyWorkLog.js')).default;
      const { start: wlStart } = getISTDayBounds(now);
      const wlEnd = new Date(wlStart.getTime() + 24*60*60*1000 - 1);
      const wl = await DailyWorkLog.findOne({ adminId: empId, date: { $gte: wlStart, $lte: wlEnd } });
      if (wl) {
        // Update hours if not locked
        if (!wl.isLocked) await DailyWorkLog.findByIdAndUpdate(wl._id, { $set: { hoursWorked: totalHours } });
      } else {
        // Create pending work log with hours pre-filled
        await DailyWorkLog.create({
          adminId: empId,
          adminName: existing.employeeName || "",
          adminEmail: "",
          adminEmployeeId: existing.employeeEmpId || "",
          date: wlStart,
          workDescription: "",
          hoursWorked: totalHours,
          status: "pending",
          isLocked: false,
        });
      }
    } catch (wlErr) { console.error("[clockout] worklog sync:", wlErr.message); }

    return res.status(200).json({ success: true, message: "Clocked out.", data: updated });
  } catch (e) {
    console.error("[me/clockout] error:", e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/me/today", adminauthenticate, checkRole(HR_ALL), async (req, res) => {
  try {
    const Attendance = (await import('../models/Attendance.js')).default;
    const { start, end } = getISTDayBounds(new Date());
    const record = await Attendance.findOne({ employeeId: req.user._id, date: { $gte: start, $lte: end } });
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.status(200).json({ success: true, data: record || null });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get("/me/monthly", adminauthenticate, checkRole(HR_ALL), async (req, res) => {
  req.params.employeeId = req.user._id;
  AttendanceController.getMonthly(req, res);
});

export default router;
