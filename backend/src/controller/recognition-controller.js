import RecognitionService from "../services/recognition-service.js";
const svc = new RecognitionService();
const gp  = (req) => ({ performedBy: req.user._id, performedByName: req.user.name || req.user.username || req.user.email || "Admin" });

const give           = async (req,res) => { try { const { performedBy, performedByName } = gp(req); const d = await svc.give(req.body, performedBy, performedByName); res.status(201).json({success:true,message:"Recognition given.",data:d}); } catch(e){res.status(e.message.includes("not found")?404:500).json({success:false,message:e.message});} };
const getWall        = async (req,res) => { try { const d = await svc.getWall(); res.status(200).json({success:true,data:d}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const getForEmployee = async (req,res) => { try { const d = await svc.getForEmployee(req.params.employeeId); res.status(200).json({success:true,data:d,count:d.length}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const getBadges      = async (req,res) => { try { const d = await svc.getBadges(req.params.employeeId); res.status(200).json({success:true,data:d}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const deleteRec      = async (req,res) => { try { const { performedBy, performedByName } = gp(req); await svc.deleteRecognition(req.params.id, performedBy, performedByName); res.status(200).json({success:true,message:"Recognition deleted."}); } catch(e){res.status(500).json({success:false,message:e.message});} };

export default { give, getWall, getForEmployee, getBadges, deleteRec };
