import SalaryService from "../services/salary-service.js";
const svc = new SalaryService();
const gp  = (req) => ({ performedBy: req.user._id, performedByName: req.user.name || req.user.username || req.user.email || "Admin" });

const setSalary      = async (req,res) => { try { const {performedBy,performedByName}=gp(req); const d=await svc.setSalary(req.params.employeeId,req.body,performedBy,performedByName); res.status(200).json({success:true,message:"Salary updated.",data:d}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const getByEmployee  = async (req,res) => { try { const d=await svc.getByEmployee(req.params.employeeId); if(!d) return res.status(404).json({success:false,message:"No salary structure found."}); res.status(200).json({success:true,data:d}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const getAll         = async (req,res) => { try { const d=await svc.getAll(); res.status(200).json({success:true,data:d,count:d.length}); } catch(e){res.status(500).json({success:false,message:e.message});} };

export default { setSalary, getByEmployee, getAll };
