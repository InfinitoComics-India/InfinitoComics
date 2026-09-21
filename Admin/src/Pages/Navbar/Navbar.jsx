import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import URLs from '../../Utils/utils.js';
import { LogOut, Home, BookOpen, Users, User, FlaskConical, FileText, HelpCircle, Clock, Briefcase, ShieldCheck, Menu, X, ChevronRight, ChevronDown, Mail, UserCog, Bell, ScrollText, CalendarDays, CalendarOff, Kanban, UserCheck, FolderKanban, TrendingUp, Target, Award as AwardIcon, Building2 } from "lucide-react";
import { message, Popconfirm } from "antd";
import { getRoles } from '../../Utils/auth.js';

const HR_ALL   = ["superadmin","hr_manager","manager","team_lead","comics_admin","character_admin","research_admin","blog_admin","career_admin"];
const HR_AUDIT = ["superadmin","hr_manager"];

// ── Regular nav items (above HR section) ────────────────────
const NAV_ITEMS = [
  { label: "Home",            to: "/",                 icon: Home,        roles: ["superadmin","comics_admin","character_admin","research_admin","blog_admin","career_admin"] },
  { label: "Comics",          to: "/comic",            icon: BookOpen,    roles: ["superadmin","comics_admin"] },
  { label: "Characters",      to: "/characters",       icon: User,        roles: ["superadmin","character_admin"] },
  { label: "Research",        to: "/research",         icon: FlaskConical,roles: ["superadmin","research_admin"] },
  { label: "Blogs",           to: "/createblog",       icon: FileText,    roles: ["superadmin","blog_admin"] },
  { label: "FAQs",            to: "/createfaq",        icon: HelpCircle,  roles: ["superadmin","blog_admin"] },
  { label: "Timeline",        to: "/timeline",         icon: Clock,       roles: ["superadmin","blog_admin"] },
  { label: "Career",          to: "/career",           icon: Briefcase,   roles: ["superadmin","career_admin"] },
  { label: "Users",           to: "/users",            icon: Users,       roles: ["superadmin"] },
  { label: "Admin Mgmt",      to: "/admin-management", icon: ShieldCheck, roles: ["superadmin"] },
  { label: "Contact Queries", to: "/contact-queries",  icon: Mail,        roles: ["superadmin"] },
];

// ── HR sub-items (shown inside collapsible accordion) ────────
const HR_ITEMS = [
  { label: "Employees",       to: "/hr/employees",    icon: UserCog,      roles: HR_ALL   },
  { label: "Notifications",   to: "/hr/notifications",icon: Bell,         roles: HR_ALL   },
  { label: "Audit Log",       to: "/hr/audit",        icon: ScrollText,   roles: HR_AUDIT },
  { label: "Attendance",      to: "/hr/attendance",   icon: Clock,        roles: HR_ALL   },
  { label: "Leaves",          to: "/hr/leaves",       icon: CalendarOff,  roles: HR_ALL   },
  { label: "Calendar",        to: "/hr/calendar",     icon: CalendarDays, roles: HR_ALL   },
  { label: "Task Board",      to: "/hr/tasks",        icon: Kanban,       roles: HR_ALL   },
  { label: "Work Assignment", to: "/hr/assignments",  icon: UserCheck,    roles: HR_ALL   },
  { label: "Projects",        to: "/hr/projects",     icon: FolderKanban, roles: HR_ALL   },
  { label: "Performance",     to: "/hr/performance",  icon: TrendingUp,   roles: HR_ALL   },
  { label: "Goals",           to: "/hr/goals",        icon: Target,       roles: HR_ALL   },
  { label: "Recognition",     to: "/hr/recognition",  icon: AwardIcon,    roles: HR_ALL   },
];

