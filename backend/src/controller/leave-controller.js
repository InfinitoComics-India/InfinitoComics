import LeaveService from "../services/leave-service.js";

const leaveService = new LeaveService();

const getPerformer = (req) => ({
  performedBy:     req.user._id,
  performedByName: req.user.name || req.user.username || req.user.email || "Admin",
});

// ── Apply for leave ───────────────────────────────────────────
const applyLeave = async (req, res) => {
  try {
    const { performedBy, performedByName } = getPerformer(req);
    const leave = await leaveService.applyLeave(req.body, performedBy, performedByName);
    res.status(201).json({ success: true, message: "Leave applied successfully.", data: leave });
  } catch (error) {
    const status = error.message.includes("overlap") || error.message.includes("balance") ? 400 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// ── Approve leave ─────────────────────────────────────────────
const approveLeave = async (req, res) => {
  try {
    const { adminNote } = req.body;
    const { performedBy, performedByName } = getPerformer(req);
    const leave = await leaveService.approveLeave(req.params.id, adminNote, performedBy, performedByName);
    res.status(200).json({ success: true, message: "Leave approved.", data: leave });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : error.message.includes("Only pending") ? 400 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// ── Reject leave ──────────────────────────────────────────────
const rejectLeave = async (req, res) => {
  try {
    const { rejectionNote } = req.body;
    const { performedBy, performedByName } = getPerformer(req);
    const leave = await leaveService.rejectLeave(req.params.id, rejectionNote, performedBy, performedByName);
    res.status(200).json({ success: true, message: "Leave rejected.", data: leave });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

// ── Cancel leave ──────────────────────────────────────────────
const cancelLeave = async (req, res) => {
  try {
    const { performedBy, performedByName } = getPerformer(req);
    const leave = await leaveService.cancelLeave(req.params.id, performedBy, performedByName);
    res.status(200).json({ success: true, message: "Leave cancelled.", data: leave });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── Get leaves for an employee ────────────────────────────────
const getByEmployee = async (req, res) => {
  try {
    const { status } = req.query;
    const leaves = await leaveService.getByEmployee(req.params.employeeId, status);
    res.status(200).json({ success: true, data: leaves, count: leaves.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get pending queue ─────────────────────────────────────────
const getPending = async (req, res) => {
  try {
    const leaves = await leaveService.getPending();
    res.status(200).json({ success: true, data: leaves, count: leaves.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get leave balance ─────────────────────────────────────────
const getBalance = async (req, res) => {
  try {
    const data = await leaveService.getBalance(req.params.employeeId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default { applyLeave, approveLeave, rejectLeave, cancelLeave, getByEmployee, getPending, getBalance };
