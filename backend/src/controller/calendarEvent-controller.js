import CalendarEventService from "../services/calendarEvent-service.js";

const calendarEventService = new CalendarEventService();

const getPerformer = (req) => ({
  performedBy:     req.user._id,
  performedByName: req.user.name || req.user.username || req.user.email || "Admin",
});

// ── Create event ──────────────────────────────────────────────
const createEvent = async (req, res) => {
  try {
    const { performedBy, performedByName } = getPerformer(req);
    const event = await calendarEventService.createEvent(req.body, performedBy, performedByName);
    res.status(201).json({ success: true, message: "Event created.", data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get events for a month ────────────────────────────────────
const getForMonth = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ success: false, message: "year and month are required." });
    const events = await calendarEventService.getForMonth(parseInt(year), parseInt(month));
    res.status(200).json({ success: true, data: events, count: events.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get events in a range ─────────────────────────────────────
const getInRange = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ success: false, message: "startDate and endDate are required." });
    const events = await calendarEventService.getInRange(startDate, endDate, employeeId);
    res.status(200).json({ success: true, data: events, count: events.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get upcoming events ───────────────────────────────────────
const getUpcoming = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const events = await calendarEventService.getUpcoming(days);
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get holidays ──────────────────────────────────────────────
const getHolidays = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const events = await calendarEventService.getHolidays(year);
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update event ──────────────────────────────────────────────
const updateEvent = async (req, res) => {
  try {
    const { performedBy, performedByName } = getPerformer(req);
    const event = await calendarEventService.updateEvent(req.params.id, req.body, performedBy, performedByName);
    res.status(200).json({ success: true, message: "Event updated.", data: event });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// ── Delete event ──────────────────────────────────────────────
const deleteEvent = async (req, res) => {
  try {
    const { performedBy, performedByName } = getPerformer(req);
    await calendarEventService.deleteEvent(req.params.id, performedBy, performedByName);
    res.status(200).json({ success: true, message: "Event deleted." });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export default { createEvent, getForMonth, getInRange, getUpcoming, getHolidays, updateEvent, deleteEvent };
