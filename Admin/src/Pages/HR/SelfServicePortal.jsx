import React, { useState, useEffect } from "react";
import { Headphones, Plus, X, CheckCircle, Clock, AlertCircle, Loader, RefreshCw, MessageSquare, Send } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const REQUEST_TYPES = ["leave_application","document_request","address_update","bank_update","profile_update","attendance_correction","salary_query","other"];
const PRIORITIES    = ["low","medium","high"];

const STATUS_STYLE = {
  open:        { bg:"bg-blue-100",   text:"text-blue-700",   icon: Clock,         label:"Open"        },
  in_progress: { bg:"bg-yellow-100", text:"text-yellow-700", icon: Clock,         label:"In Progress" },
  resolved:    { bg:"bg-green-100",  text:"text-green-700",  icon: CheckCircle,   label:"Resolved"    },
  closed:      { bg:"bg-gray-100",   text:"text-gray-500",   icon: CheckCircle,   label:"Closed"      },
};
const PRIORITY_STYLE = { low:"bg-gray-100 text-gray-600", medium:"bg-yellow-100 text-yellow-700", high:"bg-red-100 text-red-700" };

const EMPTY_FORM = { employeeId:"", type:"document_request", subject:"", description:"", priority:"medium" };

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";

const SelfServicePortal = () => {
  const [tab,       setTab]       = useState("all");
  const [requests,  setRequests]  = useState([]);
  const [stats,     setStats]     = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [detail,    setDetail]    = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [comment,   setComment]   = useState("");
  const [resolution, setResolution] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    try { setLoading(true); setError("");
      const [rRes, sRes, empRes] = await Promise.all([
        axios.get(`${BASE}/hr/self-service/all`, { ...auth(), params: statusFilter !== "all" ? { status: statusFilter } : {} }),
        axios.get(`${BASE}/hr/self-service/stats`, auth()),
        axios.get(`${BASE}/hr/employees/getall`, auth()),
      ]);
      setRequests(rRes.data.data || []);
      setStats(sRes.data.data || []);
      setEmployees(empRes.data.data || []);
    } catch { setError("Failed to load."); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleSubmit = async () => {
    if (!form.employeeId || !form.subject) { setError("Employee and subject are required."); return; }
    try { setSaving(true); setError("");
      await axios.post(`${BASE}/hr/self-service/submit`, form, auth());
      setCreateModal(false); setForm(EMPTY_FORM); load();
    } catch (e) { setError(e.response?.data?.message || "Failed to submit."); } finally { setSaving(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(`${BASE}/hr/self-service/status/${id}`, { status }, auth());
      setRequests(prev => prev.map(r => r._id === id ? {...r, status} : r));
      if (detail?._id === id) setDetail(d => ({...d, status}));
    } catch { setError("Failed to update."); }
  };

  const handleResolve = async () => {
    if (!resolution.trim() || !detail) return;
    try { setSaving(true);
      const res = await axios.patch(`${BASE}/hr/self-service/resolve/${detail._id}`, { resolution }, auth());
      setDetail(res.data.data); setResolution("");
      load();
    } catch (e) { setError(e.response?.data?.message || "Failed to resolve."); } finally { setSaving(false); }
  };

  const handleComment = async () => {
    if (!comment.trim() || !detail) return;
    try {
      const res = await axios.post(`${BASE}/hr/self-service/comment/${detail._id}`, { content: comment }, auth());
      setDetail(res.data.data); setComment("");
    } catch { setError("Failed to add comment."); }
  };

  const statsMap = {};
  stats.forEach(s => { statsMap[s._id] = s.count; });
  const totalOpen = (statsMap.open||0) + (statsMap.in_progress||0);

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Headphones size={22} className="text-[#DD1215]"/>
          <div>
            <h1 className="text-2xl font-black tracking-widest text-gray-900">SELF SERVICE</h1>
            <p className="text-xs text-gray-400 mt-0.5">{totalOpen} open requests</p>
          </div>
        </div>
        <button onClick={() => { setCreateModal(true); setError(""); }}
          className="flex items-center gap-2 bg-[#DD1215] text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
          <Plus size={14}/> New Request
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["open","in_progress","resolved","closed"].map(s => {
            const ss = STATUS_STYLE[s];
            const SI = ss.icon;
            return (
              <button key={s} onClick={() => setStatusFilter(statusFilter===s?"all":s)}
                className={`bg-white border rounded-lg px-4 py-3 text-left hover:border-[#DD1215] transition ${statusFilter===s?"border-[#DD1215] ring-1 ring-[#DD1215]":""}`}>
                <div className="flex items-center gap-2 mb-1">
                  <SI size={14} className={ss.text}/>
                  <span className={`text-[10px] font-bold uppercase ${ss.text}`}>{ss.label}</span>
                </div>
                <p className="text-2xl font-black text-gray-900">{statsMap[s]||0}</p>
              </button>
            );
          })}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">{error}</div>}

        {/* Requests list */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              {statusFilter === "all" ? "All Requests" : STATUS_STYLE[statusFilter]?.label} ({requests.length})
            </p>
            <button onClick={load} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition"><RefreshCw size={12}/></button>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><Loader size={24} className="animate-spin text-[#DD1215]"/></div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Headphones size={36} className="mx-auto mb-3 opacity-30"/>
              <p className="font-semibold">No requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>{["Employee","Type","Subject","Priority","Status","Submitted","Actions"].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requests.map(req => {
                    const emp = req.employeeId;
                    const ss  = STATUS_STYLE[req.status] || STATUS_STYLE.open;
                    const SI  = ss.icon;
                    return (
                      <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          {emp ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-[10px] font-bold">{emp.firstName?.[0]}{emp.lastName?.[0]}</div>
                              <span className="text-xs font-semibold text-gray-900 whitespace-nowrap">{emp.firstName} {emp.lastName}</span>
                            </div>
                          ) : <span className="text-xs text-gray-500">{req.employeeName||"—"}</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap capitalize">{req.type.replace(/_/g," ")}</td>
                        <td className="px-4 py-3 text-xs text-gray-800 max-w-[200px] truncate font-semibold">{req.subject}</td>
                        <td className="px-4 py-3 whitespace-nowrap"><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${PRIORITY_STYLE[req.priority]}`}>{req.priority}</span></td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select value={req.status} onChange={e => handleStatusChange(req._id, e.target.value)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border-0 cursor-pointer ${ss.bg} ${ss.text}`}>
                            {["open","in_progress","resolved","closed"].map(s=><option key={s} value={s}>{STATUS_STYLE[s].label}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmt(req.createdAt)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button onClick={() => { setDetail(req); setResolution(""); setComment(""); }} className="text-xs text-blue-600 hover:underline font-semibold">View</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Request Detail Panel */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden">
            <div className="bg-gray-900 text-white px-6 py-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${STATUS_STYLE[detail.status]?.bg} ${STATUS_STYLE[detail.status]?.text}`}>{STATUS_STYLE[detail.status]?.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${PRIORITY_STYLE[detail.priority]}`}>{detail.priority}</span>
                </div>
                <h3 className="text-lg font-black">{detail.subject}</h3>
                <p className="text-xs text-gray-300">{(detail.type||"").replace(/_/g," ")} · {detail.employeeName || `${detail.employeeId?.firstName} ${detail.employeeId?.lastName}`}</p>
              </div>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
              {/* Description */}
              {detail.description && (
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded px-4 py-3">{detail.description}</p>
                </div>
              )}

              {/* Resolution (if resolved) */}
              {detail.resolution && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <p className="text-xs font-bold text-green-700 mb-1">Resolution</p>
                  <p className="text-sm text-green-800">{detail.resolution}</p>
                </div>
              )}

              {/* Add resolution */}
              {!detail.resolution && detail.status !== "closed" && (
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400 mb-2">Resolve Request</p>
                  <textarea rows={3} value={resolution} onChange={e=>setResolution(e.target.value)}
                    className={`${inp} resize-none`} placeholder="Describe how this was resolved..." />
                  <button onClick={handleResolve} disabled={saving||!resolution.trim()}
                    className="mt-2 bg-green-600 text-white px-5 py-2 text-xs font-bold uppercase hover:bg-green-700 transition disabled:opacity-50 rounded">
                    {saving ? "Resolving..." : "Mark Resolved"}
                  </button>
                </div>
              )}

              {/* Comments */}
              <div>
                <p className="text-xs font-bold uppercase text-gray-400 mb-2">Comments ({detail.comments?.length || 0})</p>
                <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                  {(detail.comments || []).map((c, i) => (
                    <div key={i} className="bg-gray-50 border rounded px-3 py-2">
                      <p className="text-xs font-semibold text-gray-700">{c.authorName} · {fmt(c.createdAt)}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{c.content}</p>
                    </div>
                  ))}
                  {(detail.comments||[]).length === 0 && <p className="text-xs text-gray-400">No comments yet.</p>}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={comment} onChange={e=>setComment(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleComment()}
                    className="flex-1 border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[#DD1215]"
                    placeholder="Add a comment or note..." />
                  <button onClick={handleComment} disabled={!comment.trim()} className="bg-gray-900 text-white px-3 py-2 text-xs hover:bg-black transition disabled:opacity-40 rounded">
                    <Send size={12}/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Request Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black uppercase tracking-widest">New Request</h3>
              <button onClick={() => { setCreateModal(false); setError(""); }} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <F label="Employee *">
                <select value={form.employeeId} onChange={e=>setForm(f=>({...f,employeeId:e.target.value}))} className={inp} required>
                  <option value="">Select employee...</option>
                  {employees.map(e=><option key={e._id} value={e._id}>{e.firstName} {e.lastName} — {e.designation}</option>)}
                </select>
              </F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Request Type">
                  <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} className={inp}>
                    {REQUEST_TYPES.map(t=><option key={t} value={t}>{t.replace(/_/g," ")}</option>)}
                  </select>
                </F>
                <F label="Priority">
                  <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))} className={inp}>
                    {PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </F>
              </div>
              <F label="Subject *"><input type="text" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} className={inp} required /></F>
              <F label="Description">
                <textarea rows={4} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} className={`${inp} resize-none`} placeholder="Describe the request in detail..." />
              </F>
            </div>
            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setCreateModal(false); setError(""); }} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSubmit} disabled={saving} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {saving ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inp = "w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] bg-white";
const F   = ({ label, children }) => (<div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>{children}</div>);

export default SelfServicePortal;
