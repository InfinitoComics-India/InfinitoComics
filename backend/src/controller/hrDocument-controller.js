import HRDocumentService from "../services/hrDocument-service.js";
const svc = new HRDocumentService();
const gp  = (req) => ({ performedBy: req.user._id, performedByName: req.user.name || req.user.username || req.user.email || "Admin" });

const upload         = async (req,res) => { try { const {performedBy,performedByName}=gp(req); const d=await svc.upload(req.body,performedBy,performedByName); res.status(201).json({success:true,message:"Document uploaded.",data:d}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const getByEmployee  = async (req,res) => { try { const d=await svc.getByEmployee(req.params.employeeId); res.status(200).json({success:true,data:d,count:d.length}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const getExpiring    = async (req,res) => { try { const days=parseInt(req.query.days)||30; const d=await svc.getExpiringSoon(days); res.status(200).json({success:true,data:d,count:d.length}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const getAllForAdmin  = async (req,res) => { try { const d=await svc.getAllForAdmin(); res.status(200).json({success:true,data:d,count:d.length}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const updateDocument = async (req,res) => { try { const {oldFileUrl,...data}=req.body; const {performedBy,performedByName}=gp(req); const d=await svc.updateDocument(req.params.id,data,oldFileUrl,performedBy,performedByName); res.status(200).json({success:true,message:"Document updated.",data:d}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const deleteDocument = async (req,res) => { try { const {performedBy,performedByName}=gp(req); await svc.deleteDocument(req.params.id,performedBy,performedByName); res.status(200).json({success:true,message:"Document deleted."}); } catch(e){res.status(e.message.includes("not found")?404:500).json({success:false,message:e.message});} };

export default { upload, getByEmployee, getExpiring, getAllForAdmin, updateDocument, deleteDocument };
