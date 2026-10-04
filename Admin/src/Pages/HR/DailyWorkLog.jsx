import React, { useState, useEffect } from "react";
import { ClipboardList, Clock, CheckCircle, AlertTriangle, RefreshCw, Loader, Lock, Send, ThumbsUp, ThumbsDown, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const STATUS_STYLE = {
  submitted:  { bg:"bg-green-100",  text:"text-green-700",  icon:CheckCircle,   label:"Submitted"  },
  edited:     { bg:"bg-blue-100",   text:"text-blue-700",   icon:CheckCircle,   label:"Updated"    },
  auto_leave: { bg:"bg-red-100",    text:"text-red-700",    icon:AlertTriangle, label:"Auto Leave" },
  pending:    { bg:"bg-yellow-100", text:"text-yellow-700", icon:Clock,         label:"Pending"    },
};

const REVIEW_STYLE = {
  approved:          { bg:"bg-green-100",  text:"text-green-700",  label:"✅ Approved"          },
  needs_improvement: { bg:"bg-yellow-100", text:"text-yellow-700", label:"⚠️ Needs Improvement" },
  rejected:          { bg:"bg-red-100",    text:"text-red-700",    label:"❌ Needs Redo"        },
};

const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fmtTime  = (d) => d ? new Date(d).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}) : "—";
const fmtShort = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "—";

// Get IST countdown to midnight
const getCountdown = () => {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5*60*60*1000);
  const h = ist.getUTCHours(), m = ist.getUTCMinutes();
  const minsLeft = (23-h)*60 + (59-m);
  return { minsLeft, timeStr: `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}` };
};

