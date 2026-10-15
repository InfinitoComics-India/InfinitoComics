import { processMidnightAutoLeave } from "../controller/dailyWorkLog-controller.js";

// ── Auto clock-out open sessions at midnight IST ─────────────
const autoClockoutOpenSessions = async () => {
  try {
    const Attendance = (await import('../models/Attendance.js')).default;
    const now = new Date();
    
    // Find all attendance records with open sessions (clockOut is null)
    // Search yesterday's IST day (the day that just ended at midnight)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const y = istNow.getUTCFullYear(), m = istNow.getUTCMonth(), d = istNow.getUTCDate();
    // Yesterday IST = today UTC-5:30
    const yesterdayStart = new Date(Date.UTC(y, m, d - 2, 18, 30, 0, 0)); // 2 days ago IST midnight
    const yesterdayEnd   = new Date(Date.UTC(y, m, d - 1, 18, 29, 59, 999)); // yesterday IST 23:59

    const records = await Attendance.find({ date: { $gte: yesterdayStart, $lte: yesterdayEnd } });
    let closedCount = 0;

    for (const rec of records) {
      const sessions = rec.sessions || [];
      const openIdx = sessions.findIndex(s => s.clockIn && !s.clockOut);
      
      if (openIdx === -1) {
        // Check legacy clockIn without clockOut
        if (rec.clockIn && !rec.clockOut) {
          const autoOut = new Date(yesterdayEnd);
          const hours = parseFloat(((autoOut - rec.clockIn) / (1000*60*60)).toFixed(2));
          await Attendance.findByIdAndUpdate(rec._id, {
            $set: { clockOut: autoOut, hoursWorked: hours, totalHours: hours,
                    status: hours >= 4 ? 'present' : 'half_day', note: 'Auto clocked out at midnight IST' }
          });
          closedCount++;
        }
        continue;
      }

      // Close the open session
      const autoOut = new Date(yesterdayEnd);
      const sessionHours = parseFloat(((autoOut - new Date(sessions[openIdx].clockIn)) / (1000*60*60)).toFixed(2));
      const totalHours = parseFloat(sessions.reduce((s,x,i) => s + (i===openIdx ? sessionHours : (x.hoursWorked||0)), 0).toFixed(2));
      const fp = `sessions.${openIdx}`;
      await Attendance.findByIdAndUpdate(rec._id, {
        $set: {
          [`${fp}.clockOut`]: autoOut,
          [`${fp}.hoursWorked`]: sessionHours,
          [`${fp}.note`]: 'Auto clocked out at midnight IST',
          clockOut: autoOut,
          hoursWorked: totalHours,
          totalHours,
          status: totalHours >= 4 ? 'present' : 'half_day',
        }
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
// Runs every minute, checks if it's midnight IST, then fires the job
// IST = UTC + 5:30 hours

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

  console.log("⏰ Cron jobs started — midnight auto-leave checker active");

  // Check every minute
  setInterval(async () => {
    try {
      const { hour, minute } = getISTHour();
      const today = new Date().toDateString();

      // Run at exactly 00:01 IST (to be safe, just past midnight)
      if (hour === 0 && minute === 1 && lastRunDate !== today) {
        lastRunDate = today;
        console.log("🌙 Midnight IST — running midnight cron...");
        // 1. Auto clock-out any open attendance sessions
        const closedCount = await autoClockoutOpenSessions();
        console.log(`⏰ Auto clock-out: ${closedCount} sessions closed`);
        // 2. Auto-leave for work log
        const result = await processMidnightAutoLeave();
        console.log(`✅ Auto-leave cron done: ${result.autoLeaveCount} employees marked for ${result.date}`);
      }
    } catch (e) {
      console.error("❌ Cron job error:", e.message);
    }
  }, 60 * 1000); // every 60 seconds
};
