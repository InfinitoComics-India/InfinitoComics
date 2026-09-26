import React, { useState, useEffect } from "react";
import { CalendarDays, Plus, ChevronLeft, ChevronRight, X, Loader, Clock } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const EVENT_COLORS = {
  holiday:     { bg: "bg-red-500",    light: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500"    },
  leave:       { bg: "bg-yellow-500", light: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  deadline:    { bg: "bg-orange-500", light: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  meeting:     { bg: "bg-blue-500",   light: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500"   },
  event:       { bg: "bg-purple-500", light: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  birthday:    { bg: "bg-pink-500",   light: "bg-pink-50",   text: "text-pink-700",   dot: "bg-pink-500"   },
  anniversary: { bg: "bg-green-500",  light: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  reminder:    { bg: "bg-gray-400",   light: "bg-gray-50",   text: "text-gray-600",   dot: "bg-gray-400"   },
};

const EVENT_TYPES = Object.keys(EVENT_COLORS);

const EMPTY_FORM = {
  title: "", description: "", type: "meeting",
  startDate: "", endDate: "", isAllDay: true,
  startTime: "", endTime: "", isCompanyWide: true,
  isRecurring: false, recurringRule: "",
};

const CompanyCalendar = () => {
  const now = new Date();
  const [year,  setYear]   = useState(now.getFullYear());
  const [month, setMonth]  = useState(now.getMonth() + 1);
  const [events, setEvents]= useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [selectedDay, setSelectedDay] = useState(null);  // date object clicked
  const [dayEvents, setDayEvents]     = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm]     = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMonth = async () => {
    try { setLoading(true); setError("");
      const r = await axios.get(`${BASE}/hr/calendar/month`, { ...auth(), params: { year, month } });
      setEvents(r.data.data || []);
    } catch { setError("Failed to load calendar events."); }
    finally { setLoading(false); }
  };

  const loadUpcoming = async () => {
    try {
      const r = await axios.get(`${BASE}/hr/calendar/upcoming`, { ...auth(), params: { days: 14 } });
      setUpcoming(r.data.data || []);
    } catch {}
  };

  useEffect(() => { loadMonth(); }, [year, month]);
  useEffect(() => { loadUpcoming(); }, []);

  const getEventsForDay = (day) => {
    const d = new Date(year, month - 1, day);
    return events.filter(e => {
      const start = new Date(e.startDate);
      const end   = new Date(e.endDate);
      start.setHours(0,0,0,0); end.setHours(23,59,59,999);
      return d >= start && d <= end;
    });
  };

  const handleDayClick = (day) => {
    const d = new Date(year, month - 1, day);
    setSelectedDay(d);
    setDayEvents(getEventsForDay(day));
  };

  const handleCreate = async () => {
    if (!form.title || !form.startDate || !form.endDate || !form.type) {
      setError("Title, type, start date, and end date are required."); return;
    }
    try { setSaving(true); setError("");
      await axios.post(`${BASE}/hr/calendar/create`, form, auth());
      setCreateModal(false); setForm(EMPTY_FORM);
      loadMonth(); loadUpcoming();
    } catch (e) { setError(e.response?.data?.message || "Failed to create event."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { setDeleting(true);
      await axios.delete(`${BASE}/hr/calendar/delete/${deleteId}`, auth());
      setDeleteId(null); setSelectedDay(null);
      loadMonth(); loadUpcoming();
    } catch { setError("Failed to delete event."); }
    finally { setDeleting(false); }
  };

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const daysInMonth   = new Date(year, month, 0).getDate();
  const firstDayIndex = new Date(year, month - 1, 1).getDay();
  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";
  const fmtShort = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short" }) : "—";

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays size={22} className="text-[#DD1215]" />
          <div>
            <h1 className="text-2xl font-black tracking-widest text-gray-900">COMPANY CALENDAR</h1>
            <p className="text-xs text-gray-400 mt-0.5">Holidays, leaves, deadlines, meetings and events</p>
          </div>
        </div>
        <button onClick={() => { setCreateModal(true); setError(""); }}
          className="flex items-center gap-2 bg-[#DD1215] text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
          <Plus size={14} /> Add Event
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6 flex-col lg:flex-row">

          {/* ── Main Calendar ── */}
          <div className="flex-1 space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">{error}</div>}

            {/* Month nav */}
            <div className="bg-white border rounded-lg px-5 py-3 flex items-center justify-between">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded transition"><ChevronLeft size={18} /></button>
              <h2 className="text-lg font-black tracking-wide text-gray-900">{MONTHS[month-1]} {year}</h2>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded transition"><ChevronRight size={18} /></button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(EVENT_COLORS).map(([type, c]) => (
                <span key={type} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${c.light} ${c.text}`}>
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  {type}
                </span>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="bg-white border rounded-lg overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b">
                {DAYS.map(d => (
                  <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">{d}</div>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center py-16"><Loader size={28} className="animate-spin text-[#DD1215]" /></div>
              ) : (
                <div className="grid grid-cols-7">
                  {/* Empty offset cells */}
                  {Array.from({ length: firstDayIndex }).map((_, i) => (
                    <div key={`e${i}`} className="border-b border-r min-h-[80px] bg-gray-50/40" />
                  ))}

                  {/* Day cells */}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const d = new Date(year, month - 1, day);
                    const isToday    = d.toDateString() === now.toDateString();
                    const isWeekend  = d.getDay() === 0 || d.getDay() === 6;
                    const isSelected = selectedDay?.toDateString() === d.toDateString();
                    const dayEvts    = getEventsForDay(day);

                    return (
                      <div key={day}
                        onClick={() => handleDayClick(day)}
                        className={`border-b border-r min-h-[80px] p-1.5 cursor-pointer transition-colors
                          ${isToday    ? "bg-red-50" : ""}
                          ${isWeekend  ? "bg-gray-50/60" : ""}
                          ${isSelected ? "ring-2 ring-inset ring-[#DD1215]" : "hover:bg-gray-50"}
                        `}>
                        <p className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full
                          ${isToday ? "bg-[#DD1215] text-white" : isWeekend ? "text-gray-400" : "text-gray-700"}`}>
                          {day}
                        </p>
                        <div className="space-y-0.5">
                          {dayEvts.slice(0, 2).map(e => {
                            const c = EVENT_COLORS[e.type] || EVENT_COLORS.reminder;
                            return (
                              <div key={e._id} className={`text-[9px] px-1.5 py-0.5 rounded font-semibold truncate ${c.light} ${c.text}`}>
                                {e.title}
                              </div>
                            );
                          })}
                          {dayEvts.length > 2 && (
                            <p className="text-[9px] text-gray-400 font-semibold pl-1">+{dayEvts.length - 2} more</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected day events */}
            {selectedDay && (
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-600">
                    {selectedDay.toLocaleDateString("en-IN", { weekday:"long", day:"2-digit", month:"long" })}
                  </p>
                  <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
                </div>
                {dayEvents.length === 0 ? (
                  <div className="px-5 py-6 text-sm text-gray-400 text-center">No events on this day.
                    <button onClick={() => { setCreateModal(true); setForm(f => ({ ...f, startDate: selectedDay.toISOString().split("T")[0], endDate: selectedDay.toISOString().split("T")[0] })); }}
                      className="ml-2 text-[#DD1215] font-semibold hover:underline">Add one →</button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {dayEvents.map(e => {
                      const c = EVENT_COLORS[e.type] || EVENT_COLORS.reminder;
                      return (
                        <div key={e._id} className={`px-5 py-3 flex items-start gap-3 ${c.light}`}>
                          <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${c.dot}`} />
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${c.text}`}>{e.title}</p>
                            {e.description && <p className="text-xs text-gray-500 mt-0.5">{e.description}</p>}
                            <p className="text-xs text-gray-400 mt-0.5">{fmtShort(e.startDate)} — {fmtShort(e.endDate)}</p>
                          </div>
                          <button onClick={() => setDeleteId(e._id)} className="text-gray-400 hover:text-red-500 transition shrink-0">
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Sidebar: Upcoming events ── */}
          <div className="lg:w-72 space-y-4">
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Upcoming — Next 14 Days</p>
              </div>
              {upcoming.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-gray-400">No upcoming events.</div>
              ) : (
                <div className="divide-y">
                  {upcoming.map(e => {
                    const c = EVENT_COLORS[e.type] || EVENT_COLORS.reminder;
                    return (
                      <div key={e._id} className="px-4 py-3 flex items-start gap-3">
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${c.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{e.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{fmtShort(e.startDate)}</p>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${c.light} ${c.text} shrink-0`}>
                          {e.type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Create Event Modal ── */}
      {createModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 overflow-y-auto py-8">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black uppercase tracking-widest">Add Calendar Event</h3>
              <button onClick={() => { setCreateModal(false); setForm(EMPTY_FORM); }} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <F label="Title *">
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className={inp} placeholder="Team meeting, Company holiday..." required />
              </F>
              <F label="Event Type *">
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inp}>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Start Date *">
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className={inp} required />
                </F>
                <F label="End Date *">
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className={inp} required />
                </F>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.isAllDay} onChange={e => setForm(f => ({ ...f, isAllDay: e.target.checked }))} className="w-4 h-4 accent-[#DD1215]" />
                All day event
              </label>
              {!form.isAllDay && (
                <div className="grid grid-cols-2 gap-3">
                  <F label="Start Time">
                    <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className={inp} />
                  </F>
                  <F label="End Time">
                    <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} className={inp} />
                  </F>
                </div>
              )}
              <F label="Description">
                <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className={`${inp} resize-none`} placeholder="Optional details..." />
              </F>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={form.isCompanyWide} onChange={e => setForm(f => ({ ...f, isCompanyWide: e.target.checked }))} className="w-4 h-4 accent-[#DD1215]" />
                  Company-wide
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={form.isRecurring} onChange={e => setForm(f => ({ ...f, isRecurring: e.target.checked }))} className="w-4 h-4 accent-[#DD1215]" />
                  Recurring
                </label>
              </div>
              {form.isRecurring && (
                <F label="Recurring Rule">
                  <select value={form.recurringRule} onChange={e => setForm(f => ({ ...f, recurringRule: e.target.value }))} className={inp}>
                    <option value="">Select...</option>
                    {["daily","weekly","monthly","yearly"].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </F>
              )}
            </div>
            {error && <p className="text-red-600 text-xs mt-3">{error}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setCreateModal(false); setForm(EMPTY_FORM); }}
                className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleCreate} disabled={saving}
                className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {saving ? "Saving..." : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-3">Delete Event</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this event? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inp = "w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] bg-white";
const F = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
);

export default CompanyCalendar;
