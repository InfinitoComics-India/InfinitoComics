import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Pages/Navbar/Navbar';

const Body = () => {
  const admin = JSON.parse(localStorage.getItem("Admin") || "{}");
  const adminName = admin?.name || admin?.email || "Super Admin";
  const location = useLocation();
  const mainRef = useRef(null);

  // When route changes, scroll only the content area back to top
  // NOT the whole window — this prevents the unwanted full-page scroll
  useEffect(() => {
    const roles = getAdminRoles();
    const empOnly = roles.length > 0 && roles.every(r => r === "employee");
    const EMPLOYEE_ALLOWED = [
      "/employee-portal",
      "/hr/worklog",
      "/hr/attendance",
      "/hr/leaves",
      "/hr/goals",
      "/hr/documents",
      "/hr/self-service",
      "/messages",
    ];
    const path = location.pathname.replace(/^\/admin/, "") || "/";
    if (empOnly && !EMPLOYEE_ALLOWED.some(a => path.startsWith(a))) {
      navigate("/employee-portal", { replace: true });
    }
  }, [location.pathname]);

  // Scroll content to top on route change
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [location.pathname]);

  // Poll unread count every 30s (notifications + messages)
  const fetchUnreadCount = useCallback(async () => {
    try {
      const [nRes, mRes] = await Promise.all([
        axios.get(`${BASE}/hr/notifications/unread-count`, auth()),
        axios.get(`${BASE}/messages/unread-count`, auth()),
      ]);
      setUnreadCount((nRes.data.count || 0) + (mRes.data.count || 0));
    } catch { }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load notifications when bell opens
  const openBell = async () => {
    setBellOpen(o => !o);
    if (!bellOpen) {
      try {
        setLoadingNotifs(true);
        const r = await axios.get(`${BASE}/hr/notifications/mine?limit=20`, auth());
        setNotifications(r.data.data || []);
      } catch { } finally { setLoadingNotifs(false); }
    }
  };

  const markRead = async (id) => {
    try {
      await axios.patch(`${BASE}/hr/notifications/read/${id}`, {}, auth());
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch { }
  };

  const markAllRead = async () => {
    try {
      await axios.patch(`${BASE}/hr/notifications/read-all`, {}, auth());
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { }
  };

  const deleteNotif = async (id) => {
    try {
      await axios.delete(`${BASE}/hr/notifications/delete/${id}`, auth());
      const removed = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (removed && !removed.isRead) setUnreadCount(c => Math.max(0, c - 1));
    } catch { }
  };

  return (
    // Full viewport height, no overflow on the root — prevents window scroll
    <div className="h-screen overflow-hidden bg-gray-100 font-sans flex">

      {/* Sidebar — fixed, full height */}
      <Navbar />

      {/* Right side — flex column, takes remaining width */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 min-w-0">

        {/* Top bar — fixed at top of content area, never scrolls away */}
        <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between shrink-0 z-30 mt-16 md:mt-0">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Admin Panel</p>
            <h1 className="text-base font-bold text-gray-800">Welcome, {adminName}!</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#DD1215] flex items-center justify-center text-white font-bold text-sm">
              {adminName[0]?.toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">{adminName}</span>
          </div>
        </header>

        {/* Scrollable content area — ONLY this div scrolls, not the whole window */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto p-4 md:p-6"
        >
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Body;
