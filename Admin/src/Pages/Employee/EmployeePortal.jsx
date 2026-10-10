import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Clock, CheckCircle, AlertTriangle, CalendarOff, IndianRupee,
  Target, FileText, User, Send, Loader, LogIn, LogOut as LogOutIcon,
  ClipboardList, Headphones, TrendingUp, Lock, MessageCircle, Inbox,
  SendHorizonal, Trash2, Plus, X, ChevronDown, ShoppingBag, Package,
  FolderOpen, BarChart3, Sparkles, Building2, ExternalLink, ArrowRight,
  ShieldCheck, RefreshCw, Check
} from "lucide-react";
import { isEmployeeShopAllowed } from "../../services/shopServices/shopAccessService";
import { getAllProducts } from "../../services/shopServices/productService";
import { getAllCategories } from "../../services/shopServices/categoryService";
import { getAllOrders } from "../../services/shopServices/orderService";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const STATUS_COLORS = {
  present:  "bg-green-100 text-green-700",
  absent:   "bg-red-100 text-red-700",
  late:     "bg-yellow-100 text-yellow-700",
  half_day: "bg-orange-100 text-orange-700",
  on_leave: "bg-blue-100 text-blue-700",
  holiday:  "bg-purple-100 text-purple-700",
  weekend:  "bg-gray-100 text-gray-400",
};
const fmt      = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fmtTime  = (d) => d ? new Date(d).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}) : "—";
const fmtShort = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "—";
const fmtAgo   = (d) => {
  if (!d) return "";
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short"});
};
const INR      = (n) => `₹${Number(n||0).toLocaleString("en-IN")}`;

// Countdown to midnight IST
const getCountdown = () => {
  const ist = new Date(new Date().getTime() + 5.5*60*60*1000);
  const h = ist.getUTCHours(), m = ist.getUTCMinutes();
  return { minsLeft:(23-h)*60+(59-m), timeStr:`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}` };
};

const TABS = [
  { key:"attendance",  label:"Attendance",  icon:Clock          },
  { key:"worklog",     label:"Work Log",     icon:ClipboardList  },
  { key:"leave",       label:"My Leave",     icon:CalendarOff    },
  { key:"payslips",    label:"Payslips",     icon:IndianRupee    },
  { key:"goals",       label:"My Goals",     icon:Target         },
  { key:"documents",   label:"Documents",    icon:FileText       },
  { key:"requests",    label:"Requests",     icon:Headphones     },
  { key:"performance", label:"Performance",  icon:TrendingUp     },
  { key:"messages",    label:"Messages",     icon:MessageCircle  },
  { key:"profile",     label:"My Profile",   icon:User           },
];

