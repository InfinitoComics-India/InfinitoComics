import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import URLs from '../../Utils/utils.js';
import { LogOut, Home, BookOpen, Users, User, FlaskConical, FileText, HelpCircle, Clock, Briefcase, ShieldCheck, Menu, X, ChevronRight, ChevronDown, Mail, UserCog, Bell, ScrollText, CalendarDays, CalendarOff, Kanban, UserCheck, FolderKanban, TrendingUp, Target, Award as AwardIcon, Building2, IndianRupee, UserPlus, FileArchive, UserSearch, MessagesSquare, BookMarked, LifeBuoy, Sparkles, ShoppingBag, Package, FolderOpen, BarChart3, ClipboardList, Plus } from "lucide-react";
import { message, Popconfirm } from "antd";
import { getRoles, getAdmin } from '../../Utils/auth.js';
import { isEmployeeShopAllowed, fetchMyCurrentShopAccess } from '../../services/shopServices/shopAccessService.js';

const HR_ALL = ["superadmin", "hr_manager", "manager", "team_lead", "comics_admin", "character_admin", "research_admin", "blog_admin", "career_admin", "shop_admin"];
const HR_AUDIT = ["superadmin", "hr_manager"];
const SHOP_ALL = ["superadmin", "shop_admin", "employee", "admin", "comics_admin", "character_admin", "research_admin", "blog_admin", "career_admin", "manager", "team_lead"]; // Shop access roles
const EMP_ALL = [...HR_ALL, "employee"];

// ── Employee-facing standalone items (shown outside HR accordion) ───
const EMP_ITEMS = [
  { label: "Attendance", to: "/employee-portal?tab=attendance", icon: Clock, roles: EMP_ALL },
  { label: "Leaves", to: "/employee-portal?tab=leave", icon: CalendarOff, roles: EMP_ALL },
  { label: "Goals", to: "/employee-portal?tab=goals", icon: Target, roles: EMP_ALL },
  { label: "Documents", to: "/employee-portal?tab=documents", icon: FileArchive, roles: EMP_ALL },
  { label: "Self Service", to: "/employee-portal?tab=requests", icon: LifeBuoy, roles: EMP_ALL },
  { label: "Work Log", to: "/employee-portal?tab=worklog", icon: ClipboardList, roles: EMP_ALL },
  { label: "Chat", to: "/hr/chat", icon: MessagesSquare, roles: EMP_ALL },
  { label: "My Profile", to: "/employee-portal?tab=profile", icon: User, roles: ["employee"] },
];

// ── Regular nav items (above HR section) ────────────────────
const NAV_ITEMS = [
  { label: "Home", to: "/", icon: Home, roles: ["superadmin", "comics_admin", "character_admin", "research_admin", "blog_admin", "career_admin"] },
  { label: "Comics", to: "/comic", icon: BookOpen, roles: ["superadmin", "comics_admin"] },
  { label: "Characters", to: "/characters", icon: User, roles: ["superadmin", "character_admin"] },
  { label: "Research", to: "/research", icon: FlaskConical, roles: ["superadmin", "research_admin"] },
  { label: "Blogs", to: "/createblog", icon: FileText, roles: ["superadmin", "blog_admin"] },
  { label: "FAQs", to: "/createfaq", icon: HelpCircle, roles: ["superadmin", "blog_admin"] },
  { label: "Timeline", to: "/timeline", icon: Clock, roles: ["superadmin", "blog_admin"] },
  { label: "Career", to: "/career", icon: Briefcase, roles: ["superadmin", "career_admin"] },
  { label: "Users", to: "/users", icon: Users, roles: ["superadmin"] },
  { label: "Admin Mgmt", to: "/admin-management", icon: ShieldCheck, roles: ["superadmin"] },
  { label: "Contact Queries", to: "/contact-queries", icon: Mail, roles: ["superadmin"] },
  { label: "Employee Portal", to: "/employee-portal", icon: UserCheck, roles: ["employee"] },
];

// ── HR sub-items (shown inside collapsible accordion) ────────
const HR_ITEMS = [
  { label: "Employees", to: "/hr/employees", icon: UserCog, roles: HR_ALL },
  { label: "Notifications", to: "/hr/notifications", icon: Bell, roles: HR_ALL },
  { label: "Audit Log", to: "/hr/audit", icon: ScrollText, roles: HR_AUDIT },
  { label: "Attendance", to: "/hr/attendance", icon: Clock, roles: HR_ALL },
  { label: "Leaves", to: "/hr/leaves", icon: CalendarOff, roles: HR_ALL },
  { label: "Calendar", to: "/hr/calendar", icon: CalendarDays, roles: HR_ALL },
  { label: "Task Board", to: "/hr/tasks", icon: Kanban, roles: HR_ALL },
  { label: "Work Assignment", to: "/hr/assignments", icon: UserCheck, roles: HR_ALL },
  { label: "Projects", to: "/hr/projects", icon: FolderKanban, roles: HR_ALL },
  { label: "Performance", to: "/hr/performance", icon: TrendingUp, roles: HR_ALL },
  { label: "Goals", to: "/hr/goals", icon: Target, roles: HR_ALL },
  { label: "Recognition", to: "/hr/recognition", icon: AwardIcon, roles: HR_ALL },
  { label: "Payroll", to: "/hr/payroll", icon: IndianRupee, roles: HR_ALL },
  { label: "Onboarding", to: "/hr/onboarding", icon: UserPlus, roles: HR_ALL },
  { label: "Documents", to: "/hr/documents", icon: FileArchive, roles: HR_ALL },
  { label: "Recruitment", to: "/hr/recruitment", icon: UserSearch, roles: HR_ALL },
  { label: "Chat", to: "/hr/chat", icon: MessagesSquare, roles: HR_ALL },
  { label: "Wiki", to: "/hr/wiki", icon: BookMarked, roles: HR_ALL },
  { label: "Self Service", to: "/hr/self-service", icon: LifeBuoy, roles: HR_ALL },
  { label: "Infinito AI", to: "/hr/ai", icon: Sparkles, roles: HR_ALL },
];

