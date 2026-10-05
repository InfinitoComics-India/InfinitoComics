import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../Pages/Navbar/Navbar';
import axios from 'axios';
import { Bell, CheckCheck, ExternalLink, X } from 'lucide-react';

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

// Bulletproof role reader
const getAdminRoles = () => {
  try {
    const token = localStorage.getItem("authToken");
    const admin = JSON.parse(localStorage.getItem("Admin") || "{}");
    if (Array.isArray(admin.roles) && admin.roles.length > 0) return admin.roles;
    if (admin.role) return [admin.role];
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (Array.isArray(payload.roles) && payload.roles.length > 0) return payload.roles;
      if (payload.role) return [payload.role];
    }
  } catch {}
  return [];
};

const fmtAgo = (d) => {
  if (!d) return "";
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short" });
};

const TYPE_COLOR = {
  task_assigned:"bg-blue-100 text-blue-700", task_updated:"bg-indigo-100 text-indigo-700",
  task_overdue:"bg-red-100 text-red-700", leave_applied:"bg-yellow-100 text-yellow-700",
  leave_approved:"bg-green-100 text-green-700", leave_rejected:"bg-red-100 text-red-700",
  payslip_ready:"bg-emerald-100 text-emerald-700", goal_updated:"bg-purple-100 text-purple-700",
  performance_reviewed:"bg-pink-100 text-pink-700", announcement:"bg-orange-100 text-orange-700",
  mention:"bg-cyan-100 text-cyan-700", system:"bg-gray-100 text-gray-600",
};

const Body = () => {
  const admin     = JSON.parse(localStorage.getItem("Admin") || "{}");
  const adminName = admin?.name || admin?.email || "Super Admin";
  const location  = useLocation();
  const navigate  = useNavigate();
  const mainRef   = useRef(null);
  const bellRef   = useRef(null);

  const [unreadCount,   setUnreadCount]   = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [bellOpen,      setBellOpen]      = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // Employee redirect
  useEffect(() => {
    const roles   = getAdminRoles();
    const empOnly = roles.length > 0 && roles.every(r => r === "employee");
    const ALLOWED = ["/employee-portal","/hr/worklog","/hr/attendance","/hr/leaves","/hr/goals","/hr/documents","/hr/self-service","/messages"];
    const path = location.pathname.replace(/^\/admin/, "") || "/";
    if (empOnly && !ALLOWED.some(a => path.startsWith(a))) {
      navigate("/employee-portal", { replace: true });
    }
  }, [location.pathname]);

  // Scroll to top on route change
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [location.pathname]);

  // Poll unread count every 30s
  const fetchUnreadCount = useCallback(async () => {
    try {
      const [nRes, mRes] = await Promise.all([
        axios.get(`${BASE}/hr/notifications/unread-count`, auth()),
        axios.get(`${BASE}/messages/unread-count`, auth()),
      ]);
      setUnreadCount((nRes.data.count || 0) + (mRes.data.count || 0));
    } catch {}
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Close bell dropdown when clicking outside
  useEffect(() => {
    const h = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const openBell = async () => {
    setBellOpen(o => !o);
    if (!bellOpen) {
      try {
        setLoadingNotifs(true);
        const r = await axios.get(`${BASE}/hr/notifications/mine?limit=20`, auth());
        setNotifications(r.data.data || []);
      } catch {} finally { setLoadingNotifs(false); }
    }
  };

  const markRead = async (id) => {
    try {
      await axios.patch(`${BASE}/hr/notifications/read/${id}`, {}, auth());
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await axios.patch(`${BASE}/hr/notifications/read-all`, {}, auth());
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const deleteNotif = async (id) => {
    try {
      await axios.delete(`${BASE}/hr/notifications/delete/${id}`, auth());
      const removed = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (removed && !removed.isRead) setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-100 font-sans flex">
      <Navbar />

      <div className="flex-1 flex flex-col md:ml-60 transition-all duration-300 min-w-0">

        {/* Top bar */}
        <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between shrink-0 z-30 mt-16 md:mt-0">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Admin Panel</p>
            <h1 className="text-base font-bold text-gray-800">Welcome, {adminName}!</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Bell */}
            <div className="relative" ref={bellRef}>
              <button onClick={openBell} className="relative p-2 rounded-lg hover:bg-gray-100 transition" title="Notifications">
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#DD1215] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div className="absolute right-0 top-12 w-[360px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col" style={{maxHeight:"480px"}}>
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div>
                      <p className="font-black text-gray-900 text-sm">Notifications</p>
                      <p className="text-[10px] text-gray-400">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up ✅"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="flex items-center gap-1 text-[10px] text-blue-600 font-bold hover:underline">
                          <CheckCheck size={12}/> Mark all read
                        </button>
                      )}
                      <button onClick={() => setBellOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={14}/></button>
                    </div>
                  </div>

                  <div className="overflow-y-auto flex-1">
                    {loadingNotifs ? (
                      <div className="text-center py-8 text-gray-400 text-xs">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-10">
                        <Bell size={28} className="mx-auto text-gray-200 mb-2"/>
                        <p className="text-xs text-gray-400">No notifications yet</p>
                      </div>
                    ) : notifications.map(n => (
                      <div key={n._id} className={`flex gap-3 px-4 py-3 border-b last:border-0 hover:bg-gray-50 transition group ${!n.isRead ? "bg-blue-50/50 border-l-2 border-l-[#DD1215]" : ""}`}>
                        <div className="shrink-0 mt-1">
                          <span className={`inline-block w-2 h-2 rounded-full mt-1 ${!n.isRead ? "bg-[#DD1215]" : "bg-gray-300"}`}/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-xs font-bold leading-snug ${!n.isRead ? "text-gray-900" : "text-gray-600"}`}>{n.title}</p>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0 capitalize ${TYPE_COLOR[n.type] || TYPE_COLOR.system}`}>
                              {n.type?.replace(/_/g," ")}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[9px] text-gray-400 mt-1">{fmtAgo(n.createdAt)}</p>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                          {!n.isRead && (
                            <button onClick={() => markRead(n._id)} title="Mark read" className="text-blue-400 hover:text-blue-600"><CheckCheck size={13}/></button>
                          )}
                          <button onClick={() => deleteNotif(n._id)} title="Delete" className="text-gray-300 hover:text-red-500"><X size={13}/></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t px-4 py-2.5">
                    <Link to="/hr/notifications" onClick={() => setBellOpen(false)}
                      className="flex items-center justify-center gap-1.5 text-xs text-[#DD1215] font-bold hover:underline">
                      <ExternalLink size={12}/> View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-[#DD1215] flex items-center justify-center text-white font-bold text-sm">
              {adminName[0]?.toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">{adminName}</span>
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Body;