const DailyWorkLog = () => {
  const admin    = JSON.parse(localStorage.getItem("Admin") || "{}");
  const myName   = admin?.name || admin?.email || "You";
  // Support both new `roles` array and legacy `role` string
  const myRoles  = [...(admin?.roles || []), ...(admin?.role ? [admin.role] : [])];
  const isManager    = myRoles.some(r => ["superadmin","hr_manager","manager"].includes(r));
  const isSuperAdmin = myRoles.includes("superadmin");

  const [tab, setTab] = useState(isSuperAdmin ? "admin" : "my");
  const [myLog,    setMyLog]    = useState(null);
  const [history,  setHistory]  = useState([]);
  const [allLogs,  setAllLogs]  = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [countdown, setCountdown] = useState(getCountdown());

  // Form
  const [work,  setWork]  = useState("");

  // Admin view
  const [adminDate, setAdminDate] = useState(() => {
    // Use IST date as default (not UTC)
    const istMs = Date.now() + 5.5 * 60 * 60 * 1000;
    return new Date(istMs).toISOString().split("T")[0];
  });
  const [expandedLog,  setExpandedLog]  = useState(null);
  const [reviewForm,   setReviewForm]   = useState({ status:"", comment:"" });
  const [reviewingId,  setReviewingId]  = useState(null);

  // Live countdown
  useEffect(() => {
    const t = setInterval(() => setCountdown(getCountdown()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { loadMyLog(); loadHistory(); }, []);
  useEffect(() => { if (tab === "admin") { loadAllLogs(); loadSummary(); } }, [tab, adminDate]);

  const loadMyLog = async () => {
    try {
      const res = await axios.get(`${BASE}/hr/worklog/my/today`, auth());
      const log = res.data.data;
      setMyLog(log);
      if (log && !log.isLocked) {
        setWork(log.workDescription || "");
      }
    } catch {}
  };

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${BASE}/hr/worklog/my/history`, auth());
      setHistory(res.data.data || []);
    } catch {}
  };

  const loadAllLogs = async () => {
    try { setLoading(true);
      const res = await axios.get(`${BASE}/hr/worklog/date`, { ...auth(), params:{ date: adminDate } });
      setAllLogs(res.data.data || []);
    } catch { setError("Failed to load."); } finally { setLoading(false); }
  };

  const loadSummary = async () => {
    try {
      const res = await axios.get(`${BASE}/hr/worklog/summary`, { ...auth(), params:{ date: adminDate } });
      setSummary(res.data.data);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!work.trim()) { setError("Work description is required."); return; }
    try { setSaving(true); setError(""); setSuccess("");
      const res = await axios.post(`${BASE}/hr/worklog/submit`, { workDescription: work.trim() }, auth());
      setMyLog(res.data.data);
      setSuccess(myLog ? "✅ Work log updated!" : "✅ Work log submitted successfully!");
      loadHistory();
    } catch (e) { setError(e.response?.data?.message || "Failed to submit."); }
    finally { setSaving(false); }
  };

  const handleReview = async (logId) => {
    if (!reviewForm.status) { setError("Please select a review status."); return; }
    try { setSaving(true);
      const res = await axios.patch(`${BASE}/hr/worklog/review/${logId}`, { reviewStatus: reviewForm.status, reviewComment: reviewForm.comment }, auth());
      setAllLogs(prev => prev.map(l => l._id === logId ? res.data.data : l));
      setReviewingId(null); setReviewForm({ status:"", comment:"" });
      setSuccess("Review saved.");
    } catch (e) { setError(e.response?.data?.message || "Failed to save review."); }
    finally { setSaving(false); }
  };

  const handleRunCron = async () => {
    if (!window.confirm("Run midnight cron manually? Employees who haven't submitted today will be marked as on leave.")) return;
    try {
      const res = await axios.post(`${BASE}/hr/worklog/run-cron`, {}, auth());
      setSuccess(`Cron done: ${res.data.autoLeaveCount} employees auto-marked.`);
      loadAllLogs(); loadSummary();
    } catch (e) { setError(e.response?.data?.message || "Failed."); }
  };

  const isSubmitted = myLog && ["submitted","edited"].includes(myLog.status);
  const isLocked    = myLog?.isLocked;
  const { minsLeft, timeStr } = countdown;
  const isUrgent   = minsLeft < 60;
  const isCritical = minsLeft < 15;

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList size={22} className="text-[#DD1215]"/>
          <div>
            <h1 className="text-2xl font-black tracking-widest text-gray-900">DAILY WORK LOG</h1>
            <p className="text-xs text-gray-400 mt-0.5">Hi <strong>{myName}</strong> · IST: {timeStr}</p>
          </div>
        </div>
        {/* Countdown */}
        {tab === "my" && !isLocked && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold ${
            isCritical ? "bg-red-50 border-red-300 text-red-700 animate-pulse" :
            isUrgent   ? "bg-orange-50 border-orange-300 text-orange-700" :
                         "bg-green-50 border-green-200 text-green-700"
          }`}>
            <Clock size={14}/>
            {isSubmitted ? "✅ Submitted today" :
             isCritical  ? `⚠️ ${minsLeft % 60}m left!` :
             isUrgent    ? `${minsLeft % 60}m to midnight` :
             `${Math.floor(minsLeft/60)}h ${minsLeft%60}m to midnight`}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">

        {/* Tabs — hidden for superadmin (they only see Review Team) */}
        {!isSuperAdmin && (
          <div className="flex gap-1 bg-white border rounded-lg p-1 w-fit">
            <button onClick={() => setTab("my")}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition rounded ${tab==="my"?"bg-[#DD1215] text-white":"text-gray-500 hover:text-gray-800"}`}>
              📝 My Work Log
            </button>
            {isManager && (
              <button onClick={() => setTab("admin")}
                className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition rounded ${tab==="admin"?"bg-[#DD1215] text-white":"text-gray-500 hover:text-gray-800"}`}>
                📊 Review Team
              </button>
            )}
          </div>
        )}

        {error   && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded flex items-center gap-2"><AlertTriangle size={14}/>{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded">{success}</div>}

        {/* ── MY WORK LOG ── */}
        {tab === "my" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Submit form */}
            <div className="lg:col-span-2 bg-white border rounded-xl overflow-hidden">
              <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-black text-lg">{fmtDate(new Date())}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Your daily work update</p>
                </div>
                {isLocked && <div className="flex items-center gap-2 bg-red-900/50 text-red-300 px-3 py-1.5 rounded text-xs font-semibold"><Lock size={13}/> Locked</div>}
                {isSubmitted && !isLocked && <div className="flex items-center gap-2 bg-green-900/50 text-green-300 px-3 py-1.5 rounded text-xs font-semibold"><CheckCircle size={13}/> Submitted {fmtTime(myLog.submittedAt)}</div>}
              </div>

              <div className="p-6">
                {isLocked ? (
                  <div className="text-center py-12 text-gray-400">
                    <Lock size={40} className="mx-auto mb-3 opacity-30"/>
                    <p className="font-semibold">Today's log is locked after midnight IST.</p>
                    {myLog?.status === "auto_leave" && (
                      <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">
                        ⚠️ You were automatically marked as <strong>on leave</strong> — no work log submitted.
                      </div>
                    )}
                    {myLog?.reviewStatus && (
                      <div className={`mt-4 border px-4 py-3 rounded ${REVIEW_STYLE[myLog.reviewStatus]?.bg} ${REVIEW_STYLE[myLog.reviewStatus]?.text}`}>
                        <p className="font-bold">{REVIEW_STYLE[myLog.reviewStatus]?.label}</p>
                        {myLog.reviewComment && <p className="text-sm mt-1">"{myLog.reviewComment}"</p>}
                        <p className="text-xs mt-1">— {myLog.reviewerName}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Review feedback if exists */}
                    {myLog?.reviewStatus && (
                      <div className={`border px-4 py-3 rounded ${REVIEW_STYLE[myLog.reviewStatus]?.bg} ${REVIEW_STYLE[myLog.reviewStatus]?.text}`}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1">Manager Review</p>
                        <p className="font-bold">{REVIEW_STYLE[myLog.reviewStatus]?.label}</p>
                        {myLog.reviewComment && <p className="text-sm mt-1">"{myLog.reviewComment}"</p>}
                        <p className="text-xs mt-1">— {myLog.reviewerName}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                        What did you work on today? *
                      </label>
                      <textarea rows={7} value={work} onChange={e=>setWork(e.target.value)}
                        className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#DD1215] resize-none"
                        placeholder={`Write your work update here. Be specific:\n\n• Completed the login UI in Figma\n• Fixed 3 bugs in character detail page\n• Reviewed Kalash's PR for shop page\n• Attended team standup (10am)\n• Worked on backend API for wishlist`}
                        required />
                      <p className="text-[10px] text-gray-400 mt-1">{work.length} characters</p>
                    </div>

                    <button type="submit" disabled={saving}
                      className="w-full bg-[#DD1215] text-white py-3 text-xs font-black uppercase tracking-widest hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                      <Send size={15}/>
                      {saving ? "Saving..." : isSubmitted ? "Update Work Log" : "Submit Work Log"}
                    </button>

                    {!isSubmitted && (
                      <p className="text-[10px] text-center text-gray-400">
                        ⚠️ If you don't submit before <strong>midnight IST</strong>, you will be automatically marked as <strong>on leave</strong> for today.
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>

            {/* Right: Status + History */}
            <div className="space-y-4">
              {/* Today's status */}
              <div className={`border rounded-xl p-5 ${
                myLog?.status==="auto_leave" ? "bg-red-50 border-red-200" :
                isSubmitted ? "bg-green-50 border-green-200" :
                "bg-yellow-50 border-yellow-200"
              }`}>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Today</p>
                {!myLog || myLog.status==="pending" ? (
                  <div className="flex items-center gap-2 text-yellow-700">
                    <Clock size={18}/><div><p className="font-black">Not Submitted</p><p className="text-xs">Submit before midnight</p></div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {myLog.status==="auto_leave"
                      ? <AlertTriangle size={18} className="text-red-600"/>
                      : <CheckCircle size={18} className="text-green-600"/>}
                    <div>
                      <p className={`font-black ${myLog.status==="auto_leave"?"text-red-700":"text-green-700"}`}>
                        {STATUS_STYLE[myLog.status]?.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {myLog.submittedAt ? `at ${fmtTime(myLog.submittedAt)}` : ""}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* History */}
              <div className="bg-white border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Recent Logs</p>
                  <button onClick={loadHistory} className="text-gray-400 hover:text-gray-700 transition"><RefreshCw size={12}/></button>
                </div>
                <div className="divide-y max-h-64 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-xs text-gray-400 p-4 text-center">No logs yet.</p>
                  ) : history.map(log => {
                    const s = STATUS_STYLE[log.status] || STATUS_STYLE.pending;
                    const SI = s.icon;
                    return (
                      <div key={log._id} className="px-4 py-3 flex items-start gap-2.5">
                        <span className={`${s.bg} ${s.text} p-1 rounded-full shrink-0 mt-0.5`}><SI size={10}/></span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-gray-700">{fmtShort(log.date)}</p>
                            <div className="flex items-center gap-1">
                              {log.reviewStatus && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${REVIEW_STYLE[log.reviewStatus]?.bg} ${REVIEW_STYLE[log.reviewStatus]?.text}`}>
                                  {log.reviewStatus === "approved" ? "✅" : log.reviewStatus === "needs_improvement" ? "⚠️" : "❌"}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">{log.workDescription}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ADMIN REVIEW TAB — EXCEL STYLE ── */}
        {tab === "admin" && isManager && (
          <>
            {/* Toolbar */}
            <div className="bg-white border rounded-lg px-4 py-3 flex flex-wrap gap-3 items-center justify-between">
              <div className="flex gap-3 items-end flex-wrap">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Date</label>
                  <input type="date" value={adminDate} onChange={e=>setAdminDate(e.target.value)}
                    className="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:border-[#DD1215]"/>
                </div>
                {/* Week navigator */}
                <div className="flex gap-1">
                  {[-3,-2,-1,0].map(offset => {
                    const d = new Date();
                    d.setDate(d.getDate() + offset);
                    // Use IST date string (not UTC)
                    const istMs = d.getTime() + 5.5 * 60 * 60 * 1000;
                    const istDate = new Date(istMs);
                    const val = istDate.toISOString().split("T")[0];
                    const label = offset === 0 ? "Today" : d.toLocaleDateString("en-IN",{day:"2-digit",month:"short"});
                    return (
                      <button key={offset} onClick={() => setAdminDate(val)}
                        className={`px-2.5 py-1.5 text-[10px] font-bold border transition ${adminDate===val?"bg-[#DD1215] text-white border-[#DD1215]":"border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                        {label}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => { loadAllLogs(); loadSummary(); }}
                  className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50 transition">
                  <RefreshCw size={12}/> Refresh
                </button>
              </div>
              <div className="flex gap-2">
                {/* Export CSV */}
                <button onClick={() => {
                  const headers = ["#","Name","Email","Date","Status","Work Description","Submitted At","Review","Comment"];
                  const rows = allLogs.map((l,i) => [
                    i+1, l.adminName||"", l.adminEmail||"",
                    fmtDate(l.date), l.status,
                    `"${(l.workDescription||"").replace(/"/g,"'")}"`,
                    l.submittedAt?fmtTime(l.submittedAt):"",
                    l.reviewStatus||"", l.reviewComment||""
                  ]);
                  const csv = [headers, ...rows].map(r=>r.join(",")).join("\n");
                  const blob = new Blob([csv], {type:"text/csv"});
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href=url; a.download=`worklog_${adminDate}.csv`; a.click();
                  URL.revokeObjectURL(url);
                }} className="flex items-center gap-1.5 border border-green-600 text-green-700 px-3 py-1.5 text-xs font-bold hover:bg-green-50 transition">
                  📥 Export CSV
                </button>
                <button onClick={handleRunCron}
                  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-1.5 text-xs font-bold uppercase hover:bg-black transition">
                  🌙 Run Cron
                </button>
              </div>
            </div>

            {/* Summary row — like Excel totals row */}
            {summary && (
              <div className="bg-[#1e3a5f] text-white rounded-lg px-4 py-2.5 flex flex-wrap gap-6 text-xs font-semibold">
                <span>📋 Total: <strong>{summary.total}</strong></span>
                <span className="text-green-300">✅ Submitted: <strong>{summary.submitted}</strong></span>
                <span className="text-red-300">🚨 Auto Leave: <strong>{summary.auto_leave}</strong></span>
                <span className="text-yellow-300">⏳ Pending: <strong>{summary.pending}</strong></span>
                <span className="text-blue-300">🔍 Reviewed: <strong>{summary.reviewed}</strong></span>
              </div>
            )}

            {/* Excel spreadsheet */}
            {loading ? (
              <div className="flex justify-center py-12"><Loader size={24} className="animate-spin text-[#DD1215]"/></div>
            ) : (
              <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto overflow-y-auto" style={{maxHeight:"65vh"}}>
                  <table className="min-w-full border-collapse text-xs">

                    {/* Frozen header — Excel style */}
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-[#217346] text-white">
                        <th className="border border-[#1a5c38] px-3 py-2 text-center w-8 font-bold">#</th>
                        <th className="border border-[#1a5c38] px-3 py-2 text-center w-20 font-bold">Emp ID</th>
                        <th className="border border-[#1a5c38] px-3 py-2 text-left min-w-[140px] font-bold">Employee Name</th>
                        <th className="border border-[#1a5c38] px-3 py-2 text-left min-w-[160px] font-bold">Email</th>
                        <th className="border border-[#1a5c38] px-3 py-2 text-center w-24 font-bold">Date</th>
                        <th className="border border-[#1a5c38] px-3 py-2 text-center w-24 font-bold">Status</th>
                        <th className="border border-[#1a5c38] px-3 py-2 text-left min-w-[300px] font-bold">Work Description</th>
                        <th className="border border-[#1a5c38] px-3 py-2 text-center w-20 font-bold">Submitted</th>
                        <th className="border border-[#1a5c38] px-3 py-2 text-center w-24 font-bold">Review</th>
                        <th className="border border-[#1a5c38] px-3 py-2 text-left min-w-[160px] font-bold">Reviewer Comment</th>
                        <th className="border border-[#1a5c38] px-3 py-2 text-center w-24 font-bold">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {allLogs.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="text-center py-12 text-gray-400 border border-gray-200">
                            <ClipboardList size={28} className="mx-auto mb-2 opacity-30"/>
                            No work logs for this date.
                          </td>
                        </tr>
                      ) : allLogs.map((log, i) => {
                        const isReviewing = reviewingId === log._id;
                        // Row background based on status
                        const rowBg =
                          log.status === "auto_leave" ? "bg-red-50 hover:bg-red-100" :
                          log.status === "submitted" || log.status === "edited" ? "bg-white hover:bg-green-50" :
                          "bg-yellow-50 hover:bg-yellow-100";

                        // Status cell color
                        const statusColor =
                          log.status === "auto_leave" ? "bg-red-100 text-red-700" :
                          log.status === "submitted"  ? "bg-green-100 text-green-700" :
                          log.status === "edited"     ? "bg-blue-100 text-blue-700" :
                          "bg-yellow-100 text-yellow-700";

                        // Review cell color
                        const reviewColor =
                          log.reviewStatus === "approved"          ? "bg-green-100 text-green-700" :
                          log.reviewStatus === "needs_improvement" ? "bg-yellow-100 text-yellow-700" :
                          log.reviewStatus === "rejected"          ? "bg-red-100 text-red-700" :
                          "text-gray-400";

                        return (
                          <React.Fragment key={log._id}>
                            <tr className={`${rowBg} transition-colors`}>
                              {/* Row number */}
                              <td className="border border-gray-200 px-3 py-2 text-center text-gray-400 font-mono bg-gray-50 font-semibold">
                                {i + 1}
                              </td>
                              {/* Emp ID */}
                              <td className="border border-gray-200 px-3 py-2 text-center font-mono text-xs text-gray-500 bg-gray-50">
                                {log.adminEmployeeId || "—"}
                              </td>
                              {/* Name */}
                              <td className="border border-gray-200 px-3 py-2 font-semibold text-gray-900 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-[#217346] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                                    {log.adminName?.[0]?.toUpperCase()||"?"}
                                  </div>
                                  {log.adminName||"—"}
                                </div>
                              </td>
                              {/* Email */}
                              <td className="border border-gray-200 px-3 py-2 text-gray-500 whitespace-nowrap">
                                {log.adminEmail||"—"}
                              </td>
                              {/* Date */}
                              <td className="border border-gray-200 px-3 py-2 text-center text-gray-600 whitespace-nowrap">
                                {fmtDate(log.date)}
                              </td>
                              {/* Status */}
                              <td className="border border-gray-200 px-3 py-2 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize inline-block ${statusColor}`}>
                                  {STATUS_STYLE[log.status]?.label || log.status}
                                </span>
                              </td>
                              {/* Work description */}
                              <td className="border border-gray-200 px-3 py-2 text-gray-700 max-w-xs">
                                {log.status === "auto_leave" ? (
                                  <span className="text-red-400 italic">Not submitted — auto leave</span>
                                ) : (
                                  <div className="line-clamp-2 leading-relaxed">{log.workDescription || "—"}</div>
                                )}
                              </td>
                              {/* Submitted at */}
                              <td className="border border-gray-200 px-3 py-2 text-center text-gray-500 whitespace-nowrap">
                                {log.submittedAt ? fmtTime(log.submittedAt) : "—"}
                              </td>
                              {/* Review status */}
                              <td className="border border-gray-200 px-3 py-2 text-center">
                                {log.reviewStatus ? (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${reviewColor}`}>
                                    {log.reviewStatus === "approved" ? "✅ OK" :
                                     log.reviewStatus === "needs_improvement" ? "⚠️ Improve" : "❌ Redo"}
                                  </span>
                                ) : (
                                  <span className="text-gray-300 text-[10px]">—</span>
                                )}
                              </td>
                              {/* Review comment */}
                              <td className="border border-gray-200 px-3 py-2 text-gray-500 italic max-w-xs">
                                {log.reviewComment ? (
                                  <span className="line-clamp-1">"{log.reviewComment}"</span>
                                ) : "—"}
                              </td>
                              {/* Actions */}
                              <td className="border border-gray-200 px-3 py-2 text-center">
                                {log.status !== "auto_leave" && (
                                  <button
                                    onClick={() => {
                                      setReviewingId(isReviewing ? null : log._id);
                                      setReviewForm({ status: log.reviewStatus||"", comment: log.reviewComment||"" });
                                    }}
                                    className={`text-[10px] px-2.5 py-1 font-bold border transition ${
                                      isReviewing
                                        ? "bg-[#DD1215] text-white border-[#DD1215]"
                                        : "border-blue-400 text-blue-600 hover:bg-blue-50"
                                    }`}>
                                    {isReviewing ? "Cancel" : log.reviewStatus ? "Edit" : "Review"}
                                  </button>
                                )}
                              </td>
                            </tr>

                            {/* Inline review form row */}
                            {isReviewing && (
                              <tr className="bg-blue-50">
                                <td colSpan={11} className="border border-blue-200 px-5 py-3">
                                  <div className="flex items-start gap-4 flex-wrap">
                                    <div>
                                      <p className="text-[10px] font-bold uppercase text-blue-600 mb-1.5">Review Status</p>
                                      <div className="flex gap-2">
                                        {[
                                          { v:"approved",          label:"✅ Approve"    },
                                          { v:"needs_improvement", label:"⚠️ Improve"   },
                                          { v:"rejected",          label:"❌ Redo"       },
                                        ].map(({ v, label }) => (
                                          <button key={v} onClick={() => setReviewForm(f=>({...f,status:v}))}
                                            className={`px-3 py-1 text-xs font-bold border rounded transition ${
                                              reviewForm.status===v
                                                ? "border-blue-600 bg-blue-600 text-white"
                                                : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
                                            }`}>
                                            {label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                      <p className="text-[10px] font-bold uppercase text-blue-600 mb-1.5">Comment (optional)</p>
                                      <input type="text" value={reviewForm.comment}
                                        onChange={e=>setReviewForm(f=>({...f,comment:e.target.value}))}
                                        className="w-full border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 bg-white"
                                        placeholder="Feedback for employee..." />
                                    </div>
                                    <div className="flex items-end gap-2 pt-4">
                                      <button onClick={() => handleReview(log._id)} disabled={saving}
                                        className="bg-blue-600 text-white px-4 py-1.5 text-xs font-bold uppercase hover:bg-blue-700 transition disabled:opacity-50 rounded">
                                        {saving ? "..." : "Save"}
                                      </button>
                                      <button onClick={() => setReviewingId(null)}
                                        className="border border-gray-300 px-3 py-1.5 text-xs font-bold uppercase hover:bg-gray-50 transition rounded">
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}

                      {/* Totals row — like Excel SUM row */}
                      {allLogs.length > 0 && (
                        <tr className="bg-[#e2efda] font-bold sticky bottom-0 border-t-2 border-[#217346]">
                          <td className="border border-gray-300 px-3 py-2 text-center text-[#217346] bg-[#d5e8cd]">Σ</td>
                          <td className="border border-gray-300 px-3 py-2 text-[#217346]">TOTALS</td>
                          <td className="border border-gray-300 px-3 py-2"></td>
                          <td className="border border-gray-300 px-3 py-2"></td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-[10px]">
                            <span className="text-green-700">{allLogs.filter(l=>["submitted","edited"].includes(l.status)).length} ✅</span>
                            {" / "}
                            <span className="text-red-600">{allLogs.filter(l=>l.status==="auto_leave").length} 🚨</span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-[10px] text-gray-500 italic">
                            {allLogs.filter(l=>l.workDescription&&l.status!=="auto_leave").length} entries submitted
                          </td>
                          <td className="border border-gray-300 px-3 py-2"></td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-[10px] text-blue-600">
                            {allLogs.filter(l=>l.reviewStatus).length} reviewed
                          </td>
                          <td className="border border-gray-300 px-3 py-2"></td>
                          <td className="border border-gray-300 px-3 py-2"></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DailyWorkLog;
