import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Filter, ShoppingBag, Eye, Send, Printer, RefreshCw,
  TrendingUp, AlertCircle, CheckCircle2, XCircle, Clock, RotateCcw,
  Download, FileSpreadsheet, FileText, FileCode, ChevronDown, ExternalLink
} from 'lucide-react';
import { message, Spin, Tag, Dropdown, Modal } from 'antd';
import * as XLSX from 'xlsx';
import {
  getAllOrders,
  sendOrderToQikink,
  printPackingSlip,
  formatOrderDate,
  formatDateTime,
} from '../../../services/shopServices/orderService';

const AllOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All'); // All | Pending | Processing | Fulfilled | Cancelled | Refunded
  const [qikinkModalVisible, setQikinkModalVisible] = useState(false);
  const [selectedOrderForQikink, setSelectedOrderForQikink] = useState(null);
  const [sendingToQikink, setSendingToQikink] = useState(false);

  useEffect(() => {
    fetchOrders();

    const handleUpdate = () => {
      fetchOrders(true);
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('infinito_order_placed', handleUpdate);
    window.addEventListener('infinito_orders_updated', handleUpdate);

    const interval = setInterval(() => {
      fetchOrders(true);
    }, 15000);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('infinito_order_placed', handleUpdate);
      window.removeEventListener('infinito_orders_updated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, activeFilter]);

  const fetchOrders = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      if (!isBackground) message.error('Failed to load orders');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // Filter calculation & logic
  const applyFilters = () => {
    let result = [...orders];

    // Filter tab condition
    if (activeFilter !== 'All') {
      result = result.filter((order) => {
        const fulfill = (order.fulfillment?.status || '').toLowerCase();
        const payment = (order.payment?.status || '').toLowerCase();

        switch (activeFilter.toLowerCase()) {
          case 'pending':
            return fulfill === 'unfulfilled' || payment === 'pending';
          case 'processing':
            return fulfill === 'processing';
          case 'fulfilled':
            return fulfill === 'fulfilled';
          case 'cancelled':
            return fulfill === 'cancelled';
          case 'refunded':
            return payment === 'refunded' || payment === 'partially refunded';
          default:
            return true;
        }
      });
    }

    // Search query condition (Search by Order ID, Customer name, Product name)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((order) => {
        const orderIdMatch = (order.orderId || '').toLowerCase().includes(q) || (order.id || '').toLowerCase().includes(q);
        const customerMatch =
          (order.customer?.name || '').toLowerCase().includes(q) ||
          (order.customer?.email || '').toLowerCase().includes(q) ||
          (order.customer?.phone || '').toLowerCase().includes(q);
        const productMatch = (order.items || []).some((item) =>
          (item.name || '').toLowerCase().includes(q) ||
          (item.sku || '').toLowerCase().includes(q)
        );

        return orderIdMatch || customerMatch || productMatch;
      });
    }

    setFilteredOrders(result);
  };

  // Top Quick Stats
  const calculateStats = () => {
    const today = new Date().toDateString();
    
    // Today's orders
    const todayOrders = orders.filter((o) => {
      const orderDate = new Date(o.createdAt).toDateString();
      return orderDate === today;
    });

    // Pending fulfillment (Unfulfilled or Processing)
    const pendingFulfillment = orders.filter(
      (o) => (o.fulfillment?.status || '').toLowerCase() === 'unfulfilled' ||
             (o.fulfillment?.status || '').toLowerCase() === 'processing'
    );

    // Total revenue (paid orders)
    const totalRevenue = orders
      .filter((o) => (o.payment?.status || '').toLowerCase() === 'paid')
      .reduce((sum, o) => sum + Number(o.pricing?.grandTotal || 0), 0);

    return {
      todayCount: todayOrders.length,
      pendingCount: pendingFulfillment.length,
      revenue: totalRevenue,
    };
  };

  const stats = calculateStats();

  // Status tag styling helpers
  const getPaymentStatusTag = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'paid':
        return <Tag color="success" className="px-2.5 py-0.5 font-bold uppercase text-xs">Paid</Tag>;
      case 'pending':
        return <Tag color="warning" className="px-2.5 py-0.5 font-bold uppercase text-xs">Pending</Tag>;
      case 'failed':
        return <Tag color="error" className="px-2.5 py-0.5 font-bold uppercase text-xs">Failed</Tag>;
      case 'refunded':
      case 'partially refunded':
        return <Tag color="purple" className="px-2.5 py-0.5 font-bold uppercase text-xs">Refunded</Tag>;
      default:
        return <Tag color="default" className="px-2.5 py-0.5 font-bold uppercase text-xs">{status || 'Unknown'}</Tag>;
    }
  };

  const getFulfillmentStatusTag = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'unfulfilled':
        return <Tag color="orange" className="px-2.5 py-0.5 font-bold uppercase text-xs">Unfulfilled</Tag>;
      case 'processing':
        return <Tag color="processing" className="px-2.5 py-0.5 font-bold uppercase text-xs">Processing</Tag>;
      case 'fulfilled':
        return <Tag color="green" className="px-2.5 py-0.5 font-bold uppercase text-xs">Fulfilled</Tag>;
      case 'cancelled':
        return <Tag color="default" className="px-2.5 py-0.5 font-bold uppercase text-xs">Cancelled</Tag>;
      default:
        return <Tag color="default" className="px-2.5 py-0.5 font-bold uppercase text-xs">{status || 'N/A'}</Tag>;
    }
  };

  // Quick Action: Send to Qikink Modal
  const handleOpenQikinkModal = (order, e) => {
    e.stopPropagation();
    setSelectedOrderForQikink(order);
    setQikinkModalVisible(true);
  };

  const handleConfirmQikinkSend = async () => {
    if (!selectedOrderForQikink) return;
    try {
      setSendingToQikink(true);
      await sendOrderToQikink(selectedOrderForQikink.orderId);
      message.success(`Order ${selectedOrderForQikink.orderId} successfully dispatched to Qikink API!`);
      setQikinkModalVisible(false);
      fetchOrders();
    } catch (err) {
      console.error(err);
      message.error('Failed to send order to Qikink');
    } finally {
      setSendingToQikink(false);
    }
  };

  // Export handlers
  const getExportData = () => {
    const list = filteredOrders.length > 0 ? filteredOrders : orders;
    return list.map((o) => ({
      'Order #': o.orderId,
      'Date': formatDateTime(o.createdAt),
      'Customer Name': o.customer?.name || 'N/A',
      'Customer Email': o.customer?.email || 'N/A',
      'Customer Phone': o.customer?.phone || 'N/A',
      'Items Count': (o.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0),
      'Product Summary': (o.items || []).map(i => `${i.name} (x${i.quantity})`).join(', '),
      'Subtotal (₹)': o.pricing?.subtotal || 0,
      'Tax (₹)': o.pricing?.tax || 0,
      'Shipping (₹)': o.pricing?.shipping || 0,
      'Total (₹)': o.pricing?.grandTotal || 0,
      'Payment Method': o.payment?.method || 'N/A',
      'Payment Status': o.payment?.status || 'N/A',
      'Transaction ID': o.payment?.transactionId || 'N/A',
      'Fulfillment Status': o.fulfillment?.status || 'Unfulfilled',
      'Qikink Order ID': o.fulfillment?.qikink?.qikinkOrderId || 'N/A',
      'Tracking Carrier': o.fulfillment?.tracking?.carrier || 'N/A',
      'Tracking Number': o.fulfillment?.tracking?.trackingNumber || 'N/A',
    }));
  };

  const exportToExcel = () => {
    const rows = getExportData();
    if (rows.length === 0) return message.warning('No orders to export');
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, `infinito_orders_${Date.now()}.xlsx`);
    message.success('Orders exported as Excel (.xlsx)');
  };

  const exportToCSV = () => {
    const rows = getExportData();
    if (rows.length === 0) return message.warning('No orders to export');
    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `infinito_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success('Orders exported as CSV (.csv)');
  };

  const exportToJSON = () => {
    const data = filteredOrders.length > 0 ? filteredOrders : orders;
    if (data.length === 0) return message.warning('No orders to export');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `infinito_orders_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success('Orders exported as JSON (.json)');
  };

  const exportMenuItems = [
    {
      key: 'excel',
      label: 'Download Excel (.xlsx)',
      icon: <FileSpreadsheet className="w-4 h-4 text-green-600" />,
      onClick: exportToExcel,
    },
    {
      key: 'csv',
      label: 'Download CSV (.csv)',
      icon: <FileText className="w-4 h-4 text-blue-600" />,
      onClick: exportToCSV,
    },
    {
      key: 'json',
      label: 'Download JSON (.json)',
      icon: <FileCode className="w-4 h-4 text-amber-600" />,
      onClick: exportToJSON,
    },
  ];

  const filterTabs = [
    { label: 'All', count: orders.length },
    {
      label: 'Pending',
      count: orders.filter(
        (o) => (o.fulfillment?.status || '').toLowerCase() === 'unfulfilled' || (o.payment?.status || '').toLowerCase() === 'pending'
      ).length,
    },
    {
      label: 'Processing',
      count: orders.filter((o) => (o.fulfillment?.status || '').toLowerCase() === 'processing').length,
    },
    {
      label: 'Fulfilled',
      count: orders.filter((o) => (o.fulfillment?.status || '').toLowerCase() === 'fulfilled').length,
    },
    {
      label: 'Cancelled',
      count: orders.filter((o) => (o.fulfillment?.status || '').toLowerCase() === 'cancelled').length,
    },
    {
      label: 'Refunded',
      count: orders.filter(
        (o) => (o.payment?.status || '').toLowerCase() === 'refunded' || (o.payment?.status || '').toLowerCase() === 'partially refunded'
      ).length,
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spin size="large" />
        <p className="text-gray-500 mt-4 font-medium">Loading orders management...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Shop</span>
            <span>/</span>
            <span className="text-[#DD1215]">Orders Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mt-1">
            Orders Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track customer orders, automate Qikink print fulfillment, and process refunds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm shadow-sm"
            title="Refresh Orders"
          >
            <RefreshCw size={15} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm shadow-sm cursor-pointer"
            >
              <Download size={16} />
              Export
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </Dropdown>
        </div>
      </div>

      {/* ── Quick Stats at Top ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Today's Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Today's Orders</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{stats.todayCount}</h3>
              <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp size={13} />
                Active today
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#DD1215] flex items-center justify-center font-bold">
              <ShoppingBag size={24} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#DD1215]/80"></div>
        </div>

        {/* Pending Fulfillment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Pending Fulfillment</p>
              <h3 className="text-3xl font-black text-amber-600 mt-1">{stats.pendingCount}</h3>
              <p className="text-xs text-amber-700 font-semibold mt-1 flex items-center gap-1">
                <AlertCircle size={13} />
                Requires Qikink / dispatch
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock size={24} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Revenue</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">₹{stats.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <p className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 size={13} />
                Verified Razorpay payments
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <span className="text-xl font-black">₹</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
        </div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
        {/* Top: Filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-100 no-scrollbar">
          {filterTabs.map((tab) => {
            const isActive = activeFilter.toLowerCase() === tab.label.toLowerCase();
            return (
              <button
                key={tab.label}
                onClick={() => setActiveFilter(tab.label)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#DD1215] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Order ID (#4721), Customer name, email, or Product title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#DD1215]/20 focus:border-[#DD1215] transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Subsection 1: Orders Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-800">No orders found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              {searchTerm
                ? `No orders matching "${searchTerm}". Try a different keyword or filter.`
                : 'There are currently no orders in this category.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveFilter('All');
                }}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition"
              >
                Reset Search & Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4">Fulfillment Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const isQikinkSent = order.fulfillment?.qikink?.sent;
                  const isUnfulfilled = (order.fulfillment?.status || '').toLowerCase() === 'unfulfilled';
                  const isPaid = (order.payment?.status || '').toLowerCase() === 'paid';
                  const itemCount = (order.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);
                  const firstItem = order.items?.[0];

                  return (
                    <tr
                      key={order.orderId}
                      onClick={() => navigate(`/shop/orders/${order.id || order.orderId.replace('#', '')}`)}
                      className="hover:bg-gray-50/80 cursor-pointer transition"
                    >
                      {/* Order # */}
                      <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                        <span className="font-mono text-sm text-[#DD1215] bg-red-50 hover:bg-red-100 px-2 py-1 rounded font-bold border border-red-200 transition">
                          {order.orderId}
                        </span>
                        {order.fulfillment?.qikink?.qikinkOrderId && (
                          <div className="text-[10px] text-gray-400 font-mono mt-1">
                            QIK: {order.fulfillment.qikink.qikinkOrderId}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                        <div className="font-medium text-gray-800">{formatOrderDate(order.createdAt)}</div>
                        <div className="text-xs text-gray-400">{formatDateTime(order.createdAt).split(',')[1]}</div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-gray-900 truncate">
                          {order.customer?.name || 'Customer'}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {order.customer?.email || 'N/A'}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {firstItem?.thumbnail && (
                            <img
                              src={firstItem.thumbnail}
                              alt=""
                              className="w-8 h-8 rounded object-cover border border-gray-200 shrink-0"
                            />
                          )}
                          <div className="text-xs">
                            <span className="font-semibold text-gray-800">
                              {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </span>
                            <div className="text-gray-400 truncate max-w-[150px]">
                              {firstItem?.name || 'Infinito Item'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-black text-gray-900">
                          ₹{Number(order.pricing?.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {order.payment?.method?.split(' ')[0] || 'Razorpay'}
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getPaymentStatusTag(order.payment?.status)}
                      </td>

                      {/* Fulfillment Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getFulfillmentStatusTag(order.fulfillment?.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Send to Qikink quick button if unfulfilled/paid */}
                          {isPaid && isUnfulfilled && !isQikinkSent && (
                            <button
                              onClick={(e) => handleOpenQikinkModal(order, e)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#DD1215] hover:bg-red-700 text-white rounded text-xs font-bold transition shadow-xs"
                              title="Send to Qikink API"
                            >
                              <Send size={12} />
                              <span className="hidden lg:inline">Send to Qikink</span>
                            </button>
                          )}

                          {/* Print Invoice/Packing slip */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              printPackingSlip(order);
                            }}
                            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition"
                            title="Print Packing Slip & Invoice"
                          >
                            <Printer size={16} />
                          </button>

                          {/* View Detail Page */}
                          <Link
                            to={`/shop/orders/${order.id || order.orderId.replace('#', '')}`}
                            className="p-1.5 text-gray-500 hover:text-[#DD1215] hover:bg-red-50 rounded transition"
                            title="View Full Order Details"
                          >
                            <Eye size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer with Summary */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <div>
            Showing <strong className="text-gray-800">{filteredOrders.length}</strong> of{' '}
            <strong className="text-gray-800">{orders.length}</strong> total orders
          </div>
          <div className="text-gray-400">
            Click on any order row to open detailed fulfillment & payment breakdown
          </div>
        </div>
      </div>

      {/* ── Modal: Send to Qikink Confirmation ── */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-900">
            <Send className="text-[#DD1215]" size={20} />
            <span>Send Order {selectedOrderForQikink?.orderId} to Qikink</span>
          </div>
        }
        open={qikinkModalVisible}
        onOk={handleConfirmQikinkSend}
        confirmLoading={sendingToQikink}
        okText="Confirm & Transmit to Qikink"
        okButtonProps={{ className: 'bg-[#DD1215] hover:bg-red-700' }}
        onCancel={() => setQikinkModalVisible(false)}
        width={560}
      >
        {selectedOrderForQikink && (
          <div className="space-y-4 py-2 text-sm">
            <p className="text-gray-600">
              You are about to transmit this order to the <strong>Qikink Print-on-Demand Fulfillment API</strong>.
              Qikink will automatically receive the customer shipping details and item print specifications.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID:</span>
                <span className="font-bold text-gray-800">{selectedOrderForQikink.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Customer:</span>
                <span className="font-semibold text-gray-800">{selectedOrderForQikink.customer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Destination:</span>
                <span className="text-gray-800">
                  {selectedOrderForQikink.shippingAddress?.city}, {selectedOrderForQikink.shippingAddress?.state} ({selectedOrderForQikink.shippingAddress?.pincode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Items:</span>
                <span className="font-bold text-[#DD1215]">
                  {(selectedOrderForQikink.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0)} unit(s)
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              ℹ️ Upon confirmation, the order fulfillment status will change to <strong>Processing</strong> and a tracking milestone will be created.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AllOrders;
