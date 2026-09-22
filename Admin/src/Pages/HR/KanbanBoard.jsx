import React, { useState, useEffect, useRef } from "react";
import { Plus, AlertCircle, Clock, User, ChevronDown, X, MessageSquare, Loader, Flag } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const COLUMNS = [
  { key: "backlog",     label: "Backlog",      color: "bg-gray-100",   header: "bg-gray-200"   },
  { key: "assigned",   label: "Assigned",     color: "bg-blue-50",    header: "bg-blue-200"   },
  { key: "in_progress",label: "In Progress",  color: "bg-yellow-50",  header: "bg-yellow-200" },
  { key: "review",     label: "Review",       color: "bg-purple-50",  header: "bg-purple-200" },
  { key: "revision",   label: "Revision",     color: "bg-orange-50",  header: "bg-orange-200" },
  { key: "completed",  label: "Completed",    color: "bg-green-50",   header: "bg-green-200"  },
];

const PRIORITY_COLORS = { low: "text-gray-400", medium: "text-blue-500", high: "text-orange-500", critical: "text-red-600" };
const PRIORITY_BG     = { low: "bg-gray-100 text-gray-600", medium: "bg-blue-100 text-blue-700", high: "bg-orange-100 text-orange-700", critical: "bg-red-100 text-red-700" };
const STATUSES = ["backlog","assigned","in_progress","review","revision","completed"];
const PRIORITIES = ["low","medium","high","critical"];

const EMPTY_FORM = { title:"", description:"", instructions:"", priority:"medium", deadline:"", assignedTo:"", reviewers:[], projectId:"", tags:"", isRecurring:false };

