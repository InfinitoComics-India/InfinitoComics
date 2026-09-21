import React, { useState, useEffect } from "react";
import { Bell, BellOff, Check, CheckCheck, Trash2, RefreshCw, Loader } from "lucide-react";
import {
  getMyNotifications,
  markNotifRead,
  markAllNotifsRead,
  deleteNotification,
} from "../../services/hrServices";

const TYPE_STYLES = {
  task_assigned:       { bg: "bg-blue-50",   dot: "bg-blue-500",   label: "Task"         },
  task_updated:        { bg: "bg-blue-50",   dot: "bg-blue-400",   label: "Task"         },
  task_overdue:        { bg: "bg-red-50",    dot: "bg-red-500",    label: "Overdue"      },
  leave_applied:       { bg: "bg-yellow-50", dot: "bg-yellow-500", label: "Leave"        },
  leave_approved:      { bg: "bg-green-50",  dot: "bg-green-500",  label: "Leave"        },
  leave_rejected:      { bg: "bg-red-50",    dot: "bg-red-400",    label: "Leave"        },
  payslip_ready:       { bg: "bg-purple-50", dot: "bg-purple-500", label: "Payroll"      },
  goal_updated:        { bg: "bg-indigo-50", dot: "bg-indigo-500", label: "Goal"         },
  performance_reviewed:{ bg: "bg-pink-50",   dot: "bg-pink-500",   label: "Performance"  },
  announcement:        { bg: "bg-orange-50", dot: "bg-orange-500", label: "Announcement" },
  mention:             { bg: "bg-cyan-50",   dot: "bg-cyan-500",   label: "Mention"      },
  system:              { bg: "bg-gray-50",   dot: "bg-gray-400",   label: "System"       },
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [filter, setFilter]               = useState("all"); // all | unread | read

  const load = async () => {
    try {
      setLoading(true); setError("");
      const res = await getMyNotifications(100);
      setNotifications(res.data.data || []);
    } catch { setError("Failed to load notifications."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotifRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch { setError("Failed to mark as read."); }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotifsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { setError("Failed to mark all as read."); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch { setError("Failed to delete notification."); }
  };

  const filtered = notifications.filter(n => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read")   return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fmt = (d) => {
    if (!d) return "";
    const date = new Date(d);
    const now  = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60)   return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell size={22} className="text-[#DD1215]" />
          <div>
            <h1 className="text-2xl font-black tracking-widest text-gray-900">NOTIFICATIONS</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead}
              className="flex items-center gap-2 text-xs text-gray-600 border border-gray-300 px-3 py-2 hover:bg-gray-50 transition font-semibold uppercase tracking-wider">
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
          <button onClick={load}
            className="flex items-center gap-2 text-xs text-gray-600 border border-gray-300 px-3 py-2 hover:bg-gray-50 transition">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">

        {/* Filter tabs */}
        <div className="flex gap-1 bg-white border rounded-lg p-1 w-fit">
          {[
            { key: "all",    label: `All (${notifications.length})`      },
            { key: "unread", label: `Unread (${unreadCount})`            },
            { key: "read",   label: `Read (${notifications.length - unreadCount})` },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition rounded ${
                filter === key ? "bg-[#DD1215] text-white" : "text-gray-500 hover:text-gray-800"
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">{error}</div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size={28} className="animate-spin text-[#DD1215]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border rounded-lg flex flex-col items-center justify-center py-20 text-gray-400">
            <BellOff size={40} className="mb-3 opacity-30" />
            <p className="font-semibold">No notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(n => {
              const style = TYPE_STYLES[n.type] || TYPE_STYLES.system;
              return (
                <div key={n._id}
                  className={`bg-white border rounded-lg px-5 py-4 flex items-start gap-4 transition hover:shadow-sm ${
                    !n.isRead ? "border-l-4 border-l-[#DD1215]" : ""
                  }`}>
                  {/* Dot */}
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${style.dot}`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${style.bg} text-gray-600`}>
                        {style.label}
                      </span>
                      {!n.isRead && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#DD1215]">New</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{fmt(n.createdAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!n.isRead && (
                      <button onClick={() => handleMarkRead(n._id)} title="Mark as read"
                        className="text-gray-400 hover:text-green-600 transition">
                        <Check size={15} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(n._id)} title="Delete"
                      className="text-gray-400 hover:text-red-500 transition">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
