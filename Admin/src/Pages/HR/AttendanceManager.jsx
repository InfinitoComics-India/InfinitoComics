import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Loader, Calendar, Users } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const STATUS_STYLE = {
  present:  { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500",  label: "Present"  },
  absent:   { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500",    label: "Absent"   },
  late:     { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500", label: "Late"     },
  half_day: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500", label: "Half Day" },
  on_leave: { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500",   label: "On Leave" },
  holiday:  { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-400", label: "Holiday"  },
  weekend:  { bg: "bg-gray-100",   text: "text-gray-400",   dot: "bg-gray-300",   label: "Weekend"  },
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const fmt     = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" }) : "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { weekday:"short", day:"2-digit", month:"short" }) : "—";
const isoDate = (d) => new Date(d).toISOString().split("T")[0];

const AttendanceManager = () => {
  const now = new Date();
  const [tab, setTab]               = useState("week");
  const [weekRecords, setWeekRecs]  = useState([]);
  const [monthAll, setMonthAll]     = useState({ records: [], employees: [] });
  const [year,  setYear]            = useState(now.getFullYear());
  const [month, setMonth]           = useState(now.getMonth() + 1);
  const [loading, setLoading]       = useState(false);
  const [error,   setError]         = useState("");
  const [markModal, setMarkModal]   = useState(null);
  const [markForm,  setMarkForm]    = useState({ date:"", status:"present", note:"" });
  const [marking,   setMarking]     = useState(false);

  // Build last-7 date labels
  const last7Dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const loadWeek = async () => {
    try { setLoading(true); setError("");
      const r = await axios.get(`${BASE}/hr/attendance/last7days`, auth());
      setWeekRecs(r.data.data || []);
    } catch { setError("Failed to load attendance."); }
    finally { setLoading(false); }
  };

  const loadMonthAll = async () => {
    try { setLoading(true); setError("");
      const r = await axios.get(`${BASE}/hr/attendance/monthly-all`, { ...auth(), params: { year, month } });
      setMonthAll(r.data.data || { records: [], employees: [] });
    } catch { setError("Failed to load monthly attendance."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (tab === "week")    loadWeek();     }, [tab]);
  useEffect(() => { if (tab === "monthly") loadMonthAll(); }, [tab, month, year]);

  const handleMark = async () => {
    if (!markForm.date || !markForm.status) return;
    try { setMarking(true);
      await axios.patch(`${BASE}/hr/attendance/correct/${markModal.recordId}`, markForm, auth());
      setMarkModal(null);
      if (tab === "week") loadWeek(); else loadMonthAll();
    } catch (e) { setError(e.response?.data?.message || "Failed to mark."); }
    finally { setMarking(false); }
  };

  // ── Week view helpers ─────────────────────────────────────
  // Group records by employeeId key
  const weekByEmp = {};
  for (const rec of weekRecords) {
    const empId = rec.employeeId?._id || rec.employeeId;
    if (!empId) continue;
    if (!weekByEmp[empId]) weekByEmp[empId] = { emp: rec.employeeId, rows: {} };
    const key = isoDate(rec.date);
    weekByEmp[empId].rows[key] = rec;
  }
  const weekEmployees = Object.values(weekByEmp);

  // Summary counts across all 7 days
  const weekCounts = weekRecords.reduce((a, r) => { a[r.status] = (a[r.status]||0)+1; return a; }, {});

  // ── Monthly view helpers ──────────────────────────────────
  const daysInMonth   = new Date(year, month, 0).getDate();
  const allDays       = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const { records: mRecords, employees: mEmployees } = monthAll;

  // Build map: empId → { day → record }
  const monthMap = {};
  for (const rec of mRecords) {
    const empId = rec.employeeId?._id?.toString() || rec.employeeId?.toString();
    if (!empId) continue;
    if (!monthMap[empId]) monthMap[empId] = {};
    const d = new Date(rec.date).getDate();
    monthMap[empId][d] = rec;
  }

  // Per-employee monthly summary
  const empSummary = (empId) => {
    const rows = monthMap[empId] || {};
    let present=0, absent=0, late=0, leave=0;
    for (const d of allDays) {
      const r = rows[d];
      const isWeekend = new Date(year, month-1, d).getDay() === 0 || new Date(year, month-1, d).getDay() === 6;
      if (!r && !isWeekend) absent++;
      if (r?.status === "present") present++;
      if (r?.status === "late")    { present++; late++; }
      if (r?.status === "on_leave") leave++;
    }
    return { present, absent, late, leave };
  };

  const StatusPill = ({ status }) => {
    const s = STATUS_STYLE[status] || STATUS_STYLE.absent;
    return <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  const StatusDot = ({ status }) => {
    if (!status) return <span className="text-gray-200 text-xs">·</span>;
    const s = STATUS_STYLE[status];
    const abbr = { present:"P", absent:"A", late:"L", half_day:"H", on_leave:"OL", holiday:"Ho", weekend:"–" };
    return (
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[9px] font-black ${s?.bg} ${s?.text}`}>
        {abbr[status] || "?"}
      </span>
    );
  };

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <Clock size={22} className="text-[#DD1215]" />
        <div>
          <h1 className="text-2xl font-black tracking-widest text-gray-900">ATTENDANCE</h1>
          <p className="text-xs text-gray-400 mt-0.5">Track and manage employee attendance</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Tabs */}
        <div className="flex gap-1 bg-white border rounded-lg p-1 w-fit">
          {[{ key:"week", label:"Last 7 Days" }, { key:"monthly", label:"Monthly View" }].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setError(""); }}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition rounded ${
                tab === t.key ? "bg-[#DD1215] text-white" : "text-gray-500 hover:text-gray-800"
              }`}>{t.label}</button>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded flex justify-between items-center">{error}<button onClick={()=>setError("")}>✕</button></div>}

        {/* ── LAST 7 DAYS TAB ── */}
        {tab === "week" && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { key:"present",  icon: CheckCircle, color:"text-green-600"  },
                { key:"absent",   icon: XCircle,     color:"text-red-600"    },
                { key:"late",     icon: AlertCircle, color:"text-yellow-600" },
                { key:"half_day", icon: Clock,       color:"text-orange-600" },
                { key:"on_leave", icon: Calendar,    color:"text-blue-600"   },
              ].map(({ key, icon: Icon, color }) => (
                <div key={key} className="bg-white border rounded-lg px-4 py-3 flex items-center gap-3">
                  <Icon size={22} className={color} />
                  <div>
                    <p className="text-xl font-black text-gray-900">{weekCounts[key] || 0}</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">{STATUS_STYLE[key]?.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 7-day date header strip */}
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  {fmtDate(last7Dates[0])} — {fmtDate(last7Dates[6])}
                </p>
                <button onClick={loadWeek} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition">
                  <RefreshCw size={12}/> Refresh
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-16"><Loader size={28} className="animate-spin text-[#DD1215]"/></div>
              ) : weekEmployees.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Clock size={36} className="mx-auto mb-3 opacity-30"/>
                  <p className="font-semibold">No attendance records for the last 7 days.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border-collapse">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap sticky left-0 bg-gray-50 z-10 min-w-[180px]">Employee</th>
                        {last7Dates.map(d => {
                          const isToday = d.toDateString() === new Date().toDateString();
                          return (
                            <th key={isoDate(d)} className={`px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap min-w-[90px] ${isToday ? "bg-red-50 text-[#DD1215]" : "text-gray-500"}`}>
                              <div>{DAYS[d.getDay()]}</div>
                              <div className="font-black text-sm">{d.getDate()}</div>
                              <div className="text-[9px] font-normal">{MONTHS[d.getMonth()].slice(0,3)}</div>
                            </th>
                          );
                        })}
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {weekEmployees.map(({ emp, rows }) => {
                        const displayName = emp?.firstName ? `${emp.firstName} ${emp.lastName}` : "Unknown";
                        const initials    = displayName !== "Unknown" ? displayName.split(" ").map(w=>w[0]).join("").substring(0,2).toUpperCase() : "?";
                        return (
                          <tr key={emp?._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 sticky left-0 bg-white z-10">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-xs font-bold shrink-0">{initials}</div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-xs">{displayName}</p>
                                  <p className="text-[10px] text-gray-400">{emp?.employeeId}{emp?.designation ? ` · ${emp.designation}` : ""}</p>
                                </div>
                              </div>
                            </td>
                            {last7Dates.map(d => {
                              const key = isoDate(d);
                              const rec = rows[key];
                              const isToday  = d.toDateString() === new Date().toDateString();
                              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                              const s = rec ? STATUS_STYLE[rec.status] : isWeekend ? STATUS_STYLE.weekend : null;
                              return (
                                <td key={key} className={`px-3 py-3 text-center ${isToday ? "bg-red-50/40" : ""}`}>
                                  {s ? (
                                    <div>
                                      <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-bold ${s.bg} ${s.text}`}>{s.label}</span>
                                      {rec?.clockIn && <p className="text-[9px] text-gray-400 mt-0.5">{fmt(rec.clockIn)}</p>}
                                      {rec?.hoursWorked > 0 && <p className="text-[9px] text-gray-500">{rec.hoursWorked}h</p>}
                                    </div>
                                  ) : (
                                    <span className="text-gray-200">—</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-4 py-3">
                              {/* Correct latest record for this employee */}
                              {Object.values(rows).length > 0 && (
                                <button onClick={() => {
                                  const latest = Object.values(rows).sort((a,b) => new Date(b.date)-new Date(a.date))[0];
                                  setMarkModal({ recordId: latest._id });
                                  setMarkForm({ date: isoDate(latest.date), status: latest.status, note: latest.note||"" });
                                }} className="text-xs text-blue-600 hover:underline font-semibold whitespace-nowrap">Correct</button>
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

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-[10px]">
              {Object.entries(STATUS_STYLE).filter(([k]) => k !== "weekend").map(([key, s]) => (
                <span key={key} className={`flex items-center gap-1 px-2 py-1 rounded ${s.bg} ${s.text} font-semibold`}>
                  <span className={`w-2 h-2 rounded-full ${s.dot}`}/>  {s.label}
                </span>
              ))}
            </div>
          </>
        )}

        {/* ── MONTHLY TAB ── */}
        {tab === "monthly" && (
          <>
            {/* Controls */}
            <div className="bg-white border rounded-lg px-5 py-4 flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Month</label>
                <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
                  className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215]">
                  {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Year</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setYear(y => y-1)} className="border border-gray-300 p-2 hover:bg-gray-50 transition"><ChevronLeft size={14}/></button>
                  <span className="text-sm font-bold px-2">{year}</span>
                  <button onClick={() => setYear(y => y+1)} className="border border-gray-300 p-2 hover:bg-gray-50 transition"><ChevronRight size={14}/></button>
                </div>
              </div>
              <button onClick={loadMonthAll} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 border border-gray-300 px-3 py-2 transition mt-4">
                <RefreshCw size={12}/> Refresh
              </button>
              <div className="flex items-center gap-1 ml-auto text-[10px] text-gray-400 mt-4">
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">P</span> Present &nbsp;
                <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">A</span> Absent &nbsp;
                <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">L</span> Late &nbsp;
                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">OL</span> On Leave &nbsp;
                <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">H</span> Half Day
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader size={28} className="animate-spin text-[#DD1215]"/></div>
            ) : (
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{MONTHS[month-1]} {year} · {mEmployees.length} Employees</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Users size={12}/> All Active Employees
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="text-sm border-collapse w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {/* Sticky employee column */}
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap sticky left-0 bg-gray-50 z-10 min-w-[180px] border-r border-gray-200">Employee</th>
                        {/* Day columns */}
                        {allDays.map(d => {
                          const dayOfWeek = new Date(year, month-1, d).getDay();
                          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                          const isToday   = new Date(year, month-1, d).toDateString() === new Date().toDateString();
                          return (
                            <th key={d} className={`px-1 py-2 text-center text-[10px] font-bold min-w-[32px] whitespace-nowrap ${
                              isToday ? "bg-red-50 text-[#DD1215]" : isWeekend ? "bg-gray-100 text-gray-400" : "text-gray-500"
                            }`}>
                              <div>{d}</div>
                              <div className="font-normal text-[8px]">{DAYS[dayOfWeek].slice(0,1)}</div>
                            </th>
                          );
                        })}
                        {/* Summary columns */}
                        {["Present","Absent","Late","Leave"].map(h => (
                          <th key={h} className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap border-l border-gray-200 bg-gray-50">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mEmployees.length === 0 ? (
                        <tr><td colSpan={daysInMonth + 5} className="text-center py-16 text-gray-400">No employees found.</td></tr>
                      ) : mEmployees.map(emp => {
                        const empId  = emp._id.toString();
                        const rows   = monthMap[empId] || {};
                        const summary = empSummary(empId);
                        const initials = `${emp.firstName?.[0]||""}${emp.lastName?.[0]||""}`.toUpperCase();
                        return (
                          <tr key={empId} className="hover:bg-gray-50 transition-colors">
                            {/* Sticky employee cell */}
                            <td className="px-4 py-2 sticky left-0 bg-white z-10 border-r border-gray-100">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-[10px] font-bold shrink-0">{initials}</div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-xs whitespace-nowrap">{emp.firstName} {emp.lastName}</p>
                                  <p className="text-[9px] text-gray-400">{emp.employeeId}</p>
                                </div>
                              </div>
                            </td>
                            {/* Day cells */}
                            {allDays.map(d => {
                              const rec       = rows[d];
                              const dayOfWeek = new Date(year, month-1, d).getDay();
                              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                              const isFuture  = new Date(year, month-1, d) > new Date();
                              const isToday   = new Date(year, month-1, d).toDateString() === new Date().toDateString();
                              let status = rec?.status;
                              if (!status && isWeekend) status = "weekend";
                              const abbr = { present:"P", absent:"A", late:"L", half_day:"H", on_leave:"OL", holiday:"Ho", weekend:"–" };
                              const s = STATUS_STYLE[status];
                              return (
                                <td key={d} className={`px-1 py-2 text-center ${isToday ? "bg-red-50/40" : isWeekend ? "bg-gray-50/60" : ""}`}>
                                  {isFuture && !isToday ? (
                                    <span className="text-gray-200 text-xs">·</span>
                                  ) : s ? (
                                    <span className={`inline-flex items-center justify-center w-6 h-5 rounded text-[9px] font-black ${s.bg} ${s.text}`}>
                                      {abbr[status] || "?"}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-gray-300 font-bold">—</span>
                                  )}
                                </td>
                              );
                            })}
                            {/* Summary cells */}
                            <td className="px-3 py-2 text-center text-xs font-black text-green-700 border-l border-gray-100">{summary.present}</td>
                            <td className="px-3 py-2 text-center text-xs font-black text-red-600">{summary.absent}</td>
                            <td className="px-3 py-2 text-center text-xs font-black text-yellow-600">{summary.late}</td>
                            <td className="px-3 py-2 text-center text-xs font-black text-blue-600">{summary.leave}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Manual Mark Modal */}
      {markModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-5">Correct Attendance</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Date</label>
                <input type="date" value={markForm.date} onChange={e => setMarkForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Status</label>
                <select value={markForm.status} onChange={e => setMarkForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215]">
                  {Object.entries(STATUS_STYLE).filter(([k])=>k!=="weekend").map(([s, v]) => (
                    <option key={s} value={s}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Note (optional)</label>
                <input type="text" value={markForm.note} onChange={e => setMarkForm(f => ({ ...f, note: e.target.value }))}
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215]"
                  placeholder="Reason for correction..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMarkModal(null)} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleMark} disabled={marking}
                className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {marking ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManager;
