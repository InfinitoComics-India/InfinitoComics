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
  const myRoles  = admin?.roles || [];
  const isManager= myRoles.some(r => ["superadmin","hr_manager","manager"].includes(r));

  const [tab,      setTab]      = useState("my");
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
  const [hours, setHours] = useState("");

  // Admin view
  const [adminDate,    setAdminDate]    = useState(new Date().toISOString().split("T")[0]);
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
        setHours(log.hoursWorked?.toString() || "");
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
    if (!hours || parseFloat(hours) <= 0) { setError("Enter valid hours worked."); return; }
    try { setSaving(true); setError(""); setSuccess("");
      const res = await axios.post(`${BASE}/hr/worklog/submit`, { workDescription: work.trim(), hoursWorked: parseFloat(hours) }, auth());
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

        {/* Tabs */}
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

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Hours Worked *</label>
                      <div className="flex items-center gap-3 flex-wrap">
                        <input type="number" min="0.5" max="24" step="0.5" value={hours} onChange={e=>setHours(e.target.value)}
                          className="w-24 border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#DD1215] text-center font-bold"
                          placeholder="8" required />
                        <span className="text-sm text-gray-500">hours</span>
                        <div className="flex gap-2">
                          {[3,4,6,8,10].map(h => (
                            <button key={h} type="button" onClick={() => setHours(h.toString())}
                              className={`px-3 py-1.5 text-xs font-bold border transition rounded ${hours==h?"bg-[#DD1215] text-white border-[#DD1215]":"border-gray-300 text-gray-600 hover:border-[#DD1215]"}`}>
                              {h}h
                            </button>
                          ))}
                        </div>
                      </div>
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
                        {myLog.submittedAt ? `at ${fmtTime(myLog.submittedAt)}` : ""} · {myLog.hoursWorked}h
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
                              {log.hoursWorked > 0 && <span className="text-[10px] text-gray-400">{log.hoursWorked}h</span>}
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

        {/* ── ADMIN REVIEW TAB ── */}
        {tab === "admin" && isManager && (
          <>
            {/* Controls */}
            <div className="bg-white border rounded-lg px-5 py-4 flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Date</label>
                <input type="date" value={adminDate} onChange={e=>setAdminDate(e.target.value)}
                  className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215]" />
              </div>
              <button onClick={() => { loadAllLogs(); loadSummary(); }}
                className="flex items-center gap-1 border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50 transition"><RefreshCw size={13}/></button>
              <button onClick={handleRunCron}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-black transition">
                🌙 Run Midnight Cron
              </button>
            </div>

            {/* Summary */}
            {summary && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  { label:"Total",     value:summary.total,      color:"text-gray-900"  },
                  { label:"Submitted", value:summary.submitted,  color:"text-green-600" },
                  { label:"Auto Leave",value:summary.auto_leave, color:"text-red-600"   },
                  { label:"Pending",   value:summary.pending,    color:"text-yellow-600"},
                  { label:"Reviewed",  value:summary.reviewed,   color:"text-blue-600"  },
                  { label:"Avg Hours", value:`${summary.avgHours}h`, color:"text-purple-600"},
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white border rounded-lg px-4 py-3">
                    <p className={`text-xl font-black ${color}`}>{value}</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Logs list */}
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-12"><Loader size={24} className="animate-spin text-[#DD1215]"/></div>
              ) : allLogs.length === 0 ? (
                <div className="bg-white border rounded-lg text-center py-16 text-gray-400">
                  <ClipboardList size={32} className="mx-auto mb-2 opacity-30"/>
                  <p className="font-semibold">No work logs for this date.</p>
                </div>
              ) : allLogs.map(log => {
                const s  = STATUS_STYLE[log.status] || STATUS_STYLE.pending;
                const SI = s.icon;
                const isExpanded  = expandedLog === log._id;
                const isReviewing = reviewingId === log._id;
                return (
                  <div key={log._id} className="bg-white border rounded-xl overflow-hidden">
                    {/* Log row */}
                    <div className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition"
                      onClick={() => setExpandedLog(isExpanded ? null : log._id)}>
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-xs font-black shrink-0">
                        {log.adminName?.[0]?.toUpperCase() || "?"}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-gray-900 text-sm">{log.adminName || log.adminEmail}</p>
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}>
                            <SI size={9}/> {s.label}
                          </span>
                          {log.reviewStatus && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${REVIEW_STYLE[log.reviewStatus]?.bg} ${REVIEW_STYLE[log.reviewStatus]?.text}`}>
                              {REVIEW_STYLE[log.reviewStatus]?.label}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {log.workDescription || "No description"}
                        </p>
                      </div>
                      {/* Hours */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-gray-900">{log.hoursWorked > 0 ? `${log.hoursWorked}h` : "—"}</p>
                        <p className="text-[10px] text-gray-400">{log.submittedAt ? fmtTime(log.submittedAt) : "—"}</p>
                      </div>
                      {isExpanded ? <ChevronUp size={16} className="text-gray-400 shrink-0"/> : <ChevronDown size={16} className="text-gray-400 shrink-0"/>}
                    </div>

                    {/* Expanded: full description + review */}
                    {isExpanded && (
                      <div className="border-t px-5 pb-5 pt-4 space-y-4">
                        {/* Full work description */}
                        {log.workDescription && log.status !== "auto_leave" && (
                          <div>
                            <p className="text-xs font-bold uppercase text-gray-400 mb-2">Work Description</p>
                            <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                              {log.workDescription}
                            </div>
                          </div>
                        )}

                        {/* Existing review */}
                        {log.reviewStatus && (
                          <div className={`border rounded-lg px-4 py-3 ${REVIEW_STYLE[log.reviewStatus]?.bg}`}>
                            <p className={`text-xs font-bold uppercase ${REVIEW_STYLE[log.reviewStatus]?.text} mb-1`}>Your Review</p>
                            <p className={`font-bold ${REVIEW_STYLE[log.reviewStatus]?.text}`}>{REVIEW_STYLE[log.reviewStatus]?.label}</p>
                            {log.reviewComment && <p className="text-sm text-gray-700 mt-1">"{log.reviewComment}"</p>}
                          </div>
                        )}

                        {/* Review form */}
                        {!isReviewing && log.status !== "auto_leave" && (
                          <button onClick={() => { setReviewingId(log._id); setReviewForm({ status: log.reviewStatus || "", comment: log.reviewComment || "" }); }}
                            className="flex items-center gap-2 text-xs text-blue-600 font-bold hover:underline">
                            <MessageSquare size={13}/> {log.reviewStatus ? "Update Review" : "Add Review"}
                          </button>
                        )}

                        {isReviewing && (
                          <div className="space-y-3 border border-blue-200 bg-blue-50 rounded-lg p-4">
                            <p className="text-xs font-bold uppercase text-blue-600">Add / Update Review</p>
                            <div className="flex gap-2 flex-wrap">
                              {[
                                { v:"approved",          label:"✅ Approve"           },
                                { v:"needs_improvement", label:"⚠️ Needs Improvement" },
                                { v:"rejected",          label:"❌ Needs Redo"        },
                              ].map(({ v, label }) => (
                                <button key={v} onClick={() => setReviewForm(f=>({...f,status:v}))}
                                  className={`px-3 py-1.5 text-xs font-bold border transition rounded ${reviewForm.status===v?"border-blue-600 bg-blue-600 text-white":"border-gray-300 bg-white text-gray-700 hover:border-blue-400"}`}>
                                  {label}
                                </button>
                              ))}
                            </div>
                            <textarea rows={2} value={reviewForm.comment} onChange={e=>setReviewForm(f=>({...f,comment:e.target.value}))}
                              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none bg-white"
                              placeholder="Optional feedback for the employee..." />
                            <div className="flex gap-2">
                              <button onClick={() => handleReview(log._id)} disabled={saving}
                                className="bg-blue-600 text-white px-5 py-2 text-xs font-bold uppercase hover:bg-blue-700 transition disabled:opacity-50 rounded">
                                {saving ? "Saving..." : "Save Review"}
                              </button>
                              <button onClick={() => setReviewingId(null)} className="border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition rounded">
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DailyWorkLog;
