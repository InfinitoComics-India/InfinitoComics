import React, { useState, useEffect } from "react";
import { Star, Plus, X, Award, Loader, Heart, RefreshCw } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const TYPE_STYLES = {
  shoutout: { bg: "bg-yellow-50",  border: "border-yellow-200", icon: "🌟", label: "Shoutout", badge: "bg-yellow-100 text-yellow-700" },
  badge:    { bg: "bg-purple-50",  border: "border-purple-200", icon: "🏅", label: "Badge",    badge: "bg-purple-100 text-purple-700" },
  award:    { bg: "bg-red-50",     border: "border-red-200",    icon: "🏆", label: "Award",    badge: "bg-red-100 text-red-700"       },
};

const BADGE_PRESETS = [
  { title: "Zero Revisions",     icon: "✨", message: "Flawless work with no revisions this period!" },
  { title: "Perfect Attendance", icon: "📅", message: "100% attendance — always showing up!" },
  { title: "High Achiever",      icon: "🚀", message: "Completed over 90% of tasks!" },
  { title: "Team Player",        icon: "🤝", message: "Outstanding collaboration with the team." },
  { title: "Fast Delivery",      icon: "⚡", message: "Consistently delivered tasks ahead of schedule." },
  { title: "Problem Solver",     icon: "🔧", message: "Identified and resolved critical blockers." },
];

const EMPTY_FORM = { recipientId:"", type:"shoutout", title:"", message:"", badge:{ icon:"🌟", color:"#DD1215" }, isPublic:true };

