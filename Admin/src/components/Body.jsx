import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Pages/Navbar/Navbar';

const Body = () => {
  // Read admin name from localStorage
  const admin = JSON.parse(localStorage.getItem("Admin") || "{}");
  const adminName = admin?.name || admin?.email || "Super Admin";

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <Navbar />

      {/* Main content — offset by sidebar width on desktop */}
      <div className="md:ml-60 transition-all duration-300">

        {/* Top bar */}
        <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between sticky top-0 z-30 mt-16 md:mt-0">
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

        {/* Page content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Body;