const KanbanBoard = () => {
  const [board, setBoard]         = useState({});
  const [projects, setProjects]   = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [selProject, setSelProject] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [taskDetail, setTaskDetail] = useState(null);
  const [comment, setComment]     = useState("");
  const [movingId, setMovingId]   = useState(null);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [overdueTasks, setOverdueTasks] = useState([]);

  const loadBoard = async () => {
    try { setLoading(true); setError("");
      const res = await axios.get(`${BASE}/hr/tasks/kanban`, { ...auth(), params: selProject ? { projectId: selProject } : {} });
      setBoard(res.data.data || {});
    } catch { setError("Failed to load board."); } finally { setLoading(false); }
  };

  const loadOverdue = async () => {
    try { const res = await axios.get(`${BASE}/hr/tasks/overdue`, auth()); setOverdueTasks(res.data.data || []); } catch {}
  };

  useEffect(() => {
    axios.get(`${BASE}/hr/projects/getall`, auth()).then(r => setProjects(r.data.data || [])).catch(() => {});
    axios.get(`${BASE}/hr/employees/getall`, auth()).then(r => setEmployees(r.data.data || [])).catch(() => {});
    loadBoard(); loadOverdue();
  }, []);

  useEffect(() => { loadBoard(); }, [selProject]);

  const handleCreate = async () => {
    if (!form.title) { setError("Title is required."); return; }
    try { setSaving(true); setError("");
      const payload = { ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean), reviewers: form.reviewers || [] };
      await axios.post(`${BASE}/hr/tasks/create`, payload, auth());
      setCreateModal(false); setForm(EMPTY_FORM); loadBoard(); loadOverdue();
    } catch (e) { setError(e.response?.data?.message || "Failed to create task."); } finally { setSaving(false); }
  };

  const handleMove = async (taskId, newStatus) => {
    try { setMovingId(taskId);
      await axios.patch(`${BASE}/hr/tasks/status/${taskId}`, { newStatus }, auth());
      loadBoard(); loadOverdue();
    } catch (e) { setError(e.response?.data?.message || "Failed to move task."); } finally { setMovingId(null); }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !taskDetail) return;
    try { await axios.post(`${BASE}/hr/tasks/comment/${taskDetail._id}`, { content: comment }, auth()); setComment("");
      const res = await axios.get(`${BASE}/hr/tasks/${taskDetail._id}`, auth()); setTaskDetail(res.data.data);
    } catch {}
  };

  const openTask = async (task) => {
    try { const res = await axios.get(`${BASE}/hr/tasks/${task._id}`, auth()); setTaskDetail(res.data.data); } catch {}
  };

  const isOverdue = (t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== "completed";
  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short" }) : null;

  const displayBoard = overdueOnly
    ? Object.fromEntries(COLUMNS.map(c => [c.key, (board[c.key] || []).filter(isOverdue)]))
    : board;

  const totalTasks = Object.values(board).reduce((s, arr) => s + (arr?.length || 0), 0);

  return (
    <div className="bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-widest text-gray-900">TASK BOARD</h1>
          <p className="text-xs text-gray-400 mt-0.5">{totalTasks} total tasks · {overdueTasks.length} overdue</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Overdue toggle */}
          <button onClick={() => setOverdueOnly(o => !o)}
            className={`flex items-center gap-2 text-xs font-bold px-3 py-2 border transition ${overdueOnly ? "bg-red-600 text-white border-red-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            <AlertCircle size={13} /> Overdue {overdueTasks.length > 0 && <span className="bg-red-600 text-white rounded-full px-1.5 text-[10px]">{overdueTasks.length}</span>}
          </button>
          {/* Project filter */}
          <select value={selProject} onChange={e => setSelProject(e.target.value)}
            className="border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[#DD1215] min-w-[160px]">
            <option value="">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <button onClick={() => { setCreateModal(true); setError(""); }}
            className="flex items-center gap-2 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
            <Plus size={14} /> New Task
          </button>
        </div>
      </div>

      {error && <div className="mx-6 mt-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded">{error}</div>}

      {/* Kanban Board */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader size={32} className="animate-spin text-[#DD1215]" /></div>
      ) : (
        <div className="flex gap-3 p-4 overflow-x-auto min-h-[calc(100vh-80px)]">
          {COLUMNS.map(col => {
            const tasks = displayBoard[col.key] || [];
            return (
              <div key={col.key} className="flex-shrink-0 w-72">
                {/* Column Header */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg ${col.header}`}>
                  <span className="text-xs font-black uppercase tracking-widest text-gray-700">{col.label}</span>
                  <span className="text-xs font-bold bg-white/60 rounded-full px-2 py-0.5">{tasks.length}</span>
                </div>

                {/* Cards */}
                <div className={`min-h-[200px] rounded-b-lg p-2 space-y-2 ${col.color}`}>
                  {tasks.map(task => {
                    const overdue = isOverdue(task);
                    return (
                      <div key={task._id}
                        onClick={() => openTask(task)}
                        className={`bg-white rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition border-l-4 ${overdue ? "border-l-red-500" : "border-l-transparent"}`}>
                        {/* Task ID + Priority */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono text-gray-400">{task.taskId}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${PRIORITY_BG[task.priority]}`}>
                            {task.priority}
                          </span>
                        </div>
                        {/* Title */}
                        <p className="text-sm font-semibold text-gray-900 leading-tight mb-2">{task.title}</p>
                        {/* Project tag */}
                        {task.projectId?.name && (
                          <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-semibold">
                            {task.projectId.name}
                          </span>
                        )}
                        {/* Meta */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                            {task.assignedTo && (
                              <div className="flex items-center gap-1">
                                <div className="w-5 h-5 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-[9px] font-bold">
                                  {task.assignedTo.firstName?.[0]}{task.assignedTo.lastName?.[0]}
                                </div>
                                <span>{task.assignedTo.firstName}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px]">
                            {task.comments?.length > 0 && (
                              <span className="flex items-center gap-0.5 text-gray-400"><MessageSquare size={10} /> {task.comments.length}</span>
                            )}
                            {task.deadline && (
                              <span className={`flex items-center gap-0.5 font-semibold ${overdue ? "text-red-500" : "text-gray-400"}`}>
                                <Clock size={10} /> {fmt(task.deadline)}
                              </span>
                            )}
                            {task.revisionCount > 0 && (
                              <span className="text-orange-500 font-bold">{task.revisionCount}R</span>
                            )}
                          </div>
                        </div>
                        {/* Progress bar */}
                        {task.progress > 0 && (
                          <div className="mt-2 w-full bg-gray-100 rounded-full h-1">
                            <div className="bg-[#DD1215] h-1 rounded-full" style={{ width: `${task.progress}%` }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {tasks.length === 0 && (
                    <div className="flex items-center justify-center py-8 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Empty</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black uppercase tracking-widest">New Task</h3>
              <button onClick={() => { setCreateModal(false); setError(""); }} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <Fld label="Title *"><input type="text" value={form.title} onChange={e => setForm(f => ({...f,title:e.target.value}))} className={inp} placeholder="Task title..." required /></Fld>
              <Fld label="Description"><textarea rows={2} value={form.description} onChange={e => setForm(f => ({...f,description:e.target.value}))} className={`${inp} resize-none`} placeholder="What needs to be done..." /></Fld>
              <Fld label="Instructions"><textarea rows={2} value={form.instructions} onChange={e => setForm(f => ({...f,instructions:e.target.value}))} className={`${inp} resize-none`} placeholder="Step-by-step instructions for the assignee..." /></Fld>
              <div className="grid grid-cols-2 gap-3">
                <Fld label="Priority">
                  <select value={form.priority} onChange={e => setForm(f => ({...f,priority:e.target.value}))} className={inp}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Fld>
                <Fld label="Deadline">
                  <input type="date" value={form.deadline} onChange={e => setForm(f => ({...f,deadline:e.target.value}))} className={inp} />
                </Fld>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Fld label="Assign To">
                  <select value={form.assignedTo} onChange={e => setForm(f => ({...f,assignedTo:e.target.value}))} className={inp}>
                    <option value="">Unassigned</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
                  </select>
                </Fld>
                <Fld label="Project">
                  <select value={form.projectId} onChange={e => setForm(f => ({...f,projectId:e.target.value}))} className={inp}>
                    <option value="">No project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </Fld>
              </div>
              <Fld label="Tags (comma separated)"><input type="text" value={form.tags} onChange={e => setForm(f => ({...f,tags:e.target.value}))} className={inp} placeholder="design, backend, urgent" /></Fld>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.isRecurring} onChange={e => setForm(f => ({...f,isRecurring:e.target.checked}))} className="w-4 h-4 accent-[#DD1215]" />
                Recurring task
              </label>
            </div>
            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setCreateModal(false); setError(""); }} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {saving ? "Creating..." : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {taskDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gray-900 text-white px-6 py-4 flex items-start justify-between">
              <div>
                <p className="text-xs font-mono text-gray-400 mb-1">{taskDetail.taskId}</p>
                <h3 className="text-lg font-black">{taskDetail.title}</h3>
              </div>
              <button onClick={() => setTaskDetail(null)} className="text-gray-400 hover:text-white mt-1"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Meta row */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${PRIORITY_BG[taskDetail.priority]}`}>{taskDetail.priority}</span>
                <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-700 capitalize">{taskDetail.status.replace("_"," ")}</span>
                {taskDetail.deadline && <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${isOverdue(taskDetail) ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}><Clock size={11} /> {fmt(taskDetail.deadline)}</span>}
                {taskDetail.revisionCount > 0 && <span className="px-2 py-1 rounded text-xs font-bold bg-orange-100 text-orange-700">{taskDetail.revisionCount} Revision{taskDetail.revisionCount>1?"s":""}</span>}
              </div>
              {/* Description */}
              {taskDetail.description && <div><p className="text-xs font-bold uppercase text-gray-400 mb-1">Description</p><p className="text-sm text-gray-700">{taskDetail.description}</p></div>}
              {taskDetail.instructions && <div><p className="text-xs font-bold uppercase text-gray-400 mb-1">Instructions</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{taskDetail.instructions}</p></div>}
              {/* Assignee + Reviewers */}
              <div className="grid grid-cols-2 gap-4">
                {taskDetail.assignedTo && (
                  <div><p className="text-xs font-bold uppercase text-gray-400 mb-1">Assigned To</p>
                  <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-xs font-bold">{taskDetail.assignedTo.firstName?.[0]}{taskDetail.assignedTo.lastName?.[0]}</div><span className="text-sm text-gray-800">{taskDetail.assignedTo.firstName} {taskDetail.assignedTo.lastName}</span></div></div>
                )}
                {taskDetail.projectId && (
                  <div><p className="text-xs font-bold uppercase text-gray-400 mb-1">Project</p><p className="text-sm text-gray-800">{taskDetail.projectId.name}</p></div>
                )}
              </div>
              {/* Progress */}
              <div><p className="text-xs font-bold uppercase text-gray-400 mb-1">Progress — {taskDetail.progress}%</p><div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-[#DD1215] h-2 rounded-full transition-all" style={{ width:`${taskDetail.progress}%` }}/></div></div>
              {/* Move status */}
              <div>
                <p className="text-xs font-bold uppercase text-gray-400 mb-2">Move To</p>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.filter(s => s !== taskDetail.status).map(s => (
                    <button key={s} onClick={() => { handleMove(taskDetail._id, s); setTaskDetail(null); }} disabled={movingId === taskDetail._id}
                      className="text-xs px-3 py-1.5 border border-gray-300 hover:border-[#DD1215] hover:text-[#DD1215] font-semibold capitalize transition rounded">
                      → {s.replace("_"," ")}
                    </button>
                  ))}
                </div>
              </div>
              {/* Comments */}
              <div>
                <p className="text-xs font-bold uppercase text-gray-400 mb-2">Comments ({taskDetail.comments?.length || 0})</p>
                <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                  {(taskDetail.comments || []).map((c, i) => (
                    <div key={i} className="bg-gray-50 rounded px-3 py-2">
                      <p className="text-xs font-semibold text-gray-700">{c.authorName}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{c.content}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{fmt(c.createdAt)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={comment} onChange={e => setComment(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddComment()}
                    className="flex-1 border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[#DD1215]"
                    placeholder="Add a comment..." />
                  <button onClick={handleAddComment} className="bg-gray-900 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-black transition">Post</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inp = "w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] bg-white";
const Fld = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
);

export default KanbanBoard;
