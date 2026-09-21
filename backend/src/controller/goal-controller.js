import GoalService from "../services/goal-service.js";
const svc = new GoalService();
const gp  = (req) => ({ performedBy: req.user._id, performedByName: req.user.name || req.user.username || req.user.email || "Admin" });

const createGoal     = async (req,res) => { try { const { performedBy, performedByName } = gp(req); const d = await svc.createGoal(req.body, performedBy, performedByName); res.status(201).json({success:true,message:"Goal created.",data:d}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const getByEmployee  = async (req,res) => { try { const d = await svc.getByEmployee(req.params.employeeId, req.query.status); res.status(200).json({success:true,data:d,count:d.length}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const updateProgress = async (req,res) => { try { const { currentValue } = req.body; if (currentValue===undefined) return res.status(400).json({success:false,message:"currentValue required."}); const { performedBy, performedByName } = gp(req); const d = await svc.updateProgress(req.params.id, parseFloat(currentValue), performedBy, performedByName); res.status(200).json({success:true,message:"Progress updated.",data:d}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const updateGoal     = async (req,res) => { try { const { performedBy, performedByName } = gp(req); const d = await svc.updateGoal(req.params.id, req.body, performedBy, performedByName); res.status(200).json({success:true,message:"Goal updated.",data:d}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const deleteGoal     = async (req,res) => { try { const { performedBy, performedByName } = gp(req); await svc.deleteGoal(req.params.id, performedBy, performedByName); res.status(200).json({success:true,message:"Goal deleted."}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const getSummary     = async (req,res) => { try { const d = await svc.getSummary(req.params.employeeId); res.status(200).json({success:true,data:d}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const getOverdue     = async (req,res) => { try { const d = await svc.getOverdue(); res.status(200).json({success:true,data:d,count:d.length}); } catch(e){res.status(500).json({success:false,message:e.message});} };

export default { createGoal, getByEmployee, updateProgress, updateGoal, deleteGoal, getSummary, getOverdue };
