import React, { useState, useEffect } from "react";
import { Target, Plus, X, CheckCircle, AlertCircle, Clock, Loader, RefreshCw } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const CATEGORIES = ["productivity","quality","learning","collaboration","leadership","other"];
const PERIODS    = ["monthly","quarterly","yearly"];
const STATUS_STYLE = { active:"bg-blue-100 text-blue-700", completed:"bg-green-100 text-green-700", missed:"bg-red-100 text-red-700", cancelled:"bg-gray-100 text-gray-500" };
const CAT_COLORS   = { productivity:"bg-blue-50 text-blue-700", quality:"bg-green-50 text-green-700", learning:"bg-purple-50 text-purple-700", collaboration:"bg-cyan-50 text-cyan-700", leadership:"bg-orange-50 text-orange-700", other:"bg-gray-50 text-gray-600" };

const EMPTY = { employeeId:"", title:"", description:"", category:"productivity", targetValue:"", unit:"tasks", weight:1, period:"monthly", deadline:"", notes:"" };

const GoalTracker = () => {
  const [employees, setEmployees] = useState([]);
  const [selEmp,    setSelEmp]    = useState("");
  const [goals,     setGoals]     = useState([]);
  const [summary,   setSummary]   = useState([]);
  const [overdue,   setOverdue]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [tab,       setTab]       = useState("my");
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [progressModal, setProgressModal] = useState(null);
  const [newProgress, setNewProgress] = useState("");

  useEffect(() => {
    axios.get(`${BASE}/hr/employees/getall`, auth()).then(r => setEmployees(r.data.data||[])).catch(()=>{});
    loadOverdue();
  },[]);

  useEffect(() => { if (selEmp) loadGoals(); }, [selEmp]);

  const loadGoals = async () => {
    try { setLoading(true); setError("");
      const [gRes, sRes] = await Promise.all([
        axios.get(`${BASE}/hr/goals/employee/${selEmp}`, auth()),
        axios.get(`${BASE}/hr/goals/summary/${selEmp}`, auth()),
      ]);
      setGoals(gRes.data.data||[]); setSummary(sRes.data.data||[]);
    } catch { setError("Failed to load goals."); } finally { setLoading(false); }
  };

  const loadOverdue = async () => {
    try { const r = await axios.get(`${BASE}/hr/goals/overdue`, auth()); setOverdue(r.data.data||[]); } catch {}
  };

  const handleCreate = async () => {
    if (!form.employeeId || !form.title || !form.targetValue || !form.deadline) { setError("Employee, title, target, and deadline are required."); return; }
    try { setSaving(true); setError("");
      await axios.post(`${BASE}/hr/goals/create`, { ...form, targetValue: parseFloat(form.targetValue), weight: parseInt(form.weight) }, auth());
      setCreateModal(false); setForm(EMPTY);
      if (form.employeeId === selEmp) loadGoals();
    } catch (e) { setError(e.response?.data?.message||"Failed to create goal."); } finally { setSaving(false); }
  };

  const handleUpdateProgress = async () => {
    if (!progressModal || newProgress === "") return;
    try {
      await axios.patch(`${BASE}/hr/goals/progress/${progressModal._id}`, { currentValue: parseFloat(newProgress) }, auth());
      setProgressModal(null); setNewProgress(""); loadGoals();
    } catch (e) { setError(e.response?.data?.message||"Failed to update progress."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this goal?")) return;
    try { await axios.delete(`${BASE}/hr/goals/delete/${id}`, auth()); loadGoals(); }
    catch { setError("Failed to delete goal."); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
  const pct  = (g) => g.targetValue > 0 ? Math.min(100, Math.round((g.currentValue/g.targetValue)*100)) : 0;
  const summaryMap = {};
  summary.forEach(s => { summaryMap[s._id] = s.count; });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target size={22} className="text-[#DD1215]"/>
          <div>
            <h1 className="text-2xl font-black tracking-widest text-gray-900">GOALS</h1>
            <p className="text-xs text-gray-400 mt-0.5">Set and track employee targets</p>
          </div>
        </div>
        <button onClick={() => { setCreateModal(true); setError(""); }}
          className="flex items-center gap-2 bg-[#DD1215] text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
          <Plus size={14}/> Set Goal
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Tabs */}
        <div className="flex gap-1 bg-white border rounded-lg p-1 w-fit">
          {[{key:"my",label:"By Employee"},{key:"overdue",label:`Overdue (${overdue.length})`}].map(t => (
            <button key={t.key} onClick={()=>{setTab(t.key);setError("");}}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition rounded ${tab===t.key?"bg-[#DD1215] text-white":"text-gray-500 hover:text-gray-800"}`}>{t.label}</button>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">{error}</div>}

        {/* BY EMPLOYEE */}
        {tab === "my" && (
          <>
            <div className="bg-white border rounded-lg px-5 py-4 flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                <label className="text-xs font-semibold text-gray-500 uppercase">Employee</label>
                <select value={selEmp} onChange={e => setSelEmp(e.target.value)} className={inp}>
                  <option value="">Select employee...</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </div>
              {selEmp && <button onClick={loadGoals} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 border border-gray-300 px-3 py-2 transition"><RefreshCw size={12}/></button>}
            </div>

            {selEmp && (
              <>
                {/* Summary badges */}
                {summary.length > 0 && (
                  <div className="flex gap-3 flex-wrap">
                    {Object.entries(summaryMap).map(([status, count]) => (
                      <div key={status} className={`px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_STYLE[status]||"bg-gray-100 text-gray-600"}`}>
                        {status}: {count}
                      </div>
                    ))}
                  </div>
                )}

                {loading ? (
                  <div className="flex justify-center py-12"><Loader size={24} className="animate-spin text-[#DD1215]"/></div>
                ) : goals.length === 0 ? (
                  <div className="bg-white border rounded-lg text-center py-16 text-gray-400">
                    <Target size={36} className="mx-auto mb-3 opacity-30"/>
                    <p className="font-semibold">No goals set for this employee.</p>
                    <button onClick={() => { setForm(f=>({...f,employeeId:selEmp})); setCreateModal(true); }} className="mt-3 text-xs text-[#DD1215] font-bold hover:underline">Set their first goal →</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {goals.map(g => {
                      const p = pct(g);
                      const isOverdueGoal = g.status === "active" && new Date(g.deadline) < new Date();
                      return (
                        <div key={g._id} className={`bg-white border rounded-lg p-5 ${isOverdueGoal?"border-l-4 border-l-red-500":""}`}>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${CAT_COLORS[g.category]}`}>{g.category}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${STATUS_STYLE[g.status]}`}>{g.status}</span>
                                {isOverdueGoal && <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5"><AlertCircle size={10}/> Overdue</span>}
                              </div>
                              <h3 className="font-semibold text-gray-900">{g.title}</h3>
                              {g.description && <p className="text-xs text-gray-500 mt-0.5">{g.description}</p>}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {g.status === "active" && (
                                <button onClick={() => { setProgressModal(g); setNewProgress(String(g.currentValue)); }}
                                  className="text-xs text-blue-600 hover:underline font-semibold">Update</button>
                              )}
                              <button onClick={() => handleDelete(g._id)} className="text-gray-400 hover:text-red-500 transition"><X size={14}/></button>
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500">{g.currentValue} / {g.targetValue} {g.unit}</span>
                              <span className="text-xs font-bold text-gray-700">{p}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className={`h-2 rounded-full transition-all ${g.status==="completed"?"bg-green-500":isOverdueGoal?"bg-red-500":"bg-[#DD1215]"}`} style={{width:`${p}%`}}/>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-[10px] text-gray-400">
                            <span className="flex items-center gap-1"><Clock size={9}/> Deadline: {fmt(g.deadline)}</span>
                            <span>Weight: {g.weight}/5</span>
                            <span className="capitalize">{g.period}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* OVERDUE */}
        {tab === "overdue" && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b"><p className="text-xs font-bold uppercase tracking-widest text-gray-500">Overdue Goals</p></div>
            {overdue.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm"><CheckCircle size={36} className="mx-auto mb-2 opacity-30"/> No overdue goals!</div>
            ) : (
              <div className="divide-y">
                {overdue.map(g => (
                  <div key={g._id} className="px-6 py-4 flex items-center gap-4">
                    <AlertCircle size={18} className="text-red-500 shrink-0"/>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{g.title}</p>
                      <p className="text-xs text-gray-500">{g.employeeId?.firstName} {g.employeeId?.lastName} · {g.currentValue}/{g.targetValue} {g.unit}</p>
                    </div>
                    <span className="text-xs text-red-600 font-semibold whitespace-nowrap">{fmt(g.deadline)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black uppercase tracking-widest">Set Goal</h3>
              <button onClick={() => { setCreateModal(false); setError(""); }} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <F label="Employee *">
                <select value={form.employeeId} onChange={e => setForm(f=>({...f,employeeId:e.target.value}))} className={inp} required>
                  <option value="">Select...</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </F>
              <F label="Goal Title *"><input type="text" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} className={inp} placeholder="Complete 30 tasks this quarter" required /></F>
              <F label="Description"><textarea rows={2} value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} className={`${inp} resize-none`} /></F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Category">
                  <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} className={inp}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </F>
                <F label="Period">
                  <select value={form.period} onChange={e => setForm(f=>({...f,period:e.target.value}))} className={inp}>
                    {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </F>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <F label="Target *"><input type="number" value={form.targetValue} onChange={e => setForm(f=>({...f,targetValue:e.target.value}))} className={inp} placeholder="30" required /></F>
                <F label="Unit"><input type="text" value={form.unit} onChange={e => setForm(f=>({...f,unit:e.target.value}))} className={inp} placeholder="tasks" /></F>
                <F label="Weight (1-5)"><input type="number" min={1} max={5} value={form.weight} onChange={e => setForm(f=>({...f,weight:e.target.value}))} className={inp} /></F>
              </div>
              <F label="Deadline *"><input type="date" value={form.deadline} onChange={e => setForm(f=>({...f,deadline:e.target.value}))} className={inp} required /></F>
              <F label="Notes"><input type="text" value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} className={inp} /></F>
            </div>
            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setCreateModal(false); setError(""); }} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {saving ? "Saving..." : "Set Goal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Progress Modal */}
      {progressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-2">Update Progress</h3>
            <p className="text-sm text-gray-500 mb-5">{progressModal.title} — Target: {progressModal.targetValue} {progressModal.unit}</p>
            <F label={`Current Value (${progressModal.unit})`}>
              <input type="number" value={newProgress} onChange={e => setNewProgress(e.target.value)} className={inp} placeholder={String(progressModal.currentValue)} />
            </F>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setProgressModal(null); setNewProgress(""); }} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleUpdateProgress} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inp = "w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] bg-white";
const F   = ({ label, children }) => (<div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>{children}</div>);

export default GoalTracker;
