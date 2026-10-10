import React, { useState, useEffect } from "react";
import { Users, Plus, X, ChevronRight, Loader, Star, Calendar, Briefcase, RefreshCw, Mail, Phone } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const STAGES = [
  { key: "applied",              label: "Applied",              color: "bg-gray-200",   header: "bg-gray-300"   },
  { key: "screening",            label: "Screening",            color: "bg-blue-50",    header: "bg-blue-200"   },
  { key: "interview_scheduled",  label: "Interview Scheduled",  color: "bg-yellow-50",  header: "bg-yellow-200" },
  { key: "interview_done",       label: "Interview Done",       color: "bg-purple-50",  header: "bg-purple-200" },
  { key: "offer_sent",           label: "Offer Sent",           color: "bg-orange-50",  header: "bg-orange-200" },
  { key: "hired",                label: "Hired ✅",             color: "bg-green-50",   header: "bg-green-200"  },
  { key: "rejected",             label: "Rejected",             color: "bg-red-50",     header: "bg-red-200"    },
];

const SOURCE_COLORS = { website:"bg-blue-100 text-blue-700", linkedin:"bg-indigo-100 text-indigo-700", referral:"bg-green-100 text-green-700", naukri:"bg-orange-100 text-orange-700", internshala:"bg-pink-100 text-pink-700", other:"bg-gray-100 text-gray-600" };

const INTERVIEW_TYPES = ["phone","video","technical","hr","final"];
const EMPTY_INTERVIEW = { round:1, type:"phone", scheduledAt:"", conductedBy:"", notes:"" };
const EMPTY_FORM = { candidateName:"", candidateEmail:"", candidatePhone:"", jobTitle:"", jobType:"", source:"website", resumeUrl:"", internalNotes:"" };

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";

