import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Clock, CheckCircle, AlertTriangle, CalendarOff, IndianRupee,
  Target, FileText, User, Send, Loader, LogIn, LogOut as LogOutIcon,
  ClipboardList, Headphones, TrendingUp, Lock
} from "lucide-react";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const STATUS_COLORS = {
  present:  "bg-green-100 text-green-700",
  absent:   "bg-red-100 text-red-700",
  late:     "bg-yellow-100 text-yellow-700",
  half_day: "bg-orange-100 text-orange-700",
  on_leave: "bg-blue-100 text-blue-700",
  holiday:  "bg-purple-100 text-purple-700",
  weekend:  "bg-gray-100 text-gray-400",
};
const fmt      = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fmtTime  = (d) => d ? new Date(d).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}) : "—";
const fmtShort = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "—";
const INR      = (n) => `₹${Number(n||0).toLocaleString("en-IN")}`;

// Countdown to midnight IST
const getCountdown = () => {
  const ist = new Date(new Date().getTime() + 5.5*60*60*1000);
  const h = ist.getUTCHours(), m = ist.getUTCMinutes();
  return { minsLeft:(23-h)*60+(59-m), timeStr:`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}` };
};

const TABS = [
  { key:"attendance",  label:"Attendance",  icon:Clock          },
  { key:"worklog",     label:"Work Log",     icon:ClipboardList  },
  { key:"leave",       label:"My Leave",     icon:CalendarOff    },
  { key:"payslips",    label:"Payslips",     icon:IndianRupee    },
  { key:"goals",       label:"My Goals",     icon:Target         },
  { key:"documents",   label:"Documents",    icon:FileText       },
  { key:"requests",    label:"Requests",     icon:Headphones     },
  { key:"performance", label:"Performance",  icon:TrendingUp     },
];

