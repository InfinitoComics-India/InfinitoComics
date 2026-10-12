import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, UserCog, UserSearch, UserPlus, Clock, CalendarOff, CalendarDays,
  ClipboardList, UserCheck, Kanban, FolderKanban, TrendingUp, Target, Award,
  IndianRupee, FileArchive, LifeBuoy, MessagesSquare, Bell, ScrollText,
  ChevronRight, Users, Loader, CheckCircle, AlertCircle
} from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const SECTIONS = [
  {
    key: "people",
    title: "People",
    color: "from-red-50 to-rose-50",
    accent: "bg-[#DD1215]",
    border: "border-red-200",
    modules: [
      { label: "Employees",   to: "/hr/employees",   icon: UserCog,    desc: "Manage all employee records",        statKey: "employees"   },
      { label: "Recruitment", to: "/hr/recruitment", icon: UserSearch, desc: "Track candidates & hiring pipeline", statKey: "recruitment" },
      { label: "Onboarding",  to: "/hr/onboarding",  icon: UserPlus,   desc: "New hire checklists & setup",        statKey: "onboarding"  },
    ],
  },
  {
    key: "time",
    title: "Time & Work",
    color: "from-blue-50 to-sky-50",
    accent: "bg-blue-600",
    border: "border-blue-200",
    modules: [
      { label: "Attendance", to: "/hr/attendance", icon: Clock,        desc: "Daily check-in & attendance view",    statKey: "attendance" },
      { label: "Leaves",     to: "/hr/leaves",     icon: CalendarOff,  desc: "Leave requests & approvals",          statKey: "leaves"     },
      { label: "Calendar",   to: "/hr/calendar",   icon: CalendarDays, desc: "Company events & holidays",           statKey: null         },
      { label: "Work Log",   to: "/hr/worklog",    icon: ClipboardList,desc: "Daily work updates from employees",   statKey: "worklogs"   },
    ],
  },
  {
    key: "tasks",
    title: "Tasks & Projects",
    color: "from-violet-50 to-purple-50",
    accent: "bg-violet-600",
    border: "border-violet-200",
    modules: [
      { label: "Work Assignment", to: "/hr/assignments", icon: UserCheck,   desc: "Assign tasks to team members",   statKey: null },
      { label: "Task Board",      to: "/hr/tasks",       icon: Kanban,      desc: "Kanban board for all tasks",     statKey: null },
      { label: "Projects",        to: "/hr/projects",    icon: FolderKanban,desc: "Project tracking & management",  statKey: null },
    ],
  },
  {
    key: "performance",
    title: "Performance",
    color: "from-green-50 to-emerald-50",
    accent: "bg-green-600",
    border: "border-green-200",
    modules: [
      { label: "Performance", to: "/hr/performance", icon: TrendingUp, desc: "Review & track performance",       statKey: null },
      { label: "Goals",       to: "/hr/goals",       icon: Target,     desc: "Set and monitor employee goals",   statKey: null },
      { label: "Recognition", to: "/hr/recognition", icon: Award,      desc: "Celebrate team achievements",      statKey: null },
    ],
  },
  {
    key: "finance",
    title: "Finance",
    color: "from-yellow-50 to-amber-50",
    accent: "bg-yellow-500",
    border: "border-yellow-200",
    modules: [
      { label: "Payroll", to: "/hr/payroll", icon: IndianRupee, desc: "Salary structures & monthly payslips", statKey: "payroll" },
    ],
  },
  {
    key: "admin",
    title: "Admin & Support",
    color: "from-gray-50 to-slate-50",
    accent: "bg-gray-600",
    border: "border-gray-200",
    modules: [
      { label: "Documents",     to: "/hr/documents",    icon: FileArchive,    desc: "HR documents & contracts",       statKey: null },
      { label: "Self Service",  to: "/hr/self-service", icon: LifeBuoy,       desc: "Employee requests & queries",    statKey: null },
      { label: "Chat",          to: "/hr/chat",         icon: MessagesSquare, desc: "Internal team communication",    statKey: null },
      { label: "Notifications", to: "/hr/notifications",icon: Bell,           desc: "Alerts & announcements",         statKey: "notifications" },
      { label: "Audit Log",     to: "/hr/audit",        icon: ScrollText,     desc: "Activity & change history",      statKey: null },
    ],
  },
];

