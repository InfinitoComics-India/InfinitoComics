import WorkAssignmentService from "../services/workAssignment-service.js";

const waService = new WorkAssignmentService();
const gp = (req) => ({ performedBy: req.user._id, performedByName: req.user.name || req.user.username || req.user.email || "Admin" });

const assign            = async (req, res) => { try { const a = await waService.assign(req.body, ...Object.values(gp(req))); res.status(201).json({ success: true, message: "Employee assigned.", data: a }); } catch (e) { res.status(e.message.includes("already") || e.message.includes("5 active") ? 400 : 500).json({ success: false, message: e.message }); } };
const getByEmployee     = async (req, res) => { try { const a = await waService.getByEmployee(req.params.employeeId); res.status(200).json({ success: true, data: a, count: a.length }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } };
const getByProject      = async (req, res) => { try { const a = await waService.getByProject(req.params.projectId); res.status(200).json({ success: true, data: a, count: a.length }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } };
const getWorkload       = async (req, res) => { try { const w = await waService.getWorkloadSummary(); res.status(200).json({ success: true, data: w }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } };
const updateAssignment  = async (req, res) => { try { const a = await waService.updateAssignment(req.params.id, req.body, ...Object.values(gp(req))); res.status(200).json({ success: true, message: "Assignment updated.", data: a }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } };
const removeAssignment  = async (req, res) => { try { await waService.removeAssignment(req.params.id, ...Object.values(gp(req))); res.status(200).json({ success: true, message: "Assignment removed." }); } catch (e) { res.status(e.message.includes("not found") ? 404 : 500).json({ success: false, message: e.message }); } };

export default { assign, getByEmployee, getByProject, getWorkload, updateAssignment, removeAssignment };
