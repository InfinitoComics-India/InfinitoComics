import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, UserCog, UserSearch, UserPlus, Clock, CalendarOff, CalendarDays,
  ClipboardList, UserCheck, Kanban, FolderKanban, TrendingUp, Target, Award,
  IndianRupee, FileArchive, LifeBuoy, MessagesSquare, Bell, ScrollText,
  ChevronRight, Users, CheckCircle, AlertCircle, Briefcase
} from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const HRDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats]   = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [empRes, leaveRes, notifRes, payrollRes, recruitRes, onboardRes, attRes] = await Promise.allSettled([
          axios.get(`${BASE}/hr/employees/getall`, auth()),
          axios.get(`${BASE}/hr/leaves/all`, auth()),
          axios.get(`${BASE}/hr/notifications/unread-count`, auth()),
          axios.get(`${BASE}/hr/payroll/summary`, auth(), { params: { month: new Date().getMonth()+1, year: new Date().getFullYear() } }),
          axios.get(`${BASE}/hr/recruitment/stats`, auth()),
          axios.get(`${BASE}/hr/onboarding/active`, auth()),
          axios.get(`${BASE}/hr/attendance/today`, auth()),
        ]);

        const employees   = empRes.status       === "fulfilled" ? empRes.value.data.data     || [] : [];
        const leaves      = leaveRes.status     === "fulfilled" ? leaveRes.value.data.data   || [] : [];
        const notifCount  = notifRes.status     === "fulfilled" ? notifRes.value.data.count  || 0  : 0;
        const paySlips    = payrollRes.status   === "fulfilled" ? payrollRes.value.data.data || [] : [];
        const recruitStats= recruitRes.status   === "fulfilled" ? recruitRes.value.data.data || [] : [];
        const onboarding  = onboardRes.status   === "fulfilled" ? onboardRes.value.data.data || [] : [];
        const attToday    = attRes.status       === "fulfilled" ? attRes.value.data.data     || [] : [];

        const pendingLeaves  = leaves.filter(l => l.status === "pending").length;
        const draftPayslips  = paySlips.find(s => s._id === "draft")?.count || 0;
        const openPositions  = recruitStats.find(s => s._id === "applied")?.count || 0;
        const hiringTotal    = recruitStats.reduce((s, r) => s + (r.count || 0), 0);
        const presentToday   = attToday.filter(r => ["present","late"].includes(r.status)).length;
        const worklogToday   = 0; // placeholder

        setStats({
          employees:    { value: employees.length,     sub: "active employees"       },
          present:      { value: presentToday,          sub: "present today"          },
          leaves:       { value: pendingLeaves,          sub: "pending approval"       },
          openPositions:{ value: openPositions,          sub: "new applicants"         },
          recruitment:  { value: hiringTotal,            sub: "total in pipeline"      },
          onboarding:   { value: onboarding.length,      sub: "in progress"            },
          attendance:   { value: presentToday,           sub: "present today"          },
          payroll:      { value: draftPayslips,          sub: "draft payslips"         },
          notifications:{ value: notifCount,             sub: "unread"                 },
          worklogs:     { value: worklogToday,           sub: "submitted today"        },
        });
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const SECTIONS = [
    {
      title: "People",
      accent: "#DD1215",
      lightBg: "bg-red-50",
      borderColor: "border-red-100",
      modules: [
        { label: "Employees",   to: "/hr/employees",   icon: UserCog,    desc: "Manage all employee records",         statKey: "employees"    },
        { label: "Recruitment", to: "/hr/recruitment", icon: UserSearch, desc: "Track candidates & hiring pipeline",  statKey: "recruitment"  },
        { label: "Onboarding",  to: "/hr/onboarding",  icon: UserPlus,   desc: "New hire checklists & setup",         statKey: "onboarding"   },
      ],
    },
    {
      title: "Time & Work",
      accent: "#2563eb",
      lightBg: "bg-blue-50",
      borderColor: "border-blue-100",
      modules: [
        { label: "Attendance", to: "/hr/attendance", icon: Clock,         desc: "Daily check-in & attendance view",   statKey: "attendance"  },
        { label: "Leaves",     to: "/hr/leaves",     icon: CalendarOff,   desc: "Leave requests & approvals",         statKey: "leaves"      },
        { label: "Calendar",   to: "/hr/calendar",   icon: CalendarDays,  desc: "Company events & holidays",          statKey: null          },
        { label: "Work Log",   to: "/hr/worklog",    icon: ClipboardList, desc: "Daily work updates from team",       statKey: "worklogs"    },
      ],
    },
    {
      title: "Tasks & Projects",
      accent: "#7c3aed",
      lightBg: "bg-violet-50",
      borderColor: "border-violet-100",
      modules: [
        { label: "Work Assignment", to: "/hr/assignments", icon: UserCheck,    desc: "Assign tasks to team members",   statKey: null },
        { label: "Task Board",      to: "/hr/tasks",       icon: Kanban,       desc: "Kanban board for all tasks",     statKey: null },
        { label: "Projects",        to: "/hr/projects",    icon: FolderKanban, desc: "Project tracking & management",  statKey: null },
      ],
    },
    {
      title: "Performance",
      accent: "#16a34a",
      lightBg: "bg-green-50",
      borderColor: "border-green-100",
      modules: [
        { label: "Performance", to: "/hr/performance", icon: TrendingUp, desc: "Review & track performance",       statKey: null },
        { label: "Goals",       to: "/hr/goals",       icon: Target,     desc: "Set and monitor employee goals",   statKey: null },
        { label: "Recognition", to: "/hr/recognition", icon: Award,      desc: "Celebrate team achievements",      statKey: null },
      ],
    },
    {
      title: "Finance",
      accent: "#d97706",
      lightBg: "bg-amber-50",
      borderColor: "border-amber-100",
      modules: [
        { label: "Payroll", to: "/hr/payroll", icon: IndianRupee, desc: "Salary structures & monthly payslips", statKey: "payroll" },
      ],
    },
    {
      title: "Admin & Support",
      accent: "#475569",
      lightBg: "bg-slate-50",
      borderColor: "border-slate-100",
      modules: [
        { label: "Documents",     to: "/hr/documents",    icon: FileArchive,    desc: "HR documents & contracts",      statKey: null          },
        { label: "Self Service",  to: "/hr/self-service", icon: LifeBuoy,       desc: "Employee requests & queries",   statKey: null          },
        { label: "Chat",          to: "/hr/chat",         icon: MessagesSquare, desc: "Internal team communication",   statKey: null          },
        { label: "Notifications", to: "/hr/notifications",icon: Bell,           desc: "Alerts & announcements",        statKey: "notifications"},
        { label: "Audit Log",     to: "/hr/audit",        icon: ScrollText,     desc: "Activity & change history",     statKey: null          },
      ],
    },
  ];

  const topStats = [
    { label: "Total Employees", value: stats.employees?.value,   icon: Users,        color: "text-[#DD1215]", bg: "bg-red-50"    },
    { label: "Present Today",   value: stats.present?.value,     icon: CheckCircle,  color: "text-green-600", bg: "bg-green-50"  },
    { label: "Pending Leaves",  value: stats.leaves?.value,      icon: AlertCircle,  color: "text-yellow-600",bg: "bg-yellow-50" },
    { label: "Open Positions",  value: stats.openPositions?.value,icon: Briefcase,   color: "text-blue-600",  bg: "bg-blue-50"   },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="bg-white border-b px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#DD1215] flex items-center justify-center">
            <Building2 size={22} className="text-white"/>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-widest text-gray-900">HR SYSTEM</h1>
            <p className="text-xs text-gray-400 mt-0.5">People · Attendance · Payroll · Performance</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {topStats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white border rounded-xl px-5 py-4 flex items-center gap-4 hover:shadow-sm transition">
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={22} className={color}/>
              </div>
              <div>
                <p className={`text-2xl font-black ${color}`}>
                  {loading ? <span className="text-gray-200 animate-pulse">—</span> : (value ?? "—")}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5 leading-tight">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sections */}
        {SECTIONS.map(section => (
          <div key={section.title}>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 rounded-full" style={{ background: section.accent }}/>
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-700">{section.title}</h2>
              <div className="flex-1 border-t border-gray-200"/>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {section.modules.map(mod => {
                const Icon = mod.icon;
                const stat = mod.statKey ? stats[mod.statKey] : null;
                return (
                  <button key={mod.to} onClick={() => navigate(mod.to)}
                    className={`${section.lightBg} border ${section.borderColor} rounded-xl p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
                        <Icon size={20} style={{ color: section.accent }}/>
                      </div>
                      <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all mt-1"/>
                    </div>
                    <p className="text-sm font-black text-gray-900 mb-1">{mod.label}</p>
                    <p className="text-[11px] text-gray-500 leading-snug mb-3">{mod.desc}</p>
                    {loading ? (
                      <div className="h-5 w-16 bg-white/50 rounded animate-pulse"/>
                    ) : stat ? (
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full text-white"
                        style={{ background: stat.value > 0 ? section.accent : "#9ca3af" }}>
                        {stat.value} {stat.sub}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-semibold">Open →</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HRDashboard;