const HRDashboard = () => {
  const navigate   = useNavigate();
  const [stats,    setStats]   = useState({});
  const [loading,  setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [empRes, leaveRes, notifRes, payrollRes, recruitRes, onboardRes] = await Promise.allSettled([
          axios.get(`${BASE}/hr/employees/getall`, auth()),
          axios.get(`${BASE}/hr/leaves/all`, auth()),
          axios.get(`${BASE}/hr/notifications/unread-count`, auth()),
          axios.get(`${BASE}/hr/payroll/summary`, auth(), { params: { month: new Date().getMonth()+1, year: new Date().getFullYear() } }),
          axios.get(`${BASE}/hr/recruitment/stats`, auth()),
          axios.get(`${BASE}/hr/onboarding/active`, auth()),
        ]);

        const employees  = empRes.status === "fulfilled"    ? (empRes.value.data.data   || []) : [];
        const leaves     = leaveRes.status === "fulfilled"  ? (leaveRes.value.data.data || []) : [];
        const notifCount = notifRes.status === "fulfilled"  ? (notifRes.value.data.count|| 0)  : 0;
        const paySlips   = payrollRes.status === "fulfilled"? (payrollRes.value.data.data||[])  : [];
        const recruitStats = recruitRes.status === "fulfilled" ? (recruitRes.value.data.data||[]) : [];
        const onboarding = onboardRes.status === "fulfilled"? (onboardRes.value.data.data||[])  : [];

        const pendingLeaves = leaves.filter(l => l.status === "pending").length;
        const draftPayslips = paySlips.find(s => s._id === "draft")?.count || 0;
        const hiringCount   = recruitStats.find(s => s._id === "applied")?.count || 0;

        // Today attendance — use attendance today endpoint
        let presentToday = 0;
        try {
          const attRes = await axios.get(`${BASE}/hr/attendance/today`, auth());
          presentToday = (attRes.data.data || []).filter(r => ["present","late"].includes(r.status)).length;
        } catch {}

        // Today worklogs
        const today = new Date().toISOString().split("T")[0];
        let submittedLogs = 0;
        try {
          const wlRes = await axios.get(`${BASE}/hr/worklog/summary`, { ...auth(), params: { date: today } });
          submittedLogs = wlRes.data.data?.submitted || 0;
        } catch {}

        setStats({
          employees:    { value: employees.length,   label: "active"           },
          attendance:   { value: presentToday,        label: "present today"    },
          leaves:       { value: pendingLeaves,        label: "pending approval" },
          payroll:      { value: draftPayslips,        label: "draft payslips"   },
          recruitment:  { value: hiringCount,          label: "new applicants"   },
          onboarding:   { value: onboarding.length,    label: "in progress"      },
          notifications:{ value: notifCount,           label: "unread"           },
          worklogs:     { value: submittedLogs,        label: "submitted today"  },
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const topStats = [
    { label:"Total Employees",  value: stats.employees?.value   ?? "—", icon: Users,        color:"text-[#DD1215]", bg:"bg-red-50"    },
    { label:"Present Today",    value: stats.attendance?.value  ?? "—", icon: CheckCircle,  color:"text-green-600", bg:"bg-green-50"  },
    { label:"Pending Leaves",   value: stats.leaves?.value      ?? "—", icon: AlertCircle,  color:"text-yellow-600",bg:"bg-yellow-50" },
    { label:"Draft Payslips",   value: stats.payroll?.value     ?? "—", icon: IndianRupee,  color:"text-blue-600",  bg:"bg-blue-50"   },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b px-6 py-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#DD1215] flex items-center justify-center shrink-0">
          <Building2 size={22} className="text-white"/>
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-widest text-gray-900">HR SYSTEM</h1>
          <p className="text-xs text-gray-400 mt-0.5">People · Attendance · Payroll · Performance</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">

        {/* ── Top Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {loading ? (
            Array.from({length:4}).map((_,i) => (
              <div key={i} className="bg-white border rounded-xl px-4 py-4 flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-lg bg-gray-100"/>
                <div className="space-y-2 flex-1"><div className="h-5 bg-gray-100 rounded w-12"/><div className="h-3 bg-gray-100 rounded w-20"/></div>
              </div>
            ))
          ) : topStats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white border rounded-xl px-4 py-4 flex items-center gap-3 hover:shadow-sm transition">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={20} className={color}/>
              </div>
              <div>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Sections ── */}
        {SECTIONS.map(section => (
          <div key={section.key}>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-1 h-6 rounded-full ${section.accent}`}/>
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-700">{section.title}</h2>
              <div className="flex-1 border-t border-gray-200"/>
            </div>

            {/* Module cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {section.modules.map(mod => {
                const Icon  = mod.icon;
                const stat  = mod.statKey ? stats[mod.statKey] : null;
                return (
                  <button key={mod.to} onClick={() => navigate(mod.to)}
                    className={`bg-gradient-to-br ${section.color} border ${section.border} rounded-xl p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg ${section.accent} bg-opacity-10 flex items-center justify-center`}
                        style={{background:"rgba(0,0,0,0.06)"}}>
                        <Icon size={20} className="text-gray-700"/>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all"/>
                    </div>
                    <p className="text-sm font-black text-gray-900 mb-1">{mod.label}</p>
                    <p className="text-[11px] text-gray-500 leading-snug mb-3">{mod.desc}</p>
                    {stat ? (
                      <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${section.accent} text-white`}
                        style={{background: stat.value > 0 ? undefined : "#9ca3af"}}>
                        {stat.value} {stat.label}
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400">
                        Open →
                      </div>
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