const Navbar = () => {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hrOpen, setHrOpen]         = useState(false); // HR accordion open/closed
  const location = useLocation();
  const token = localStorage.getItem("authToken");
  const roles = getRoles();

  const visibleNav = NAV_ITEMS.filter(item => roles.some(r => item.roles.includes(r)));
  const visibleHR  = HR_ITEMS.filter(item  => roles.some(r => item.roles.includes(r)));
  const showHRSection = visibleHR.length > 0;

  // If any HR route is currently active, keep accordion open
  const isHRActive = visibleHR.some(item => location.pathname.startsWith(`/admin${item.to}`));

  const handleLogout = () => {
    localStorage.clear();
    message.success("Logged out successfully");
    window.location.href = "/admin";
  };

  const isActive = (to) => {
    if (to === "/") return location.pathname === "/admin" || location.pathname === "/admin/";
    return location.pathname.startsWith(`/admin${to}`);
  };

  const SidebarContent = ({ onNavClick }) => (
    <div className="flex flex-col h-full">
      {/* Logo + collapse button */}
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-4 py-4 border-b border-gray-700`}>
        {!collapsed && (
          <Link to="/" onClick={onNavClick}>
            <img src={URLs.Logo_url} alt="Infinito" className="h-10 w-auto object-contain bg-white rounded p-1" />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition"
        >
          {collapsed ? <ChevronRight size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">

        {/* ── Regular items ── */}
        {visibleNav.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onNavClick}
            title={collapsed ? label : ""}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
              ${isActive(to) ? "bg-[#DD1215] text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <Icon size={20} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}

        {/* ── HR System Accordion ── */}
        {showHRSection && (
          <div className="mt-2">

            {/* HR Header — bold, clickable, with chevron */}
            {!collapsed ? (
              <button
                onClick={() => setHrOpen(o => !o)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 group
                  ${isHRActive ? "bg-gray-800 text-white" : "text-gray-200 hover:bg-gray-700 hover:text-white"}
                `}
              >
                <div className="flex items-center gap-3">
                  <Building2 size={20} className="shrink-0 text-[#DD1215]" />
                  <span className="text-sm font-black uppercase tracking-widest text-[#DD1215]">HR System</span>
                </div>
                <div className={`transition-transform duration-200 ${(hrOpen || isHRActive) ? "rotate-180" : ""}`}>
                  <ChevronDown size={16} className="text-[#DD1215]" />
                </div>
              </button>
            ) : (
              // Collapsed: show just icon as toggle
              <button
                onClick={() => setHrOpen(o => !o)}
                title="HR System"
                className="flex items-center justify-center w-full py-2.5 rounded-lg text-[#DD1215] hover:bg-gray-700 transition"
              >
                <Building2 size={20} />
              </button>
            )}

            {/* HR Sub-items — animated dropdown */}
            {(hrOpen || isHRActive) && (
              <div className={`mt-1 space-y-0.5 overflow-hidden ${!collapsed ? "pl-2" : ""}`}>
                {visibleHR.map(({ label, to, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={onNavClick}
                    title={collapsed ? label : ""}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
                      ${isActive(to)
                        ? "bg-[#DD1215] text-white font-bold"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white font-medium"
                      }
                      ${collapsed ? "justify-center" : ""}
                    `}
                  >
                    <Icon size={17} className="shrink-0" />
                    {!collapsed && (
                      <span className="text-xs">{label}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-gray-700">
        {token ? (
          <Popconfirm
            title="Log Out"
            description="Are you sure you want to log out?"
            onConfirm={handleLogout}
            okText="Yes"
            cancelText="No"
            placement="topLeft"
          >
            <button
              title={collapsed ? "Logout" : ""}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-all
                ${collapsed ? "justify-center" : ""}
              `}
            >
              <LogOut size={20} className="shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </Popconfirm>
        ) : (
          <Link
            to="/login"
            onClick={onNavClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-all
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span>Login</span>}
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 left-0 h-screen bg-gray-900 z-50 transition-all duration-300 shadow-xl
          ${collapsed ? "w-16" : "w-60"}
        `}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Top Bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 px-4 py-3 flex items-center justify-between shadow-lg">
        <Link to="/">
          <img src={URLs.Logo_url} alt="Infinito" className="h-10 w-auto object-contain bg-white rounded p-1" />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          {/* Drawer */}
          <div className="relative w-64 bg-gray-900 h-full shadow-2xl flex flex-col pt-16">
            <SidebarContent onNavClick={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
