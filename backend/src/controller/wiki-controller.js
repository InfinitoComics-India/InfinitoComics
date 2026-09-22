import WikiService from "../services/wiki-service.js";
const svc = new WikiService();
const gp  = (req) => ({ performedBy: req.user._id, performedByName: req.user.name || req.user.username || req.user.email || "Admin" });

const createArticle   = async (req,res) => { try { const {performedBy,performedByName}=gp(req); const d=await svc.createArticle(req.body,performedBy,performedByName); res.status(201).json({success:true,message:"Article created.",data:d}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const getAllArticles   = async (req,res) => { try { const d=await svc.getAllArticles(req.query.category); res.status(200).json({success:true,data:d,count:d.length}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const getPublished    = async (req,res) => { try { const d=await svc.getPublishedArticles(req.query.category); res.status(200).json({success:true,data:d,count:d.length}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const getBySlug       = async (req,res) => { try { const d=await svc.getArticleBySlug(req.params.slug); res.status(200).json({success:true,data:d}); } catch(e){res.status(e.message.includes("not found")?404:500).json({success:false,message:e.message});} };
const getById         = async (req,res) => { try { const d=await svc.getArticleById(req.params.id); res.status(200).json({success:true,data:d}); } catch(e){res.status(e.message.includes("not found")?404:500).json({success:false,message:e.message});} };
const updateArticle   = async (req,res) => { try { const {performedBy,performedByName}=gp(req); const d=await svc.updateArticle(req.params.id,req.body,performedBy,performedByName); res.status(200).json({success:true,message:"Updated.",data:d}); } catch(e){res.status(e.message.includes("not found")?404:500).json({success:false,message:e.message});} };
const deleteArticle   = async (req,res) => { try { const {performedBy,performedByName}=gp(req); await svc.deleteArticle(req.params.id,performedBy,performedByName); res.status(200).json({success:true,message:"Deleted."}); } catch(e){res.status(e.message.includes("not found")?404:500).json({success:false,message:e.message});} };
const searchArticles  = async (req,res) => { try { const {q}=req.query; if(!q) return res.status(400).json({success:false,message:"q required."}); const d=await svc.searchArticles(q); res.status(200).json({success:true,data:d}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const vote            = async (req,res) => { try { const {helpful}=req.body; const d=await svc.vote(req.params.id,!!helpful); res.status(200).json({success:true,data:d}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const getPopular      = async (req,res) => { try { const d=await svc.getPopular(); res.status(200).json({success:true,data:d}); } catch(e){res.status(500).json({success:false,message:e.message});} };
const getCategoryStats= async (req,res) => { try { const d=await svc.getCategoryStats(); res.status(200).json({success:true,data:d}); } catch(e){res.status(500).json({success:false,message:e.message});} };

export default { createArticle, getAllArticles, getPublished, getBySlug, getById, updateArticle, deleteArticle, searchArticles, vote, getPopular, getCategoryStats };
