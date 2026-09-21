import ProjectService from "../services/project-service.js";

const projectService = new ProjectService();
const gp = (req) => ({ performedBy: req.user._id, performedByName: req.user.name || req.user.username || req.user.email || "Admin" });

const createProject     = async (req, res) => { try { const p = await projectService.createProject(req.body, ...Object.values(gp(req))); res.status(201).json({ success: true, message: "Project created.", data: p }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } };
const getAllProjects     = async (req, res) => { try { const p = await projectService.getAllProjects(req.query); res.status(200).json({ success: true, data: p, count: p.length }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } };
const getProjectDetail  = async (req, res) => { try { const p = await projectService.getProjectDetail(req.params.id); res.status(200).json({ success: true, data: p }); } catch (e) { res.status(e.message.includes("not found") ? 404 : 500).json({ success: false, message: e.message }); } };
const updateProject     = async (req, res) => { try { const p = await projectService.updateProject(req.params.id, req.body, ...Object.values(gp(req))); res.status(200).json({ success: true, message: "Project updated.", data: p }); } catch (e) { res.status(e.message.includes("not found") ? 404 : 500).json({ success: false, message: e.message }); } };
const addMilestone      = async (req, res) => { try { const p = await projectService.addMilestone(req.params.id, req.body, ...Object.values(gp(req))); res.status(200).json({ success: true, message: "Milestone added.", data: p }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } };
const updateMilestone   = async (req, res) => { try { const p = await projectService.updateMilestone(req.params.id, req.params.milestoneId, req.body, ...Object.values(gp(req))); res.status(200).json({ success: true, message: "Milestone updated.", data: p }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } };
const deleteProject     = async (req, res) => { try { await projectService.deleteProject(req.params.id, ...Object.values(gp(req))); res.status(200).json({ success: true, message: "Project deleted." }); } catch (e) { res.status(e.message.includes("not found") ? 404 : 500).json({ success: false, message: e.message }); } };
const getStats          = async (req, res) => { try { const s = await projectService.getStats(); res.status(200).json({ success: true, data: s }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } };

export default { createProject, getAllProjects, getProjectDetail, updateProject, addMilestone, updateMilestone, deleteProject, getStats };
