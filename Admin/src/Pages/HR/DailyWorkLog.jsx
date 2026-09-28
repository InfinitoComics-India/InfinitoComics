import React, { useState, useEffect, useRef } from "react";
import { ClipboardList, Plus, X, Clock, CheckCircle, AlertTriangle, CalendarDays, RefreshCw, Loader, Lock, ChevronLeft, ChevronRight, Send } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const STATUS_STYLE = {
  submitted:  { bg: "bg-green-100",  text: "text-green-700",  icon: CheckCircle,    label: "Submitted"   },
  edited:     { bg: "bg-blue-100",   text: "text-blue-700",   icon: CheckCircle,    label: "Updated"     },
  auto_leave: { bg: "bg-red-100",    text: "text-red-700",    icon: AlertTriangle,  label: "Auto Leave"  },
  pending:    { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock,          label: "Pending"     },
};

const fmt      = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtTime  = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "—";

// Get current IST time info
const getISTInfo = () => {
  const now       = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow    = new Date(now.getTime() + istOffset);
  const hours     = istNow.getUTCHours();
  const minutes   = istNow.getUTCMinutes();
  const timeStr   = `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}`;
  // Minutes until midnight
  const minsLeft  = (23 - hours) * 60 + (59 - minutes);
  return { hours, minutes, timeStr, minsLeft, isPastMidnight: false };
};