const RecognitionWall = () => {
  const [wall,      setWall]      = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [tab,       setTab]       = useState("wall");
  const [giveModal, setGiveModal] = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [filterType, setFilterType] = useState("all");

  const loadWall = async () => {
    try { setLoading(true); setError("");
      const [wRes, empRes] = await Promise.all([
        axios.get(`${BASE}/hr/recognition/wall`, auth()),
        axios.get(`${BASE}/hr/employees/getall`, auth()),
      ]);
      setWall(wRes.data.data||[]);
      setEmployees(empRes.data.data||[]);
    } catch { setError("Failed to load recognition wall."); } finally { setLoading(false); }
  };

  useEffect(() => { loadWall(); }, []);

  const handleGive = async () => {
    if (!form.recipientId || !form.title) { setError("Recipient and title are required."); return; }
    try { setSaving(true); setError("");
      await axios.post(`${BASE}/hr/recognition/give`, form, auth());
      setGiveModal(false); setForm(EMPTY_FORM); loadWall();
    } catch (e) { setError(e.response?.data?.message||"Failed to give recognition."); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this recognition?")) return;
    try { await axios.delete(`${BASE}/hr/recognition/delete/${id}`, auth()); loadWall(); }
    catch { setError("Failed to delete."); }
  };

  const applyPreset = (preset) => {
    setForm(f => ({ ...f, type:"badge", title: preset.title, message: preset.message, badge:{ icon: preset.icon, color:"#DD1215" } }));
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";

  const filtered = filterType === "all" ? wall : wall.filter(r => r.type === filterType);
  const counts = wall.reduce((a, r) => { a[r.type] = (a[r.type]||0)+1; return a; }, {});

  return (
    <div className="bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Star size={22} className="text-[#DD1215]"/>
          <div>
            <h1 className="text-2xl font-black tracking-widest text-gray-900">RECOGNITION</h1>
            <p className="text-xs text-gray-400 mt-0.5">Celebrate achievements and give shoutouts</p>
          </div>
        </div>
        <button onClick={() => { setGiveModal(true); setError(""); }}
          className="flex items-center gap-2 bg-[#DD1215] text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
          <Plus size={14}/> Give Recognition
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {["shoutout","badge","award"].map(t => {
            const s = TYPE_STYLES[t];
            return (
              <button key={t} onClick={() => setFilterType(filterType===t?"all":t)}
                className={`bg-white border rounded-lg px-4 py-3 text-left hover:border-[#DD1215] transition ${filterType===t?"border-[#DD1215] ring-1 ring-[#DD1215]":""}`}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <p className="text-xl font-black text-gray-900">{counts[t]||0}</p>
                <p className="text-[10px] uppercase tracking-widest text-gray-400">{s.label}s</p>
              </button>
            );
          })}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">{error}</div>}

        {/* Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-white border rounded-lg p-1">
            {[{key:"wall",label:"Recognition Wall"},{key:"badges",label:"Badges"}].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition rounded ${tab===t.key?"bg-[#DD1215] text-white":"text-gray-500 hover:text-gray-800"}`}>{t.label}</button>
            ))}
          </div>
          <button onClick={loadWall} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition"><RefreshCw size={12}/> Refresh</button>
        </div>

        {/* WALL */}
        {tab === "wall" && (
          loading ? (
            <div className="flex justify-center py-16"><Loader size={28} className="animate-spin text-[#DD1215]"/></div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border rounded-lg text-center py-16 text-gray-400">
              <Heart size={40} className="mx-auto mb-3 opacity-30"/>
              <p className="font-semibold">No recognition yet. Be the first to give a shoutout!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(r => {
                const s   = TYPE_STYLES[r.type] || TYPE_STYLES.shoutout;
                const emp = r.recipientId;
                return (
                  <div key={r._id} className={`${s.bg} border ${s.border} rounded-xl p-5`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Recipient avatar */}
                        <div className="w-10 h-10 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-sm font-black shrink-0">
                          {emp?.firstName?.[0]}{emp?.lastName?.[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg">{r.type==="badge" ? r.badge?.icon||"🏅" : s.icon}</span>
                            <p className="font-black text-gray-900">{r.title}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${s.badge}`}>{s.label}</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-700 mt-0.5">
                            {emp?.firstName} {emp?.lastName}
                            <span className="font-normal text-gray-400"> · {emp?.designation}</span>
                          </p>
                          {r.message && <p className="text-sm text-gray-600 mt-1.5 italic">"{r.message}"</p>}
                          <p className="text-[10px] text-gray-400 mt-2">
                            By {r.givenByName} · {fmt(r.createdAt)}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(r._id)} className="text-gray-400 hover:text-red-500 transition shrink-0"><X size={14}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* BADGES */}
        {tab === "badges" && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Auto-awarded badges appear here after performance generation</p>
            {wall.filter(r => r.type === "badge").length === 0 ? (
              <div className="bg-white border rounded-lg text-center py-12 text-gray-400 text-sm">
                <Award size={36} className="mx-auto mb-2 opacity-30"/> No badges awarded yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {wall.filter(r => r.type === "badge").map(r => (
                  <div key={r._id} className="bg-white border rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2">{r.badge?.icon||"🏅"}</div>
                    <p className="text-sm font-black text-gray-900">{r.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{r.recipientId?.firstName} {r.recipientId?.lastName}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{fmt(r.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Give Recognition Modal */}
      {giveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black uppercase tracking-widest">Give Recognition</h3>
              <button onClick={() => { setGiveModal(false); setError(""); }} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>

            {/* Badge presets */}
            <div className="mb-4">
              <p className="text-xs font-bold uppercase text-gray-400 mb-2">Quick Badges</p>
              <div className="flex flex-wrap gap-2">
                {BADGE_PRESETS.map(p => (
                  <button key={p.title} onClick={() => applyPreset(p)}
                    className="text-xs px-2.5 py-1.5 border border-gray-300 hover:border-[#DD1215] hover:text-[#DD1215] rounded transition font-semibold">
                    {p.icon} {p.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <F label="Recipient *">
                  <select value={form.recipientId} onChange={e => setForm(f=>({...f,recipientId:e.target.value}))} className={inp} required>
                    <option value="">Select employee</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
                  </select>
                </F>
                <F label="Type">
                  <select value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))} className={inp}>
                    <option value="shoutout">🌟 Shoutout</option>
                    <option value="badge">🏅 Badge</option>
                    <option value="award">🏆 Award</option>
                  </select>
                </F>
              </div>
              <F label="Title *"><input type="text" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} className={inp} placeholder="Great job this sprint!" required /></F>
              <F label="Message">
                <textarea rows={3} value={form.message} onChange={e => setForm(f=>({...f,message:e.target.value}))} className={`${inp} resize-none`} placeholder="Tell them why they deserve this recognition..." />
              </F>
              {form.type === "badge" && (
                <div className="grid grid-cols-2 gap-3">
                  <F label="Badge Icon (emoji)"><input type="text" value={form.badge.icon} onChange={e => setForm(f=>({...f,badge:{...f.badge,icon:e.target.value}}))} className={inp} placeholder="🏅" /></F>
                  <F label="Badge Color"><input type="color" value={form.badge.color} onChange={e => setForm(f=>({...f,badge:{...f.badge,color:e.target.value}}))} className={`${inp} h-10 cursor-pointer`} /></F>
                </div>
              )}
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.isPublic} onChange={e => setForm(f=>({...f,isPublic:e.target.checked}))} className="w-4 h-4 accent-[#DD1215]"/>
                Show on recognition wall
              </label>
            </div>
            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setGiveModal(false); setError(""); }} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleGive} disabled={saving} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {saving ? "Sending..." : "Give Recognition"}
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

export default RecognitionWall;
