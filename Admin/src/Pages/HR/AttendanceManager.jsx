import React, { useState, useEffect, useCallback } from "react";
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
const isoDate = (d) => new Date(d).toISOString().split("T")[0];
const labelDate = (d) => new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short" });
const isToday   = (d) => new Date(d).toDateString() === new Date().toDateString();

const AttendanceManager = () => {
  const now = new Date();

  // ── Tab state ─────────────────────────────────────────────
  const [tab, setTab] = useState("daily");

  // ── Daily view state ──────────────────────────────────────
  const [selDate,     setSelDate]   = useState(isoDate(now));        // selected date string "YYYY-MM-DD"
  const [dayRecords,  setDayRecs]   = useState([]);

  // ── Monthly view state ────────────────────────────────────
  const [monthAll,  setMonthAll]  = useState({ records: [], employees: [] });
  const [year,      setYear]      = useState(now.getFullYear());
  const [month,     setMonth]     = useState(now.getMonth() + 1);

  // ── Shared state ──────────────────────────────────────────
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [markModal, setMarkModal] = useState(null);
  const [markForm,  setMarkForm]  = useState({ date:"", status:"present", note:"" });
  const [marking,   setMarking]   = useState(false);

  // Build last-7 quick-pick dates (today and 6 days before)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  // ── Load daily attendance for selected date ───────────────
  const loadDay = useCallback(async (dateStr) => {
    try { setLoading(true); setError("");
      const r = await axios.get(`${BASE}/hr/attendance/bydate`, { ...auth(), params: { date: dateStr } });
      setDayRecs(r.data.data || []);
    } catch { setError("Failed to load attendance."); }
    finally { setLoading(false); }
  }, []);

  // ── Load monthly all-employee attendance ──────────────────
  const loadMonthAll = useCallback(async () => {
    try { setLoading(true); setError("");
      const r = await axios.get(`${BASE}/hr/attendance/monthly-all`, { ...auth(), params: { year, month } });
      setMonthAll(r.data.data || { records: [], employees: [] });
    } catch { setError("Failed to load monthly attendance."); }
    finally { setLoading(false); }
  }, [year, month]);

  useEffect(() => { if (tab === "daily")   loadDay(selDate);  }, [tab, selDate]);
  useEffect(() => { if (tab === "monthly") loadMonthAll();    }, [tab, month, year]);

  // ── Correct attendance ────────────────────────────────────
  const handleMark = async () => {
    if (!markForm.date || !markForm.status) return;
    try { setMarking(true);
      await axios.patch(`${BASE}/hr/attendance/correct/${markModal.recordId}`, markForm, auth());
      setMarkModal(null);
      if (tab === "daily") loadDay(selDate); else loadMonthAll();
    } catch (e) { setError(e.response?.data?.message || "Failed to mark."); }
    finally { setMarking(false); }
  };

  // ── Daily view: counts for selected day ───────────────────
  const dayCounts = dayRecords.reduce((a, r) => { a[r.status] = (a[r.status]||0)+1; return a; }, {});

  // ── Monthly view helpers ──────────────────────────────────
  const daysInMonth = new Date(year, month, 0).getDate();
  const allDays     = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const { records: mRecords, employees: mEmployees } = monthAll;

  const monthMap = {};
  for (const rec of mRecords) {
    const rawId = rec.employeeId?._id ?? rec.employeeId;
    if (!rawId) continue;
    const k = rawId.toString();
    if (!monthMap[k]) monthMap[k] = {};
    monthMap[k][new Date(rec.date).getDate()] = rec;
  }

  const empSummary = (empId) => {
    const rows = monthMap[empId] || {};
    let present=0, absent=0, late=0, leave=0, halfDay=0;
    for (const d of allDays) {
      const r = rows[d];
      const isWknd = new Date(year, month-1, d).getDay() === 0 || new Date(year, month-1, d).getDay() === 6;
      if (!r && !isWknd && new Date(year, month-1, d) <= now) absent++;
      if (r?.status === "present") present++;
      if (r?.status === "late") { present++; late++; }
      if (r?.status === "on_leave") leave++;
      if (r?.status === "half_day") halfDay++;
    }
    return { present, absent, late, leave, halfDay };
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
          {[{ key:"daily", label:"Daily View" }, { key:"monthly", label:"Monthly View" }].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setError(""); }}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition rounded ${
                tab === t.key ? "bg-[#DD1215] text-white" : "text-gray-500 hover:text-gray-800"
              }`}>{t.label}</button>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded flex justify-between items-center">{error}<button onClick={()=>setError("")}>✕</button></div>}

        {/* ── DAILY VIEW TAB ── */}
        {tab === "daily" && (
          <>
            {/* Date picker bar */}
            <div className="bg-white border rounded-lg px-5 py-3 flex flex-wrap items-center gap-3">
              <div className="flex flex-col gap-0.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Date</label>
                <input
                  type="date"
                  value={selDate}
                  max={isoDate(now)}
                  onChange={e => setSelDate(e.target.value)}
                  className="border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-[#DD1215] rounded"
                />
              </div>
              {/* Quick-pick buttons for last 6 days */}
              <div className="flex items-end gap-2 flex-wrap">
                {last7.slice(0, 6).map(d => {
                  const ds = isoDate(d);
                  const active = ds === selDate;
                  return (
                    <button key={ds} onClick={() => setSelDate(ds)}
                      className={`px-3 py-1.5 text-xs font-bold border rounded transition ${
                        active ? "bg-[#DD1215] text-white border-[#DD1215]" : "border-gray-300 text-gray-600 hover:border-[#DD1215] hover:text-[#DD1215]"
                      }`}>
                      {labelDate(d)}
                    </button>
                  );
                })}
                {/* Today button */}
                <button onClick={() => setSelDate(isoDate(now))}
                  className={`px-3 py-1.5 text-xs font-bold border rounded transition ${
                    selDate === isoDate(now) ? "bg-[#DD1215] text-white border-[#DD1215]" : "border-gray-300 text-gray-600 hover:border-[#DD1215] hover:text-[#DD1215]"
                  }`}>
                  Today
                </button>
                <button onClick={() => loadDay(selDate)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-gray-300 text-gray-500 hover:text-gray-700 rounded transition">
                  <RefreshCw size={12}/> Refresh
                </button>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key:"present",  icon: CheckCircle, color:"text-green-600"  },
                { key:"absent",   icon: XCircle,     color:"text-red-600"    },
                { key:"half_day", icon: Clock,       color:"text-orange-600" },
                { key:"on_leave", icon: Calendar,    color:"text-blue-600"   },
              ].map(({ key, icon: Icon, color }) => (
                <div key={key} className="bg-white border rounded-lg px-4 py-3 flex items-center gap-3">
                  <Icon size={22} className={color} />
                  <div>
                    <p className="text-xl font-black text-gray-900">{dayCounts[key] || 0}</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">{STATUS_STYLE[key]?.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Daily attendance table */}
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  {new Date(selDate + "T00:00:00").toLocaleDateString("en-IN", { weekday:"long", day:"2-digit", month:"long", year:"numeric" })}
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center py-16"><Loader size={28} className="animate-spin text-[#DD1215]"/></div>
              ) : dayRecords.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Clock size={36} className="mx-auto mb-3 opacity-30"/>
                  <p className="font-semibold">No attendance records for this date.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Employee","Status","Clock In","Clock Out","Hours","Actions"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {dayRecords.map(rec => {
                        const s    = STATUS_STYLE[rec.status] || STATUS_STYLE.absent;
                        const emp  = rec.employeeId;
                        const name = emp?.firstName ? `${emp.firstName} ${emp.lastName}` : rec.employeeName || "Unknown";
                        const empId = emp?.employeeId || rec.employeeEmpId || "";
                        const init = name !== "Unknown" ? name.split(" ").map(w=>w[0]).join("").substring(0,2).toUpperCase() : "?";
                        return (
                          <tr key={rec._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-xs font-bold shrink-0">{init}</div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-xs">{name}</p>
                                  <p className="text-[10px] text-gray-400">{empId}{emp?.designation ? ` · ${emp.designation}` : ""}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>{s.label}</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{fmt(rec.clockIn)}</td>
                            <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{fmt(rec.clockOut)}</td>
                            <td className="px-4 py-3 text-xs font-semibold text-gray-700">{rec.hoursWorked > 0 ? `${rec.hoursWorked}h` : "—"}</td>
                            <td className="px-4 py-3">
                              <button onClick={() => { setMarkModal({ recordId: rec._id }); setMarkForm({ date: isoDate(rec.date), status: rec.status, note: rec.note||"" }); }}
                                className="text-xs text-blue-600 hover:underline font-semibold">Correct</button>
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
                  <span className={`w-2 h-2 rounded-full ${s.dot}`}/> {s.label}
                </span>
              ))}
            </div>
          </>
        )}

        {/* ── MONTHLY TAB ── */}
        {tab === "monthly" && (
          <>
            {/* Controls */}
            <div className="bg-white border rounded-lg px-5 py-4 flex flex-wrap gap-4 items-center">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Month</label>
                <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
                  className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] rounded">
                  {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Year</label>
                <div className="flex items-center gap-1">
                  <button onClick={() => setYear(y => y-1)} className="border border-gray-300 p-2 hover:bg-gray-50 rounded transition"><ChevronLeft size={14}/></button>
                  <span className="text-sm font-bold px-3">{year}</span>
                  <button onClick={() => setYear(y => y+1)} className="border border-gray-300 p-2 hover:bg-gray-50 rounded transition"><ChevronRight size={14}/></button>
                </div>
              </div>
              <button onClick={loadMonthAll} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 px-3 py-2 rounded transition mt-4">
                <RefreshCw size={12}/> Refresh
              </button>
              {/* Month summary stats */}
              {mEmployees.length > 0 && (
                <div className="ml-auto flex items-center gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-lg font-black text-gray-900">{mEmployees.length}</p>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400">Employees</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-green-700">{mEmployees.reduce((s,e)=>s+empSummary(e._id.toString()).present,0)}</p>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400">Total Present</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-red-600">{mEmployees.reduce((s,e)=>s+empSummary(e._id.toString()).absent,0)}</p>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400">Total Absent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-blue-600">{mEmployees.reduce((s,e)=>s+empSummary(e._id.toString()).leave,0)}</p>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400">On Leave</p>
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader size={28} className="animate-spin text-[#DD1215]"/></div>
            ) : mEmployees.length === 0 ? (
              <div className="bg-white border rounded-lg text-center py-16 text-gray-400">
                <Users size={36} className="mx-auto mb-3 opacity-30"/>
                <p className="font-semibold">No employees found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mEmployees.map(emp => {
                  const eid   = emp._id.toString();
                  const sum   = empSummary(eid);
                  const init  = `${emp.firstName?.[0]||""}${emp.lastName?.[0]||""}`.toUpperCase();
                  const totalWorkDays = allDays.filter(d => {
                    const dow = new Date(year, month-1, d).getDay();
                    return dow !== 0 && dow !== 6 && new Date(year, month-1, d) <= now;
                  }).length;
                  const attendPct = totalWorkDays > 0 ? Math.round((sum.present / totalWorkDays) * 100) : 0;
                  const rows = monthMap[eid] || {};
                  const totalHours = Object.values(rows).reduce((s, r) => s + (r.hoursWorked || 0), 0);

                  return (
                    <div key={eid} className="bg-white border rounded-xl px-5 py-4 hover:shadow-sm transition">
                      <div className="flex items-center gap-4 flex-wrap">
                        {/* Avatar + Name */}
                        <div className="flex items-center gap-3 min-w-[180px]">
                          <div className="w-10 h-10 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-sm font-black shrink-0">{init}</div>
                          <div>
                            <p className="font-black text-gray-900 text-sm">{emp.firstName} {emp.lastName}</p>
                            <p className="text-[10px] text-gray-400">{emp.employeeId} · {emp.designation || emp.department}</p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 flex-1 flex-wrap">
                          {[
                            { label:"Present", value: sum.present, color:"text-green-700", bg:"bg-green-50 border-green-200" },
                            { label:"Absent",  value: sum.absent,  color:"text-red-600",   bg:"bg-red-50 border-red-200"    },
                            { label:"Half Day",value: sum.halfDay, color:"text-orange-600",bg:"bg-orange-50 border-orange-200"},
                            { label:"On Leave",value: sum.leave,   color:"text-blue-600",  bg:"bg-blue-50 border-blue-200"  },
                            { label:"Hours",   value: `${totalHours.toFixed(1)}h`, color:"text-purple-700", bg:"bg-purple-50 border-purple-200"},
                          ].map(({ label, value, color, bg }) => (
                            <div key={label} className={`flex flex-col items-center px-4 py-2 rounded-lg border ${bg} min-w-[60px]`}>
                              <p className={`text-lg font-black ${color}`}>{value}</p>
                              <p className="text-[9px] uppercase tracking-wider text-gray-500 mt-0.5">{label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Attendance % bar */}
                        <div className="min-w-[120px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-gray-500 font-semibold">Attendance</span>
                            <span className={`text-xs font-black ${attendPct >= 80 ? "text-green-700" : attendPct >= 60 ? "text-yellow-600" : "text-red-600"}`}>{attendPct}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${attendPct >= 80 ? "bg-green-500" : attendPct >= 60 ? "bg-yellow-400" : "bg-red-500"}`}
                              style={{ width: `${attendPct}%` }}/>
                          </div>
                        </div>

                        {/* Day-by-day mini dots */}
                        <div className="flex flex-wrap gap-0.5 max-w-[220px]">
                          {allDays.map(d => {
                            const rec    = rows[d];
                            const dow    = new Date(year, month-1, d).getDay();
                            const isWknd = dow === 0 || dow === 6;
                            const isFut  = new Date(year, month-1, d) > now;
                            const isTdy  = new Date(year, month-1, d).toDateString() === now.toDateString();
                            let status   = rec?.status || (isWknd ? "weekend" : null);
                            const dotColor = {
                              present:"bg-green-500", absent:"bg-red-400", late:"bg-green-400",
                              half_day:"bg-orange-400", on_leave:"bg-blue-400",
                              holiday:"bg-purple-400", weekend:"bg-gray-200"
                            }[status] || (isFut && !isTdy ? "bg-gray-100" : "bg-gray-300");
                            return (
                              <div key={d} title={`${d} — ${status || "no record"}`}
                                className={`w-3 h-3 rounded-sm ${dotColor}`}/>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                  {Object.entries(STATUS_STYLE).filter(([k])=>k!=="weekend" && k!=="late").map(([s, v]) => (
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
