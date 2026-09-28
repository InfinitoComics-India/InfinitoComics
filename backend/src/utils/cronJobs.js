import { processMidnightAutoLeave } from "../controller/dailyWorkLog-controller.js";

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
        console.log("🌙 Midnight IST — running auto-leave cron...");
        const result = await processMidnightAutoLeave();
        console.log(`✅ Auto-leave cron done: ${result.autoLeaveCount} employees marked for ${result.date}`);
      }
    } catch (e) {
      console.error("❌ Cron job error:", e.message);
    }
  }, 60 * 1000); // every 60 seconds
};
