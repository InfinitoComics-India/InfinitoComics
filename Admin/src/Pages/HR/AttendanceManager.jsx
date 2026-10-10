import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Loader, Calendar } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const STATUS_STYLE = {
  present:  { bg: "bg-green-100",  text: "text-green-700",  label: "Present"  },
  absent:   { bg: "bg-red-100",    text: "text-red-700",    label: "Absent"   },
  late:     { bg: "bg-yellow-100", text: "text-yellow-700", label: "Late"     },
  half_day: { bg: "bg-orange-100", text: "text-orange-700", label: "Half Day" },
  on_leave: { bg: "bg-blue-100",   text: "text-blue-700",   label: "On Leave" },
  holiday:  { bg: "bg-purple-100", text: "text-purple-700", label: "Holiday"  },
  weekend:  { bg: "bg-gray-100",   text: "text-gray-500",   label: "Weekend"  },
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const AttendanceManager = () => {
  const now = new Date();
  const [tab, setTab]           = useState("today");
  const [todayRecords, setToday]= useState([]);
  const [monthly, setMonthly]   = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selEmployee, setSelEmployee] = useState("");
  const [year,  setYear]        = useState(now.getFullYear());
  const [month, setMonth]       = useState(now.getMonth() + 1);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [markModal, setMarkModal] = useState(null); // { employeeId }
  const [markForm, setMarkForm] = useState({ date: "", status: "present", note: "" });
  const [marking, setMarking]   = useState(false);

  // Load employees for dropdown
  useEffect(() => {
    axios.get(`${BASE}/hr/employees/getall`, auth())
      .then(r => setEmployees(r.data.data || []))
      .catch(() => {});
  }, []);

  const loadToday = async () => {
    try {
      setLoading(true); setError("");
      const r = await axios.get(`${BASE}/hr/attendance/today`, auth());
      setToday(r.data.data || []);
    } catch { setError("Failed to load today's attendance."); }
    finally { setLoading(false); }
  };

  const loadMonthly = async () => {
    if (!selEmployee) { setError("Please select an employee."); return; }
    try {
      setLoading(true); setError("");
      const r = await axios.get(`${BASE}/hr/attendance/monthly/${selEmployee}`, {
        ...auth(), params: { year, month }
      });
      setMonthly(r.data.data || []);
    } catch { setError("Failed to load monthly attendance."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (tab === "today") loadToday(); }, [tab]);
  useEffect(() => { if (tab === "monthly" && selEmployee) loadMonthly(); }, [selEmployee, year, month]);

  const handleMark = async () => {
    if (!markForm.date || !markForm.status) return;
    try {
      setMarking(true);
      await axios.patch(`${BASE}/hr/attendance/mark/${markModal.employeeId}`, markForm, auth());
      setMarkModal(null);
      if (tab === "today") loadToday();
      else loadMonthly();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to mark attendance.");
    } finally { setMarking(false); }
  };

  // Summary counts for today
  const counts = todayRecords.reduce((a, r) => {
    a[r.status] = (a[r.status] || 0) + 1;
    return a;
  }, {});

  const fmt = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—";

  // Build calendar grid for monthly view
  const buildGrid = () => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month - 1, i + 1);
      const rec = monthly.find(r => new Date(r.date).getDate() === i + 1);
      return { day: i + 1, date: d, record: rec };
    });
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
          {[{ key: "today", label: "Today" }, { key: "monthly", label: "Monthly View" }].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setError(""); }}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition rounded ${
                tab === t.key ? "bg-[#DD1215] text-white" : "text-gray-500 hover:text-gray-800"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">{error}</div>}

        {/* TODAY TAB */}
        {tab === "today" && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { key: "present",  icon: CheckCircle, color: "text-green-600"  },
                { key: "absent",   icon: XCircle,     color: "text-red-600"    },
                { key: "late",     icon: AlertCircle, color: "text-yellow-600" },
                { key: "half_day", icon: Clock,       color: "text-orange-600" },
                { key: "on_leave", icon: Calendar,    color: "text-blue-600"   },
              ].map(({ key, icon: Icon, color }) => (
                <div key={key} className="bg-white border rounded-lg px-4 py-3 flex items-center gap-3">
                  <Icon size={22} className={color} />
                  <div>
                    <p className="text-xl font-black text-gray-900">{counts[key] || 0}</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">{STATUS_STYLE[key]?.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Today table */}
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                </p>
                <button onClick={loadToday} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition">
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center py-16"><Loader size={28} className="animate-spin text-[#DD1215]" /></div>
              ) : todayRecords.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Clock size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">No attendance records for today yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Employee", "Status", "Clock In", "Clock Out", "Hours", "Late By", "Actions"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {todayRecords.map(rec => {
                        const s = STATUS_STYLE[rec.status] || STATUS_STYLE.absent;
                        const emp = rec.employeeId;
                        return (
                          <tr key={rec._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-xs font-bold">
                                  {emp?.firstName?.[0]}{emp?.lastName?.[0]}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-xs">{emp?.firstName} {emp?.lastName}</p>
                                  <p className="text-[10px] text-gray-400">{emp?.designation}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>{s.label}</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{fmt(rec.clockIn)}</td>
                            <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{fmt(rec.clockOut)}</td>
                            <td className="px-4 py-3 text-xs font-semibold text-gray-700">{rec.hoursWorked > 0 ? `${rec.hoursWorked}h` : "—"}</td>
                            <td className="px-4 py-3 text-xs text-yellow-600">{rec.isLate ? `${rec.lateByMinutes} mins` : "—"}</td>
                            <td className="px-4 py-3">
                              <button onClick={() => { setMarkModal({ employeeId: emp?._id }); setMarkForm({ date: new Date().toISOString().split("T")[0], status: rec.status, note: rec.note || "" }); }}
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
          </>
        )}

        {/* MONTHLY TAB */}
        {tab === "monthly" && (
          <>
            {/* Controls */}
            <div className="bg-white border rounded-lg px-5 py-4 flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Employee</label>
                <select value={selEmployee} onChange={e => setSelEmployee(e.target.value)}
                  className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] min-w-[200px]">
                  <option value="">Select employee</option>
                  {employees.map(e => (
                    <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Month</label>
                <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
                  className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215]">
                  {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Year</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setYear(y => y - 1)} className="border border-gray-300 p-2 hover:bg-gray-50 transition"><ChevronLeft size={14} /></button>
                  <span className="text-sm font-bold px-2">{year}</span>
                  <button onClick={() => setYear(y => y + 1)} className="border border-gray-300 p-2 hover:bg-gray-50 transition"><ChevronRight size={14} /></button>
                </div>
              </div>
            </div>

            {/* Calendar grid */}
            {selEmployee && (
              loading ? (
                <div className="flex justify-center py-16"><Loader size={28} className="animate-spin text-[#DD1215]" /></div>
              ) : (
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="px-5 py-3 border-b">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{MONTHS[month - 1]} {year}</p>
                  </div>
                  <div className="grid grid-cols-7 border-b">
                    {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                      <div key={d} className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {/* Empty cells for first day offset */}
                    {Array.from({ length: new Date(year, month - 1, 1).getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} className="border-b border-r p-2 min-h-[60px] bg-gray-50/50" />
                    ))}
                    {buildGrid().map(({ day, date, record }) => {
                      const isToday = date.toDateString() === new Date().toDateString();
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      const s = record ? STATUS_STYLE[record.status] : isWeekend ? STATUS_STYLE.weekend : null;
                      return (
                        <div key={day} className={`border-b border-r p-2 min-h-[60px] ${isToday ? "bg-red-50" : ""}`}>
                          <p className={`text-xs font-bold mb-1 ${isToday ? "text-[#DD1215]" : "text-gray-500"}`}>{day}</p>
                          {s && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${s.bg} ${s.text}`}>{s.label}</span>
                          )}
                          {record?.hoursWorked > 0 && (
                            <p className="text-[9px] text-gray-400 mt-0.5">{record.hoursWorked}h</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* Manual Mark Modal */}
      {markModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-5">Mark Attendance</h3>
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
                  {Object.keys(STATUS_STYLE).map(s => (
                    <option key={s} value={s}>{STATUS_STYLE[s].label}</option>
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