const EmployeePortal = () => {
  const admin    = JSON.parse(localStorage.getItem("Admin") || "{}");
  const myId     = admin?._id || admin?.id || "";
  const myName   = admin?.name || admin?.email?.split("@")[0] || "Employee";
  const myEmail  = admin?.email || "";
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Read tab from URL search param ?tab=xxx, fallback to "attendance"
  const tab = searchParams.get("tab") || "attendance";
  const setTab = (newTab) => {
    setSearchParams({ tab: newTab });
  };
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [countdown,  setCountdown]  = useState(getCountdown());

  // Shop Access state & metrics
  const [empHasShopAccess, setEmpHasShopAccess] = useState(() => isEmployeeShopAllowed(myEmail, admin));
  const [shopMetrics, setShopMetrics] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    loading: false,
    loaded: false,
  });

  const loadShopMetrics = async () => {
    try {
      setShopMetrics((prev) => ({ ...prev, loading: true }));
      const [prodRes, catRes, ordersRes] = await Promise.allSettled([
        getAllProducts(),
        getAllCategories(),
        getAllOrders(),
      ]);

      const prods = prodRes.status === "fulfilled"
        ? (Array.isArray(prodRes.value?.data?.data) ? prodRes.value.data.data : (Array.isArray(prodRes.value?.data) ? prodRes.value.data : []))
        : [];
      const cats = catRes.status === "fulfilled"
        ? (Array.isArray(catRes.value?.data?.data) ? catRes.value.data.data : (Array.isArray(catRes.value?.data) ? catRes.value.data : []))
        : [];
      const ords = ordersRes.status === "fulfilled"
        ? (Array.isArray(ordersRes.value) ? ordersRes.value : [])
        : [];

      setShopMetrics({
        products: prods.length,
        categories: cats.length,
        orders: ords.length,
        loading: false,
        loaded: true,
      });
    } catch {
      setShopMetrics((prev) => ({ ...prev, loading: false, loaded: true }));
    }
  };

  useEffect(() => {
    const checkLiveAccess = () => {
      const curAdmin = JSON.parse(localStorage.getItem("Admin") || "{}");
      const allowed = isEmployeeShopAllowed(curAdmin?.email || myEmail, curAdmin);
      setEmpHasShopAccess(allowed);
    };

    window.addEventListener("storage", checkLiveAccess);
    window.addEventListener("focus", checkLiveAccess);

    let bc;
    try {
      bc = new BroadcastChannel("infinito_shop_access_channel");
      bc.onmessage = () => {
        checkLiveAccess();
      };
    } catch {}

    return () => {
      window.removeEventListener("storage", checkLiveAccess);
      window.removeEventListener("focus", checkLiveAccess);
      if (bc) bc.close();
    };
  }, [myEmail]);

  useEffect(() => {
    if (empHasShopAccess && (tab === "shop" || !shopMetrics.loaded)) {
      loadShopMetrics();
    }
  }, [empHasShopAccess, tab]);

  const availableTabs = [
    ...TABS,
    ...(empHasShopAccess ? [{ key: "shop", label: "Shop Section", icon: ShoppingBag, badge: "Full Access" }] : []),
  ];

  // Attendance state
  const [todayAttd,  setTodayAttd]  = useState(null);
  const [monthlyAttd,setMonthlyAttd]= useState([]);
  const [attdMonth,  setAttdMonth]  = useState(new Date().getMonth()+1);
  const [attdYear,   setAttdYear]   = useState(new Date().getFullYear());
  const [clocking,   setClocking]   = useState(false);

  // Work log state
  const [myLog,      setMyLog]      = useState(null);
  const [workHistory,setWorkHistory]= useState([]);
  const [workDesc,   setWorkDesc]   = useState("");
  const [workHours,  setWorkHours]  = useState("");
  const [workSaving, setWorkSaving] = useState(false);

  // Leave state
  const [leaves,     setLeaves]     = useState([]);
  const [leaveBalance,setLeaveBalance]=useState(null);
  const [applyModal, setApplyModal] = useState(false);
  const [leaveForm,  setLeaveForm]  = useState({ leaveType:"casual", fromDate:"", toDate:"", reason:"", isHalfDay:false });
  const [leaveSaving,setLeaveSaving]= useState(false);

  // Payslips
  const [payslips,   setPayslips]   = useState([]);
  const [selPayslip, setSelPayslip] = useState(null);

  // Goals
  const [goals,      setGoals]      = useState([]);
  const [progModal,  setProgModal]  = useState(null);
  const [progVal,    setProgVal]    = useState("");

  // Documents
  const [docs,       setDocs]       = useState([]);

  // Self-service requests
  const [requests,   setRequests]   = useState([]);
  const [reqModal,   setReqModal]   = useState(false);
  const [reqForm,    setReqForm]    = useState({ type:"document_request", subject:"", description:"", priority:"medium" });
  const [reqSaving,  setReqSaving]  = useState(false);

  // Performance
  const [perfHistory,setPerfHistory]= useState([]);

  // Messages
  const [msgTab,     setMsgTab]     = useState("inbox");
  const [inbox,      setInbox]      = useState([]);
  const [sentMsgs,   setSentMsgs]   = useState([]);
  const [contacts,   setContacts]   = useState([]);
  const [selMsg,     setSelMsg]     = useState(null);
  const [composing,  setComposing]  = useState(false);
  const [msgUnread,  setMsgUnread]  = useState(0);
  const [toId,       setToId]       = useState("");
  const [toSearch,   setToSearch]   = useState("");
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody,    setMsgBody]    = useState("");
  const [msgSending, setMsgSending] = useState(false);
  const [dropOpen,   setDropOpen]   = useState(false);

  // Profile state
  const [profile,      setProfile]      = useState(null);
  const [profileForm,  setProfileForm]  = useState({
    phone:"", dateOfBirth:"", gender:"", address:"",
    bankName:"", accountHolder:"", accountNumber:"", ifscCode:"",
    emergencyContact: { name:"", phone:"", relation:"" }
  });
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setCountdown(getCountdown()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setError(""); setSuccess("");
    if (tab === "attendance")  { loadTodayAttd(); loadMonthlyAttd(); }
    if (tab === "worklog")     { loadMyLog(); loadWorkHistory(); }
    if (tab === "leave")       { loadLeaves(); loadLeaveBalance(); }
    if (tab === "payslips")    loadPayslips();
    if (tab === "goals")       loadGoals();
    if (tab === "documents")   loadDocs();
    if (tab === "requests")    loadRequests();
    if (tab === "performance") loadPerformance();
    if (tab === "messages")    { loadInbox(); loadSentMsgs(); loadContacts(); loadMsgUnread(); }
    if (tab === "profile")     loadProfile();
    if (tab === "shop")        loadShopMetrics();
  }, [tab]);

  useEffect(() => { if (tab === "attendance") loadMonthlyAttd(); }, [attdMonth, attdYear]);

  // ── Loaders ──────────────────────────────────────────────────
  const loadTodayAttd = async () => {
    try { const r = await axios.get(`${BASE}/hr/attendance/me/today`, auth()); setTodayAttd(r.data.data); } catch {}
  };
  const loadMonthlyAttd = async () => {
    try { const r = await axios.get(`${BASE}/hr/attendance/me/monthly`, { ...auth(), params:{ year:attdYear, month:attdMonth } }); setMonthlyAttd(r.data.data||[]); } catch {}
  };
  const loadMyLog = async () => {
    try {
      const r = await axios.get(`${BASE}/hr/worklog/my/today`, auth());
      const log = r.data.data;
      setMyLog(log);
      if (log && !log.isLocked) { setWorkDesc(log.workDescription||""); setWorkHours(log.hoursWorked?.toString()||""); }
    } catch {}
  };
  const loadWorkHistory = async () => {
    let list = [];
    try {
      const r = await axios.get(`${BASE}/hr/worklog/my/history`, auth());
      list = r.data.data || [];
    } catch {}

    try {
      const raw = localStorage.getItem("infinito_daily_worklogs_store");
      if (raw) {
        const stored = JSON.parse(raw);
        if (Array.isArray(stored)) {
          stored.forEach(s => {
            const sDateStr = s.date ? new Date(s.date).toDateString() : '';
            const existingIdx = list.findIndex(item => item._id === s._id || (item.date && new Date(item.date).toDateString() === sDateStr));
            if (existingIdx === -1) {
              list.push(s);
            } else if (!list[existingIdx].workDescription || list[existingIdx].status === "auto_leave") {
              list[existingIdx] = { ...list[existingIdx], ...s };
            }
          });
        }
      }
    } catch {}

    list.sort((a,b) => new Date(b.date) - new Date(a.date));
    setWorkHistory(list);
  };
  const loadLeaves = async () => {
    try { const r = await axios.get(`${BASE}/hr/leaves/employee/${myId}`, auth()); setLeaves(r.data.data||[]); } catch {}
  };
  const loadLeaveBalance = async () => {
    try { const r = await axios.get(`${BASE}/hr/leaves/balance/${myId}`, auth()); setLeaveBalance(r.data.data); } catch {}
  };
  const loadPayslips = async () => {
    try { const r = await axios.get(`${BASE}/hr/payroll/employee/${myId}`, auth()); setPayslips(r.data.data||[]); } catch {}
  };
  const loadGoals = async () => {
    try { const r = await axios.get(`${BASE}/hr/goals/employee/${myId}`, auth()); setGoals(r.data.data||[]); } catch {}
  };
  const loadDocs = async () => {
    try { const r = await axios.get(`${BASE}/hr/documents/employee/${myId}`, auth()); setDocs(r.data.data||[]); } catch {}
  };
  const loadRequests = async () => {
    try { const r = await axios.get(`${BASE}/hr/self-service/employee/${myId}`, auth()); setRequests(r.data.data||[]); } catch {}
  };
  const loadPerformance = async () => {
    try { const r = await axios.get(`${BASE}/hr/performance/${myId}`, auth()); setPerfHistory(r.data.data||[]); } catch {}
  };

  const loadInbox     = async () => { try { const r = await axios.get(`${BASE}/messages/inbox`, auth()); setInbox(r.data.data||[]); } catch {} };
  const loadSentMsgs  = async () => { try { const r = await axios.get(`${BASE}/messages/sent`, auth()); setSentMsgs(r.data.data||[]); } catch {} };
  const loadContacts  = async () => { try { const r = await axios.get(`${BASE}/messages/contacts`, auth()); setContacts(r.data.data||[]); } catch {} };
  const loadMsgUnread = async () => { try { const r = await axios.get(`${BASE}/messages/unread-count`, auth()); setMsgUnread(r.data.count||0); } catch {} };

  const openMsg = async (msg) => {
    setSelMsg(msg);
    if (!msg.isRead && msgTab === "inbox") {
      try { await axios.patch(`${BASE}/messages/read/${msg._id}`, {}, auth()); setInbox(p=>p.map(m=>m._id===msg._id?{...m,isRead:true}:m)); setMsgUnread(c=>Math.max(0,c-1)); } catch {}
    }
  };
  const deleteMsg = async (id) => {
    try { await axios.delete(`${BASE}/messages/delete/${id}`, auth()); setInbox(p=>p.filter(m=>m._id!==id)); setSentMsgs(p=>p.filter(m=>m._id!==id)); if(selMsg?._id===id)setSelMsg(null); setSuccess("Deleted."); } catch {}
  };
  const sendMsg = async (e) => {
    e.preventDefault();
    if (!toId) { setError("Select a recipient."); return; }
    if (!msgBody.trim()) { setError("Message is required."); return; }
    try { setMsgSending(true); setError("");
      await axios.post(`${BASE}/messages/send`, { receiverId:toId, subject:msgSubject, body:msgBody }, auth());
      setSuccess("✅ Sent!"); setComposing(false); setToId(""); setToSearch(""); setMsgSubject(""); setMsgBody(""); loadSentMsgs();
    } catch(e) { setError(e.response?.data?.message||"Failed."); } finally { setMsgSending(false); }
  };

  const loadProfile = async () => {
    try {
      const r = await axios.get(`${BASE}/hr/employees/me/profile`, auth());
      const d = r.data.data || {};
      setProfile(d);
      setProfileForm({
        phone:        d.phone || "",
        dateOfBirth:  d.dateOfBirth ? d.dateOfBirth.split("T")[0] : "",
        gender:       d.gender || "",
        address:      d.address || "",
        bankName:     d.bankName || "",
        accountHolder:d.accountHolder || "",
        accountNumber:d.accountNumber || "",
        ifscCode:     d.ifscCode || "",
        emergencyContact: {
          name:     d.emergencyContact?.name || "",
          phone:    d.emergencyContact?.phone || "",
          relation: d.emergencyContact?.relation || "",
        },
      });
    } catch {}
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true); setError(""); setSuccess("");
      await axios.patch(`${BASE}/hr/employees/me/profile`, profileForm, auth());
      setSuccess("✅ Profile updated successfully!");
      loadProfile();
    } catch (e) { setError(e.response?.data?.message || "Failed to save profile."); }
    finally { setProfileSaving(false); }
  };

  // ── Actions ──────────────────────────────────────────────────
  const handleClockIn = async () => {
    try { setClocking(true); setError(""); setSuccess("");
      const r = await axios.post(`${BASE}/hr/attendance/me/clockin`, {}, auth());
      setTodayAttd(r.data.data);
      setSuccess("✅ Clocked in successfully!");
    } catch (e) { setError(e.response?.data?.message||"Failed to clock in."); } finally { setClocking(false); }
  };
  const handleClockOut = async () => {
    try { setClocking(true); setError(""); setSuccess("");
      const r = await axios.post(`${BASE}/hr/attendance/me/clockout`, {}, auth());
      setTodayAttd(r.data.data);
      setSuccess("✅ Clocked out successfully!");
    } catch (e) { setError(e.response?.data?.message||"Failed to clock out."); } finally { setClocking(false); }
  };

  const handleWorkSubmit = async (e) => {
    e.preventDefault();
    if (!workDesc.trim()) { setError("Work description required."); return; }
    if (!workHours || parseFloat(workHours)<=0) { setError("Enter valid hours."); return; }
    try { setWorkSaving(true); setError(""); setSuccess("");
      const r = await axios.post(`${BASE}/hr/worklog/submit`, { workDescription:workDesc.trim(), hoursWorked:parseFloat(workHours) }, auth());
      setMyLog(r.data.data); setSuccess(myLog?"✅ Updated!":"✅ Submitted!"); loadWorkHistory();
    } catch (e) { setError(e.response?.data?.message||"Failed."); } finally { setWorkSaving(false); }
  };

  const handleApplyLeave = async () => {
    if (!leaveForm.fromDate||!leaveForm.toDate||!leaveForm.reason) { setError("All fields required."); return; }
    try { setLeaveSaving(true); setError(""); setSuccess("");
      await axios.post(`${BASE}/hr/leaves/apply`, { ...leaveForm, employeeId:myId }, auth());
      setApplyModal(false); setLeaveForm({ leaveType:"casual", fromDate:"", toDate:"", reason:"", isHalfDay:false });
      setSuccess("✅ Leave application submitted!"); loadLeaves(); loadLeaveBalance();
    } catch (e) { setError(e.response?.data?.message||"Failed."); } finally { setLeaveSaving(false); }
  };

  const handleCancelLeave = async (id) => {
    try { await axios.patch(`${BASE}/hr/leaves/cancel/${id}`, {}, auth()); loadLeaves(); loadLeaveBalance(); }
    catch (e) { setError(e.response?.data?.message||"Failed."); }
  };

  const handleUpdateProgress = async () => {
    if (!progModal||progVal==="") return;
    try {
      await axios.patch(`${BASE}/hr/goals/progress/${progModal._id}`, { currentValue:parseFloat(progVal) }, auth());
      setProgModal(null); setProgVal(""); loadGoals();
    } catch (e) { setError(e.response?.data?.message||"Failed."); }
  };

  const handleSubmitRequest = async () => {
    if (!reqForm.subject) { setError("Subject required."); return; }
    try { setReqSaving(true); setError(""); setSuccess("");
      await axios.post(`${BASE}/hr/self-service/submit`, { ...reqForm, employeeId:myId }, auth());
      setReqModal(false); setReqForm({ type:"document_request", subject:"", description:"", priority:"medium" });
      setSuccess("✅ Request submitted!"); loadRequests();
    } catch (e) { setError(e.response?.data?.message||"Failed."); } finally { setReqSaving(false); }
  };

  const { minsLeft, timeStr } = countdown;
  // Allow submission if not locked, OR if locked but was auto_leave (late submission allowed)
  const workLocked   = myLog?.isLocked && myLog?.status !== "auto_leave";
  const isAutoLeave  = myLog?.status === "auto_leave";
  const workSubmitted = myLog && ["submitted","edited"].includes(myLog.status);

  // Build monthly calendar grid
  const buildGrid = () => {
    const daysInMonth = new Date(attdYear, attdMonth, 0).getDate();
    return Array.from({ length:daysInMonth }, (_, i) => {
      const d = new Date(attdYear, attdMonth-1, i+1);
      const rec = monthlyAttd.find(r => new Date(r.date).getDate() === i+1);
      return { day:i+1, date:d, rec };
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-widest text-gray-900">EMPLOYEE PORTAL</h1>
          <p className="text-xs text-gray-400 mt-0.5">Welcome, <strong>{myName}</strong> · {myEmail}</p>
        </div>
        <div className="flex items-center gap-3">
          {empHasShopAccess && (
            <button
              onClick={() => setTab("shop")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition shadow-xs cursor-pointer ${
                tab === "shop"
                  ? "bg-[#DD1215] text-white"
                  : "bg-red-50 hover:bg-red-100 text-[#DD1215] border border-red-200"
              }`}
            >
              <ShoppingBag size={14} />
              <span>Full Shop Access Active</span>
            </button>
          )}
          <div className="text-xs text-gray-500 font-semibold">{timeStr} IST</div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b px-6 overflow-x-auto scrollbar-none shadow-xs">
        <div className="flex items-center gap-1.5 min-w-max py-2.5">
          {availableTabs.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#DD1215] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-gray-500"} />
                <span>{t.label}</span>
                {t.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                    isActive ? "bg-white text-[#DD1215]" : "bg-red-50 text-red-600 border border-red-200"
                  }`}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">
        {error   && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded flex items-center gap-2"><AlertTriangle size={14}/>{error}<button onClick={()=>setError("")} className="ml-auto text-red-400 hover:text-red-700">✕</button></div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded">{success}</div>}

        {/* ── ATTENDANCE ── */}
        {tab === "attendance" && (
          <div className="space-y-5">
            {/* Clock in/out card */}
            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Today — {fmt(new Date())}</p>
                {todayAttd && (
                  <div className="flex items-center gap-3">
                    {/* Total hours badge */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-center">
                      <p className="text-[10px] text-blue-500 font-bold uppercase">Total Hours</p>
                      <p className="text-lg font-black text-blue-700">{(todayAttd.totalHours || todayAttd.hoursWorked || 0).toFixed(1)}h</p>
                    </div>
                    {/* Status badge */}
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${STATUS_COLORS[todayAttd.status]||"bg-gray-100 text-gray-600"}`}>
                      {todayAttd.status?.replace("_"," ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Sessions list */}
              {todayAttd?.sessions?.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {todayAttd.sessions.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2.5 text-xs">
                      <span className="w-6 h-6 rounded-full bg-[#DD1215] text-white flex items-center justify-center font-black text-[10px] shrink-0">{i+1}</span>
                      <div className="flex-1">
                        <span className="text-green-700 font-bold">IN: {fmtTime(s.clockIn)}</span>
                        {s.clockOut ? (
                          <span className="text-red-600 font-bold ml-4">OUT: {fmtTime(s.clockOut)}</span>
                        ) : (
                          <span className="text-yellow-600 font-semibold ml-4 animate-pulse">● Currently working</span>
                        )}
                      </div>
                      {s.clockOut && <span className="text-gray-500 font-semibold">{s.hoursWorked}h</span>}
                    </div>
                  ))}
                  {/* 4hr progress bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>Daily target</span>
                      <span>{Math.min((todayAttd.totalHours||0), 4).toFixed(1)}h / 4h</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${(todayAttd.totalHours||0) >= 4 ? "bg-green-500" : "bg-yellow-400"}`}
                        style={{width:`${Math.min(((todayAttd.totalHours||0)/4)*100,100)}%`}}/>
                    </div>
                    {(todayAttd.totalHours||0) >= 4
                      ? <p className="text-[10px] text-green-600 font-bold mt-1">✅ Present — 4h target met</p>
                      : <p className="text-[10px] text-yellow-600 mt-1">⚠️ {(4-(todayAttd.totalHours||0)).toFixed(1)}h more for Present (Half Day currently)</p>
                    }
                  </div>
                </div>
              ) : todayAttd?.clockIn ? (
                // Legacy single session display
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2.5 text-xs">
                    <span className="w-6 h-6 rounded-full bg-[#DD1215] text-white flex items-center justify-center font-black text-[10px] shrink-0">1</span>
                    <div className="flex-1">
                      <span className="text-green-700 font-bold">IN: {fmtTime(todayAttd.clockIn)}</span>
                      {todayAttd.clockOut ? (
                        <span className="text-red-600 font-bold ml-4">OUT: {fmtTime(todayAttd.clockOut)}</span>
                      ) : (
                        <span className="text-yellow-600 font-semibold ml-4 animate-pulse">● Currently working</span>
                      )}
                    </div>
                    {todayAttd.clockOut && (
                      <span className="text-gray-500 font-semibold">{todayAttd.hoursWorked}h</span>
                    )}
                  </div>
                </div>
              ) : !todayAttd ? (
                <div className="flex items-center gap-2 text-gray-400 mb-4">
                  <Clock size={20}/>
                  <div><p className="font-black text-gray-700">Not Clocked In</p><p className="text-xs">Tap Clock In to start your session</p></div>
                </div>
              ) : null}

              {/* Buttons */}
              <div className="flex gap-3 flex-wrap">
                {(() => {
                  const sessions = todayAttd?.sessions || [];
                  const lastSession = sessions[sessions.length - 1];
                  // Check sessions array OR legacy clockIn/clockOut fields
                  const isCurrentlyIn = 
                    (sessions.length > 0 && !lastSession?.clockOut) ||
                    (sessions.length === 0 && todayAttd?.clockIn && !todayAttd?.clockOut);
                  if (isCurrentlyIn) {
                    return (
                      <button onClick={handleClockOut} disabled={clocking}
                        className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-red-700 transition disabled:opacity-50 rounded-lg">
                        <LogOutIcon size={16}/> {clocking ? "Clocking Out..." : "Clock Out"}
                      </button>
                    );
                  }
                  const hasAnySessions = sessions.length > 0 || todayAttd?.clockOut;
                  return (
                    <button onClick={handleClockIn} disabled={clocking}
                      className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-green-700 transition disabled:opacity-50 rounded-lg">
                      <LogIn size={16}/> {clocking ? "Clocking In..." : hasAnySessions ? "Clock In Again" : "Clock In"}
                    </button>
                  );
                })()}
                {todayAttd && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {todayAttd.isLate && <span className="text-yellow-600 font-semibold">⚠️ Late by {todayAttd.lateByMinutes} mins</span>}
                    <span>{(todayAttd.sessions||[]).length} session{(todayAttd.sessions||[]).length !== 1 ? "s" : ""} today</span>
                  </div>
                )}
              </div>
            </div>

            {/* Monthly calendar */}
            <div className="bg-white border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Monthly View</p>
                <div className="flex items-center gap-2">
                  <select value={attdMonth} onChange={e=>setAttdMonth(parseInt(e.target.value))} className="border border-gray-300 px-2 py-1 text-xs focus:outline-none">
                    {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
                  </select>
                  <input type="number" value={attdYear} onChange={e=>setAttdYear(parseInt(e.target.value))} className="border border-gray-300 px-2 py-1 text-xs w-16 focus:outline-none"/>
                </div>
              </div>
              <div className="grid grid-cols-7 border-b">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} className="py-2 text-center text-[10px] font-bold text-gray-400">{d}</div>)}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({length:new Date(attdYear,attdMonth-1,1).getDay()}).map((_,i)=>(
                  <div key={i} className="border-b border-r min-h-[52px] bg-gray-50/40"/>
                ))}
                {buildGrid().map(({day,date,rec})=>{
                  const isToday = date.toDateString()===new Date().toDateString();
                  const isWeekend = date.getDay()===0; // Only Sunday is weekend
                  const sc = rec ? STATUS_COLORS[rec.status] : isWeekend ? "bg-gray-100 text-gray-400" : null;
                  return (
                    <div key={day} className={`border-b border-r min-h-[52px] p-1.5 ${isToday?"bg-red-50":""}`}>
                      <p className={`text-[10px] font-bold mb-1 w-5 h-5 flex items-center justify-center rounded-full ${isToday?"bg-[#DD1215] text-white":"text-gray-600"}`}>{day}</p>
                      {sc && <span className={`text-[8px] px-1 py-0.5 rounded font-semibold ${sc}`}>{rec?.status?.replace("_","")?.substring(0,4)||"week"}</span>}
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="px-4 py-3 flex flex-wrap gap-3">
                {Object.entries(STATUS_COLORS).map(([k,v])=>(
                  <span key={k} className={`text-[9px] px-2 py-0.5 rounded-full font-bold capitalize ${v}`}>{k.replace("_"," ")}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── WORK LOG ── */}
        {tab === "worklog" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white border rounded-xl overflow-hidden">
              <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
                <div><p className="font-black text-lg">{fmt(new Date())}</p><p className="text-xs text-gray-400">Your daily work update</p></div>
                {workLocked && <div className="flex items-center gap-1.5 bg-red-900/50 text-red-300 px-3 py-1.5 rounded text-xs font-semibold"><Lock size={12}/>Locked</div>}
                {isAutoLeave && <div className="flex items-center gap-1.5 bg-orange-900/50 text-orange-300 px-3 py-1.5 rounded text-xs font-semibold"><AlertTriangle size={12}/>Auto Leave — Submit to override</div>}
                {workSubmitted && !workLocked && !isAutoLeave && <div className="flex items-center gap-1.5 bg-green-900/50 text-green-300 px-3 py-1.5 rounded text-xs font-semibold"><CheckCircle size={12}/>Submitted {fmtTime(myLog.submittedAt)}</div>}
              </div>
              <div className="p-6">
                {workLocked ? (
                  <div className="text-center py-12 text-gray-400">
                    <Lock size={36} className="mx-auto mb-3 opacity-30"/>
                    <p className="font-semibold">Locked after midnight IST.</p>
                    {myLog?.status==="auto_leave" && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">⚠️ Auto-marked as <strong>on leave</strong>.</div>}
                  </div>
                ) : (
                  <form onSubmit={handleWorkSubmit} className="space-y-4">
                    {isAutoLeave && (
                      <div className="bg-orange-50 border border-orange-300 text-orange-800 text-sm px-4 py-3 rounded flex items-center gap-2">
                        <AlertTriangle size={16}/>
                        <span>You were auto-marked as <strong>on leave</strong>. You can still add your work below — your manager can review and override your status.</span>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">What did you work on today? *</label>
                      <textarea rows={6} value={workDesc} onChange={e=>setWorkDesc(e.target.value)}
                        className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#DD1215] resize-none"
                        placeholder="• Completed task X&#10;• Fixed bug in Y&#10;• Attended team standup&#10;• Reviewed PR from..." required/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Hours Worked *</label>
                      <div className="flex items-center gap-3">
                        <input type="number" min="0.5" max="24" step="0.5" value={workHours} onChange={e=>setWorkHours(e.target.value)}
                          className="w-24 border border-gray-300 px-3 py-2 text-sm text-center font-bold focus:outline-none focus:border-[#DD1215]"/>
                        <div className="flex gap-1.5">
                          {[3,4,6,8].map(h=>(
                            <button key={h} type="button" onClick={()=>setWorkHours(h.toString())}
                              className={`px-3 py-1.5 text-xs font-bold border rounded transition ${workHours==h?"bg-[#DD1215] text-white border-[#DD1215]":"border-gray-300 text-gray-600 hover:border-[#DD1215]"}`}>{h}h</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button type="submit" disabled={workSaving}
                      className="w-full bg-[#DD1215] text-white py-3 text-xs font-black uppercase tracking-widest hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                      <Send size={14}/>{workSaving?"Saving...":workSubmitted?"Update Work Log":"Submit Work Log"}
                    </button>
                    {!workSubmitted && <p className="text-[10px] text-center text-gray-400">⚠️ Not submitted by midnight = auto-marked as <strong>on leave</strong>.</p>}
                  </form>
                )}
              </div>
            </div>
            {/* History */}
            <div className="bg-white border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b"><p className="text-xs font-bold uppercase tracking-widest text-gray-500">Recent History</p></div>
              <div className="divide-y max-h-80 overflow-y-auto">
                {workHistory.length===0 ? <p className="text-xs text-gray-400 p-4 text-center">No logs yet.</p> :
                workHistory.map(l=>(
                  <div key={l._id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-semibold text-gray-700">{fmtShort(l.date)}</p>
                      <div className="flex items-center gap-1.5">
                        {l.hoursWorked>0&&<span className="text-[10px] text-gray-400">{l.hoursWorked}h</span>}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${l.status==="auto_leave"?"bg-red-100 text-red-700":l.status==="pending"?"bg-yellow-100 text-yellow-700":"bg-green-100 text-green-700"}`}>
                          {l.status==="auto_leave"?"Leave":l.status==="pending"?"Pending":"Done"}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">{l.workDescription||"—"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LEAVE ── */}
        {tab === "leave" && (
          <div className="space-y-5">
            {/* Balance cards */}
            {leaveBalance?.balance && (
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                {Object.entries(leaveBalance.balance).map(([type,days])=>{
                  const used = leaveBalance.used?.find(u=>u._id===type)?.totalDaysUsed||0;
                  return (
                    <div key={type} className="bg-white border rounded-lg px-4 py-3">
                      <p className="text-[10px] font-bold uppercase text-gray-400 capitalize mb-1">{type}</p>
                      <p className="text-2xl font-black text-gray-900">{days}</p>
                      <p className="text-[10px] text-gray-400">available · {used} used</p>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex justify-end">
              <button onClick={()=>{setApplyModal(true);setError("");}}
                className="bg-[#DD1215] text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
                + Apply for Leave
              </button>
            </div>
            {/* Leave history */}
            <div className="bg-white border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b"><p className="text-xs font-bold uppercase tracking-widest text-gray-500">My Leave Requests</p></div>
              {leaves.length===0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">No leave requests yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50"><tr>{["Type","From","To","Days","Reason","Status","Actions"].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {leaves.map(l=>(
                        <tr key={l._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-xs font-semibold capitalize">{l.leaveType}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{fmt(l.fromDate)}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{fmt(l.toDate)}</td>
                          <td className="px-4 py-3 text-xs font-bold text-gray-700">{l.totalDays}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 max-w-[140px] truncate">{l.reason}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${l.status==="approved"?"bg-green-100 text-green-700":l.status==="rejected"?"bg-red-100 text-red-700":l.status==="cancelled"?"bg-gray-100 text-gray-500":"bg-yellow-100 text-yellow-700"}`}>{l.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            {["pending","approved"].includes(l.status) && (
                              <button onClick={()=>handleCancelLeave(l._id)} className="text-xs text-red-500 hover:underline font-semibold">Cancel</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PAYSLIPS ── */}
        {tab === "payslips" && (
          <div className="space-y-3">
            {payslips.length===0 ? (
              <div className="bg-white border rounded-xl text-center py-16 text-gray-400"><IndianRupee size={36} className="mx-auto mb-3 opacity-30"/><p>No payslips yet.</p></div>
            ) : payslips.map(slip=>(
              <div key={slip._id} className="bg-white border rounded-xl px-6 py-4 flex flex-wrap items-center justify-between gap-4 hover:border-gray-300 transition">
                <div>
                  <p className="font-black text-gray-900">{MONTHS[(slip.month||1)-1]} {slip.year}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Gross: {INR(slip.grossSalary)} · Deductions: {INR(slip.totalDeductions)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xl font-black text-green-700">{INR(slip.netSalary)}</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${slip.status==="paid"?"bg-green-100 text-green-700":slip.status==="approved"?"bg-blue-100 text-blue-700":"bg-yellow-100 text-yellow-700"}`}>{slip.status}</span>
                  <button onClick={()=>setSelPayslip(selPayslip?._id===slip._id?null:slip)} className="text-xs text-blue-600 hover:underline font-semibold">
                    {selPayslip?._id===slip._id?"Hide":"View"}
                  </button>
                </div>
                {selPayslip?._id===slip._id && (
                  <div className="w-full border-t pt-4 mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {[["Basic",slip.basic],["HRA",slip.hra],["Travel",slip.ta],["Medical",slip.medical],["Special",slip.special],["PF",`-${INR(slip.pf)}`],["TDS",`-${INR(slip.tds)}`],["Loss of Pay",`-${INR(slip.lossOfPay)}`]].map(([l,v])=>(
                      <div key={l} className="bg-gray-50 rounded px-3 py-2"><p className="text-[10px] text-gray-400">{l}</p><p className="font-bold text-gray-800">{typeof v==="number"?INR(v):v}</p></div>
                    ))}
                    <div className="col-span-2 sm:col-span-4 bg-green-50 border border-green-200 rounded px-4 py-2 flex items-center justify-between">
                      <p className="font-black text-green-800">Net Salary</p>
                      <p className="font-black text-xl text-green-800">{INR(slip.netSalary)}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── GOALS ── */}
        {tab === "goals" && (
          <div className="space-y-3">
            {goals.length===0 ? (
              <div className="bg-white border rounded-xl text-center py-16 text-gray-400"><Target size={36} className="mx-auto mb-3 opacity-30"/><p>No goals set yet. Your manager will set goals for you.</p></div>
            ) : goals.map(g=>{
              const pct = g.targetValue>0?Math.min(100,Math.round((g.currentValue/g.targetValue)*100)):0;
              const isOverdue = g.status==="active"&&new Date(g.deadline)<new Date();
              return (
                <div key={g._id} className={`bg-white border rounded-xl p-5 ${isOverdue?"border-l-4 border-l-red-500":""}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${g.status==="completed"?"bg-green-100 text-green-700":isOverdue?"bg-red-100 text-red-700":"bg-blue-100 text-blue-700"}`}>{g.status}</span>
                        <span className="text-[10px] capitalize text-gray-400">{g.category} · {g.period}</span>
                      </div>
                      <p className="font-semibold text-gray-900">{g.title}</p>
                    </div>
                    {g.status==="active" && (
                      <button onClick={()=>{setProgModal(g);setProgVal(String(g.currentValue));}}
                        className="text-xs text-blue-600 hover:underline font-semibold shrink-0">Update</button>
                    )}
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">{g.currentValue}/{g.targetValue} {g.unit}</span>
                      <span className="text-xs font-bold text-gray-700">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${g.status==="completed"?"bg-green-500":isOverdue?"bg-red-500":"bg-[#DD1215]"}`} style={{width:`${pct}%`}}/>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400">Deadline: {fmt(g.deadline)}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── DOCUMENTS ── */}
        {tab === "documents" && (
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b"><p className="text-xs font-bold uppercase tracking-widest text-gray-500">My HR Documents ({docs.length})</p></div>
            {docs.length===0 ? (
              <div className="text-center py-16 text-gray-400 text-sm"><FileText size={32} className="mx-auto mb-2 opacity-30"/>No documents yet.</div>
            ) : (
              <div className="divide-y">
                {docs.map(d=>(
                  <div key={d._id} className="px-5 py-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{d.title||d.fileName}</p>
                      <p className="text-xs text-gray-400 capitalize">{d.category?.replace(/_/g," ")} · {fmt(d.issueDate)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${d.status==="active"?"bg-green-100 text-green-700":d.status==="pending_signature"?"bg-yellow-100 text-yellow-700":"bg-gray-100 text-gray-500"}`}>{d.status?.replace(/_/g," ")}</span>
                      {d.fileUrl && <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline font-semibold">Open</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SELF SERVICE REQUESTS ── */}
        {tab === "requests" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={()=>{setReqModal(true);setError("");}}
                className="bg-[#DD1215] text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
                + New Request
              </button>
            </div>
            {requests.length===0 ? (
              <div className="bg-white border rounded-xl text-center py-16 text-gray-400"><Headphones size={36} className="mx-auto mb-3 opacity-30"/><p>No requests submitted yet.</p></div>
            ) : requests.map(r=>(
              <div key={r._id} className="bg-white border rounded-xl px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{r.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{r.type?.replace(/_/g," ")} · {fmt(r.createdAt)}</p>
                    {r.description && <p className="text-xs text-gray-500 mt-1 italic">"{r.description}"</p>}
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold shrink-0 ${r.status==="resolved"?"bg-green-100 text-green-700":r.status==="in_progress"?"bg-blue-100 text-blue-700":r.status==="closed"?"bg-gray-100 text-gray-500":"bg-yellow-100 text-yellow-700"}`}>{r.status}</span>
                </div>
                {r.resolution && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded px-3 py-2">
                    <p className="text-[10px] font-bold text-green-700 mb-0.5">HR Resolution</p>
                    <p className="text-xs text-green-800">{r.resolution}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── PERFORMANCE ── */}
        {tab === "performance" && (
          <div className="space-y-4">
            {perfHistory.length===0 ? (
              <div className="bg-white border rounded-xl text-center py-16 text-gray-400"><TrendingUp size={36} className="mx-auto mb-3 opacity-30"/><p>No performance reviews yet.</p></div>
            ) : perfHistory.map(p=>(
              <div key={p._id} className="bg-white border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-black text-gray-900">{MONTHS[(p.period?.month||1)-1]} {p.period?.year}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center font-black text-sm" style={{borderColor:p.overallScore>=70?"#22c55e":p.overallScore>=50?"#f59e0b":"#ef4444",color:p.overallScore>=70?"#22c55e":p.overallScore>=50?"#f59e0b":"#ef4444"}}>
                      {p.overallScore}
                    </div>
                    <div><p className="text-xs font-bold text-gray-700">{p.overallScore}/100</p><p className={`text-[10px] ${p.status==="published"?"text-green-600":"text-yellow-600"}`}>{p.status}</p></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[["Completion Rate",`${p.productivity?.completionRate||0}%`],["Attendance",`${p.reliability?.attendanceRate||0}%`],["Tasks Done",p.productivity?.tasksCompleted||0],["Revisions",p.quality?.revisionCount||0]].map(([l,v])=>(
                    <div key={l} className="bg-gray-50 rounded px-3 py-2"><p className="text-[10px] text-gray-400">{l}</p><p className="font-bold text-gray-800">{v}</p></div>
                  ))}
                </div>
                {p.managerScore?.comment && (
                  <div className="mt-3 bg-blue-50 border border-blue-100 rounded px-3 py-2">
                    <p className="text-[10px] font-bold text-blue-700 mb-0.5">Manager Comment</p>
                    <p className="text-xs text-blue-800 italic">"{p.managerScore.comment}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab === "messages" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* List */}
            <div className="bg-white border rounded-xl overflow-hidden flex flex-col">
              <div className="flex border-b">
                {["inbox","sent"].map(t => (
                  <button key={t} onClick={() => { setMsgTab(t); setSelMsg(null); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold uppercase transition ${msgTab===t?"bg-[#DD1215] text-white":"text-gray-500 hover:bg-gray-50"}`}>
                    {t==="inbox" ? <Inbox size={13}/> : <SendHorizonal size={13}/>}
                    {t}
                    {t==="inbox" && inbox.filter(m=>!m.isRead).length>0 && (
                      <span className="bg-white text-[#DD1215] text-[9px] font-black px-1.5 py-0.5 rounded-full">{inbox.filter(m=>!m.isRead).length}</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="px-3 py-2 border-b">
                <button onClick={() => { setComposing(true); setSelMsg(null); }}
                  className="w-full flex items-center justify-center gap-1.5 bg-[#DD1215] text-white py-2 text-xs font-black uppercase rounded-lg hover:bg-red-700">
                  <Plus size={13}/> Compose
                </button>
              </div>
              <div className="flex-1 overflow-y-auto divide-y" style={{maxHeight:"45vh"}}>
                {(msgTab==="inbox"?inbox:sentMsgs).length===0
                  ? <div className="text-center py-8"><MessageCircle size={24} className="mx-auto text-gray-200 mb-2"/><p className="text-xs text-gray-400">No messages</p></div>
                  : (msgTab==="inbox"?inbox:sentMsgs).map(msg=>(
                    <div key={msg._id} onClick={()=>openMsg(msg)}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${selMsg?._id===msg._id?"bg-blue-50 border-l-2 border-l-[#DD1215]":""} ${!msg.isRead&&msgTab==="inbox"?"bg-blue-50/40":""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs truncate ${!msg.isRead&&msgTab==="inbox"?"font-black text-gray-900":"font-semibold text-gray-700"}`}>
                            {msgTab==="inbox"?msg.senderName:msg.receiverName}
                          </p>
                          {msg.subject && <p className="text-[10px] text-gray-500 truncate">{msg.subject}</p>}
                          <p className="text-[10px] text-gray-400 truncate">{msg.body}</p>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <p className="text-[9px] text-gray-400">{fmtAgo(msg.createdAt)}</p>
                          {!msg.isRead&&msgTab==="inbox"&&<span className="w-2 h-2 rounded-full bg-[#DD1215]"/>}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* View / Compose */}
            <div className="lg:col-span-2 bg-white border rounded-xl overflow-hidden flex flex-col" style={{minHeight:"360px"}}>
              {composing ? (
                <div className="flex flex-col h-full">
                  <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
                    <p className="font-black text-sm text-gray-900">New Message</p>
                    <button onClick={()=>setComposing(false)} className="text-gray-400 hover:text-gray-700"><X size={16}/></button>
                  </div>
                  <form onSubmit={sendMsg} className="flex-1 flex flex-col p-5 space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">To *</label>
                      <div className="relative">
                        <div onClick={()=>setDropOpen(o=>!o)} className="w-full border border-gray-300 px-3 py-2.5 text-xs cursor-pointer flex items-center justify-between rounded-lg">
                          {contacts.find(c=>c._id===toId) ? <span className="font-semibold">{contacts.find(c=>c._id===toId).name}</span> : <span className="text-gray-400">Select recipient...</span>}
                          <ChevronDown size={14} className="text-gray-400"/>
                        </div>
                        {dropOpen && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-1 max-h-48 overflow-y-auto">
                            <div className="p-2 border-b">
                              <input value={toSearch} onChange={e=>setToSearch(e.target.value)} autoFocus placeholder="Search..." className="w-full text-xs focus:outline-none px-2 py-1.5 border border-gray-200 rounded"/>
                            </div>
                            {contacts.filter(c=>!toSearch||c.name?.toLowerCase().includes(toSearch.toLowerCase())||c.email?.toLowerCase().includes(toSearch.toLowerCase())).map(c=>(
                              <div key={c._id} onClick={()=>{setToId(c._id);setToSearch("");setDropOpen(false);}} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0">
                                <div className="w-6 h-6 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-[10px] font-black shrink-0">{c.name?.[0]?.toUpperCase()||"?"}</div>
                                <div><p className="text-xs font-bold">{c.name}</p><p className="text-[10px] text-gray-400">{c.email}</p></div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Subject</label>
                      <input value={msgSubject} onChange={e=>setMsgSubject(e.target.value)} placeholder="Optional" className="w-full border border-gray-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-[#DD1215]"/>
                    </div>
                    <div className="flex-1 flex flex-col">
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Message *</label>
                      <textarea value={msgBody} onChange={e=>setMsgBody(e.target.value)} required rows={5} placeholder="Type your message..." className="flex-1 border border-gray-300 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-[#DD1215] resize-none"/>
                    </div>
                    <button type="submit" disabled={msgSending} className="flex items-center justify-center gap-2 bg-[#DD1215] text-white py-2.5 text-xs font-black uppercase rounded-lg hover:bg-red-700 disabled:opacity-50">
                      <Send size={13}/> {msgSending?"Sending...":"Send"}
                    </button>
                  </form>
                </div>
              ) : selMsg ? (
                <div className="flex flex-col h-full">
                  <div className="px-5 py-3 border-b bg-gray-50 flex items-start justify-between">
                    <div>
                      <p className="font-black text-gray-900">{selMsg.subject||"(No subject)"}</p>
                      <p className="text-xs text-gray-500 mt-1">{msgTab==="inbox"?`From: ${selMsg.senderName}`:`To: ${selMsg.receiverName}`} · {fmtAgo(selMsg.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={()=>{setComposing(true);setToId(msgTab==="inbox"?selMsg.senderId:selMsg.receiverId);setMsgSubject(`Re: ${selMsg.subject||""}`);setMsgBody("");setSelMsg(null);}}
                        className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 text-xs font-bold hover:bg-gray-100 rounded-lg"><Send size={11}/> Reply</button>
                      <button onClick={()=>deleteMsg(selMsg._id)} className="flex items-center gap-1 border border-red-200 text-red-500 px-3 py-1.5 text-xs font-bold hover:bg-red-50 rounded-lg"><Trash2 size={11}/> Delete</button>
                      <button onClick={()=>setSelMsg(null)} className="text-gray-400 hover:text-gray-700 ml-1"><X size={15}/></button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5">
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{selMsg.body}</div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-300">
                  <MessageCircle size={40} className="mb-3 opacity-30"/>
                  <p className="font-bold text-gray-400 text-sm">Select a message or compose</p>
                  <button onClick={()=>setComposing(true)} className="mt-4 flex items-center gap-2 bg-[#DD1215] text-white px-5 py-2.5 text-xs font-black uppercase rounded-lg hover:bg-red-700">
                    <Plus size={13}/> Compose
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {tab === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-5 max-w-2xl">

            {/* Personal Info */}
            <div className="bg-white border rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <User size={18} className="text-[#DD1215]"/>
                <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Full Name</label>
                  <input value={myName} disabled className="w-full border border-gray-200 px-3 py-2.5 text-sm bg-gray-50 text-gray-400 rounded-lg cursor-not-allowed"/>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Email</label>
                  <input value={myEmail} disabled className="w-full border border-gray-200 px-3 py-2.5 text-sm bg-gray-50 text-gray-400 rounded-lg cursor-not-allowed"/>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Phone Number</label>
                  <input type="tel" value={profileForm.phone} onChange={e=>setProfileForm(f=>({...f,phone:e.target.value}))}
                    placeholder="e.g. 9876543210" className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#DD1215] rounded-lg"/>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Date of Birth</label>
                  <input type="date" value={profileForm.dateOfBirth} onChange={e=>setProfileForm(f=>({...f,dateOfBirth:e.target.value}))}
                    className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#DD1215] rounded-lg"/>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Gender</label>
                  <select value={profileForm.gender} onChange={e=>setProfileForm(f=>({...f,gender:e.target.value}))}
                    className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#DD1215] rounded-lg bg-white">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Address</label>
                  <textarea value={profileForm.address} onChange={e=>setProfileForm(f=>({...f,address:e.target.value}))}
                    rows={2} placeholder="Your full address..."
                    className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#DD1215] rounded-lg resize-none"/>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-white border rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee size={18} className="text-[#DD1215]"/>
                <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Bank Details</h3>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2.5 text-xs text-yellow-800">
                ⚠️ Your bank details are used for salary disbursement. Please ensure they are accurate.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Account Holder Name *</label>
                  <input type="text" value={profileForm.accountHolder} onChange={e=>setProfileForm(f=>({...f,accountHolder:e.target.value}))}
                    placeholder="As on bank account" className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#DD1215] rounded-lg"/>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Bank Name *</label>
                  <input type="text" value={profileForm.bankName} onChange={e=>setProfileForm(f=>({...f,bankName:e.target.value}))}
                    placeholder="e.g. HDFC Bank" className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#DD1215] rounded-lg"/>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Account Number *</label>
                  <input type="text" value={profileForm.accountNumber} onChange={e=>setProfileForm(f=>({...f,accountNumber:e.target.value}))}
                    placeholder="e.g. 1234567890" className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#DD1215] rounded-lg"/>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">IFSC Code *</label>
                  <input type="text" value={profileForm.ifscCode} onChange={e=>setProfileForm(f=>({...f,ifscCode:e.target.value.toUpperCase()}))}
                    placeholder="e.g. HDFC0001234" className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#DD1215] rounded-lg font-mono"/>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white border rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={18} className="text-[#DD1215]"/>
                <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Emergency Contact</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Contact Name</label>
                  <input type="text" value={profileForm.emergencyContact.name}
                    onChange={e=>setProfileForm(f=>({...f,emergencyContact:{...f.emergencyContact,name:e.target.value}}))}
                    placeholder="e.g. Parent / Spouse" className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#DD1215] rounded-lg"/>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Phone</label>
                  <input type="tel" value={profileForm.emergencyContact.phone}
                    onChange={e=>setProfileForm(f=>({...f,emergencyContact:{...f.emergencyContact,phone:e.target.value}}))}
                    placeholder="9876543210" className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#DD1215] rounded-lg"/>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Relation</label>
                  <input type="text" value={profileForm.emergencyContact.relation}
                    onChange={e=>setProfileForm(f=>({...f,emergencyContact:{...f.emergencyContact,relation:e.target.value}}))}
                    placeholder="e.g. Father, Mother" className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#DD1215] rounded-lg"/>
                </div>
              </div>
            </div>

            {/* Save button */}
            <button type="submit" disabled={profileSaving}
              className="flex items-center justify-center gap-2 w-full bg-[#DD1215] text-white py-3 text-xs font-black uppercase tracking-widest hover:bg-red-700 transition disabled:opacity-50 rounded-xl">
              <Send size={14}/> {profileSaving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        )}

        {/* ── SHOP SECTION (FULL SUPER ADMIN PRIVILEGES ON EMPLOYEE PORTAL) ── */}
        {tab === "shop" && empHasShopAccess && (
          <div className="space-y-6">
            {/* Banner card */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white rounded-2xl p-6 md:p-8 shadow-md border border-gray-800 relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-red-600/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-widest mb-3">
                    <ShieldCheck size={14} /> Super Admin Shop Privileges Active
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-white">
                    Store Management Center
                  </h2>
                  <p className="text-sm text-gray-300 mt-2 max-w-2xl leading-relaxed">
                    You have been granted complete administrative access to the Infinito Shop. Manage the live product catalog, create categories, process customer orders, monitor warehouse stock inventory, update promotional banners, and review analytics.
                  </p>
                </div>
                <div className="flex flex-wrap md:flex-col gap-2.5 shrink-0">
                  <a
                    href="/shop/products/new"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#DD1215] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm"
                  >
                    <Plus size={15} />
                    <span>Add New Product</span>
                  </a>
                  <a
                    href="/shop/orders"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition border border-white/10"
                  >
                    <ClipboardList size={15} />
                    <span>View Orders</span>
                  </a>
                </div>
              </div>

              {/* Quick Counter Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-800">
                <a href="/shop/products" className="bg-white/5 hover:bg-white/10 p-3.5 rounded-xl border border-white/5 transition block">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Products Catalog</div>
                  <div className="text-2xl font-black text-white mt-1">
                    {shopMetrics.loading ? '...' : shopMetrics.products}
                  </div>
                  <span className="text-[11px] text-red-400 font-semibold mt-1 inline-flex items-center gap-1">
                    Manage Products →
                  </span>
                </a>
                <a href="/shop/categories" className="bg-white/5 hover:bg-white/10 p-3.5 rounded-xl border border-white/5 transition block">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Active Categories</div>
                  <div className="text-2xl font-black text-white mt-1">
                    {shopMetrics.loading ? '...' : shopMetrics.categories}
                  </div>
                  <span className="text-[11px] text-red-400 font-semibold mt-1 inline-flex items-center gap-1">
                    View Categories →
                  </span>
                </a>
                <a href="/shop/orders" className="bg-white/5 hover:bg-white/10 p-3.5 rounded-xl border border-white/5 transition block">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Total Orders</div>
                  <div className="text-2xl font-black text-white mt-1">
                    {shopMetrics.loading ? '...' : shopMetrics.orders}
                  </div>
                  <span className="text-[11px] text-red-400 font-semibold mt-1 inline-flex items-center gap-1">
                    Process Orders →
                  </span>
                </a>
                <a href="/shop/inventory" className="bg-white/5 hover:bg-white/10 p-3.5 rounded-xl border border-white/5 transition block">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Warehouse Stock</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    Monitored
                  </div>
                  <span className="text-[11px] text-red-400 font-semibold mt-1 inline-flex items-center gap-1">
                    Stock Alerts →
                  </span>
                </a>
              </div>
            </div>

            {/* Complete Module Cards Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider text-gray-900">
                    Full Super Admin Shop Modules
                  </h3>
                  <p className="text-xs text-gray-500">
                    Direct access to all core eCommerce modules available to Super Administrators.
                  </p>
                </div>
                <button
                  onClick={loadShopMetrics}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  title="Refresh shop status"
                >
                  <RefreshCw size={13} className={shopMetrics.loading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. All Products */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-red-300 hover:shadow-md transition flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#DD1215] flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
                      <Package size={20} />
                    </div>
                    <h4 className="font-bold text-sm text-gray-900">Products Catalog</h4>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                      View all products, edit pricing, variants, descriptions, tags, and stock statuses.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                    <a
                      href="/shop/products"
                      className="flex-1 py-2 text-center text-xs font-bold text-white bg-[#DD1215] hover:bg-red-700 rounded-lg transition"
                    >
                      View Catalog
                    </a>
                    <a
                      href="/shop/products/new"
                      className="px-2.5 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                      title="Add New Product"
                    >
                      + Add
                    </a>
                  </div>
                </div>

                {/* 2. Categories */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-red-300 hover:shadow-md transition flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
                      <FolderOpen size={20} />
                    </div>
                    <h4 className="font-bold text-sm text-gray-900">Categories & Collections</h4>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                      Organize store items into Comics, Apparel, Figurines, and Posters categories with cover images.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                    <a
                      href="/shop/categories"
                      className="flex-1 py-2 text-center text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      Categories
                    </a>
                    <a
                      href="/shop/categories/new"
                      className="px-2.5 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                      title="Add New Category"
                    >
                      + Add
                    </a>
                  </div>
                </div>

                {/* 3. Orders */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-red-300 hover:shadow-md transition flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
                      <ClipboardList size={20} />
                    </div>
                    <h4 className="font-bold text-sm text-gray-900">Orders & Dispatches</h4>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                      Manage customer orders, print GST tax invoices & packing slips, and dispatch orders to Qikink.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <a
                      href="/shop/orders"
                      className="w-full block py-2 text-center text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                    >
                      All Orders ({shopMetrics.orders})
                    </a>
                  </div>
                </div>

                {/* 4. Inventory */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-red-300 hover:shadow-md transition flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
                      <BarChart3 size={20} />
                    </div>
                    <h4 className="font-bold text-sm text-gray-900">Inventory & Stock</h4>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                      Track SKU stock counts in real time, review out-of-stock items, and update physical stock counts.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <a
                      href="/shop/inventory"
                      className="w-full block py-2 text-center text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      Manage Inventory
                    </a>
                  </div>
                </div>

                {/* 5. Analytics & Reports */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-red-300 hover:shadow-md transition flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
                      <TrendingUp size={20} />
                    </div>
                    <h4 className="font-bold text-sm text-gray-900">Analytics & Reports</h4>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                      Monitor revenue trajectories, top revenue items, average order values, and sales breakdowns.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <a
                      href="/shop/analytics"
                      className="w-full block py-2 text-center text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      Open Analytics
                    </a>
                  </div>
                </div>

                {/* 6. Marketing & Promotions */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-red-300 hover:shadow-md transition flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
                      <Sparkles size={20} />
                    </div>
                    <h4 className="font-bold text-sm text-gray-900">Marketing & Banners</h4>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                      Configure Hero Carousel slider slides, discount coupon codes, and promotional banners.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <a
                      href="/shop/marketing"
                      className="w-full block py-2 text-center text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      Hero & Marketing
                    </a>
                  </div>
                </div>

                {/* 7. Company Profile */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-red-300 hover:shadow-md transition flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
                      <Building2 size={20} />
                    </div>
                    <h4 className="font-bold text-sm text-gray-900">Company & Invoicing</h4>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                      Store legal company info, GSTIN tax registration, warehouse dispatch address, and logos.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <a
                      href="/shop/company-profile"
                      className="w-full block py-2 text-center text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      Company Profile
                    </a>
                  </div>
                </div>

                {/* 8. Live Storefront */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-red-300 hover:shadow-md transition flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition">
                      <ExternalLink size={20} />
                    </div>
                    <h4 className="font-bold text-sm text-gray-900">Live Customer Store</h4>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                      Inspect the live customer storefront to preview new product drops, categories, and promotions.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <a
                      href="https://shop.infinitohq.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block py-2 text-center text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                    >
                      Open Storefront ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SHOP ACCESS REQUIRED NOTICE (IF OPENED WITHOUT PERMISSION) ── */}
        {tab === "shop" && !empHasShopAccess && (
          <div className="bg-white border rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="w-14 h-14 bg-red-50 text-[#DD1215] rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag size={28} />
            </div>
            <h3 className="text-lg font-black uppercase text-gray-900">Shop Section Access Required</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your employee account has not yet been granted Shop Section permissions. A Super Administrator can grant you access instantly under <strong>Shop &gt; Management</strong>.
            </p>
            <button
              onClick={() => setTab("attendance")}
              className="px-6 py-2.5 bg-[#DD1215] text-white text-xs font-bold uppercase rounded-lg hover:bg-red-700 transition"
            >
              Return to Attendance
            </button>
          </div>
        )}
      </div>

      {/* ── Apply Leave Modal ── */}
      {applyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-5">Apply for Leave</h3>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Leave Type</label>
                <select value={leaveForm.leaveType} onChange={e=>setLeaveForm(f=>({...f,leaveType:e.target.value}))} className={inp}>
                  {["casual","sick","earned","unpaid","maternity","paternity","bereavement"].map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">From *</label><input type="date" value={leaveForm.fromDate} onChange={e=>setLeaveForm(f=>({...f,fromDate:e.target.value}))} className={inp}/></div>
                <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">To *</label><input type="date" value={leaveForm.toDate} onChange={e=>setLeaveForm(f=>({...f,toDate:e.target.value}))} className={inp}/></div>
              </div>
              <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Reason *</label><textarea rows={3} value={leaveForm.reason} onChange={e=>setLeaveForm(f=>({...f,reason:e.target.value}))} className={`${inp} resize-none`} required/></div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" checked={leaveForm.isHalfDay} onChange={e=>setLeaveForm(f=>({...f,isHalfDay:e.target.checked}))} className="w-4 h-4 accent-[#DD1215]"/>Half day leave</label>
            </div>
            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={()=>{setApplyModal(false);setError("");}} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleApplyLeave} disabled={leaveSaving} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">{leaveSaving?"Applying...":"Apply"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Update Goal Progress Modal ── */}
      {progModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-2">Update Progress</h3>
            <p className="text-sm text-gray-500 mb-4">{progModal.title} · Target: {progModal.targetValue} {progModal.unit}</p>
            <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Current Value ({progModal.unit})</label>
              <input type="number" value={progVal} onChange={e=>setProgVal(e.target.value)} className={inp}/>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setProgModal(null)} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleUpdateProgress} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition">Update</button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Request Modal ── */}
      {reqModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-5">New Request</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Type</label>
                  <select value={reqForm.type} onChange={e=>setReqForm(f=>({...f,type:e.target.value}))} className={inp}>
                    {["leave_application","document_request","address_update","bank_update","profile_update","attendance_correction","salary_query","other"].map(t=><option key={t} value={t}>{t.replace(/_/g," ")}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Priority</label>
                  <select value={reqForm.priority} onChange={e=>setReqForm(f=>({...f,priority:e.target.value}))} className={inp}>
                    {["low","medium","high"].map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Subject *</label><input type="text" value={reqForm.subject} onChange={e=>setReqForm(f=>({...f,subject:e.target.value}))} className={inp} required/></div>
              <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Description</label><textarea rows={3} value={reqForm.description} onChange={e=>setReqForm(f=>({...f,description:e.target.value}))} className={`${inp} resize-none`}/></div>
            </div>
            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={()=>{setReqModal(false);setError("");}} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSubmitRequest} disabled={reqSaving} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">{reqSaving?"Submitting...":"Submit"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inp = "w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] bg-white";

export default EmployeePortal;
