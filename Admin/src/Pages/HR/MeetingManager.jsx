import React, { useState, useEffect } from "react";
import { Video, Plus, X, RefreshCw, Loader, Calendar, Clock, Users, ExternalLink, Trash2, Edit2, CheckCircle } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const STATUS_STYLE = {
  scheduled: { bg:"bg-blue-100",   text:"text-blue-700",   label:"Scheduled"  },
  ongoing:   { bg:"bg-green-100",  text:"text-green-700",  label:"Ongoing"    },
  completed: { bg:"bg-gray-100",   text:"text-gray-600",   label:"Completed"  },
  cancelled: { bg:"bg-red-100",    text:"text-red-700",    label:"Cancelled"  },
};

const fmt = (d) => d ? new Date(d).toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", hour12:true }) : "—";
const fmtDate = (d) => d ? new Date(d).toISOString().slice(0,16) : "";

const EMPTY_FORM = { title:"", agenda:"", meetLink:"", scheduledAt:"", duration:60, participants:[] };

const MeetingManager = () => {
  const [meetings,   setMeetings]  = useState([]);
  const [employees,  setEmployees] = useState([]);
  const [loading,    setLoading]   = useState(false);
  const [error,      setError]     = useState("");
  const [success,    setSuccess]   = useState("");
  const [modal,      setModal]     = useState(false);
  const [editModal,  setEditModal] = useState(null);
  const [form,       setForm]      = useState(EMPTY_FORM);
  const [saving,     setSaving]    = useState(false);

  const load = async () => {
    try { setLoading(true); setError("");
      const [mRes, eRes] = await Promise.all([
        axios.get(`${BASE}/hr/meetings`, auth()),
        axios.get(`${BASE}/hr/employees/getall`, auth()),
      ]);
      setMeetings(mRes.data.data || []);
      setEmployees(eRes.data.data || []);
    } catch { setError("Failed to load meetings."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.title || !form.scheduledAt) { setError("Title and date/time required."); return; }
    try { setSaving(true); setError("");
      await axios.post(`${BASE}/hr/meetings`, form, auth());
      setSuccess("✅ Meeting created and participants notified!");
      setModal(false); setForm(EMPTY_FORM); load();
    } catch (e) { setError(e.response?.data?.message || "Failed to create."); }
    finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    try { setSaving(true); setError("");
      await axios.patch(`${BASE}/hr/meetings/${editModal._id}`, form, auth());
      setSuccess("✅ Meeting updated!");
      setEditModal(null); setForm(EMPTY_FORM); load();
    } catch (e) { setError(e.response?.data?.message || "Failed to update."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this meeting?")) return;
    try { await axios.delete(`${BASE}/hr/meetings/${id}`, auth()); load(); }
    catch { setError("Failed to delete."); }
  };

  const handleStatusChange = async (id, status) => {
    try { await axios.patch(`${BASE}/hr/meetings/${id}`, { status }, auth()); load(); }
    catch { setError("Failed to update status."); }
  };

  const openEdit = (m) => {
    setForm({ title:m.title, agenda:m.agenda||"", meetLink:m.meetLink||"", scheduledAt:fmtDate(m.scheduledAt), duration:m.duration||60, participants:m.participants||[] });
    setEditModal(m);
  };

  const toggleParticipant = (id) => {
    setForm(f => ({ ...f, participants: f.participants.includes(id) ? f.participants.filter(p=>p!==id) : [...f.participants, id] }));
  };

  const upcoming = meetings.filter(m => new Date(m.scheduledAt) >= new Date() && m.status !== "cancelled");
  const past     = meetings.filter(m => new Date(m.scheduledAt) < new Date() || m.status === "completed");

  const MeetingCard = ({ m }) => {
    const s = STATUS_STYLE[m.status] || STATUS_STYLE.scheduled;
    const isPast = new Date(m.scheduledAt) < new Date();
    return (
      <div className="bg-white border rounded-xl p-5 hover:shadow-sm transition">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${s.bg} ${s.text}`}>{s.label}</span>
              {m.meetLink && <a href={m.meetLink} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5 hover:underline"><Video size={10}/> Join Meet</a>}
            </div>
            <h3 className="font-black text-gray-900">{m.title}</h3>
            {m.agenda && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{m.agenda}</p>}
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-blue-600 transition"><Edit2 size={14}/></button>
            <button onClick={() => handleDelete(m._id)} className="p-1.5 text-gray-400 hover:text-red-600 transition"><Trash2 size={14}/></button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><Calendar size={12}/> {fmt(m.scheduledAt)}</span>
          <span className="flex items-center gap-1"><Clock size={12}/> {m.duration} min</span>
          <span className="flex items-center gap-1"><Users size={12}/> {m.participantNames?.length || 0} participants</span>
        </div>

        {m.participantNames?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {m.participantNames.map((n,i) => (
              <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">{n}</span>
            ))}
          </div>
        )}

        {!isPast && m.status === "scheduled" && (
          <div className="flex gap-2 pt-2 border-t border-gray-50">
            <button onClick={() => handleStatusChange(m._id, "ongoing")} className="text-xs text-green-600 font-bold hover:underline flex items-center gap-1"><CheckCircle size={11}/> Mark Ongoing</button>
            <button onClick={() => handleStatusChange(m._id, "cancelled")} className="text-xs text-red-500 font-bold hover:underline ml-auto">Cancel</button>
          </div>
        )}
        {m.status === "ongoing" && (
          <div className="flex gap-2 pt-2 border-t border-gray-50">
            <button onClick={() => handleStatusChange(m._id, "completed")} className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"><CheckCircle size={11}/> Mark Completed</button>
          </div>
        )}
        {m.meetLink && (
          <a href={m.meetLink} target="_blank" rel="noreferrer"
            className="mt-3 flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-black uppercase tracking-wider transition">
            <Video size={14}/> Join Google Meet
          </a>
        )}
      </div>
    );
  };

  const FormBody = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Meeting Title *</label>
        <input type="text" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
          className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 rounded" placeholder="e.g. Weekly Team Standup"/>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Date & Time *</label>
          <input type="datetime-local" value={form.scheduledAt} onChange={e=>setForm(f=>({...f,scheduledAt:e.target.value}))}
            className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 rounded"/>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Duration (mins)</label>
          <input type="number" min={15} step={15} value={form.duration} onChange={e=>setForm(f=>({...f,duration:parseInt(e.target.value)||60}))}
            className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 rounded"/>
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Google Meet Link</label>
        <div className="flex gap-2">
          <input type="url" value={form.meetLink} onChange={e=>setForm(f=>({...f,meetLink:e.target.value}))}
            className="flex-1 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 rounded" placeholder="https://meet.google.com/xxx-xxxx-xxx"/>
          <a href="https://meet.google.com/new" target="_blank" rel="noreferrer"
            className="flex items-center gap-1 bg-blue-50 border border-blue-300 text-blue-700 px-3 py-2 text-xs font-bold rounded hover:bg-blue-100 transition whitespace-nowrap">
            <Video size={12}/> Create New
          </a>
        </div>
        <p className="text-[10px] text-gray-400 mt-1">Click "Create New" to open Google Meet and copy the link</p>
      </div>
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Agenda</label>
        <textarea rows={3} value={form.agenda} onChange={e=>setForm(f=>({...f,agenda:e.target.value}))}
          className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 rounded resize-none"
          placeholder="Topics to discuss..."/>
      </div>
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Invite Participants</label>
        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y">
          {employees.map(emp => (
            <label key={emp._id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={form.participants.includes(emp._id)}
                onChange={() => toggleParticipant(emp._id)} className="accent-blue-600"/>
              <div className="w-6 h-6 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {emp.firstName?.[0]}{emp.lastName?.[0]}
              </div>
              <span className="text-xs font-semibold text-gray-700">{emp.firstName} {emp.lastName}</span>
              <span className="text-[10px] text-gray-400 ml-auto">{emp.designation}</span>
            </label>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-1">{form.participants.length} selected — they'll get a notification with the meet link</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Video size={22} className="text-blue-600"/>
          <div>
            <h1 className="text-2xl font-black tracking-widest text-gray-900">MEETINGS</h1>
            <p className="text-xs text-gray-400 mt-0.5">Schedule and manage Google Meet sessions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="border border-gray-300 p-2 rounded hover:bg-gray-50"><RefreshCw size={14}/></button>
          <button onClick={() => { setModal(true); setForm(EMPTY_FORM); setError(""); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-blue-700 rounded transition">
            <Plus size={14}/> Schedule Meeting
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {error   && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded flex justify-between">{error}<button onClick={()=>setError("")}>✕</button></div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded flex justify-between">{success}<button onClick={()=>setSuccess("")}>✕</button></div>}

        {loading ? (
          <div className="flex justify-center py-16"><Loader size={28} className="animate-spin text-blue-600"/></div>
        ) : (
          <>
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"/> Upcoming ({upcoming.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcoming.map(m => <MeetingCard key={m._id} m={m}/>)}
                </div>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400"/> Past Meetings ({past.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {past.map(m => <MeetingCard key={m._id} m={m}/>)}
                </div>
              </div>
            )}

            {meetings.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <Video size={40} className="mx-auto mb-3 opacity-20"/>
                <p className="font-semibold">No meetings yet.</p>
                <p className="text-xs mt-1">Click "Schedule Meeting" to create one.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black uppercase tracking-widest">Schedule Meeting</h3>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            {error && <p className="text-red-600 text-xs mb-3">{error}</p>}
            <FormBody/>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 rounded transition">Cancel</button>
              <button onClick={handleCreate} disabled={saving}
                className="flex-1 bg-blue-600 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-blue-700 rounded transition disabled:opacity-50">
                {saving ? "Creating..." : "Create & Notify"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black uppercase tracking-widest">Edit Meeting</h3>
              <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            {error && <p className="text-red-600 text-xs mb-3">{error}</p>}
            <FormBody/>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditModal(null)} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 rounded transition">Cancel</button>
              <button onClick={handleUpdate} disabled={saving}
                className="flex-1 bg-blue-600 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-blue-700 rounded transition disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingManager;
