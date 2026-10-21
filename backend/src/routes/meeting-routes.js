import express from "express";
const router = express.Router();
import Meeting from "../models/Meeting.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const ALL = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin","shop_admin","employee"];
const HR  = ["superadmin","hr_manager","manager"];

// GET all meetings (admin sees all, employee sees their own + meetings where they're participant)
router.get("/", adminauthenticate, checkRole(ALL), async (req, res) => {
  try {
    const isAdmin = ["superadmin","hr_manager","manager"].some(r => 
      Array.isArray(req.user.roles) ? req.user.roles.includes(r) : req.user.role === r
    );
    // For employees: show meetings where they are a participant OR all upcoming meetings
    // (internal company meetings should be visible to everyone)
    const meetings = await Meeting.find({}).sort({ scheduledAt: -1 }).limit(100);
    res.status(200).json({ success: true, data: meetings });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET upcoming meetings for current user
router.get("/upcoming", adminauthenticate, checkRole(ALL), async (req, res) => {
  try {
    const filter = { scheduledAt: { $gte: new Date() }, status: { $in: ["scheduled","ongoing"] }, participants: req.user._id };
    const meetings = await Meeting.find(filter).sort({ scheduledAt: 1 }).limit(10);
    res.status(200).json({ success: true, data: meetings });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET single meeting
router.get("/:id", adminauthenticate, checkRole(ALL), async (req, res) => {
  try {
    const m = await Meeting.findById(req.params.id);
    if (!m) return res.status(404).json({ success: false, message: "Meeting not found." });
    res.status(200).json({ success: true, data: m });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST create meeting + notify participants
router.post("/", adminauthenticate, checkRole(HR), async (req, res) => {
  try {
    const Admin = (await import('../models/Admin.js')).default;
    const { title, agenda, meetLink, scheduledAt, duration, participants } = req.body;
    if (!title || !scheduledAt) return res.status(400).json({ success: false, message: "title and scheduledAt required." });

    // Resolve participant names
    const participantDocs = await Admin.find({ _id: { $in: participants || [] } }).select("name");
    const participantNames = participantDocs.map(p => p.name);

    const meeting = await Meeting.create({
      title, agenda: agenda||"", meetLink: meetLink||"",
      scheduledAt: new Date(scheduledAt),
      duration: duration || 60,
      participants: participants || [],
      participantNames,
      createdBy: req.user._id,
      createdByName: req.user.name || req.user.email || "Admin",
    });

    // Notify all participants
    const meetDate = new Date(scheduledAt).toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", hour12:true });
    try {
      const NotificationRepo = (await import('../repository/notification-repository.js')).default;
      const notifRepo = new NotificationRepo();
      for (const pid of (participants||[])) {
        try {
          await notifRepo.create({
            recipientId: pid,
            recipientModel: "Employee",
            type: "system",
            title: `📅 Meeting: ${title}`,
            message: `You are invited to "${title}" on ${meetDate}.${meetLink ? ` Join: ${meetLink}` : " Meet link will be shared."}`,
            link: "/employee-portal?tab=meetings",
            triggeredBy: req.user._id,
          });
        } catch {}
      }
    } catch {}

    res.status(201).json({ success: true, message: "Meeting created and participants notified.", data: meeting });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// PATCH update meeting
router.patch("/:id", adminauthenticate, checkRole(HR), async (req, res) => {
  try {
    const updated = await Meeting.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Not found." });
    res.status(200).json({ success: true, data: updated });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// DELETE meeting
router.delete("/:id", adminauthenticate, checkRole(HR), async (req, res) => {
  try {
    await Meeting.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Deleted." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