const RecruitmentPipeline = () => {
  const [board,    setBoard]    = useState({});
  const [stats,    setStats]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [detail,   setDetail]   = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [movingId, setMovingId] = useState(null);
  const [intModal, setIntModal] = useState(null); // pipeline id
  const [intForm,  setIntForm]  = useState(EMPTY_INTERVIEW);
  const [tab,      setTab]      = useState("kanban");

  const load = async () => {
    try { setLoading(true); setError("");
      const [bRes, sRes] = await Promise.all([
        axios.get(`${BASE}/hr/recruitment/kanban`, auth()),
        axios.get(`${BASE}/hr/recruitment/stats`, auth()),
      ]);
      setBoard(bRes.data.data || {});
      setStats(sRes.data.data || []);
    } catch { setError("Failed to load pipeline."); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.candidateName || !form.candidateEmail || !form.jobTitle) { setError("Name, email and job title required."); return; }
    try { setSaving(true); setError("");
      // applicationId is required by model — we'll use a generated placeholder for manually added entries
      const payload = { ...form, applicationId: `manual-${Date.now()}` };
      await axios.post(`${BASE}/hr/recruitment/add`, payload, auth());
      setAddModal(false); setForm(EMPTY_FORM); load();
    } catch (e) { setError(e.response?.data?.message || "Failed to add."); } finally { setSaving(false); }
  };

  const handleMove = async (id, stage) => {
    try { setMovingId(id);
      await axios.patch(`${BASE}/hr/recruitment/stage/${id}`, { stage }, auth());
      load(); if (detail?._id === id) setDetail(d => ({...d, stage}));
    } catch (e) { setError(e.response?.data?.message || "Failed to move."); } finally { setMovingId(null); }
  };

  const handleAddInterview = async () => {
    if (!intModal || !intForm.type) return;
    try { setSaving(true);
      const res = await axios.post(`${BASE}/hr/recruitment/interview/${intModal}`, intForm, auth());
      setIntModal(null); setIntForm(EMPTY_INTERVIEW); load();
      if (detail?._id === intModal) setDetail(res.data.data);
    } catch (e) { setError(e.response?.data?.message || "Failed to add interview."); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this candidate from the pipeline?")) return;
    try { await axios.delete(`${BASE}/hr/recruitment/delete/${id}`, auth()); setDetail(null); load(); }
    catch { setError("Failed to delete."); }
  };

  const statsMap = {};
  stats.forEach(s => { statsMap[s._id] = s.count; });
  const totalCandidates = Object.values(statsMap).reduce((s,v)=>s+v,0);

  return (
    <div className="bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={22} className="text-[#DD1215]" />
          <div>
            <h1 className="text-2xl font-black tracking-widest text-gray-900">RECRUITMENT</h1>
            <p className="text-xs text-gray-400 mt-0.5">{totalCandidates} total candidates in pipeline</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="border border-gray-300 p-2 hover:bg-gray-50 transition"><RefreshCw size={14}/></button>
          <button onClick={() => { setAddModal(true); setError(""); }}
            className="flex items-center gap-2 bg-[#DD1215] text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
            <Plus size={14}/> Add Candidate
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {STAGES.map(s => (
            <div key={s.key} className={`rounded-lg px-3 py-2 text-center ${s.color}`}>
              <p className="text-xl font-black text-gray-900">{statsMap[s.key]||0}</p>
              <p className="text-[9px] uppercase tracking-wider text-gray-500 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">{error}</div>}

        {/* Kanban Board */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader size={28} className="animate-spin text-[#DD1215]"/></div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-4">
            {STAGES.map(stage => {
              const cards = board[stage.key] || [];
              return (
                <div key={stage.key} className="flex-shrink-0 w-64">
                  <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg ${stage.header}`}>
                    <span className="text-xs font-black uppercase tracking-widest text-gray-700">{stage.label}</span>
                    <span className="text-xs font-bold bg-white/60 rounded-full px-2 py-0.5">{cards.length}</span>
                  </div>
                  <div className={`min-h-[200px] rounded-b-lg p-2 space-y-2 ${stage.color}`}>
                    {cards.map(c => (
                      <div key={c._id} onClick={() => setDetail(c)}
                        className="bg-white rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition">
                        <p className="text-sm font-bold text-gray-900 truncate">{c.candidateName}</p>
                        <p className="text-xs text-gray-500 truncate">{c.jobTitle}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold capitalize ${SOURCE_COLORS[c.source]||"bg-gray-100 text-gray-600"}`}>{c.source}</span>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            {c.overallRating && <><Star size={9} className="text-yellow-400"/> {c.overallRating}</>}
                            {c.interviews?.length > 0 && <span>· {c.interviews.length} int.</span>}
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">{fmt(c.createdAt)}</p>
                      </div>
                    ))}
                    {cards.length === 0 && (
                      <div className="flex items-center justify-center py-8 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Empty</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Candidate Detail Panel */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden">
            <div className="bg-gray-900 text-white px-6 py-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black">{detail.candidateName}</h3>
                <p className="text-xs text-gray-300">{detail.jobTitle} · {detail.jobType}</p>
                <span className={`mt-1 inline-block text-[10px] px-2 py-0.5 rounded font-bold ${SOURCE_COLORS[detail.source]}`}>{detail.source}</span>
              </div>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">

              {/* Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-700"><Mail size={14} className="text-gray-400"/> {detail.candidateEmail}</div>
                {detail.candidatePhone && <div className="flex items-center gap-2 text-sm text-gray-700"><Phone size={14} className="text-gray-400"/> {detail.candidatePhone}</div>}
              </div>

              {/* Move stage */}
              <div>
                <p className="text-xs font-bold uppercase text-gray-400 mb-2">Move to Stage</p>
                <div className="flex flex-wrap gap-2">
                  {STAGES.filter(s => s.key !== detail.stage).map(s => (
                    <button key={s.key} onClick={() => { handleMove(detail._id, s.key); setDetail(d=>({...d,stage:s.key})); }} disabled={movingId===detail._id}
                      className="text-xs px-3 py-1.5 border border-gray-300 hover:border-[#DD1215] hover:text-[#DD1215] font-semibold capitalize transition rounded">
                      → {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interviews */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase text-gray-400">Interviews ({detail.interviews?.length || 0})</p>
                  <button onClick={() => { setIntModal(detail._id); setIntForm({ ...EMPTY_INTERVIEW, round: (detail.interviews?.length||0)+1 }); }}
                    className="text-xs text-[#DD1215] font-bold hover:underline flex items-center gap-1"><Plus size={11}/> Schedule</button>
                </div>
                {(detail.interviews||[]).length === 0 ? (
                  <p className="text-xs text-gray-400">No interviews scheduled yet.</p>
                ) : (
                  <div className="space-y-2">
                    {detail.interviews.map((iv, i) => (
                      <div key={i} className="bg-gray-50 border rounded-lg px-4 py-2 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-xs font-bold">{iv.round}</div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold capitalize text-gray-800">{iv.type} Interview</p>
                          {iv.scheduledAt && <p className="text-[10px] text-gray-400">{fmt(iv.scheduledAt)} · {iv.conductedBy||"TBD"}</p>}
                          {iv.feedback && <p className="text-xs text-gray-500 italic mt-0.5">"{iv.feedback}"</p>}
                        </div>
                        {iv.rating && <div className="flex items-center gap-0.5 text-xs"><Star size={11} className="text-yellow-400"/> {iv.rating}</div>}
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold capitalize ${iv.result==="passed"?"bg-green-100 text-green-700":iv.result==="failed"?"bg-red-100 text-red-700":"bg-gray-100 text-gray-600"}`}>{iv.result}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes + Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400 mb-1">Overall Rating</p>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={async () => {
                        await axios.put(`${BASE}/hr/recruitment/update/${detail._id}`,{overallRating:n},auth());
                        setDetail(d=>({...d,overallRating:n}));
                      }}>
                        <Star size={20} className={n<=(detail.overallRating||0)?"text-yellow-400 fill-yellow-400":"text-gray-300"}/>
                      </button>
                    ))}
                  </div>
                </div>
                {detail.resumeUrl && (
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400 mb-1">Resume</p>
                    <a href={detail.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline font-semibold">Open Resume →</a>
                  </div>
                )}
              </div>
              {detail.internalNotes && (
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400 mb-1">Internal Notes</p>
                  <p className="text-sm text-gray-700 bg-yellow-50 border border-yellow-100 rounded px-3 py-2">{detail.internalNotes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t">
                <button onClick={() => handleDelete(detail._id)} className="text-xs text-red-500 hover:underline font-semibold">Remove from Pipeline</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Candidate Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black uppercase tracking-widest">Add Candidate</h3>
              <button onClick={() => { setAddModal(false); setError(""); }} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <F label="Full Name *"><input type="text" value={form.candidateName} onChange={e=>setForm(f=>({...f,candidateName:e.target.value}))} className={inp} required /></F>
                <F label="Email *"><input type="email" value={form.candidateEmail} onChange={e=>setForm(f=>({...f,candidateEmail:e.target.value}))} className={inp} required /></F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label="Phone"><input type="tel" value={form.candidatePhone} onChange={e=>setForm(f=>({...f,candidatePhone:e.target.value}))} className={inp} /></F>
                <F label="Source">
                  <select value={form.source} onChange={e=>setForm(f=>({...f,source:e.target.value}))} className={inp}>
                    {["website","linkedin","referral","naukri","internshala","other"].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label="Job Title *"><input type="text" value={form.jobTitle} onChange={e=>setForm(f=>({...f,jobTitle:e.target.value}))} className={inp} required /></F>
                <F label="Job Type"><input type="text" value={form.jobType} onChange={e=>setForm(f=>({...f,jobType:e.target.value}))} className={inp} placeholder="Full-time / Intern" /></F>
              </div>
              <F label="Resume URL"><input type="url" value={form.resumeUrl} onChange={e=>setForm(f=>({...f,resumeUrl:e.target.value}))} className={inp} placeholder="https://..." /></F>
              <F label="Internal Notes"><textarea rows={2} value={form.internalNotes} onChange={e=>setForm(f=>({...f,internalNotes:e.target.value}))} className={`${inp} resize-none`} /></F>
            </div>
            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setAddModal(false); setError(""); }} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {saving ? "Adding..." : "Add to Pipeline"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {intModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-5">Schedule Interview</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <F label="Round"><input type="number" min={1} value={intForm.round} onChange={e=>setIntForm(f=>({...f,round:parseInt(e.target.value)}))} className={inp}/></F>
                <F label="Type">
                  <select value={intForm.type} onChange={e=>setIntForm(f=>({...f,type:e.target.value}))} className={inp}>
                    {INTERVIEW_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </F>
              </div>
              <F label="Scheduled At"><input type="datetime-local" value={intForm.scheduledAt} onChange={e=>setIntForm(f=>({...f,scheduledAt:e.target.value}))} className={inp}/></F>
              <F label="Conducted By"><input type="text" value={intForm.conductedBy} onChange={e=>setIntForm(f=>({...f,conductedBy:e.target.value}))} className={inp} placeholder="Interviewer name" /></F>
              <F label="Notes"><textarea rows={2} value={intForm.notes} onChange={e=>setIntForm(f=>({...f,notes:e.target.value}))} className={`${inp} resize-none`}/></F>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setIntModal(null)} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleAddInterview} disabled={saving} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {saving ? "Saving..." : "Schedule"}
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

export default RecruitmentPipeline;
