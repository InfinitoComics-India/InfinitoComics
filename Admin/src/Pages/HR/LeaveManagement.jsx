import React, { useState, useEffect } from "react";
import { CalendarOff, Check, X, Clock, RefreshCw, Plus, Loader, ChevronDown } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const STATUS_STYLE = {
  pending:   { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending"   },
  approved:  { bg: "bg-green-100",  text: "text-green-700",  label: "Approved"  },
  rejected:  { bg: "bg-red-100",    text: "text-red-700",    label: "Rejected"  },
  cancelled: { bg: "bg-gray-100",   text: "text-gray-500",   label: "Cancelled" },
};

const LEAVE_TYPES = ["casual","sick","earned","unpaid","maternity","paternity","bereavement"];

const LeaveManagement = () => {
  const [tab, setTab]               = useState("pending");
  const [pending, setPending]       = useState([]);
  const [employees, setEmployees]   = useState([]);
  const [selEmp, setSelEmp]         = useState("");
  const [empLeaves, setEmpLeaves]   = useState([]);
  const [balance, setBalance]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [actionModal, setActionModal] = useState(null); // { type: approve|reject, leave }
  const [actionNote, setActionNote] = useState("");
  const [acting, setActing]         = useState(false);
  const [applyModal, setApplyModal] = useState(false);
  const [applyForm, setApplyForm]   = useState({ employeeId:"", leaveType:"casual", fromDate:"", toDate:"", reason:"", isHalfDay:false });
  const [applying, setApplying]     = useState(false);

  useEffect(() => {
    axios.get(`${BASE}/hr/employees/getall`, auth()).then(r => setEmployees(r.data.data || [])).catch(() => {});
  }, []);

  const loadPending = async () => {
    try { setLoading(true); setError("");
      const r = await axios.get(`${BASE}/hr/leaves/pending`, auth());
      setPending(r.data.data || []);
    } catch { setError("Failed to load pending leaves."); }
    finally { setLoading(false); }
  };

  const loadEmpLeaves = async () => {
    if (!selEmp) return;
    try { setLoading(true); setError("");
      const [leavesRes, balRes] = await Promise.all([
        axios.get(`${BASE}/hr/leaves/employee/${selEmp}`, auth()),
        axios.get(`${BASE}/hr/leaves/balance/${selEmp}`, auth()),
      ]);
      setEmpLeaves(leavesRes.data.data || []);
      setBalance(balRes.data.data);
    } catch { setError("Failed to load employee leaves."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (tab === "pending") loadPending(); }, [tab]);
  useEffect(() => { if (tab === "employee" && selEmp) loadEmpLeaves(); }, [selEmp]);

  const handleAction = async () => {
    if (!actionModal) return;
    try { setActing(true);
      const url = `${BASE}/hr/leaves/${actionModal.type}/${actionModal.leave._id}`;
      const body = actionModal.type === "approve" ? { adminNote: actionNote } : { rejectionNote: actionNote };
      await axios.patch(url, body, auth());
      setActionModal(null); setActionNote("");
      loadPending();
      if (selEmp) loadEmpLeaves();
    } catch (e) { setError(e.response?.data?.message || "Action failed."); }
    finally { setActing(false); }
  };

  const handleApply = async () => {
    try { setApplying(true); setError("");
      await axios.post(`${BASE}/hr/leaves/apply`, applyForm, auth());
      setApplyModal(false);
      setApplyForm({ employeeId:"", leaveType:"casual", fromDate:"", toDate:"", reason:"", isHalfDay:false });
      loadPending();
    } catch (e) { setError(e.response?.data?.message || "Failed to apply leave."); }
    finally { setApplying(false); }
  };

  const handleCancel = async (id) => {
    try {
      await axios.patch(`${BASE}/hr/leaves/cancel/${id}`, {}, auth());
      loadEmpLeaves();
    } catch (e) { setError(e.response?.data?.message || "Failed to cancel leave."); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarOff size={22} className="text-[#DD1215]" />
          <div>
            <h1 className="text-2xl font-black tracking-widest text-gray-900">LEAVE MANAGEMENT</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage leave requests and balances</p>
          </div>
        </div>
        <button onClick={() => setApplyModal(true)}
          className="flex items-center gap-2 bg-[#DD1215] text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
          <Plus size={14} /> Apply Leave
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Tabs */}
        <div className="flex gap-1 bg-white border rounded-lg p-1 w-fit">
          {[
            { key: "pending",  label: `Pending (${pending.length})` },
            { key: "employee", label: "By Employee" },
          ].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setError(""); }}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition rounded ${
                tab === t.key ? "bg-[#DD1215] text-white" : "text-gray-500 hover:text-gray-800"
              }`}>{t.label}</button>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">{error}</div>}

        {/* PENDING TAB */}
        {tab === "pending" && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Approval Queue</p>
              <button onClick={loadPending} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition">
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center py-16"><Loader size={28} className="animate-spin text-[#DD1215]" /></div>
            ) : pending.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Check size={36} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No pending leave requests.</p>
              </div>
            ) : (
              <div className="divide-y">
                {pending.map(leave => {
                  const emp = leave.employeeId;
                  return (
                    <div key={leave._id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Employee info */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-9 h-9 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {emp?.firstName?.[0]}{emp?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{emp?.firstName} {emp?.lastName}</p>
                          <p className="text-xs text-gray-400">{emp?.designation} · {emp?.department}</p>
                        </div>
                      </div>
                      {/* Leave details */}
                      <div className="flex-1 space-y-0.5">
                        <p className="text-sm font-semibold text-gray-800 capitalize">{leave.leaveType} Leave</p>
                        <p className="text-xs text-gray-500">{fmt(leave.fromDate)} → {fmt(leave.toDate)} · <strong>{leave.totalDays} day{leave.totalDays > 1 ? "s" : ""}</strong></p>
                        <p className="text-xs text-gray-400 italic">"{leave.reason}"</p>
                      </div>
                      {/* Applied date */}
                      <div className="text-xs text-gray-400 shrink-0">
                        Applied {fmt(leave.createdAt)}
                      </div>
                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => { setActionModal({ type: "approve", leave }); setActionNote(""); }}
                          className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-green-700 transition rounded">
                          <Check size={13} /> Approve
                        </button>
                        <button onClick={() => { setActionModal({ type: "reject", leave }); setActionNote(""); }}
                          className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition rounded">
                          <X size={13} /> Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* EMPLOYEE TAB */}
        {tab === "employee" && (
          <>
            {/* Employee selector */}
            <div className="bg-white border rounded-lg px-5 py-4 flex gap-4 items-end flex-wrap">
              <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                <label className="text-xs font-semibold text-gray-500 uppercase">Select Employee</label>
                <select value={selEmp} onChange={e => setSelEmp(e.target.value)}
                  className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215]">
                  <option value="">Choose employee...</option>
                  {employees.map(e => (
                    <option key={e._id} value={e._id}>{e.firstName} {e.lastName} — {e.designation}</option>
                  ))}
                </select>
              </div>
            </div>

            {selEmp && (
              <>
                {/* Leave Balance cards */}
                {balance && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(balance.balance || {}).map(([type, days]) => {
                      const used = balance.used?.find(u => u._id === type)?.totalDaysUsed || 0;
                      return (
                        <div key={type} className="bg-white border rounded-lg px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 capitalize mb-2">{type}</p>
                          <div className="flex items-end gap-2">
                            <p className="text-2xl font-black text-gray-900">{days}</p>
                            <p className="text-xs text-gray-400 mb-1">available</p>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                            <div className="bg-[#DD1215] h-1.5 rounded-full" style={{ width: `${Math.min(100, (used / (days + used)) * 100)}%` }} />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">{used} used this year</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Leave history */}
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="px-5 py-3 border-b">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Leave History</p>
                  </div>
                  {loading ? (
                    <div className="flex justify-center py-12"><Loader size={24} className="animate-spin text-[#DD1215]" /></div>
                  ) : empLeaves.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm">No leave records found.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-100 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            {["Type","From","To","Days","Reason","Status","Applied","Actions"].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {empLeaves.map(l => {
                            const s = STATUS_STYLE[l.status] || STATUS_STYLE.pending;
                            return (
                              <tr key={l._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-semibold capitalize text-gray-800">{l.leaveType}</td>
                                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{fmt(l.fromDate)}</td>
                                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{fmt(l.toDate)}</td>
                                <td className="px-4 py-3 font-bold text-gray-700">{l.totalDays}</td>
                                <td className="px-4 py-3 text-xs text-gray-500 max-w-[160px] truncate">{l.reason}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>{s.label}</span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{fmt(l.createdAt)}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {["pending","approved"].includes(l.status) && (
                                    <button onClick={() => handleCancel(l._id)}
                                      className="text-xs text-red-500 hover:underline font-semibold">Cancel</button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Approve / Reject Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-1">
              {actionModal.type === "approve" ? "Approve Leave" : "Reject Leave"}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {actionModal.leave.employeeId?.firstName} {actionModal.leave.employeeId?.lastName} ·{" "}
              <span className="capitalize">{actionModal.leave.leaveType}</span> ·{" "}
              {actionModal.leave.totalDays} day{actionModal.leave.totalDays > 1 ? "s" : ""}
            </p>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">
              {actionModal.type === "approve" ? "Admin Note (optional)" : "Rejection Reason (optional)"}
            </label>
            <textarea rows={3} value={actionNote} onChange={e => setActionNote(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] resize-none"
              placeholder={actionModal.type === "approve" ? "Any note for employee..." : "Reason for rejection..."} />
            <div className="flex gap-3 mt-5">
              <button onClick={() => setActionModal(null)} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleAction} disabled={acting}
                className={`flex-1 text-white px-4 py-2 text-xs font-bold uppercase transition disabled:opacity-50 ${
                  actionModal.type === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-[#DD1215] hover:bg-red-700"
                }`}>
                {acting ? "Processing..." : actionModal.type === "approve" ? "Confirm Approve" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {applyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-5">Apply Leave</h3>
            <div className="space-y-4">
              <Field label="Employee *">
                <select value={applyForm.employeeId} onChange={e => setApplyForm(f => ({ ...f, employeeId: e.target.value }))} className={inp} required>
                  <option value="">Select employee</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </Field>
              <Field label="Leave Type *">
                <select value={applyForm.leaveType} onChange={e => setApplyForm(f => ({ ...f, leaveType: e.target.value }))} className={inp}>
                  {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="From Date *">
                  <input type="date" value={applyForm.fromDate} onChange={e => setApplyForm(f => ({ ...f, fromDate: e.target.value }))} className={inp} required />
                </Field>
                <Field label="To Date *">
                  <input type="date" value={applyForm.toDate} onChange={e => setApplyForm(f => ({ ...f, toDate: e.target.value }))} className={inp} required />
                </Field>
              </div>
              <Field label="Reason *">
                <textarea rows={3} value={applyForm.reason} onChange={e => setApplyForm(f => ({ ...f, reason: e.target.value }))}
                  className={`${inp} resize-none`} placeholder="Reason for leave..." required />
              </Field>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={applyForm.isHalfDay} onChange={e => setApplyForm(f => ({ ...f, isHalfDay: e.target.checked }))}
                  className="w-4 h-4 accent-[#DD1215]" />
                Half day leave
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setApplyModal(false)} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleApply} disabled={applying}
                className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {applying ? "Applying..." : "Apply Leave"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inp = "w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] bg-white";
const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
);

export default LeaveManagement;