// ── Shop sub-items (shown inside collapsible accordion) ────────
const SHOP_ITEMS = [
  { label: "All Products", to: "/shop/products", icon: Package, roles: SHOP_ALL },
  { label: "Add Product", to: "/shop/products/new", icon: Plus, roles: SHOP_ALL },
  { label: "Categories", to: "/shop/categories", icon: FolderOpen, roles: SHOP_ALL },
  { label: "Inventory", to: "/shop/inventory", icon: BarChart3, roles: SHOP_ALL },
  { label: "Orders", to: "/shop/orders", icon: ClipboardList, roles: SHOP_ALL },
  { label: "Analytics & Reports", to: "/shop/analytics", icon: TrendingUp, roles: SHOP_ALL },
  { label: "Marketing & Promotions", to: "/shop/marketing", icon: Sparkles, roles: SHOP_ALL },
  { label: "Company Profile", to: "/shop/company-profile", icon: Building2, roles: SHOP_ALL },
  { label: "Management", to: "/shop/management", icon: Users, roles: ["superadmin"] },
];

const Navbar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hrOpen, setHrOpen] = useState(false); // HR accordion open/closed
  const desktopNavRef = useRef(null);
  const location = useLocation();
  const token = localStorage.getItem("authToken");
  const roles = getRoles();
  const admin = getAdmin();

  const isSuperOrShopAdmin = roles.includes('superadmin') || roles.includes('shop_admin');
  const [empShopAllowed, setEmpShopAllowed] = useState(() => {
    return isEmployeeShopAllowed(admin?.email, admin);
  });

  // Listen for shop access changes in real-time across tabs / storage events and server status
  useEffect(() => {
    let isMounted = true;

    const checkAccess = () => {
      const curAdmin = getAdmin();
      const allowed = isEmployeeShopAllowed(curAdmin?.email, curAdmin);
      if (isMounted) setEmpShopAllowed(allowed);
    };

    // Immediately fetch fresh status from backend server
    const syncWithServer = async () => {
      try {
        const allowed = await fetchMyCurrentShopAccess();
        if (isMounted) {
          setEmpShopAllowed(allowed);
        }
      } catch {}
    };

    checkAccess();
    syncWithServer();

    window.addEventListener('storage', checkAccess);
    window.addEventListener('focus', syncWithServer);

    // Periodic sync every 10 seconds so employee sees shop toggle in real-time
    const interval = setInterval(syncWithServer, 10000);

    let bc;
    try {
      bc = new BroadcastChannel('infinito_shop_access_channel');
      bc.onmessage = (e) => {
        checkAccess();
        syncWithServer();
      };
    } catch { }

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('storage', checkAccess);
      window.removeEventListener('focus', syncWithServer);
      if (bc) bc.close();
    };
  }, []);

  const canViewShop = isSuperOrShopAdmin || empShopAllowed;

  // If on a shop route or user has shop access, shop opens by default
  const isShopActive = location.pathname.startsWith('/admin/shop') || location.pathname.startsWith('/shop');
  const [shopOpen, setShopOpen] = useState(() => {
    return canViewShop && (isShopActive || roles.includes('shop_admin') || (roles.includes('employee') && empShopAllowed));
  });

  // Automatically keep shop accordion open if shop becomes newly allowed
  useEffect(() => {
    if (canViewShop && (isShopActive || roles.includes('shop_admin') || (roles.includes('employee') && empShopAllowed))) {
      setShopOpen(true);
    }
  }, [canViewShop, isShopActive, empShopAllowed]);

  const visibleNav = NAV_ITEMS.filter(item => roles.some(r => item.roles.includes(r)));
  const visibleHR = HR_ITEMS.filter(item => roles.some(r => item.roles.includes(r)));
  const visibleShop = SHOP_ITEMS.filter(item => roles.some(r => item.roles.includes(r)));
  const baseEmp = EMP_ITEMS.filter(item => roles.some(r => item.roles.includes(r)));
  const visibleEmp = canViewShop
    ? [...baseEmp, { label: "Shop Section", to: "/employee-portal?tab=shop", icon: ShoppingBag, roles: EMP_ALL }]
    : baseEmp;
  const isEmpOnly = roles.length > 0 && roles.every(r => r === "employee");
  const showHRSection = visibleHR.length > 0 && !isEmpOnly;
  const showShopSection = visibleShop.length > 0 && canViewShop;

  // If any HR route is currently active, keep accordion open
  const isHRActive = visibleHR.some(item => location.pathname.startsWith(`/admin${item.to}`) || location.pathname.startsWith(item.to));

  // Track and persist scroll position of the sidebar navigation
  const handleNavScroll = (e) => {
    sessionStorage.setItem('admin_sidebar_scroll', String(e.currentTarget.scrollTop));
  };

  useLayoutEffect(() => {
    const saved = sessionStorage.getItem('admin_sidebar_scroll');
    if (saved && desktopNavRef.current) {
      desktopNavRef.current.scrollTop = Number(saved);
    }
  }, [location.pathname, location.search]);


  const handleLogout = () => {
    localStorage.clear();
    message.success("Logged out successfully");
    window.location.href = "/admin";
  };

  const isActive = (to) => {
    if (to === "/") return location.pathname === "/admin" || location.pathname === "/admin/" || location.pathname === "/";
    const [path, query] = to.split('?');
    const normCurrentPath = location.pathname.startsWith('/admin') ? location.pathname.replace(/^\/admin/, '') : location.pathname;
    const normTarget = path.startsWith('/admin') ? path.replace(/^\/admin/, '') : path;

    if (query) {
      const fullCurrent = `${location.pathname}${location.search}`;
      const pathMatches = normCurrentPath === normTarget || normCurrentPath.startsWith(`${normTarget}/`);
      return pathMatches && fullCurrent.includes(query);
    }

    // Exact path match
    if (normCurrentPath === normTarget) {
      return true;
    }

    // Do NOT highlight "All Products" when on "Add Product" (/shop/products/new)
    if (normTarget === "/shop/products" && normCurrentPath === "/shop/products/new") {
      return false;
    }

    // Do NOT highlight "Categories" when on "Add Category" (/shop/categories/new)
    if (normTarget === "/shop/categories" && normCurrentPath === "/shop/categories/new") {
      return false;
    }

    // Sub-path match (e.g. editing a product /shop/products/:id where id is not new)
    return normCurrentPath.startsWith(`${normTarget}/`);
  };

  const renderSidebarContent = (onNavClick, isMobile = false) => (
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
      <nav
        ref={!isMobile ? desktopNavRef : undefined}
        onScroll={!isMobile ? handleNavScroll : undefined}
        className="flex-1 overflow-y-auto py-4 px-2 space-y-1"
      >

        {/* ── My Portal — shown first for employees ── */}
        {isEmpOnly && (
          <Link to="/employee-portal" onClick={onNavClick} title={collapsed ? "My Portal" : ""}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-150
              ${isActive("/employee-portal") ? "bg-[#DD1215] text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}
              ${collapsed ? "justify-center" : ""}`}>
            <Users size={20} className="shrink-0" />
            {!collapsed && <span>My Portal</span>}
          </Link>
        )}

        {/* ── Employee standalone items (outside HR accordion) ── */}
        {isEmpOnly && visibleEmp.map(({ label, to, icon: Icon }) => (
          <Link key={to} to={to} onClick={onNavClick} title={collapsed ? label : ""}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
              ${isActive(to) ? "bg-[#DD1215] text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}
              ${collapsed ? "justify-center" : ""}`}>
            <Icon size={20} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}

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

        {/* ── Shop System Accordion ── */}
        {showShopSection && (
          <div className="mt-2">

            {/* Shop Header — bold, clickable, with chevron */}
            {!collapsed ? (
              <button
                onClick={() => setShopOpen(o => !o)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 group cursor-pointer
                  ${(shopOpen || isShopActive) ? "bg-gray-800 text-white" : "text-gray-200 hover:bg-gray-700 hover:text-white"}
                `}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag size={20} className="shrink-0 text-[#DD1215]" />
                  <span className="text-sm font-black uppercase tracking-widest text-[#DD1215]">Shop</span>
                </div>
                <div className={`transition-transform duration-200 ${(shopOpen || isShopActive) ? "rotate-180" : ""}`}>
                  <ChevronDown size={16} className="text-[#DD1215]" />
                </div>
              </button>
            ) : (
              // Collapsed: show just icon as toggle
              <button
                onClick={() => setShopOpen(o => !o)}
                title="Shop"
                className="flex items-center justify-center w-full py-2.5 rounded-lg text-[#DD1215] hover:bg-gray-700 transition cursor-pointer"
              >
                <ShoppingBag size={20} />
              </button>
            )}

            {/* Shop Sub-items — list of all shop pages directly */}
            {(shopOpen || isShopActive) && (
              <div className={`mt-1 space-y-0.5 overflow-hidden ${!collapsed ? "pl-2" : ""}`}>
                {visibleShop.map(({ label, to, icon: Icon }) => (
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
          ${collapsed ? "w-16" : "w-64"}
        `}
      >
        {renderSidebarContent()}
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
            {renderSidebarContent(() => setMobileOpen(false), true)}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
