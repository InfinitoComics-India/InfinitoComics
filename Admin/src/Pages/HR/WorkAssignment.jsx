import React, { useState, useEffect } from "react";
import { Users, Plus, X, AlertTriangle, Loader, RefreshCw } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const ROLES = ["contributor","lead","reviewer","observer"];
const STATUS_STYLE = { active: "bg-green-100 text-green-700", completed: "bg-gray-100 text-gray-500", paused: "bg-yellow-100 text-yellow-700", cancelled: "bg-red-100 text-red-600" };

const WorkAssignment = () => {
  const [employees, setEmployees]   = useState([]);
  const [projects, setProjects]     = useState([]);
  const [workload, setWorkload]     = useState([]);
  const [selEmp, setSelEmp]         = useState("");
  const [empAssignments, setEmpAssignments] = useState([]);
  const [tab, setTab]               = useState("workload");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [assignModal, setAssignModal] = useState(false);
  const [form, setForm]             = useState({ employeeId:"", projectId:"", role:"contributor", startDate:"", endDate:"", hoursPerWeek:40, allocatedPercent:100, note:"" });
  const [saving, setSaving]         = useState(false);

  const loadWorkload = async () => {
    try { setLoading(true);
      const [wRes, empRes, projRes] = await Promise.all([
        axios.get(`${BASE}/hr/assignments/workload`, auth()),
        axios.get(`${BASE}/hr/employees/getall`, auth()),
        axios.get(`${BASE}/hr/projects/getall`, auth()),
      ]);
      setWorkload(wRes.data.data || []);
      setEmployees(empRes.data.data || []);
      setProjects(projRes.data.data || []);
    } catch { setError("Failed to load workload data."); } finally { setLoading(false); }
  };

  const loadEmpAssignments = async () => {
    if (!selEmp) return;
    try { setLoading(true);
      const res = await axios.get(`${BASE}/hr/assignments/employee/${selEmp}`, auth());
      setEmpAssignments(res.data.data || []);
    } catch { setError("Failed to load assignments."); } finally { setLoading(false); }
  };

  useEffect(() => { loadWorkload(); }, []);
  useEffect(() => { if (tab === "employee" && selEmp) loadEmpAssignments(); }, [selEmp, tab]);

  const handleAssign = async () => {
    if (!form.employeeId || !form.projectId || !form.startDate) { setError("Employee, project, and start date are required."); return; }
    try { setSaving(true); setError("");
      await axios.post(`${BASE}/hr/assignments/assign`, form, auth());
      setAssignModal(false); setForm({ employeeId:"", projectId:"", role:"contributor", startDate:"", endDate:"", hoursPerWeek:40, allocatedPercent:100, note:"" });
      loadWorkload(); if (selEmp) loadEmpAssignments();
    } catch (e) { setError(e.response?.data?.message || "Failed to assign."); } finally { setSaving(false); }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this assignment?")) return;
    try {
      await axios.delete(`${BASE}/hr/assignments/remove/${id}`, auth());
      loadEmpAssignments(); loadWorkload();
    } catch (e) { setError(e.response?.data?.message || "Failed to remove assignment."); }
  };

  // Build workload map from aggregate data
  const workloadMap = {};
  workload.forEach(w => { workloadMap[w._id?.toString()] = w; });

  const getWorkloadColor = (count) => {
    if (count >= 5) return "bg-red-100 text-red-700";
    if (count >= 3) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={22} className="text-[#DD1215]" />
          <div>
            <h1 className="text-2xl font-black tracking-widest text-gray-900">WORK ASSIGNMENT</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage project assignments and team workload</p>
          </div>
        </div>
        <button onClick={() => { setAssignModal(true); setError(""); }}
          className="flex items-center gap-2 bg-[#DD1215] text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
          <Plus size={14} /> Assign Employee
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Tabs */}
        <div className="flex gap-1 bg-white border rounded-lg p-1 w-fit">
          {[{ key:"workload", label:"Workload Heatmap" }, { key:"employee", label:"By Employee" }].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setError(""); }}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition rounded ${tab === t.key ? "bg-[#DD1215] text-white" : "text-gray-500 hover:text-gray-800"}`}>{t.label}</button>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">{error}</div>}

        {/* WORKLOAD HEATMAP */}
        {tab === "workload" && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Team Workload — Active Project Assignments</p>
              <button onClick={loadWorkload} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition"><RefreshCw size={12} /> Refresh</button>
            </div>
            {loading ? (
              <div className="flex justify-center py-12"><Loader size={24} className="animate-spin text-[#DD1215]" /></div>
            ) : employees.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No employees found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Employee","Department","Role","Active Projects","Hrs/Week","Workload Status"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {employees.map(emp => {
                      const wl = workloadMap[emp._id?.toString()];
                      const count = wl?.activeProjects || 0;
                      const hrs   = wl?.totalHoursPerWeek || 0;
                      return (
                        <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-xs font-bold">{emp.firstName?.[0]}{emp.lastName?.[0]}</div>
                              <div>
                                <p className="font-semibold text-gray-900 text-xs">{emp.firstName} {emp.lastName}</p>
                                <p className="text-[10px] text-gray-400">{emp.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">{emp.department}</td>
                          <td className="px-4 py-3 text-xs capitalize text-gray-600">{emp.hrRole?.replace("_"," ")}</td>
                          <td className="px-4 py-3 text-xs font-bold text-gray-800">{count} project{count !== 1 ? "s" : ""}</td>
                          <td className="px-4 py-3 text-xs text-gray-600">{hrs}h</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getWorkloadColor(count)}`}>
                                {count >= 5 ? "Overloaded" : count >= 3 ? "Busy" : count > 0 ? "Active" : "Free"}
                              </span>
                              {count >= 5 && <AlertTriangle size={12} className="text-red-500" />}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BY EMPLOYEE TAB */}
        {tab === "employee" && (
          <>
            <div className="bg-white border rounded-lg px-5 py-4">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Select Employee</label>
              <select value={selEmp} onChange={e => setSelEmp(e.target.value)}
                className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] min-w-[250px]">
                <option value="">Choose employee...</option>
                {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName} — {e.designation}</option>)}
              </select>
            </div>

            {selEmp && (
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Active Assignments ({empAssignments.length})</p>
                </div>
                {loading ? (
                  <div className="flex justify-center py-12"><Loader size={24} className="animate-spin text-[#DD1215]" /></div>
                ) : empAssignments.length === 0 ? (
                  <div className="text-center py-12 text-sm text-gray-400">No active assignments.</div>
                ) : (
                  <div className="divide-y">
                    {empAssignments.map(a => (
                      <div key={a._id} className="px-6 py-4 flex items-center gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{a.projectId?.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{a.projectId?.projectId}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="capitalize font-semibold">{a.role}</span>
                          <span>{a.hoursPerWeek}h/week</span>
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLE[a.status]}`}>{a.status}</span>
                        </div>
                        <button onClick={() => handleRemove(a._id)} className="text-gray-400 hover:text-red-500 transition"><X size={15} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black uppercase tracking-widest">Assign to Project</h3>
              <button onClick={() => { setAssignModal(false); setError(""); }} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <F label="Employee *">
                <select value={form.employeeId} onChange={e => setForm(f => ({...f,employeeId:e.target.value}))} className={inp} required>
                  <option value="">Select employee</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </F>
              <F label="Project *">
                <select value={form.projectId} onChange={e => setForm(f => ({...f,projectId:e.target.value}))} className={inp} required>
                  <option value="">Select project</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Role">
                  <select value={form.role} onChange={e => setForm(f => ({...f,role:e.target.value}))} className={inp}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </F>
                <F label="Hrs/Week">
                  <input type="number" value={form.hoursPerWeek} onChange={e => setForm(f => ({...f,hoursPerWeek:parseInt(e.target.value)}))} className={inp} min={1} max={60} />
                </F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label="Start Date *">
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({...f,startDate:e.target.value}))} className={inp} required />
                </F>
                <F label="End Date">
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({...f,endDate:e.target.value}))} className={inp} />
                </F>
              </div>
              <F label="Note">
                <input type="text" value={form.note} onChange={e => setForm(f => ({...f,note:e.target.value}))} className={inp} placeholder="Optional note..." />
              </F>
            </div>
            {error && <p className="text-red-600 text-xs mt-3">{error}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setAssignModal(false); setError(""); }} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleAssign} disabled={saving} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {saving ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inp = "w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] bg-white";
const F = ({ label, children }) => (<div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>{children}</div>);

export default WorkAssignment;
