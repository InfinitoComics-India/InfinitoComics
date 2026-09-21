import EmployeeService from "../services/employee-service.js";

const employeeService = new EmployeeService();

// Helper — extract performer info from req.user (set by adminauthenticate middleware)
const getPerformer = (req) => ({
  performedBy:   req.user._id,
  performedByName: req.user.name || req.user.username || req.user.email || "Admin",
});

// ── CREATE ────────────────────────────────────────────────────
const createEmployee = async (req, res) => {
  try {
    const { performedBy, performedByName } = getPerformer(req);
    const employee = await employeeService.createEmployee(req.body, performedBy, performedByName);
    res.status(201).json({ success: true, message: "Employee created successfully.", data: employee });
  } catch (error) {
    console.error("createEmployee:", error);
    const status = error.message.includes("already exists") ? 409 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// ── GET ALL ───────────────────────────────────────────────────
const getAllEmployees = async (req, res) => {
  try {
    // Supports ?search=, ?department=, ?hrRole=, ?all=true
    const employees = await employeeService.getAllEmployees(req.query);
    res.status(200).json({ success: true, data: employees, count: employees.length });
  } catch (error) {
    console.error("getAllEmployees:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET BY ID ─────────────────────────────────────────────────
const getEmployeeById = async (req, res) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    console.error("getEmployeeById:", error);
    const status = error.message.includes("not found") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// ── UPDATE ────────────────────────────────────────────────────
const updateEmployee = async (req, res) => {
  try {
    const { performedBy, performedByName } = getPerformer(req);
    const updated = await employeeService.updateEmployee(req.params.id, req.body, performedBy, performedByName);
    res.status(200).json({ success: true, message: "Employee updated successfully.", data: updated });
  } catch (error) {
    console.error("updateEmployee:", error);
    const status = error.message.includes("not found") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// ── CHANGE STATUS ─────────────────────────────────────────────
const changeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: "status is required." });
    const { performedBy, performedByName } = getPerformer(req);
    const updated = await employeeService.changeStatus(req.params.id, status, performedBy, performedByName);
    res.status(200).json({ success: true, message: `Employee status changed to ${status}.`, data: updated });
  } catch (error) {
    console.error("changeStatus:", error);
    const status = error.message.includes("not found") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// ── CHANGE HR ROLE ────────────────────────────────────────────
const changeRole = async (req, res) => {
  try {
    const { hrRole } = req.body;
    if (!hrRole) return res.status(400).json({ success: false, message: "hrRole is required." });
    const { performedBy, performedByName } = getPerformer(req);
    const updated = await employeeService.changeRole(req.params.id, hrRole, performedBy, performedByName);
    res.status(200).json({ success: true, message: `HR role changed to ${hrRole}.`, data: updated });
  } catch (error) {
    console.error("changeRole:", error);
    const status = error.message.includes("not found") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// ── DELETE ────────────────────────────────────────────────────
const deleteEmployee = async (req, res) => {
  try {
    const { performedBy, performedByName } = getPerformer(req);
    await employeeService.deleteEmployee(req.params.id, performedBy, performedByName);
    res.status(200).json({ success: true, message: "Employee deleted successfully." });
  } catch (error) {
    console.error("deleteEmployee:", error);
    const status = error.message.includes("not found") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// ── GET DIRECT REPORTS ────────────────────────────────────────
const getDirectReports = async (req, res) => {
  try {
    const reports = await employeeService.getDirectReports(req.params.id);
    res.status(200).json({ success: true, data: reports, count: reports.length });
  } catch (error) {
    console.error("getDirectReports:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  changeStatus,
  changeRole,
  deleteEmployee,
  getDirectReports,
};
