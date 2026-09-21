import express from "express";
const router = express.Router();
import CalendarEventController from "../controller/calendarEvent-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const HR_ALL    = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin"];
const HR_MANAGE = ["superadmin","hr_manager","manager"];

// GET events for a month              ?year=&month=
router.get("/month",        adminauthenticate, checkRole(HR_ALL),    CalendarEventController.getForMonth);

// GET events in a date range          ?startDate=&endDate=&employeeId=
router.get("/range",        adminauthenticate, checkRole(HR_ALL),    CalendarEventController.getInRange);

// GET upcoming events                 ?days=7
router.get("/upcoming",     adminauthenticate, checkRole(HR_ALL),    CalendarEventController.getUpcoming);

// GET holidays for a year             ?year=
router.get("/holidays",     adminauthenticate, checkRole(HR_ALL),    CalendarEventController.getHolidays);

// POST create event
router.post("/create",      adminauthenticate, checkRole(HR_MANAGE), CalendarEventController.createEvent);

// PUT update event
router.put("/update/:id",   adminauthenticate, checkRole(HR_MANAGE), CalendarEventController.updateEvent);

// DELETE event
router.delete("/delete/:id",adminauthenticate, checkRole(HR_MANAGE), CalendarEventController.deleteEvent);

export default router;
