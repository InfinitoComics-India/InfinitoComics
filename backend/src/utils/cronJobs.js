import { processMidnightAutoLeave } from "../controller/dailyWorkLog-controller.js";

// ── Auto clock-out open sessions at midnight IST ─────────────
const autoClockoutOpenSessions = async () => {
  try {
    const Attendance = (await import('../models/Attendance.js')).default;
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;

    // Find ALL past records (before today IST) that have open sessions
    const istNow = new Date(now.getTime() + istOffset);
    istNow.setUTCHours(0, 0, 0, 0);
    const todayStart = new Date(istNow.getTime() - istOffset);

    const records = await Attendance.find({ date: { $lt: todayStart } });
    let closedCount = 0;

    for (const rec of records) {
      const sessions = rec.sessions || [];
      const hasOpenSession = sessions.some(s => s.clockIn && !s.clockOut);
      const legacyOpen = sessions.length === 0 && rec.clockIn && !rec.clockOut;

      if (!hasOpenSession && !legacyOpen) continue;

      // Auto clock-out at 11:59pm IST of the record's own date
      const recDayIST = new Date(new Date(rec.date).getTime() + istOffset);
      recDayIST.setUTCHours(0, 0, 0, 0);
      const autoOut = new Date(recDayIST.getTime() + 23*60*60*1000 + 59*60*1000 - istOffset);

      if (legacyOpen) {
        const hours = Math.max(0, parseFloat(((autoOut - new Date(rec.clockIn)) / (1000*60*60)).toFixed(2)));
        await Attendance.findByIdAndUpdate(rec._id, {
          $set: { clockOut: autoOut, hoursWorked: hours, totalHours: hours,
                  status: hours >= 4 ? 'present' : 'half_day',
                  note: 'Automatically clocked out at midnight IST' }
        });
        closedCount++;
        continue;
      }

      // Fix all open sessions in array
      const updatedSessions = sessions.map(s => {
        if (s.clockIn && !s.clockOut) {
          const h = Math.max(0, parseFloat(((autoOut - new Date(s.clockIn)) / (1000*60*60)).toFixed(2)));
          return { ...s.toObject?.() || s, clockOut: autoOut, hoursWorked: h, note: 'Automatically clocked out at midnight IST' };
        }
        return s.toObject?.() || s;
      });

      const totalHours = parseFloat(updatedSessions.reduce((t, s) => t + (s.hoursWorked||0), 0).toFixed(2));
      await Attendance.findByIdAndUpdate(rec._id, {
        $set: { sessions: updatedSessions, clockOut: autoOut, hoursWorked: totalHours, totalHours,
                status: totalHours >= 4 ? 'present' : 'half_day' }
      });
      closedCount++;
    }

    console.log(`✅ Auto clock-out: ${closedCount} open sessions closed`);
    return closedCount;
  } catch (e) {
    console.error("❌ Auto clock-out error:", e.message);
    return 0;
  }
};

// ── Simple cron implementation using setInterval ──────────────
let cronStarted = false;

const getISTHour = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  return { hour: istNow.getUTCHours(), minute: istNow.getUTCMinutes() };
};

let lastRunDate = null;

export const startCronJobs = () => {
  if (cronStarted) return;
  cronStarted = true;

  console.log("⏰ Cron jobs started — midnight auto-clockout + auto-leave active");

  setInterval(async () => {
    try {
      const { hour, minute } = getISTHour();
      const today = new Date().toDateString();

      if (hour === 0 && minute === 1 && lastRunDate !== today) {
        lastRunDate = today;
        console.log("🌙 Midnight IST — running midnight cron...");
        const closedCount = await autoClockoutOpenSessions();
        console.log(`⏰ Auto clock-out: ${closedCount} sessions closed`);
        const result = await processMidnightAutoLeave();
        console.log(`✅ Auto-leave cron done: ${result.autoLeaveCount} employees marked for ${result.date}`);
      }
    } catch (e) {
      console.error("❌ Cron job error:", e.message);
    }
  }, 60 * 1000);
};
