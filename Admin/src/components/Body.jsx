import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Pages/Navbar/Navbar';

const Body = () => {
  const admin     = JSON.parse(localStorage.getItem("Admin") || "{}");
  const adminName = admin?.name || admin?.email || "Super Admin";
  const location  = useLocation();
  const mainRef   = useRef(null);

  // When route changes, scroll only the content area back to top
  // NOT the whole window — this prevents the unwanted full-page scroll
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    // Full viewport height, no overflow on the root — prevents window scroll
    <div className="h-screen overflow-hidden bg-gray-100 font-sans flex">

      {/* Sidebar — fixed, full height */}
      <Navbar />

      {/* Right side — flex column, takes remaining width */}
      <div className="flex-1 flex flex-col md:ml-60 transition-all duration-300 min-w-0">

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