const EmployeePortal = () => {
  const admin    = JSON.parse(localStorage.getItem("Admin") || "{}");
  const myId     = admin?._id || admin?.id || "";
  const myName   = admin?.name || admin?.email?.split("@")[0] || "Employee";
  const myEmail  = admin?.email || "";

  const [tab,        setTab]        = useState("attendance");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [countdown,  setCountdown]  = useState(getCountdown());

  // Attendance state
  const [todayAttd,  setTodayAttd]  = useState(null);
  const [monthlyAttd,setMonthlyAttd]= useState([]);
  const [attdMonth,  setAttdMonth]  = useState(new Date().getMonth()+1);
  const [attdYear,   setAttdYear]   = useState(new Date().getFullYear());
  const [clocking,   setClocking]   = useState(false);

  // Work log state
  const [myLog,      setMyLog]      = useState(null);
  const [workHistory,setWorkHistory]= useState([]);
  const [workDesc,   setWorkDesc]   = useState("");
  const [workHours,  setWorkHours]  = useState("");
  const [workSaving, setWorkSaving] = useState(false);

  // Leave state
  const [leaves,     setLeaves]     = useState([]);
  const [leaveBalance,setLeaveBalance]=useState(null);
  const [applyModal, setApplyModal] = useState(false);
  const [leaveForm,  setLeaveForm]  = useState({ leaveType:"casual", fromDate:"", toDate:"", reason:"", isHalfDay:false });
  const [leaveSaving,setLeaveSaving]= useState(false);

  // Payslips
  const [payslips,   setPayslips]   = useState([]);
  const [selPayslip, setSelPayslip] = useState(null);

  // Goals
  const [goals,      setGoals]      = useState([]);
  const [progModal,  setProgModal]  = useState(null);
  const [progVal,    setProgVal]    = useState("");

  // Documents
  const [docs,       setDocs]       = useState([]);

  // Self-service requests
  const [requests,   setRequests]   = useState([]);
  const [reqModal,   setReqModal]   = useState(false);
  const [reqForm,    setReqForm]    = useState({ type:"document_request", subject:"", description:"", priority:"medium" });
  const [reqSaving,  setReqSaving]  = useState(false);

  // Performance
  const [perfHistory,setPerfHistory]= useState([]);

  useEffect(() => {
    const t = setInterval(() => setCountdown(getCountdown()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setError(""); setSuccess("");
    if (tab === "attendance")  { loadTodayAttd(); loadMonthlyAttd(); }
    if (tab === "worklog")     { loadMyLog(); loadWorkHistory(); }
    if (tab === "leave")       { loadLeaves(); loadLeaveBalance(); }
    if (tab === "payslips")    loadPayslips();
    if (tab === "goals")       loadGoals();
    if (tab === "documents")   loadDocs();
    if (tab === "requests")    loadRequests();
    if (tab === "performance") loadPerformance();
  }, [tab]);

  useEffect(() => { if (tab === "attendance") loadMonthlyAttd(); }, [attdMonth, attdYear]);

  // ── Loaders ──────────────────────────────────────────────────
  const loadTodayAttd = async () => {
    try { const r = await axios.get(`${BASE}/hr/attendance/me/today`, auth()); setTodayAttd(r.data.data); } catch {}
  };
  const loadMonthlyAttd = async () => {
    try { const r = await axios.get(`${BASE}/hr/attendance/me/monthly`, { ...auth(), params:{ year:attdYear, month:attdMonth } }); setMonthlyAttd(r.data.data||[]); } catch {}
  };
  const loadMyLog = async () => {
    try {
      const r = await axios.get(`${BASE}/hr/worklog/my/today`, auth());
      const log = r.data.data;
      setMyLog(log);
      if (log && !log.isLocked) { setWorkDesc(log.workDescription||""); setWorkHours(log.hoursWorked?.toString()||""); }
    } catch {}
  };
  const loadWorkHistory = async () => {
    try { const r = await axios.get(`${BASE}/hr/worklog/my/history`, auth()); setWorkHistory(r.data.data||[]); } catch {}
  };
  const loadLeaves = async () => {
    try { const r = await axios.get(`${BASE}/hr/leaves/employee/${myId}`, auth()); setLeaves(r.data.data||[]); } catch {}
  };
  const loadLeaveBalance = async () => {
    try { const r = await axios.get(`${BASE}/hr/leaves/balance/${myId}`, auth()); setLeaveBalance(r.data.data); } catch {}
  };
  const loadPayslips = async () => {
    try { const r = await axios.get(`${BASE}/hr/payroll/employee/${myId}`, auth()); setPayslips(r.data.data||[]); } catch {}
  };
  const loadGoals = async () => {
    try { const r = await axios.get(`${BASE}/hr/goals/employee/${myId}`, auth()); setGoals(r.data.data||[]); } catch {}
  };
  const loadDocs = async () => {
    try { const r = await axios.get(`${BASE}/hr/documents/employee/${myId}`, auth()); setDocs(r.data.data||[]); } catch {}
  };
  const loadRequests = async () => {
    try { const r = await axios.get(`${BASE}/hr/self-service/employee/${myId}`, auth()); setRequests(r.data.data||[]); } catch {}
  };
  const loadPerformance = async () => {
    try { const r = await axios.get(`${BASE}/hr/performance/${myId}`, auth()); setPerfHistory(r.data.data||[]); } catch {}
  };

  // ── Actions ──────────────────────────────────────────────────
  const handleClockIn = async () => {
    try { setClocking(true); setError(""); setSuccess("");
      const r = await axios.post(`${BASE}/hr/attendance/me/clockin`, {}, auth());
      setTodayAttd(r.data.data);
      setSuccess("✅ Clocked in successfully!");
    } catch (e) { setError(e.response?.data?.message||"Failed to clock in."); } finally { setClocking(false); }
  };
  const handleClockOut = async () => {
    try { setClocking(true); setError(""); setSuccess("");
      const r = await axios.post(`${BASE}/hr/attendance/me/clockout`, {}, auth());
      setTodayAttd(r.data.data);
      setSuccess("✅ Clocked out successfully!");
    } catch (e) { setError(e.response?.data?.message||"Failed to clock out."); } finally { setClocking(false); }
  };

  const handleWorkSubmit = async (e) => {
    e.preventDefault();
    if (!workDesc.trim()) { setError("Work description required."); return; }
    if (!workHours || parseFloat(workHours)<=0) { setError("Enter valid hours."); return; }
    try { setWorkSaving(true); setError(""); setSuccess("");
      const r = await axios.post(`${BASE}/hr/worklog/submit`, { workDescription:workDesc.trim(), hoursWorked:parseFloat(workHours) }, auth());
      setMyLog(r.data.data); setSuccess(myLog?"✅ Updated!":"✅ Submitted!"); loadWorkHistory();
    } catch (e) { setError(e.response?.data?.message||"Failed."); } finally { setWorkSaving(false); }
  };

  const handleApplyLeave = async () => {
    if (!leaveForm.fromDate||!leaveForm.toDate||!leaveForm.reason) { setError("All fields required."); return; }
    try { setLeaveSaving(true); setError(""); setSuccess("");
      await axios.post(`${BASE}/hr/leaves/apply`, { ...leaveForm, employeeId:myId }, auth());
      setApplyModal(false); setLeaveForm({ leaveType:"casual", fromDate:"", toDate:"", reason:"", isHalfDay:false });
      setSuccess("✅ Leave application submitted!"); loadLeaves(); loadLeaveBalance();
    } catch (e) { setError(e.response?.data?.message||"Failed."); } finally { setLeaveSaving(false); }
  };

  const handleCancelLeave = async (id) => {
    try { await axios.patch(`${BASE}/hr/leaves/cancel/${id}`, {}, auth()); loadLeaves(); loadLeaveBalance(); }
    catch (e) { setError(e.response?.data?.message||"Failed."); }
  };

  const handleUpdateProgress = async () => {
    if (!progModal||progVal==="") return;
    try {
      await axios.patch(`${BASE}/hr/goals/progress/${progModal._id}`, { currentValue:parseFloat(progVal) }, auth());
      setProgModal(null); setProgVal(""); loadGoals();
    } catch (e) { setError(e.response?.data?.message||"Failed."); }
  };

  const handleSubmitRequest = async () => {
    if (!reqForm.subject) { setError("Subject required."); return; }
    try { setReqSaving(true); setError(""); setSuccess("");
      await axios.post(`${BASE}/hr/self-service/submit`, { ...reqForm, employeeId:myId }, auth());
      setReqModal(false); setReqForm({ type:"document_request", subject:"", description:"", priority:"medium" });
      setSuccess("✅ Request submitted!"); loadRequests();
    } catch (e) { setError(e.response?.data?.message||"Failed."); } finally { setReqSaving(false); }
  };

  const { minsLeft, timeStr } = countdown;
  const workLocked = myLog?.isLocked;
  const workSubmitted = myLog && ["submitted","edited"].includes(myLog.status);

  // Build monthly calendar grid
  const buildGrid = () => {
    const daysInMonth = new Date(attdYear, attdMonth, 0).getDate();
    return Array.from({ length:daysInMonth }, (_, i) => {
      const d = new Date(attdYear, attdMonth-1, i+1);
      const rec = monthlyAttd.find(r => new Date(r.date).getDate() === i+1);
      return { day:i+1, date:d, rec };
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-widest text-gray-900">EMPLOYEE PORTAL</h1>
          <p className="text-xs text-gray-400 mt-0.5">Welcome, <strong>{myName}</strong> · {myEmail}</p>
        </div>
        <div className="text-xs text-gray-500 font-semibold">{timeStr} IST</div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b px-6 flex gap-0 overflow-x-auto">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition ${
                tab===t.key?"border-[#DD1215] text-[#DD1215]":"border-transparent text-gray-500 hover:text-gray-800"}`}>
              <Icon size={13}/>{t.label}
            </button>
          );
        })}
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">
        {error   && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded flex items-center gap-2"><AlertTriangle size={14}/>{error}<button onClick={()=>setError("")} className="ml-auto text-red-400 hover:text-red-700">✕</button></div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded">{success}</div>}

        {/* ── ATTENDANCE ── */}
        {tab === "attendance" && (
          <div className="space-y-5">
            {/* Clock in/out card */}
            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Today — {fmt(new Date())}</p>
                {todayAttd && (
                  <div className="flex items-center gap-3">
                    {/* Total hours badge */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-center">
                      <p className="text-[10px] text-blue-500 font-bold uppercase">Total Hours</p>
                      <p className="text-lg font-black text-blue-700">{(todayAttd.totalHours || todayAttd.hoursWorked || 0).toFixed(1)}h</p>
                    </div>
                    {/* Status badge */}
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${STATUS_COLORS[todayAttd.status]||"bg-gray-100 text-gray-600"}`}>
                      {todayAttd.status?.replace("_"," ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Sessions list */}
              {todayAttd?.sessions?.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {todayAttd.sessions.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2.5 text-xs">
                      <span className="w-6 h-6 rounded-full bg-[#DD1215] text-white flex items-center justify-center font-black text-[10px] shrink-0">{i+1}</span>
                      <div className="flex-1">
                        <span className="text-green-700 font-bold">IN: {fmtTime(s.clockIn)}</span>
                        {s.clockOut ? (
                          <span className="text-red-600 font-bold ml-4">OUT: {fmtTime(s.clockOut)}</span>
                        ) : (
                          <span className="text-yellow-600 font-semibold ml-4 animate-pulse">● Currently working</span>
                        )}
                      </div>
                      {s.clockOut && (
                        <span className="text-gray-500 font-semibold">{s.hoursWorked}h</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : todayAttd?.clockIn ? (
                // Legacy single session display
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2.5 text-xs">
                    <span className="w-6 h-6 rounded-full bg-[#DD1215] text-white flex items-center justify-center font-black text-[10px] shrink-0">1</span>
                    <div className="flex-1">
                      <span className="text-green-700 font-bold">IN: {fmtTime(todayAttd.clockIn)}</span>
                      {todayAttd.clockOut ? (
                        <span className="text-red-600 font-bold ml-4">OUT: {fmtTime(todayAttd.clockOut)}</span>
                      ) : (
                        <span className="text-yellow-600 font-semibold ml-4 animate-pulse">● Currently working</span>
                      )}
                    </div>
                    {todayAttd.clockOut && (
                      <span className="text-gray-500 font-semibold">{todayAttd.hoursWorked}h</span>
                    )}
                  </div>
                </div>
              ) : !todayAttd ? (
                <div className="flex items-center gap-2 text-gray-400 mb-4">
                  <Clock size={20}/>
                  <div><p className="font-black text-gray-700">Not Clocked In</p><p className="text-xs">Tap Clock In to start your session</p></div>
                </div>
              ) : null}

              {/* Buttons */}
              <div className="flex gap-3 flex-wrap">
                {(() => {
                  const sessions = todayAttd?.sessions || [];
                  const lastSession = sessions[sessions.length - 1];
                  // Check sessions array OR legacy clockIn/clockOut fields
                  const isCurrentlyIn = 
                    (sessions.length > 0 && !lastSession?.clockOut) ||
                    (sessions.length === 0 && todayAttd?.clockIn && !todayAttd?.clockOut);
                  if (isCurrentlyIn) {
                    return (
                      <button onClick={handleClockOut} disabled={clocking}
                        className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-red-700 transition disabled:opacity-50 rounded-lg">
                        <LogOutIcon size={16}/> {clocking ? "Clocking Out..." : "Clock Out"}
                      </button>
                    );
                  }
                  const hasAnySessions = sessions.length > 0 || todayAttd?.clockOut;
                  return (
                    <button onClick={handleClockIn} disabled={clocking}
                      className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-green-700 transition disabled:opacity-50 rounded-lg">
                      <LogIn size={16}/> {clocking ? "Clocking In..." : hasAnySessions ? "Clock In Again" : "Clock In"}
                    </button>
                  );
                })()}
                {todayAttd && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {todayAttd.isLate && <span className="text-yellow-600 font-semibold">⚠️ Late by {todayAttd.lateByMinutes} mins</span>}
                    <span>{(todayAttd.sessions||[]).length} session{(todayAttd.sessions||[]).length !== 1 ? "s" : ""} today</span>
                  </div>
                )}
              </div>
            </div>

            {/* Monthly calendar */}
            <div className="bg-white border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Monthly View</p>
                <div className="flex items-center gap-2">
                  <select value={attdMonth} onChange={e=>setAttdMonth(parseInt(e.target.value))} className="border border-gray-300 px-2 py-1 text-xs focus:outline-none">
                    {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
                  </select>
                  <input type="number" value={attdYear} onChange={e=>setAttdYear(parseInt(e.target.value))} className="border border-gray-300 px-2 py-1 text-xs w-16 focus:outline-none"/>
                </div>
              </div>
              <div className="grid grid-cols-7 border-b">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} className="py-2 text-center text-[10px] font-bold text-gray-400">{d}</div>)}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({length:new Date(attdYear,attdMonth-1,1).getDay()}).map((_,i)=>(
                  <div key={i} className="border-b border-r min-h-[52px] bg-gray-50/40"/>
                ))}
                {buildGrid().map(({day,date,rec})=>{
                  const isToday = date.toDateString()===new Date().toDateString();
                  const isWeekend = date.getDay()===0||date.getDay()===6;
                  const sc = rec ? STATUS_COLORS[rec.status] : isWeekend ? "bg-gray-100 text-gray-400" : null;
                  return (
                    <div key={day} className={`border-b border-r min-h-[52px] p-1.5 ${isToday?"bg-red-50":""}`}>
                      <p className={`text-[10px] font-bold mb-1 w-5 h-5 flex items-center justify-center rounded-full ${isToday?"bg-[#DD1215] text-white":"text-gray-600"}`}>{day}</p>
                      {sc && <span className={`text-[8px] px-1 py-0.5 rounded font-semibold ${sc}`}>{rec?.status?.replace("_","")?.substring(0,4)||"week"}</span>}
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="px-4 py-3 flex flex-wrap gap-3">
                {Object.entries(STATUS_COLORS).map(([k,v])=>(
                  <span key={k} className={`text-[9px] px-2 py-0.5 rounded-full font-bold capitalize ${v}`}>{k.replace("_"," ")}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── WORK LOG ── */}
        {tab === "worklog" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white border rounded-xl overflow-hidden">
              <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
                <div><p className="font-black text-lg">{fmt(new Date())}</p><p className="text-xs text-gray-400">Your daily work update</p></div>
                {workLocked && <div className="flex items-center gap-1.5 bg-red-900/50 text-red-300 px-3 py-1.5 rounded text-xs font-semibold"><Lock size={12}/>Locked</div>}
                {workSubmitted && !workLocked && <div className="flex items-center gap-1.5 bg-green-900/50 text-green-300 px-3 py-1.5 rounded text-xs font-semibold"><CheckCircle size={12}/>Submitted {fmtTime(myLog.submittedAt)}</div>}
              </div>
              <div className="p-6">
                {workLocked ? (
                  <div className="text-center py-12 text-gray-400">
                    <Lock size={36} className="mx-auto mb-3 opacity-30"/>
                    <p className="font-semibold">Locked after midnight IST.</p>
                    {myLog?.status==="auto_leave" && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">⚠️ Auto-marked as <strong>on leave</strong>.</div>}
                  </div>
                ) : (
                  <form onSubmit={handleWorkSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">What did you work on today? *</label>
                      <textarea rows={6} value={workDesc} onChange={e=>setWorkDesc(e.target.value)}
                        className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#DD1215] resize-none"
                        placeholder="• Completed task X&#10;• Fixed bug in Y&#10;• Attended team standup&#10;• Reviewed PR from..." required/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Hours Worked *</label>
                      <div className="flex items-center gap-3">
                        <input type="number" min="0.5" max="24" step="0.5" value={workHours} onChange={e=>setWorkHours(e.target.value)}
                          className="w-24 border border-gray-300 px-3 py-2 text-sm text-center font-bold focus:outline-none focus:border-[#DD1215]"/>
                        <div className="flex gap-1.5">
                          {[3,4,6,8].map(h=>(
                            <button key={h} type="button" onClick={()=>setWorkHours(h.toString())}
                              className={`px-3 py-1.5 text-xs font-bold border rounded transition ${workHours==h?"bg-[#DD1215] text-white border-[#DD1215]":"border-gray-300 text-gray-600 hover:border-[#DD1215]"}`}>{h}h</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button type="submit" disabled={workSaving}
                      className="w-full bg-[#DD1215] text-white py-3 text-xs font-black uppercase tracking-widest hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                      <Send size={14}/>{workSaving?"Saving...":workSubmitted?"Update Work Log":"Submit Work Log"}
                    </button>
                    {!workSubmitted && <p className="text-[10px] text-center text-gray-400">⚠️ Not submitted by midnight = auto-marked as <strong>on leave</strong>.</p>}
                  </form>
                )}
              </div>
            </div>
            {/* History */}
            <div className="bg-white border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b"><p className="text-xs font-bold uppercase tracking-widest text-gray-500">Recent History</p></div>
              <div className="divide-y max-h-80 overflow-y-auto">
                {workHistory.length===0 ? <p className="text-xs text-gray-400 p-4 text-center">No logs yet.</p> :
                workHistory.map(l=>(
                  <div key={l._id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-semibold text-gray-700">{fmtShort(l.date)}</p>
                      <div className="flex items-center gap-1.5">
                        {l.hoursWorked>0&&<span className="text-[10px] text-gray-400">{l.hoursWorked}h</span>}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${l.status==="auto_leave"?"bg-red-100 text-red-700":l.status==="pending"?"bg-yellow-100 text-yellow-700":"bg-green-100 text-green-700"}`}>
                          {l.status==="auto_leave"?"Leave":l.status==="pending"?"Pending":"Done"}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">{l.workDescription||"—"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LEAVE ── */}
        {tab === "leave" && (
          <div className="space-y-5">
            {/* Balance cards */}
            {leaveBalance?.balance && (
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                {Object.entries(leaveBalance.balance).map(([type,days])=>{
                  const used = leaveBalance.used?.find(u=>u._id===type)?.totalDaysUsed||0;
                  return (
                    <div key={type} className="bg-white border rounded-lg px-4 py-3">
                      <p className="text-[10px] font-bold uppercase text-gray-400 capitalize mb-1">{type}</p>
                      <p className="text-2xl font-black text-gray-900">{days}</p>
                      <p className="text-[10px] text-gray-400">available · {used} used</p>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex justify-end">
              <button onClick={()=>{setApplyModal(true);setError("");}}
                className="bg-[#DD1215] text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
                + Apply for Leave
              </button>
            </div>
            {/* Leave history */}
            <div className="bg-white border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b"><p className="text-xs font-bold uppercase tracking-widest text-gray-500">My Leave Requests</p></div>
              {leaves.length===0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">No leave requests yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50"><tr>{["Type","From","To","Days","Reason","Status","Actions"].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {leaves.map(l=>(
                        <tr key={l._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-xs font-semibold capitalize">{l.leaveType}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{fmt(l.fromDate)}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{fmt(l.toDate)}</td>
                          <td className="px-4 py-3 text-xs font-bold text-gray-700">{l.totalDays}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 max-w-[140px] truncate">{l.reason}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${l.status==="approved"?"bg-green-100 text-green-700":l.status==="rejected"?"bg-red-100 text-red-700":l.status==="cancelled"?"bg-gray-100 text-gray-500":"bg-yellow-100 text-yellow-700"}`}>{l.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            {["pending","approved"].includes(l.status) && (
                              <button onClick={()=>handleCancelLeave(l._id)} className="text-xs text-red-500 hover:underline font-semibold">Cancel</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PAYSLIPS ── */}
        {tab === "payslips" && (
          <div className="space-y-3">
            {payslips.length===0 ? (
              <div className="bg-white border rounded-xl text-center py-16 text-gray-400"><IndianRupee size={36} className="mx-auto mb-3 opacity-30"/><p>No payslips yet.</p></div>
            ) : payslips.map(slip=>(
              <div key={slip._id} className="bg-white border rounded-xl px-6 py-4 flex flex-wrap items-center justify-between gap-4 hover:border-gray-300 transition">
                <div>
                  <p className="font-black text-gray-900">{MONTHS[(slip.month||1)-1]} {slip.year}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Gross: {INR(slip.grossSalary)} · Deductions: {INR(slip.totalDeductions)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xl font-black text-green-700">{INR(slip.netSalary)}</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${slip.status==="paid"?"bg-green-100 text-green-700":slip.status==="approved"?"bg-blue-100 text-blue-700":"bg-yellow-100 text-yellow-700"}`}>{slip.status}</span>
                  <button onClick={()=>setSelPayslip(selPayslip?._id===slip._id?null:slip)} className="text-xs text-blue-600 hover:underline font-semibold">
                    {selPayslip?._id===slip._id?"Hide":"View"}
                  </button>
                </div>
                {selPayslip?._id===slip._id && (
                  <div className="w-full border-t pt-4 mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {[["Basic",slip.basic],["HRA",slip.hra],["Travel",slip.ta],["Medical",slip.medical],["Special",slip.special],["PF",`-${INR(slip.pf)}`],["TDS",`-${INR(slip.tds)}`],["Loss of Pay",`-${INR(slip.lossOfPay)}`]].map(([l,v])=>(
                      <div key={l} className="bg-gray-50 rounded px-3 py-2"><p className="text-[10px] text-gray-400">{l}</p><p className="font-bold text-gray-800">{typeof v==="number"?INR(v):v}</p></div>
                    ))}
                    <div className="col-span-2 sm:col-span-4 bg-green-50 border border-green-200 rounded px-4 py-2 flex items-center justify-between">
                      <p className="font-black text-green-800">Net Salary</p>
                      <p className="font-black text-xl text-green-800">{INR(slip.netSalary)}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── GOALS ── */}
        {tab === "goals" && (
          <div className="space-y-3">
            {goals.length===0 ? (
              <div className="bg-white border rounded-xl text-center py-16 text-gray-400"><Target size={36} className="mx-auto mb-3 opacity-30"/><p>No goals set yet. Your manager will set goals for you.</p></div>
            ) : goals.map(g=>{
              const pct = g.targetValue>0?Math.min(100,Math.round((g.currentValue/g.targetValue)*100)):0;
              const isOverdue = g.status==="active"&&new Date(g.deadline)<new Date();
              return (
                <div key={g._id} className={`bg-white border rounded-xl p-5 ${isOverdue?"border-l-4 border-l-red-500":""}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${g.status==="completed"?"bg-green-100 text-green-700":isOverdue?"bg-red-100 text-red-700":"bg-blue-100 text-blue-700"}`}>{g.status}</span>
                        <span className="text-[10px] capitalize text-gray-400">{g.category} · {g.period}</span>
                      </div>
                      <p className="font-semibold text-gray-900">{g.title}</p>
                    </div>
                    {g.status==="active" && (
                      <button onClick={()=>{setProgModal(g);setProgVal(String(g.currentValue));}}
                        className="text-xs text-blue-600 hover:underline font-semibold shrink-0">Update</button>
                    )}
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">{g.currentValue}/{g.targetValue} {g.unit}</span>
                      <span className="text-xs font-bold text-gray-700">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${g.status==="completed"?"bg-green-500":isOverdue?"bg-red-500":"bg-[#DD1215]"}`} style={{width:`${pct}%`}}/>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400">Deadline: {fmt(g.deadline)}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── DOCUMENTS ── */}
        {tab === "documents" && (
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b"><p className="text-xs font-bold uppercase tracking-widest text-gray-500">My HR Documents ({docs.length})</p></div>
            {docs.length===0 ? (
              <div className="text-center py-16 text-gray-400 text-sm"><FileText size={32} className="mx-auto mb-2 opacity-30"/>No documents yet.</div>
            ) : (
              <div className="divide-y">
                {docs.map(d=>(
                  <div key={d._id} className="px-5 py-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{d.title||d.fileName}</p>
                      <p className="text-xs text-gray-400 capitalize">{d.category?.replace(/_/g," ")} · {fmt(d.issueDate)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${d.status==="active"?"bg-green-100 text-green-700":d.status==="pending_signature"?"bg-yellow-100 text-yellow-700":"bg-gray-100 text-gray-500"}`}>{d.status?.replace(/_/g," ")}</span>
                      {d.fileUrl && <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline font-semibold">Open</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SELF SERVICE REQUESTS ── */}
        {tab === "requests" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={()=>{setReqModal(true);setError("");}}
                className="bg-[#DD1215] text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
                + New Request
              </button>
            </div>
            {requests.length===0 ? (
              <div className="bg-white border rounded-xl text-center py-16 text-gray-400"><Headphones size={36} className="mx-auto mb-3 opacity-30"/><p>No requests submitted yet.</p></div>
            ) : requests.map(r=>(
              <div key={r._id} className="bg-white border rounded-xl px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{r.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{r.type?.replace(/_/g," ")} · {fmt(r.createdAt)}</p>
                    {r.description && <p className="text-xs text-gray-500 mt-1 italic">"{r.description}"</p>}
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold shrink-0 ${r.status==="resolved"?"bg-green-100 text-green-700":r.status==="in_progress"?"bg-blue-100 text-blue-700":r.status==="closed"?"bg-gray-100 text-gray-500":"bg-yellow-100 text-yellow-700"}`}>{r.status}</span>
                </div>
                {r.resolution && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded px-3 py-2">
                    <p className="text-[10px] font-bold text-green-700 mb-0.5">HR Resolution</p>
                    <p className="text-xs text-green-800">{r.resolution}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── PERFORMANCE ── */}
        {tab === "performance" && (
          <div className="space-y-4">
            {perfHistory.length===0 ? (
              <div className="bg-white border rounded-xl text-center py-16 text-gray-400"><TrendingUp size={36} className="mx-auto mb-3 opacity-30"/><p>No performance reviews yet.</p></div>
            ) : perfHistory.map(p=>(
              <div key={p._id} className="bg-white border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-black text-gray-900">{MONTHS[(p.period?.month||1)-1]} {p.period?.year}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center font-black text-sm" style={{borderColor:p.overallScore>=70?"#22c55e":p.overallScore>=50?"#f59e0b":"#ef4444",color:p.overallScore>=70?"#22c55e":p.overallScore>=50?"#f59e0b":"#ef4444"}}>
                      {p.overallScore}
                    </div>
                    <div><p className="text-xs font-bold text-gray-700">{p.overallScore}/100</p><p className={`text-[10px] ${p.status==="published"?"text-green-600":"text-yellow-600"}`}>{p.status}</p></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[["Completion Rate",`${p.productivity?.completionRate||0}%`],["Attendance",`${p.reliability?.attendanceRate||0}%`],["Tasks Done",p.productivity?.tasksCompleted||0],["Revisions",p.quality?.revisionCount||0]].map(([l,v])=>(
                    <div key={l} className="bg-gray-50 rounded px-3 py-2"><p className="text-[10px] text-gray-400">{l}</p><p className="font-bold text-gray-800">{v}</p></div>
                  ))}
                </div>
                {p.managerScore?.comment && (
                  <div className="mt-3 bg-blue-50 border border-blue-100 rounded px-3 py-2">
                    <p className="text-[10px] font-bold text-blue-700 mb-0.5">Manager Comment</p>
                    <p className="text-xs text-blue-800 italic">"{p.managerScore.comment}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Apply Leave Modal ── */}
      {applyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-5">Apply for Leave</h3>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Leave Type</label>
                <select value={leaveForm.leaveType} onChange={e=>setLeaveForm(f=>({...f,leaveType:e.target.value}))} className={inp}>
                  {["casual","sick","earned","unpaid","maternity","paternity","bereavement"].map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">From *</label><input type="date" value={leaveForm.fromDate} onChange={e=>setLeaveForm(f=>({...f,fromDate:e.target.value}))} className={inp}/></div>
                <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">To *</label><input type="date" value={leaveForm.toDate} onChange={e=>setLeaveForm(f=>({...f,toDate:e.target.value}))} className={inp}/></div>
              </div>
              <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Reason *</label><textarea rows={3} value={leaveForm.reason} onChange={e=>setLeaveForm(f=>({...f,reason:e.target.value}))} className={`${inp} resize-none`} required/></div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" checked={leaveForm.isHalfDay} onChange={e=>setLeaveForm(f=>({...f,isHalfDay:e.target.checked}))} className="w-4 h-4 accent-[#DD1215]"/>Half day leave</label>
            </div>
            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={()=>{setApplyModal(false);setError("");}} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleApplyLeave} disabled={leaveSaving} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">{leaveSaving?"Applying...":"Apply"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Update Goal Progress Modal ── */}
      {progModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-2">Update Progress</h3>
            <p className="text-sm text-gray-500 mb-4">{progModal.title} · Target: {progModal.targetValue} {progModal.unit}</p>
            <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Current Value ({progModal.unit})</label>
              <input type="number" value={progVal} onChange={e=>setProgVal(e.target.value)} className={inp}/>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setProgModal(null)} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleUpdateProgress} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition">Update</button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Request Modal ── */}
      {reqModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-5">New Request</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Type</label>
                  <select value={reqForm.type} onChange={e=>setReqForm(f=>({...f,type:e.target.value}))} className={inp}>
                    {["leave_application","document_request","address_update","bank_update","profile_update","attendance_correction","salary_query","other"].map(t=><option key={t} value={t}>{t.replace(/_/g," ")}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Priority</label>
                  <select value={reqForm.priority} onChange={e=>setReqForm(f=>({...f,priority:e.target.value}))} className={inp}>
                    {["low","medium","high"].map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Subject *</label><input type="text" value={reqForm.subject} onChange={e=>setReqForm(f=>({...f,subject:e.target.value}))} className={inp} required/></div>
              <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Description</label><textarea rows={3} value={reqForm.description} onChange={e=>setReqForm(f=>({...f,description:e.target.value}))} className={`${inp} resize-none`}/></div>
            </div>
            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={()=>{setReqModal(false);setError("");}} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSubmitRequest} disabled={reqSaving} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">{reqSaving?"Submitting...":"Submit"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inp = "w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] bg-white";

export default EmployeePortal;
