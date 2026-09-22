import React, { useState, useEffect } from "react";
import { UserPlus, UserMinus, Plus, X, CheckCircle2, Circle, Loader, RefreshCw, ChevronDown } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const STATUS_STYLE  = { pending:"bg-gray-100 text-gray-600", in_progress:"bg-blue-100 text-blue-700", completed:"bg-green-100 text-green-700" };
const ASSIGNED_COLORS = { HR:"bg-purple-100 text-purple-700", IT:"bg-blue-100 text-blue-700", Manager:"bg-orange-100 text-orange-700", Employee:"bg-green-100 text-green-700" };

const EMPTY_INIT = { type:"onboarding", startDate:"", targetDate:"", welcomeMessage:"", exitReason:"", exitNotes:"" };

const OnboardingManager = () => {
  const [tab, setTab]           = useState("onboarding");
  const [records, setRecords]   = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [expanded, setExpanded] = useState(null);
  const [initModal, setInitModal] = useState(false);
  const [initForm, setInitForm] = useState(EMPTY_INIT);
  const [selEmp, setSelEmp]     = useState("");
  const [saving, setSaving]     = useState(false);
  const [addItemModal, setAddItemModal] = useState(null);
  const [newItem, setNewItem]   = useState({ title:"", assignedTo:"HR", description:"" });

  const load = async () => {
    try { setLoading(true); setError("");
      const [rRes, empRes] = await Promise.all([
        axios.get(`${BASE}/hr/onboarding/type/${tab}`, auth()),
        axios.get(`${BASE}/hr/employees/getall`, auth()),
      ]);
      setRecords(rRes.data.data||[]);
      setEmployees(empRes.data.data||[]);
    } catch { setError("Failed to load records."); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab]);

  const handleInitiate = async () => {
    if (!selEmp) { setError("Select an employee."); return; }
    try { setSaving(true); setError("");
      await axios.post(`${BASE}/hr/onboarding/initiate/${selEmp}`, initForm, auth());
      setInitModal(false); setInitForm(EMPTY_INIT); setSelEmp(""); load();
    } catch (e) { setError(e.response?.data?.message || "Failed to initiate."); }
    finally { setSaving(false); }
  };

  const handleToggle = async (recordId, itemId, current) => {
    try {
      const res = await axios.patch(`${BASE}/hr/onboarding/toggle/${recordId}`, { itemId, isCompleted: !current }, auth());
      setRecords(prev => prev.map(r => r._id === recordId ? res.data.data : r));
      if (expanded === recordId) setExpanded(recordId); // keep expanded
    } catch { setError("Failed to update checklist."); }
  };

  const handleAddItem = async () => {
    if (!newItem.title) return;
    try {
      const res = await axios.post(`${BASE}/hr/onboarding/additem/${addItemModal}`, newItem, auth());
      setRecords(prev => prev.map(r => r._id === addItemModal ? res.data.data : r));
      setAddItemModal(null); setNewItem({ title:"", assignedTo:"HR", description:"" });
    } catch { setError("Failed to add item."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try { await axios.delete(`${BASE}/hr/onboarding/delete/${id}`, auth()); load(); }
    catch { setError("Failed to delete."); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserPlus size={22} className="text-[#DD1215]"/>
          <div>
            <h1 className="text-2xl font-black tracking-widest text-gray-900">ONBOARDING</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage employee onboarding and offboarding checklists</p>
          </div>
        </div>
        <button onClick={() => { setInitModal(true); setError(""); }}
          className="flex items-center gap-2 bg-[#DD1215] text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
          <Plus size={14}/> Initiate
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">

        {/* Tabs */}
        <div className="flex gap-1 bg-white border rounded-lg p-1 w-fit">
          {[{key:"onboarding",label:"🟢 Onboarding"},{key:"offboarding",label:"🔴 Offboarding"}].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setExpanded(null); }}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition rounded ${tab===t.key?"bg-[#DD1215] text-white":"text-gray-500 hover:text-gray-800"}`}>{t.label}</button>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-16"><Loader size={28} className="animate-spin text-[#DD1215]"/></div>
        ) : records.length === 0 ? (
          <div className="bg-white border rounded-lg text-center py-16 text-gray-400">
            {tab==="onboarding" ? <UserPlus size={40} className="mx-auto mb-3 opacity-30"/> : <UserMinus size={40} className="mx-auto mb-3 opacity-30"/>}
            <p className="font-semibold">No active {tab} records.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map(r => {
              const emp     = r.employeeId;
              const total   = r.checklist?.length || 0;
              const done    = r.checklist?.filter(i=>i.isCompleted).length || 0;
              const isOpen  = expanded === r._id;
              const ss      = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
              return (
                <div key={r._id} className="bg-white border rounded-lg overflow-hidden">
                  {/* Record header */}
                  <button onClick={() => setExpanded(isOpen ? null : r._id)}
                    className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition text-left">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-sm font-black shrink-0">
                      {emp?.firstName?.[0]}{emp?.lastName?.[0]}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900">{emp?.firstName} {emp?.lastName}</p>
                      <p className="text-xs text-gray-400">{emp?.designation} · {tab==="onboarding" ? `Joining: ${fmt(emp?.joiningDate)}` : `Started: ${fmt(r.startDate)}`}</p>
                    </div>
                    {/* Progress */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-gray-900">{done}/{total}</p>
                      <p className="text-[10px] text-gray-400">tasks</p>
                    </div>
                    {/* Progress bar */}
                    <div className="w-24 shrink-0">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${r.status==="completed"?"bg-green-500":"bg-[#DD1215]"}`} style={{width:`${r.progress}%`}}/>
                      </div>
                      <p className="text-[10px] text-gray-400 text-center mt-0.5">{r.progress}%</p>
                    </div>
                    {/* Status */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${ss} shrink-0`}>{r.status.replace("_"," ")}</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen?"rotate-180":""} shrink-0`}/>
                  </button>

                  {/* Checklist (expanded) */}
                  {isOpen && (
                    <div className="border-t px-5 pb-4">
                      <div className="flex items-center justify-between py-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Checklist</p>
                        <div className="flex gap-2">
                          <button onClick={() => setAddItemModal(r._id)} className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"><Plus size={11}/> Add item</button>
                          <button onClick={() => handleDelete(r._id)} className="text-xs text-red-500 hover:underline font-semibold">Delete</button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {r.checklist?.map(item => (
                          <div key={item._id}
                            onClick={() => handleToggle(r._id, item._id, item.isCompleted)}
                            className={`flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition ${item.isCompleted?"bg-green-50 hover:bg-green-100":"bg-gray-50 hover:bg-gray-100"}`}>
                            {item.isCompleted
                              ? <CheckCircle2 size={17} className="text-green-500 shrink-0 mt-0.5"/>
                              : <Circle       size={17} className="text-gray-300 shrink-0 mt-0.5"/>}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold ${item.isCompleted?"line-through text-gray-400":"text-gray-800"}`}>{item.title}</p>
                              {item.description && <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>}
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${ASSIGNED_COLORS[item.assignedTo]||"bg-gray-100 text-gray-600"}`}>
                              {item.assignedTo}
                            </span>
                          </div>
                        ))}
                      </div>
                      {r.welcomeMessage && (
                        <div className="mt-3 bg-blue-50 border border-blue-100 rounded px-3 py-2">
                          <p className="text-xs font-semibold text-blue-700">Welcome Message</p>
                          <p className="text-xs text-blue-600 mt-0.5">{r.welcomeMessage}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Initiate Modal */}
      {initModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black uppercase tracking-widest">Initiate {initForm.type === "onboarding" ? "Onboarding" : "Offboarding"}</h3>
              <button onClick={() => { setInitModal(false); setError(""); }} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <F label="Type">
                <select value={initForm.type} onChange={e => setInitForm(f=>({...f,type:e.target.value}))} className={inp}>
                  <option value="onboarding">Onboarding</option>
                  <option value="offboarding">Offboarding</option>
                </select>
              </F>
              <F label="Employee *">
                <select value={selEmp} onChange={e => setSelEmp(e.target.value)} className={inp} required>
                  <option value="">Select employee...</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName} — {e.designation}</option>)}
                </select>
              </F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Start Date">
                  <input type="date" value={initForm.startDate} onChange={e => setInitForm(f=>({...f,startDate:e.target.value}))} className={inp}/>
                </F>
                <F label="Target Date">
                  <input type="date" value={initForm.targetDate} onChange={e => setInitForm(f=>({...f,targetDate:e.target.value}))} className={inp}/>
                </F>
              </div>
              {initForm.type === "onboarding" ? (
                <F label="Welcome Message">
                  <textarea rows={3} value={initForm.welcomeMessage} onChange={e => setInitForm(f=>({...f,welcomeMessage:e.target.value}))}
                    className={`${inp} resize-none`} placeholder="Welcome aboard! We're excited to have you..." />
                </F>
              ) : (
                <>
                  <F label="Exit Reason">
                    <input type="text" value={initForm.exitReason} onChange={e => setInitForm(f=>({...f,exitReason:e.target.value}))} className={inp} placeholder="Resignation / Contract end / etc." />
                  </F>
                  <F label="Exit Notes">
                    <textarea rows={2} value={initForm.exitNotes} onChange={e => setInitForm(f=>({...f,exitNotes:e.target.value}))} className={`${inp} resize-none`} />
                  </F>
                </>
              )}
            </div>
            {error && <p className="text-red-600 text-xs mt-3">{error}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setInitModal(false); setError(""); }} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleInitiate} disabled={saving} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {saving ? "Initiating..." : `Initiate ${initForm.type}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Checklist Item Modal */}
      {addItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-5">Add Checklist Item</h3>
            <div className="space-y-4">
              <F label="Title *"><input type="text" value={newItem.title} onChange={e => setNewItem(f=>({...f,title:e.target.value}))} className={inp} placeholder="Task title..." required /></F>
              <F label="Assigned To">
                <select value={newItem.assignedTo} onChange={e => setNewItem(f=>({...f,assignedTo:e.target.value}))} className={inp}>
                  {["HR","IT","Manager","Employee"].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </F>
              <F label="Description"><input type="text" value={newItem.description} onChange={e => setNewItem(f=>({...f,description:e.target.value}))} className={inp} /></F>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setAddItemModal(null); setNewItem({title:"",assignedTo:"HR",description:""}); }} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleAddItem} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inp = "w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] bg-white";
const F   = ({ label, children }) => (<div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>{children}</div>);

export default OnboardingManager;
