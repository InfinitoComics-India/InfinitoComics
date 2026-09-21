import CalendarEventRepository from "../repository/calendarEvent-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";
import NotificationRepository from "../repository/notification-repository.js";

class CalendarEventService {
  constructor() {
    this.calendarRepo     = new CalendarEventRepository();
    this.auditRepo        = new AuditLogRepository();
    this.notificationRepo = new NotificationRepository();
  }

  // ── Create event ──────────────────────────────────────────
  async createEvent(data, performedBy, performedByName) {
    try {
      const event = await this.calendarRepo.create({ ...data, createdBy: performedBy });

      await this.auditRepo.create({
        performedBy,
        performedByName,
        action:      "CREATE",
        entity:      "CalendarEvent",
        entityId:    event._id,
        entityLabel: event.title,
        description: `Created calendar event: "${event.title}" on ${new Date(event.startDate).toDateString()}`,
      });

      // Notify participants if not company-wide
      if (!data.isCompanyWide && data.participants?.length > 0) {
        for (const participantId of data.participants) {
          await this.notificationRepo.create({
            recipientId:    participantId,
            recipientModel: "Employee",
            type:           "system",
            title:          `New Event: ${event.title}`,
            message:        `You have been added to event "${event.title}" on ${new Date(event.startDate).toDateString()}.`,
            link:           "/hr/calendar",
            triggeredBy:    performedBy,
            entity:         "CalendarEvent",
            entityId:       event._id,
          });
        }
      }

      return event;
    } catch (error) {
      console.error("CalendarEventService.createEvent:", error);
      throw error;
    }
  }

  // ── Get events for a month ────────────────────────────────
  async getForMonth(year, month) {
    try {
      return await this.calendarRepo.getForMonth(year, month);
    } catch (error) {
      console.error("CalendarEventService.getForMonth:", error);
      throw error;
    }
  }

  // ── Get events in a range ─────────────────────────────────
  async getInRange(startDate, endDate, employeeId = null) {
    try {
      return await this.calendarRepo.getInRange(startDate, endDate, employeeId);
    } catch (error) {
      console.error("CalendarEventService.getInRange:", error);
      throw error;
    }
  }

  // ── Get upcoming events ───────────────────────────────────
  async getUpcoming(days = 7) {
    try {
      return await this.calendarRepo.getUpcoming(days);
    } catch (error) {
      console.error("CalendarEventService.getUpcoming:", error);
      throw error;
    }
  }

  // ── Get holidays for a year ───────────────────────────────
  async getHolidays(year) {
    try {
      return await this.calendarRepo.getHolidays(year);
    } catch (error) {
      console.error("CalendarEventService.getHolidays:", error);
      throw error;
    }
  }

  // ── Update event ──────────────────────────────────────────
  async updateEvent(id, data, performedBy, performedByName) {
    try {
      const event = await this.calendarRepo.getById(id);
      if (!event) throw new Error("Event not found.");

      const updated = await this.calendarRepo.findByIdandUpdate(id, data);

      await this.auditRepo.create({
        performedBy,
        performedByName,
        action:      "UPDATE",
        entity:      "CalendarEvent",
        entityId:    id,
        entityLabel: event.title,
        description: `Updated calendar event: "${event.title}"`,
      });

      return updated;
    } catch (error) {
      console.error("CalendarEventService.updateEvent:", error);
      throw error;
    }
  }

  // ── Delete event ──────────────────────────────────────────
  async deleteEvent(id, performedBy, performedByName) {
    try {
      const event = await this.calendarRepo.getById(id);
      if (!event) throw new Error("Event not found.");

      await this.calendarRepo.findByIdandDelete(id);

      await this.auditRepo.create({
        performedBy,
        performedByName,
        action:      "DELETE",
        entity:      "CalendarEvent",
        entityId:    id,
        entityLabel: event.title,
        description: `Deleted calendar event: "${event.title}"`,
      });

      return { success: true };
    } catch (error) {
      console.error("CalendarEventService.deleteEvent:", error);
      throw error;
    }
  }
}

export default CalendarEventService;
