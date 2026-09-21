import mongoose from "mongoose";

const CalendarEventSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    // ── Type drives the color on the calendar ─────────────────
    type: {
      type: String,
      enum: [
        "holiday",      // company holiday — red
        "leave",        // approved leave — yellow
        "deadline",     // task/project deadline — orange
        "meeting",      // team meeting — blue
        "event",        // company event — purple
        "birthday",     // employee birthday — pink
        "anniversary",  // work anniversary — green
        "reminder",     // general reminder — grey
      ],
      required: true,
    },

    // ── Date & Time ───────────────────────────────────────────
    startDate:  { type: Date, required: true },
    endDate:    { type: Date, required: true },
    isAllDay:   { type: Boolean, default: false },
    startTime:  { type: String }, // "HH:MM" — only if not all-day
    endTime:    { type: String },

    // ── Participants ──────────────────────────────────────────
    // Empty = visible to everyone. Filled = only those employees
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
    isCompanyWide: { type: Boolean, default: false },

    // ── Recurring ─────────────────────────────────────────────
    isRecurring: { type: Boolean, default: false },
    recurringRule: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
    },

    // ── Meta ──────────────────────────────────────────────────
    createdBy:  { type: mongoose.Schema.Types.ObjectId },
    color:      { type: String, default: "" }, // override default type color
    link:       { type: String, default: "" }, // meeting link / related page

    // Reference — e.g. leave event links to a Leave record
    relatedEntity:   { type: String },
    relatedEntityId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

CalendarEventSchema.index({ startDate: 1, endDate: 1 });
CalendarEventSchema.index({ type: 1, startDate: 1 });

const CalendarEvent = mongoose.model("CalendarEvent", CalendarEventSchema);
export default CalendarEvent;
