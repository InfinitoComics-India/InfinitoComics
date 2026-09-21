import React, { useState, useEffect } from "react";
import { FolderKanban, Plus, X, ChevronRight, Loader, CheckCircle2, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const STATUS_STYLE  = { planning: "bg-blue-100 text-blue-700", active: "bg-green-100 text-green-700", on_hold: "bg-yellow-100 text-yellow-700", completed: "bg-gray-100 text-gray-600", cancelled: "bg-red-100 text-red-600" };
const HEALTH_STYLE  = { on_track: "bg-green-100 text-green-700", at_risk: "bg-yellow-100 text-yellow-700", delayed: "bg-red-100 text-red-700" };
const HEALTH_ICON   = { on_track: CheckCircle2, at_risk: AlertTriangle, delayed: AlertTriangle };
const STATUSES      = ["planning","active","on_hold","completed","cancelled"];
const EMPTY_FORM    = { name:"", description:"", clientName:"", category:"", startDate:"", endDate:"", budget:"", status:"planning", tags:"" };
const EMPTY_MS      = { title:"", description:"", dueDate:"", status:"pending" };

const ProjectManager = () => {
  const [projects, setProjects]     = useState([]);
  const [employees, setEmployees]   = useState([]);
  const [stats, setStats]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [detail, setDetail]         = useState(null);
  const [detailTab, setDetailTab]   = useState("overview");
  const [createModal, setCreateModal] = useState(false);
  const [msModal, setMsModal]       = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [msForm, setMsForm]         = useState(EMPTY_MS);
  const [saving, setSaving]         = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [taskCounts, setTaskCounts] = useState({});

  const load = async () => {
    try { setLoading(true); setError("");
      const [pRes, empRes, sRes] = await Promise.all([
        axios.get(`${BASE}/hr/projects/getall`, auth()),
        axios.get(`${BASE}/hr/employees/getall`, auth()),
        axios.get(`${BASE}/hr/projects/stats`, auth()),
      ]);
      setProjects(pRes.data.data || []);
      setEmployees(empRes.data.data || []);
      setStats(sRes.data.data || []);
    } catch { setError("Failed to load projects."); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openDetail = async (project) => {
    try {
      const [pRes, tRes] = await Promise.all([
        axios.get(`${BASE}/hr/projects/${project._id}`, auth()),
        axios.get(`${BASE}/hr/tasks/project/${project._id}`, auth()),
      ]);
      setDetail(pRes.data.data);
      const tasks = tRes.data.data || [];
      const counts = tasks.reduce((a, t) => { a[t.status] = (a[t.status]||0)+1; return a; }, {});
      setTaskCounts(counts);
      setDetailTab("overview");
    } catch {}
  };

  const handleCreate = async () => {
    if (!form.name) { setError("Project name is required."); return; }
    try { setSaving(true); setError("");
      const payload = { ...form, tags: form.tags.split(",").map(t=>t.trim()).filter(Boolean), budget: form.budget ? parseInt(form.budget) : 0 };
      await axios.post(`${BASE}/hr/projects/create`, payload, auth());
      setCreateModal(false); setForm(EMPTY_FORM); load();
    } catch (e) { setError(e.response?.data?.message || "Failed to create."); } finally { setSaving(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`${BASE}/hr/projects/update/${id}`, { status }, auth());
      setProjects(prev => prev.map(p => p._id === id ? {...p, status} : p));
      if (detail?._id === id) setDetail(d => ({...d, status}));
    } catch { setError("Failed to update status."); }
  };

  const handleAddMilestone = async () => {
    if (!msForm.title || !detail) return;
    try { setSaving(true);
      const res = await axios.post(`${BASE}/hr/projects/milestone/${detail._id}`, msForm, auth());
      setDetail(res.data.data); setMsModal(false); setMsForm(EMPTY_MS);
    } catch (e) { setError(e.response?.data?.message || "Failed to add milestone."); } finally { setSaving(false); }
  };

  const handleMilestoneStatus = async (projectId, milestoneId, status) => {
    try {
      const ms = detail.milestones.find(m => m._id === milestoneId);
      const res = await axios.put(`${BASE}/hr/projects/milestone/${projectId}/${milestoneId}`, { ...ms, status }, auth());
      setDetail(res.data.data);
    } catch {}
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";

  const filtered = statusFilter === "all" ? projects : projects.filter(p => p.status === statusFilter);

  // Summary counts
  const statMap = {};
  stats.forEach(s => { statMap[s._id] = s; });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderKanban size={22} className="text-[#DD1215]" />
          <div>
            <h1 className="text-2xl font-black tracking-widest text-gray-900">PROJECTS</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage all InfinitoComics projects</p>
          </div>
        </div>
        <button onClick={() => { setCreateModal(true); setError(""); }}
          className="flex items-center gap-2 bg-[#DD1215] text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
          <Plus size={14} /> New Project
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {["planning","active","on_hold","completed","cancelled"].map(s => {
            const d = statMap[s];
            return (
              <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
                className={`bg-white border rounded-lg px-4 py-3 text-left hover:border-[#DD1215] transition ${statusFilter === s ? "border-[#DD1215] ring-1 ring-[#DD1215]" : ""}`}>
                <p className="text-2xl font-black text-gray-900">{d?.count || 0}</p>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 capitalize mt-0.5">{s.replace("_"," ")}</p>
                {d?.avgProgress > 0 && <p className="text-[10px] text-gray-400 mt-0.5">{Math.round(d.avgProgress)}% avg</p>}
              </button>
            );
          })}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">{error}</div>}

        {/* Projects grid */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader size={28} className="animate-spin text-[#DD1215]" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border rounded-lg text-center py-20 text-gray-400">
            <FolderKanban size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No projects found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => {
              const HIcon = HEALTH_ICON[p.health] || CheckCircle2;
              return (
                <div key={p._id} onClick={() => openDetail(p)}
                  className="bg-white border rounded-lg p-5 cursor-pointer hover:shadow-md hover:border-[#DD1215] transition">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[10px] font-mono text-gray-400">{p.projectId}</p>
                      <h3 className="font-black text-gray-900 text-sm mt-0.5">{p.name}</h3>
                      {p.clientName && <p className="text-xs text-gray-400 mt-0.5">Client: {p.clientName}</p>}
                    </div>
                    <div className="flex flex-col gap-1 items-end shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${STATUS_STYLE[p.status]}`}>{p.status.replace("_"," ")}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${HEALTH_STYLE[p.health]}`}>
                        <HIcon size={9} /> {p.health?.replace("_"," ")}
                      </span>
                    </div>
                  </div>
                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-400">Progress</span>
                      <span className="text-[10px] font-bold text-gray-700">{p.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-[#DD1215] h-1.5 rounded-full" style={{ width:`${p.progress}%` }} />
                    </div>
                  </div>
                  {/* Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {(p.teamMembers || []).slice(0,4).map(m => (
                        <div key={m._id} title={`${m.firstName} ${m.lastName}`}
                          className="w-6 h-6 rounded-full bg-[#DD1215] text-white border-2 border-white flex items-center justify-center text-[9px] font-bold">
                          {m.firstName?.[0]}{m.lastName?.[0]}
                        </div>
                      ))}
                      {p.teamMembers?.length > 4 && <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 border-2 border-white flex items-center justify-center text-[9px] font-bold">+{p.teamMembers.length-4}</div>}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                      {p.endDate && <span className="flex items-center gap-0.5"><Clock size={10} /> {fmt(p.endDate)}</span>}
                      <ChevronRight size={14} className="text-gray-300" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Project Detail Panel */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 px-0 sm:px-4">
          <div className="bg-white w-full sm:max-w-3xl sm:rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gray-900 text-white px-6 py-4 flex items-start justify-between shrink-0">
              <div>
                <p className="text-xs font-mono text-gray-400">{detail.projectId}</p>
                <h2 className="text-xl font-black">{detail.name}</h2>
                {detail.clientName && <p className="text-xs text-gray-300 mt-0.5">Client: {detail.clientName}</p>}
              </div>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-white mt-1"><X size={20} /></button>
            </div>
            {/* Tabs */}
            <div className="border-b flex shrink-0 bg-white">
              {["overview","milestones","tasks","team"].map(t => (
                <button key={t} onClick={() => setDetailTab(t)}
                  className={`px-5 py-3 text-xs font-bold uppercase tracking-widest capitalize transition ${detailTab===t?"border-b-2 border-[#DD1215] text-[#DD1215]":"text-gray-500 hover:text-gray-800"}`}>{t}</button>
              ))}
            </div>
            {/* Content */}
            <div className="overflow-y-auto flex-1 p-6">

              {/* Overview */}
              {detailTab==="overview" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <Info label="Status">
                      <select value={detail.status} onChange={e => handleStatusChange(detail._id, e.target.value)} className={`text-xs font-semibold px-2 py-1 rounded border-0 cursor-pointer ${STATUS_STYLE[detail.status]}`}>
                        {STATUSES.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
                      </select>
                    </Info>
                    <Info label="Health"><span className={`px-2 py-1 rounded text-xs font-bold capitalize ${HEALTH_STYLE[detail.health]}`}>{detail.health?.replace("_"," ")}</span></Info>
                    <Info label="Progress"><span className="text-lg font-black text-gray-900">{detail.progress}%</span></Info>
                    <Info label="Start Date"><span className="text-sm text-gray-700">{fmt(detail.startDate)}</span></Info>
                    <Info label="End Date"><span className="text-sm text-gray-700">{fmt(detail.endDate)}</span></Info>
                    <Info label="Budget"><span className="text-sm text-gray-700">{detail.budget > 0 ? `₹${detail.budget.toLocaleString("en-IN")}` : "—"}</span></Info>
                  </div>
                  {detail.description && <div><p className="text-xs font-bold uppercase text-gray-400 mb-1">Description</p><p className="text-sm text-gray-700">{detail.description}</p></div>}
                  {/* Task summary */}
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400 mb-2">Tasks by Status</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(taskCounts).map(([s, count]) => (
                        <span key={s} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-semibold capitalize">{s.replace("_"," ")}: {count}</span>
                      ))}
                      {Object.keys(taskCounts).length === 0 && <span className="text-xs text-gray-400">No tasks yet.</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Milestones */}
              {detailTab==="milestones" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-700">Milestones ({detail.milestones?.length || 0})</p>
                    <button onClick={() => setMsModal(true)} className="flex items-center gap-1 text-xs text-[#DD1215] font-bold hover:underline"><Plus size={13} /> Add</button>
                  </div>
                  {(detail.milestones || []).length === 0 ? (
                    <p className="text-sm text-gray-400">No milestones yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {detail.milestones.map(ms => (
                        <div key={ms._id} className="flex items-center gap-3 bg-gray-50 border rounded-lg px-4 py-3">
                          <button onClick={() => handleMilestoneStatus(detail._id, ms._id, ms.status==="completed"?"pending":"completed")}
                            className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${ms.status==="completed"?"bg-green-600 border-green-600 text-white":"border-gray-300 hover:border-green-500"}`}>
                            {ms.status==="completed" && <CheckCircle2 size={12} />}
                          </button>
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${ms.status==="completed"?"line-through text-gray-400":"text-gray-900"}`}>{ms.title}</p>
                            {ms.dueDate && <p className="text-xs text-gray-400 mt-0.5"><Clock size={9} className="inline mr-1" />{fmt(ms.dueDate)}</p>}
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold capitalize ${ms.status==="completed"?"bg-green-100 text-green-700":ms.status==="in_progress"?"bg-blue-100 text-blue-700":"bg-gray-100 text-gray-600"}`}>{ms.status.replace("_"," ")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tasks */}
              {detailTab==="tasks" && (
                <div className="text-sm text-gray-600 space-y-2">
                  <p className="text-xs font-bold uppercase text-gray-400 mb-3">Task Distribution</p>
                  {Object.entries(taskCounts).length === 0 ? (
                    <p className="text-gray-400">No tasks assigned to this project yet.</p>
                  ) : Object.entries(taskCounts).map(([s, count]) => (
                    <div key={s} className="flex items-center gap-3">
                      <span className="text-xs capitalize text-gray-600 w-24">{s.replace("_"," ")}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="bg-[#DD1215] h-2 rounded-full" style={{ width:`${Math.round(count/Object.values(taskCounts).reduce((a,b)=>a+b,0)*100)}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-700 w-4">{count}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Team */}
              {detailTab==="team" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(detail.teamMembers || []).map(m => (
                    <div key={m._id} className="flex items-center gap-3 bg-gray-50 border rounded-lg px-4 py-3">
                      <div className="w-9 h-9 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-xs font-bold">{m.firstName?.[0]}{m.lastName?.[0]}</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{m.firstName} {m.lastName}</p>
                        <p className="text-xs text-gray-400">{m.designation}</p>
                      </div>
                    </div>
                  ))}
                  {detail.teamMembers?.length === 0 && <p className="text-sm text-gray-400 col-span-2">No team members assigned.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black uppercase tracking-widest">New Project</h3>
              <button onClick={() => { setCreateModal(false); setError(""); }} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <F2 label="Project Name *"><input type="text" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} className={inp} placeholder="InfinitoComics Shop..." required /></F2>
              <F2 label="Description"><textarea rows={2} value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} className={`${inp} resize-none`} /></F2>
              <div className="grid grid-cols-2 gap-3">
                <F2 label="Client Name"><input type="text" value={form.clientName} onChange={e => setForm(f=>({...f,clientName:e.target.value}))} className={inp} /></F2>
                <F2 label="Category"><input type="text" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} className={inp} placeholder="Frontend / Backend..." /></F2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F2 label="Start Date"><input type="date" value={form.startDate} onChange={e => setForm(f=>({...f,startDate:e.target.value}))} className={inp} /></F2>
                <F2 label="End Date"><input type="date" value={form.endDate} onChange={e => setForm(f=>({...f,endDate:e.target.value}))} className={inp} /></F2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F2 label="Budget (₹)"><input type="number" value={form.budget} onChange={e => setForm(f=>({...f,budget:e.target.value}))} className={inp} placeholder="0" /></F2>
                <F2 label="Status">
                  <select value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))} className={inp}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
                  </select>
                </F2>
              </div>
              <F2 label="Tags (comma separated)"><input type="text" value={form.tags} onChange={e => setForm(f=>({...f,tags:e.target.value}))} className={inp} placeholder="web, react, mobile" /></F2>
            </div>
            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setCreateModal(false); setError(""); }} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {saving ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {msModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] px-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-5">Add Milestone</h3>
            <div className="space-y-4">
              <F2 label="Title *"><input type="text" value={msForm.title} onChange={e => setMsForm(f=>({...f,title:e.target.value}))} className={inp} required /></F2>
              <F2 label="Description"><textarea rows={2} value={msForm.description} onChange={e => setMsForm(f=>({...f,description:e.target.value}))} className={`${inp} resize-none`} /></F2>
              <F2 label="Due Date"><input type="date" value={msForm.dueDate} onChange={e => setMsForm(f=>({...f,dueDate:e.target.value}))} className={inp} /></F2>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMsModal(false)} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleAddMilestone} disabled={saving} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {saving ? "Adding..." : "Add Milestone"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inp = "w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] bg-white";
const Info = ({ label, children }) => (<div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>{children}</div>);
const F2   = ({ label, children }) => (<div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>{children}</div>);

export default ProjectManager;
