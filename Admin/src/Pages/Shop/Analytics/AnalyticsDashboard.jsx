import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  TrendingUp, ShoppingBag, Package, Users, DollarSign, Calendar,
  Download, FileSpreadsheet, FileText, FileCode, ChevronDown,
  AlertTriangle, CheckCircle2, Clock, ArrowUpRight, ArrowDownRight,
  Filter, Search, RefreshCw, Layers, Eye, ShieldAlert, BarChart3,
  PieChart, Activity, Sparkles, ExternalLink
} from 'lucide-react';
import { message, Spin, Tag, Dropdown, Tooltip, Progress } from 'antd';
import * as XLSX from 'xlsx';
import { getAnalyticsData } from '../../../services/shopServices/analyticsService';
import { formatOrderDate, formatDateTime } from '../../../services/shopServices/orderService';

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { subTab } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab: 'overview' | 'sales' | 'inventory' | 'customers'
  const initialTab = subTab || searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Filters
  const [topProductsRange, setTopProductsRange] = useState('week'); // 'today' | 'week' | 'month'
  const [salesDateRange, setSalesDateRange] = useState('30d'); // '7d' | '30d' | '90d' | 'year'
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Hovered point on interactive SVG graph
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    if (subTab) {
      setActiveTab(subTab);
    } else {
      const tabFromUrl = searchParams.get('tab');
      if (tabFromUrl && tabFromUrl !== activeTab) {
        setActiveTab(tabFromUrl);
      }
    }
  }, [subTab, searchParams]);

  useEffect(() => {
    loadAnalytics();

    const handleUpdate = () => {
      loadAnalytics(true);
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('infinito_order_placed', handleUpdate);
    window.addEventListener('infinito_orders_updated', handleUpdate);

    const interval = setInterval(() => {
      loadAnalytics(true);
    }, 15000);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('infinito_order_placed', handleUpdate);
      window.removeEventListener('infinito_orders_updated', handleUpdate);
      clearInterval(interval);
    };
  }, [salesDateRange]);

  const loadAnalytics = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await getAnalyticsData(salesDateRange);
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      if (!isBackground) message.error('Failed to load analytics data');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  // ── Export Handlers ──────────────────────────────────────────
  const exportData = (type) => {
    if (!data) return;
    let rows = [];
    let filename = `infinito_analytics_${activeTab}_${Date.now()}`;

    if (activeTab === 'overview' || activeTab === 'sales') {
      rows = (data.salesReports?.productSales || []).map((p, idx) => ({
        'Rank': idx + 1,
        'Product Name': p.name,
        'SKU': p.sku,
        'Category': p.category,
        'Unit Price (₹)': p.unitPrice,
        'Units Sold': p.totalSoldAll,
        'Gross Revenue (₹)': p.revenueAll,
      }));
    } else if (activeTab === 'inventory') {
      rows = (data.inventoryReports?.inventoryItems || []).map((i) => ({
        'Product Name': i.name,
        'SKU': i.sku,
        'Category': i.category,
        'Current Stock': i.currentStock,
        'Reorder Threshold': i.reorderThreshold,
        'Cost Price (₹)': i.costPrice,
        'Retail Price (₹)': i.retailPrice,
        'Status': i.status,
      }));
    } else if (activeTab === 'customers') {
      rows = (data.customerReports?.topCustomers || []).map((c, idx) => ({
        'Rank': idx + 1,
        'Customer Name': c.name,
        'Email': c.email,
        'Phone': c.phone,
        'Orders Count': c.orderCount,
        'Total Spent (₹)': c.totalSpent,
        'Last Active': formatOrderDate(c.lastOrder),
      }));
    }

    if (rows.length === 0) return message.warning('No data available to export');

    if (type === 'excel') {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      XLSX.writeFile(wb, `${filename}.xlsx`);
      message.success('Report exported as Excel (.xlsx)');
    } else if (type === 'csv') {
      const ws = XLSX.utils.json_to_sheet(rows);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('Report exported as CSV (.csv)');
    } else if (type === 'json') {
      const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('Report exported as JSON (.json)');
    }
  };

  const exportMenuItems = [
    {
      key: 'excel',
      label: 'Download Excel (.xlsx)',
      icon: <FileSpreadsheet className="w-4 h-4 text-green-600" />,
      onClick: () => exportData('excel'),
    },
    {
      key: 'csv',
      label: 'Download CSV (.csv)',
      icon: <FileText className="w-4 h-4 text-blue-600" />,
      onClick: () => exportData('csv'),
    },
    {
      key: 'json',
      label: 'Download JSON (.json)',
      icon: <FileCode className="w-4 h-4 text-amber-600" />,
      onClick: () => exportData('json'),
    },
  ];

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px]">
        <Spin size="large" />
        <p className="text-gray-500 mt-4 font-medium">Computing analytics & reports...</p>
      </div>
    );
  }

  const { overview, salesReports, inventoryReports, customerReports } = data;

  // ── Render 30-Day Revenue Interactive SVG Graph ──────────────
  const renderRevenueGraph = () => {
    const points = overview.revenue30Days || [];
    if (points.length === 0) return null;

    const maxRevenue = Math.max(...points.map((p) => p.revenue), 1000);
    const height = 220;
    const width = 800;
    const padding = 40;

    const getX = (idx) => padding + (idx / (points.length - 1)) * (width - 2 * padding);
    const getY = (val) => height - padding - (val / maxRevenue) * (height - 2 * padding);

    // SVG path string
    const pathD = points.reduce((acc, p, idx) => {
      const x = getX(idx);
      const y = getY(p.revenue);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');

    // Closed path for gradient area fill
    const areaD = `${pathD} L ${getX(points.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;

    const total30d = points.reduce((sum, p) => sum + p.revenue, 0);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
              <Activity className="text-[#DD1215]" size={17} />
              Revenue Graph (Last 30 Days)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Daily revenue fluctuation from completed customer orders & verified payments
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">30-Day Total</span>
            <span className="text-lg font-black text-gray-900">
              ₹{total30d.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* SVG Area Chart */}
        <div className="relative overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 select-none">
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DD1215" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#DD1215" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal guidelines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = getY(maxRevenue * pct);
              return (
                <g key={idx}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={width - padding}
                    y2={y}
                    stroke="#f3f4f6"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding - 6}
                    y={y + 4}
                    fill="#9ca3af"
                    fontSize="9"
                    textAnchor="end"
                    fontWeight="600"
                  >
                    ₹{Math.round((maxRevenue * pct) / 1000)}k
                  </text>
                </g>
              );
            })}

            {/* Gradient area */}
            <path d={areaD} fill="url(#revenueGrad)" />

            {/* Line path */}
            <path d={pathD} fill="none" stroke="#DD1215" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Hoverable interactive dots */}
            {points.map((p, idx) => {
              const cx = getX(idx);
              const cy = getY(p.revenue);
              const isHovered = hoveredPoint?.dateKey === p.dateKey;

              return (
                <g key={p.dateKey}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 6 : 3}
                    fill={isHovered ? '#DD1215' : '#ffffff'}
                    stroke="#DD1215"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Date labels at bottom for every 5th point */}
                  {idx % 5 === 0 && (
                    <text
                      x={cx}
                      y={height - padding + 16}
                      fill="#6b7280"
                      fontSize="9"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {p.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Card */}
          {hoveredPoint && (
            <div className="absolute top-2 right-4 bg-gray-900/90 text-white rounded-lg p-2.5 text-xs shadow-xl backdrop-blur-xs pointer-events-none transition">
              <p className="font-bold text-[11px] text-gray-300">{hoveredPoint.label}</p>
              <p className="text-sm font-black text-[#DD1215] mt-0.5">
                ₹{hoveredPoint.revenue.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-gray-400">
                {hoveredPoint.orders} order{hoveredPoint.orders === 1 ? '' : 's'} · {hoveredPoint.units} item{hoveredPoint.units === 1 ? '' : 's'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Shop</span>
            <span>/</span>
            <span className="text-[#DD1215]">Analytics & Reports</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mt-1 flex items-center gap-2">
            <span>Analytics & Reports</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time sales performance, inventory valuations, and customer lifetime value metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAnalytics}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-xs shadow-sm cursor-pointer"
            title="Refresh Analytics"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>

          <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#DD1215] hover:bg-red-700 text-white rounded-lg transition font-bold text-xs shadow-sm cursor-pointer"
            >
              <Download size={14} />
              <span>Export Report</span>
              <ChevronDown size={12} className="opacity-80" />
            </button>
          </Dropdown>
        </div>
      </div>

      {/* ── Subtabs Navigation ── */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: 'overview', label: 'Dashboard (Overview)', icon: BarChart3 },
          { key: 'sales', label: 'Sales Reports', icon: TrendingUp },
          { key: 'inventory', label: 'Inventory Reports', icon: Package },
          { key: 'customers', label: 'Customer Reports', icon: Users },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-[#DD1215]' : 'text-gray-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── 3.1 DASHBOARD (OVERVIEW) ────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics Grid: Today, Week, Month, Pending Fulfillment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Today's Sales */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 relative overflow-hidden group hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Today's Sales</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">
                    ₹{Number(overview.todaySales).toLocaleString('en-IN')}
                  </h3>
                  <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
                    <ArrowUpRight size={13} /> +14.2% vs yesterday
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-red-50 text-[#DD1215] flex items-center justify-center font-bold">
                  <DollarSign size={22} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#DD1215]"></div>
            </div>

            {/* This Week */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 relative overflow-hidden group hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">This Week</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">
                    ₹{Number(overview.thisWeekSales).toLocaleString('en-IN')}
                  </h3>
                  <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
                    <ArrowUpRight size={13} /> +8.6% vs last week
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <TrendingUp size={22} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
            </div>

            {/* This Month */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 relative overflow-hidden group hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">This Month</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">
                    ₹{Number(overview.thisMonthSales).toLocaleString('en-IN')}
                  </h3>
                  <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
                    <ArrowUpRight size={13} /> +22.4% vs last month
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Calendar size={22} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
            </div>

            {/* Pending Fulfillment Count */}
            <Link
              to="/shop/orders"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 relative overflow-hidden group hover:shadow-md transition block"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Pending Fulfillment</p>
                  <h3 className="text-2xl font-black text-amber-600 mt-1">
                    {overview.pendingFulfillmentCount} Orders
                  </h3>
                  <p className="text-xs text-amber-700 font-semibold mt-1 flex items-center gap-1">
                    <Clock size={13} /> Click to dispatch / Qikink
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Package size={22} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>
            </Link>
          </div>

          {/* 30-Day Revenue Graph */}
          {renderRevenueGraph()}

          {/* Top Selling Products & Recent Orders Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Selling Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
                    <Sparkles className="text-[#DD1215]" size={17} />
                    Top Selling Products
                  </h3>
                  <p className="text-xs text-gray-400">Ranked by units and gross revenue</p>
                </div>

                {/* Range Toggle */}
                <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                  {['today', 'week', 'month'].map((rng) => (
                    <button
                      key={rng}
                      onClick={() => setTopProductsRange(rng)}
                      className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-md transition cursor-pointer ${
                        topProductsRange === rng ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {rng}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products List */}
              <div className="space-y-3">
                {overview.topSellingList.slice(0, 5).map((p, idx) => {
                  const units = topProductsRange === 'today' ? p.todayUnits : topProductsRange === 'week' ? p.weekUnits : p.monthUnits;
                  const rev = topProductsRange === 'today' ? p.todayRevenue : topProductsRange === 'week' ? p.weekRevenue : p.monthRevenue;

                  return (
                    <div
                      key={p.id || idx}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-black flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <img
                          src={p.thumbnail || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'}
                          alt=""
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-gray-900 text-xs line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">SKU: {p.sku}</p>
                        </div>
                      </div>

                      <div className="text-right whitespace-nowrap pl-3">
                        <p className="font-black text-gray-900 text-xs">
                          ₹{Number(rev || p.revenueAll).toLocaleString('en-IN')}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {units || p.totalSoldAll} sold
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Orders (Last 10) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
                    <ShoppingBag className="text-[#DD1215]" size={17} />
                    Recent Orders (Last 10)
                  </h3>
                  <p className="text-xs text-gray-400">Latest customer transactions</p>
                </div>
                <Link
                  to="/shop/orders"
                  className="text-xs font-bold text-[#DD1215] hover:underline flex items-center gap-1"
                >
                  View All <ExternalLink size={12} />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400">
                    <tr>
                      <th className="py-2.5 px-3">Order #</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {overview.recentOrders.map((ord) => (
                      <tr
                        key={ord.orderId}
                        onClick={() => navigate(`/shop/orders/${ord.id || ord.orderId.replace('#', '')}`)}
                        className="hover:bg-gray-50 cursor-pointer transition"
                      >
                        <td className="py-2.5 px-3 font-bold text-gray-900 font-mono">
                          {ord.orderId}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-gray-800 block truncate max-w-[120px]">
                            {ord.customer?.name}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-gray-900">
                          ₹{Number(ord.pricing?.grandTotal || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3">
                          <Tag
                            color={
                              ord.fulfillment?.status === 'Fulfilled'
                                ? 'green'
                                : ord.fulfillment?.status === 'Processing'
                                ? 'blue'
                                : 'orange'
                            }
                            className="text-[10px] font-bold uppercase px-1.5 py-0"
                          >
                            {ord.fulfillment?.status || 'Unfulfilled'}
                          </Tag>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── 3.2 SALES REPORTS ───────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* Top Controls: Date range filter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <span className="text-xs font-bold text-gray-700 uppercase">Sales Filter Range:</span>
              <div className="flex items-center bg-gray-100 p-1 rounded-lg ml-2">
                {[
                  { key: '7d', label: 'Last 7 Days' },
                  { key: '30d', label: 'Last 30 Days' },
                  { key: '90d', label: 'Last 90 Days' },
                  { key: 'year', label: 'This Year' },
                ].map((rng) => (
                  <button
                    key={rng.key}
                    onClick={() => setSalesDateRange(rng.key)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                      salesDateRange === rng.key
                        ? 'bg-[#DD1215] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {rng.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500 font-medium">
              Showing verified Razorpay sales and taxes
            </div>
          </div>

          {/* Sales Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gross Sales</span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                ₹{Number(salesReports.grossSales).toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Net Revenue (Excl. Tax)</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                ₹{Number(salesReports.netSales).toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Orders</span>
              <h3 className="text-2xl font-black text-blue-600 mt-1">
                {salesReports.totalOrders}
              </h3>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average Order Value (AOV)</span>
              <h3 className="text-2xl font-black text-purple-600 mt-1">
                ₹{Number(salesReports.averageOrderValue).toLocaleString('en-IN')}
              </h3>
            </div>
          </div>

          {/* Sales by Category Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
                <PieChart className="text-[#DD1215]" size={17} />
                Sales by Category
              </h3>
              <span className="text-xs text-gray-400">Revenue and unit distribution</span>
            </div>

            <div className="space-y-4">
              {salesReports.categorySales.map((cat) => (
                <div key={cat.name} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center font-bold text-gray-800">
                    <span>{cat.name}</span>
                    <span>
                      ₹{cat.revenue.toLocaleString('en-IN')} ({cat.share}%) · {cat.units} units
                    </span>
                  </div>
                  <Progress
                    percent={cat.share}
                    showInfo={false}
                    strokeColor={cat.color}
                    size="small"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sales by Product Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                  Sales by Product
                </h3>
                <p className="text-xs text-gray-400">Individual merchandise sales breakdown</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Filter product sales..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#DD1215]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-center">Units Sold</th>
                    <th className="py-3 px-4 text-right">Gross Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {salesReports.productSales
                    .filter((p) => (p.name || '').toLowerCase().includes(productSearch.toLowerCase()))
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.thumbnail || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'}
                              alt=""
                              className="w-9 h-9 object-cover rounded-lg border border-gray-200 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-gray-900">{p.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono">SKU: {p.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-medium">
                          {p.category}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-700">
                          ₹{Number(p.unitPrice).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-gray-800">
                          {p.totalSoldAll}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-gray-900">
                          ₹{Number(p.revenueAll).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── 3.3 INVENTORY REPORTS ───────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Stock Levels & Inventory Value Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total In Stock */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">In Stock SKUs</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {inventoryReports.stockLevels.inStock}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Sufficient fulfillment inventory</p>
            </div>

            {/* Low Stock */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Low Stock (≤10)</span>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                {inventoryReports.stockLevels.lowStock}
              </h3>
              <p className="text-xs text-amber-700 font-medium mt-1">Approaching reorder threshold</p>
            </div>

            {/* Out of Stock */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Out of Stock</span>
              <h3 className="text-2xl font-black text-red-600 mt-1">
                {inventoryReports.stockLevels.outOfStock}
              </h3>
              <p className="text-xs text-red-700 font-medium mt-1">Backorder / Restock needed</p>
            </div>

            {/* Inventory Valuation */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Retail Valuation</span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                ₹{Number(inventoryReports.valuation.retailValue).toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                ~{inventoryReports.valuation.grossMargin}% Gross Margin
              </p>
            </div>
          </div>

          {/* Products Needing Restock Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
                  <AlertTriangle className="text-amber-500" size={17} />
                  Products Needing Restock
                </h3>
                <p className="text-xs text-gray-400">Items at or below the reorder minimum</p>
              </div>
              <Link
                to="/shop/inventory"
                className="text-xs font-bold text-[#DD1215] hover:underline flex items-center gap-1"
              >
                Manage Inventory <ExternalLink size={12} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400">
                  <tr>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Current Stock</th>
                    <th className="py-3 px-4 text-center">Min Threshold</th>
                    <th className="py-3 px-4 text-right">Retail Value</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inventoryReports.productsNeedingRestock.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.thumbnail}
                            alt=""
                            className="w-9 h-9 object-cover rounded-lg border border-gray-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-gray-900">{item.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">SKU: {item.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-medium">
                        {item.category}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-red-600">
                        {item.currentStock} units
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-500">
                        {item.reorderThreshold} units
                      </td>
                      <td className="py-3 px-4 text-right font-black text-gray-900">
                        ₹{item.retailPrice}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Tag
                          color={item.currentStock === 0 ? 'error' : 'warning'}
                          className="text-[10px] font-bold uppercase px-2 py-0.5"
                        >
                          {item.status}
                        </Tag>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── 3.4 CUSTOMER REPORTS ────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          {/* Customer Retention & Lifetime Value Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* New vs Returning Customers */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer Mix</span>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-black text-gray-900">
                    {customerReports.totalCustomers}
                  </span>
                  <span className="text-xs text-gray-400 block">Total Customers</span>
                </div>
                <div className="text-right text-xs space-y-0.5">
                  <p className="text-blue-600 font-bold">New: {customerReports.newCustomerRate}%</p>
                  <p className="text-purple-600 font-bold">Returning: {customerReports.returningCustomerRate}%</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex">
                <div style={{ width: `${customerReports.newCustomerRate}%` }} className="bg-blue-600 h-full"></div>
                <div style={{ width: `${customerReports.returningCustomerRate}%` }} className="bg-purple-600 h-full"></div>
              </div>
            </div>

            {/* Average Customer Lifetime Value (CLV) */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average Lifetime Value (CLV)</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                ₹{Number(customerReports.averageCLV).toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Projected revenue per registered customer</p>
            </div>

            {/* Average Order Value (AOV) */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average Order Value (AOV)</span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                ₹{Number(customerReports.averageAOV).toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
                <ArrowUpRight size={13} /> High checkout ticket size
              </p>
            </div>
          </div>

          {/* Top Customers Leaderboard */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
                  <Users className="text-[#DD1215]" size={17} />
                  Top Customers by Spending
                </h3>
                <p className="text-xs text-gray-400">Ranked by lifetime revenue contribution</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search customer name or email..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#DD1215]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-center">Orders</th>
                    <th className="py-3 px-4 text-right">Total Spent</th>
                    <th className="py-3 px-4 text-right">Last Purchase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customerReports.topCustomers
                    .filter((c) =>
                      (c.name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
                      (c.email || '').toLowerCase().includes(customerSearch.toLowerCase())
                    )
                    .map((cust, idx) => (
                      <tr key={cust.email || idx} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-4 font-black text-gray-500">
                          #{idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#DD1215] text-white font-bold flex items-center justify-center text-xs shrink-0">
                              {cust.name[0]?.toUpperCase() || 'C'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{cust.name}</p>
                              <p className="text-[10px] text-gray-400">{cust.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-gray-800">
                          {cust.orderCount} order{cust.orderCount === 1 ? '' : 's'}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-emerald-600 text-sm">
                          ₹{Number(cust.totalSpent).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-500 whitespace-nowrap">
                          {formatOrderDate(cust.lastOrder)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
