import CalendarEvent from "../models/CalendarEvent.js";
import CrudRepository from "./crud-repository.js";

class CalendarEventRepository extends CrudRepository {
  constructor() {
    super(CalendarEvent);
  }

  // Get all events in a date range
  async getInRange(startDate, endDate, employeeId = null) {
    const filter = {
      startDate: { $lte: new Date(endDate) },
      endDate:   { $gte: new Date(startDate) },
    };
    // Return company-wide events + events for this specific employee
    if (employeeId) {
      filter.$or = [
        { isCompanyWide: true },
        { participants: employeeId },
      ];
    }
    return await CalendarEvent.find(filter)
      .sort({ startDate: 1 })
      .populate("participants", "firstName lastName");
  }

  // Get all events for a specific month
  async getForMonth(year, month) {
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0, 23, 59, 59);
    return await CalendarEvent.find({
      startDate: { $lte: end },
      endDate:   { $gte: start },
    }).sort({ startDate: 1 });
  }

  // Get upcoming events (next N days)
  async getUpcoming(days = 7) {
    const now  = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);
    return await CalendarEvent.find({
      startDate: { $gte: now, $lte: future },
    }).sort({ startDate: 1 }).limit(20);
  }

  // Get all holidays
  async getHolidays(year) {
    const start = new Date(year, 0, 1);
    const end   = new Date(year, 11, 31, 23, 59, 59);
    return await CalendarEvent.find({
      type: "holiday",
      startDate: { $gte: start, $lte: end },
    }).sort({ startDate: 1 });
  }
}

export default CalendarEventRepository;