const DailyWorkLog = () => {
  const admin      = JSON.parse(localStorage.getItem("Admin") || "{}");
  const myId       = admin?._id || admin?.id || "";

  const [tab,        setTab]        = useState("submit"); // submit | admin
  const [employees,  setEmployees]  = useState([]);
  const [selEmployee,setSelEmployee]= useState(myId || "");
  const [myLog,      setMyLog]      = useState(null);
  const [allLogs,    setAllLogs]    = useState([]);
  const [summary,    setSummary]    = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [istInfo,    setIstInfo]    = useState(getISTInfo());

  // Form
  const [workDescription, setWorkDescription] = useState("");
  const [hoursWorked,     setHoursWorked]     = useState("");

  // Date picker for admin view
  const [adminDate, setAdminDate] = useState(new Date().toISOString().split("T")[0]);

  // Live IST clock
  useEffect(() => {
    const timer = setInterval(() => setIstInfo(getISTInfo()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Load employees + today's log
  useEffect(() => {
    loadEmployees();
    if (selEmployee) loadMyLog(selEmployee);
  }, []);

  useEffect(() => {
    if (tab === "admin") { loadAdminLogs(); loadSummary(); }
  }, [tab, adminDate]);

  useEffect(() => {
    if (selEmployee) loadMyLog(selEmployee);
  }, [selEmployee]);

  const loadEmployees = async () => {
    try {
      const res = await axios.get(`${BASE}/hr/employees/getall`, auth());
      setEmployees(res.data.data || []);
    } catch {}
  };

  const loadMyLog = async (empId) => {
    try {
      const res = await axios.get(`${BASE}/hr/worklog/today/${empId}`, auth());
      const log = res.data.data;
      setMyLog(log);
      if (log && !log.isLocked) {
        setWorkDescription(log.workDescription || "");
        setHoursWorked(log.hoursWorked?.toString() || "");
      }
    } catch {}
  };

  const loadAdminLogs = async () => {
    try { setLoading(true);
      const res = await axios.get(`${BASE}/hr/worklog/date`, { ...auth(), params: { date: adminDate } });
      setAllLogs(res.data.data || []);
    } catch { setError("Failed to load logs."); } finally { setLoading(false); }
  };

  const loadSummary = async () => {
    try {
      const res = await axios.get(`${BASE}/hr/worklog/summary`, { ...auth(), params: { date: adminDate } });
      setSummary(res.data.data);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selEmployee) { setError("Please select your employee profile."); return; }
    if (!workDescription.trim()) { setError("Work description is required."); return; }
    if (!hoursWorked || parseFloat(hoursWorked) <= 0) { setError("Please enter valid hours worked."); return; }

    try { setSaving(true); setError(""); setSuccess("");
      const res = await axios.post(`${BASE}/hr/worklog/submit`, {
        employeeId:      selEmployee,
        workDescription: workDescription.trim(),
        hoursWorked:     parseFloat(hoursWorked),
      }, auth());
      setMyLog(res.data.data);
      setSuccess(myLog ? "✅ Work log updated successfully!" : "✅ Work log submitted successfully!");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to submit work log.");
    } finally { setSaving(false); }
  };

  const handleRunCron = async () => {
    if (!window.confirm("Manually run the midnight cron? This will auto-mark all employees who haven't submitted today's log as on leave.")) return;
    try {
      const res = await axios.post(`${BASE}/hr/worklog/run-cron`, {}, auth());
      setSuccess(`Cron completed: ${res.data.autoLeaveCount} employees auto-marked as leave.`);
      loadAdminLogs(); loadSummary();
    } catch (e) { setError(e.response?.data?.message || "Failed to run cron."); }
  };

  const isLocked = myLog?.isLocked;
  const isSubmitted = myLog && ["submitted","edited"].includes(myLog.status);

  // Time remaining display
  const { minsLeft, timeStr } = istInfo;
  const hoursLeft = Math.floor(minsLeft / 60);
  const minsLeftDisplay = minsLeft % 60;
  const isUrgent = minsLeft < 60;
  const isCritical = minsLeft < 15;

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList size={22} className="text-[#DD1215]" />
          <div>
            <h1 className="text-2xl font-black tracking-widest text-gray-900">DAILY WORK LOG</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Submit your work update before midnight IST · Current time: <strong>{timeStr} IST</strong>
            </p>
          </div>
        </div>
        {/* Countdown */}
        {tab === "submit" && !isLocked && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold ${
            isCritical ? "bg-red-50 border-red-300 text-red-700 animate-pulse" :
            isUrgent   ? "bg-orange-50 border-orange-300 text-orange-700" :
                         "bg-green-50 border-green-200 text-green-700"
          }`}>
            <Clock size={14}/>
            {isSubmitted ? "✅ Submitted" : (
              isCritical ? `⚠️ Only ${minsLeftDisplay} mins left!` :
              isUrgent   ? `${minsLeftDisplay} mins remaining` :
              `${hoursLeft}h ${minsLeftDisplay}m until midnight`
            )}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">

        {/* Tabs */}
        <div className="flex gap-1 bg-white border rounded-lg p-1 w-fit">
          {[{key:"submit",label:"📝 My Work Log"},{key:"admin",label:"📊 Admin View"}].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setError(""); setSuccess(""); }}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition rounded ${t.key===tab?"bg-[#DD1215] text-white":"text-gray-500 hover:text-gray-800"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {error   && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded flex items-center gap-2"><AlertTriangle size={14}/>{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded">{success}</div>}

        {/* ── MY WORK LOG TAB ── */}
        {tab === "submit" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Form */}
            <div className="lg:col-span-2 bg-white border rounded-xl overflow-hidden">
              <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-black text-lg">
                    {fmt(new Date())}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Submit your work update for today</p>
                </div>
                {isLocked && (
                  <div className="flex items-center gap-2 bg-red-900/50 text-red-300 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <Lock size={13}/> Locked — midnight passed
                  </div>
                )}
                {isSubmitted && !isLocked && (
                  <div className="flex items-center gap-2 bg-green-900/50 text-green-300 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <CheckCircle size={13}/> Submitted at {fmtTime(myLog?.submittedAt)}
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Employee selector */}
                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Your Employee Profile</label>
                  <select value={selEmployee} onChange={e => setSelEmployee(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#DD1215] bg-white">
                    <option value="">Select your profile...</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName} — {e.designation}</option>)}
                  </select>
                </div>

                {isLocked ? (
                  <div className="text-center py-10 text-gray-400">
                    <Lock size={40} className="mx-auto mb-3 opacity-30"/>
                    <p className="font-semibold">Today's work log is locked.</p>
                    <p className="text-xs mt-1">Submissions closed after midnight IST.</p>
                    {myLog?.status === "auto_leave" && (
                      <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                        ⚠️ You were automatically marked as <strong>on leave</strong> for not submitting today's work log.
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Work Description */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                        Work Description * <span className="text-gray-400 font-normal normal-case">— What did you work on today?</span>
                      </label>
                      <textarea
                        rows={6}
                        value={workDescription}
                        onChange={e => setWorkDescription(e.target.value)}
                        className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#DD1215] resize-none"
                        placeholder={`Example:\n• Completed the login page UI design in Figma\n• Fixed 3 bugs in the character detail page\n• Reviewed PRs from Kalash and Arpit\n• Attended team standup meeting`}
                        required
                      />
                      <p className="text-[10px] text-gray-400 mt-1">{workDescription.length} characters</p>
                    </div>

                    {/* Hours Worked */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Hours Worked *</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0.5" max="24" step="0.5"
                          value={hoursWorked}
                          onChange={e => setHoursWorked(e.target.value)}
                          className="w-32 border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#DD1215] text-center font-bold"
                          placeholder="8"
                          required
                        />
                        <span className="text-sm text-gray-500">hours</span>
                        <div className="flex gap-2 ml-2">
                          {[4, 6, 8, 10].map(h => (
                            <button key={h} type="button" onClick={() => setHoursWorked(h.toString())}
                              className={`px-3 py-1.5 text-xs font-bold border transition rounded ${hoursWorked==h?"bg-[#DD1215] text-white border-[#DD1215]":"border-gray-300 text-gray-600 hover:border-[#DD1215] hover:text-[#DD1215]"}`}>
                              {h}h
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button type="submit" disabled={saving || !selEmployee}
                      className="w-full bg-[#DD1215] text-white py-3 text-xs font-black uppercase tracking-widest hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                      <Send size={15}/>
                      {saving ? "Submitting..." : isSubmitted ? "Update Work Log" : "Submit Work Log"}
                    </button>

                    {!isSubmitted && (
                      <p className="text-[10px] text-center text-gray-400">
                        ⚠️ If you don't submit before midnight IST, you will be automatically marked as <strong>on leave</strong> for today.
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>

            {/* Right panel — My recent logs */}
            <div className="space-y-4">
              {/* Today's status card */}
              <div className={`border rounded-xl p-5 ${
                isLocked && myLog?.status === "auto_leave" ? "bg-red-50 border-red-200" :
                isSubmitted ? "bg-green-50 border-green-200" :
                "bg-yellow-50 border-yellow-200"
              }`}>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Today's Status</p>
                {!myLog || myLog.status === "pending" ? (
                  <div className="flex items-center gap-2 text-yellow-700">
                    <Clock size={20}/>
                    <div>
                      <p className="font-black">Pending</p>
                      <p className="text-xs">Submit before midnight IST</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className={`flex items-center gap-2 mb-3 ${
                      myLog.status === "auto_leave" ? "text-red-700" :
                      "text-green-700"
                    }`}>
                      {myLog.status === "auto_leave" ? <AlertTriangle size={20}/> : <CheckCircle size={20}/>}
                      <div>
                        <p className="font-black capitalize">{STATUS_STYLE[myLog.status]?.label}</p>
                        <p className="text-xs">
                          {myLog.submittedAt ? `Submitted at ${fmtTime(myLog.submittedAt)}` : "Auto-marked"}
                        </p>
                      </div>
                    </div>
                    {myLog.workDescription && myLog.status !== "auto_leave" && (
                      <div className="bg-white rounded-lg px-3 py-2.5 border border-gray-200">
                        <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Work Done</p>
                        <p className="text-xs text-gray-700 leading-relaxed line-clamp-4">{myLog.workDescription}</p>
                        <p className="text-[10px] text-gray-400 mt-1.5">⏱ {myLog.hoursWorked}h worked</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recent history */}
              <div className="bg-white border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Recent History</p>
                </div>
                <HistoryList employeeId={selEmployee} />
              </div>
            </div>
          </div>
        )}

        {/* ── ADMIN VIEW TAB ── */}
        {tab === "admin" && (
          <>
            {/* Date controls */}
            <div className="bg-white border rounded-lg px-5 py-4 flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Date</label>
                <input type="date" value={adminDate} onChange={e => setAdminDate(e.target.value)}
                  className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215]" />
              </div>
              <button onClick={() => { loadAdminLogs(); loadSummary(); }}
                className="flex items-center gap-1 border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50 transition"><RefreshCw size={13}/> Refresh</button>
              <button onClick={handleRunCron}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-black transition">
                🌙 Run Midnight Cron
              </button>
            </div>

            {/* Summary cards */}
            {summary && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label:"Total",      value: summary.total,      color: "text-gray-900"  },
                  { label:"Submitted",  value: summary.submitted,  color: "text-green-600" },
                  { label:"Auto Leave", value: summary.auto_leave, color: "text-red-600"   },
                  { label:"Pending",    value: summary.pending,    color: "text-yellow-600"},
                  { label:"Avg Hours",  value: `${summary.avgHours}h`, color: "text-blue-600" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white border rounded-lg px-4 py-3">
                    <p className={`text-2xl font-black ${color}`}>{value}</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Logs table */}
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Work Logs for {new Date(adminDate).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})} ({allLogs.length} entries)
                </p>
              </div>
              {loading ? (
                <div className="flex justify-center py-12"><Loader size={24} className="animate-spin text-[#DD1215]"/></div>
              ) : allLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ClipboardList size={32} className="mx-auto mb-2 opacity-30"/>
                  <p className="text-sm font-semibold">No work logs for this date.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Employee","Designation","Status","Hours","Work Description","Submitted At","Locked"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {allLogs.map(log => {
                        const emp = log.employeeId;
                        const s   = STATUS_STYLE[log.status] || STATUS_STYLE.pending;
                        const SI  = s.icon;
                        return (
                          <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-[10px] font-bold">
                                  {(emp?.firstName||log.employeeName)?.[0]}{(emp?.lastName||"")?.[0]}
                                </div>
                                <span className="text-xs font-semibold text-gray-900 whitespace-nowrap">
                                  {emp ? `${emp.firstName} ${emp.lastName}` : log.employeeName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{emp?.designation || "—"}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${s.bg} ${s.text}`}>
                                <SI size={10}/> {s.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs font-bold text-gray-700 whitespace-nowrap">
                              {log.hoursWorked > 0 ? `${log.hoursWorked}h` : "—"}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600 max-w-xs">
                              <p className="line-clamp-2">{log.workDescription || "—"}</p>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                              {log.submittedAt ? fmtTime(log.submittedAt) : "—"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {log.isLocked
                                ? <span className="flex items-center gap-1 text-[10px] text-gray-400"><Lock size={10}/> Locked</span>
                                : <span className="text-[10px] text-green-600">Open</span>}
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
      </div>
    </div>
  );
};

// ── Recent history sub-component ─────────────────────────────
const HistoryList = ({ employeeId }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!employeeId) return;
    axios.get(`${BASE}/hr/worklog/history/${employeeId}`, { ...auth(), params: { limit: 7 } })
      .then(r => setLogs(r.data.data || []))
      .catch(() => {});
  }, [employeeId]);

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "—";

  if (!employeeId) return <p className="text-xs text-gray-400 p-4">Select your profile to see history.</p>;
  if (logs.length === 0) return <p className="text-xs text-gray-400 p-4">No history yet.</p>;

  return (
    <div className="divide-y">
      {logs.map(log => {
        const s = STATUS_STYLE[log.status] || STATUS_STYLE.pending;
        const SI = s.icon;
        return (
          <div key={log._id} className="px-4 py-3 flex items-center gap-3">
            <span className={`${s.bg} ${s.text} p-1 rounded-full shrink-0`}><SI size={11}/></span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-700">{fmt(log.date)}</p>
              <p className="text-[10px] text-gray-400 truncate">{log.workDescription || "No description"}</p>
            </div>
            <span className="text-[10px] font-bold text-gray-500 shrink-0">{log.hoursWorked > 0 ? `${log.hoursWorked}h` : ""}</span>
          </div>
        );
      })}
    </div>
  );
};

export default DailyWorkLog;
