import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Printer, Send, CheckCircle2, AlertCircle, Clock,
  Package, Truck, RotateCcw, XCircle, Mail, MapPin, CreditCard,
  User, Phone, Copy, Check, ExternalLink, Edit3, ShieldAlert,
  Calendar, Layers, Hash, FileText, RefreshCw
} from 'lucide-react';
import { message, Modal, Spin, Tag, Input, Radio, InputNumber } from 'antd';
import {
  getOrderById,
  sendOrderToQikink,
  syncOrderWithQikink,
  markOrderAsFulfilled,
  cancelOrder,
  refundOrder,
  resendOrderEmail,
  printPackingSlip,
  testQikinkConnection,
  triggerQikinkWebhookSimulation,
  formatOrderDate,
  formatDateTime,
  resolveCustomerDisplayName,
} from '../../../services/shopServices/orderService';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);

  // Modals & Action loading states
  const [qikinkModalOpen, setQikinkModalOpen] = useState(false);
  const [qikinkLoading, setQikinkLoading] = useState(false);
  const [qikinkAllowSimulation, setQikinkAllowSimulation] = useState(false);
  const [testingQikink, setTestingQikink] = useState(false);
  const [qikinkTestResult, setQikinkTestResult] = useState(null);
  const [syncingQikink, setSyncingQikink] = useState(false);

  // Webhook Simulation Modal state
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState('Dispatched');
  const [webhookCourier, setWebhookCourier] = useState('BlueDart Express');
  const [webhookAwb, setWebhookAwb] = useState('');
  const [webhookSimulating, setWebhookSimulating] = useState(false);

  const [fulfillModalOpen, setFulfillModalOpen] = useState(false);
  const [fulfillCarrier, setFulfillCarrier] = useState('BlueDart');
  const [fulfillTracking, setFulfillTracking] = useState('');
  const [fulfillDeliveryDate, setFulfillDeliveryDate] = useState('');
  const [fulfilling, setFulfilling] = useState(false);

  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundType, setRefundType] = useState('Full Refund');
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const [resendingEmail, setResendingEmail] = useState(false);

  useEffect(() => {
    loadOrder();

    const handleUpdate = () => {
      loadOrder(true);
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('infinito_orders_updated', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('infinito_orders_updated', handleUpdate);
    };
  }, [orderId]);

  const loadOrder = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const data = await getOrderById(orderId);
      if (!data) {
        if (!isBackground) {
          message.error(`Order #${orderId} not found`);
          navigate('/shop/orders');
        }
        return;
      }
      setOrder(data);
      setRefundAmount(data.pricing?.grandTotal || 0);
      setFulfillTracking(data.fulfillment?.tracking?.trackingNumber || '');
      setFulfillDeliveryDate(data.fulfillment?.tracking?.estimatedDelivery || formatOrderDate(new Date(), 3));
    } catch (err) {
      console.error(err);
      if (!isBackground) message.error('Failed to load order details');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    message.success(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ── Actions ──────────────────────────────────────────────────
  const handleSendToQikink = async () => {
    try {
      setQikinkLoading(true);
      const updated = await sendOrderToQikink(order.orderId, {
        allowSandboxSimulation: qikinkAllowSimulation,
      });
      setOrder(updated);
      setQikinkModalOpen(false);
      message.success(`Order successfully sent to Qikink POD! Assigned ID: ${updated.fulfillment?.qikink?.qikinkOrderId}`);
    } catch (err) {
      console.error(err);
      message.error(err.message || 'Failed to transmit order to Qikink');
    } finally {
      setQikinkLoading(false);
    }
  };

  const handleSyncQikink = async () => {
    try {
      setSyncingQikink(true);
      const updated = await syncOrderWithQikink(order.orderId);
      setOrder(updated);
      const qStatus = updated?.fulfillment?.qikink?.status || 'Synced';
      const awb = updated?.fulfillment?.tracking?.trackingNumber;
      message.success(`Qikink Sync Complete: Status "${qStatus}"${awb ? ` | AWB: ${awb}` : ''}`);
    } catch (err) {
      console.error(err);
      message.error(err.message || 'Failed to sync live status with Qikink');
    } finally {
      setSyncingQikink(false);
    }
  };

  const handleTestQikink = async () => {
    try {
      setTestingQikink(true);
      const res = await testQikinkConnection();
      setQikinkTestResult(res);
      if (res?.success) {
        message.success(`Connected to Qikink API (${res.environment}) successfully!`);
      } else {
        message.error(`Qikink API Error: ${res?.message || 'Check credentials'}`);
      }
    } catch (e) {
      message.error('Failed to ping Qikink API');
    } finally {
      setTestingQikink(false);
    }
  };

  const handleSimulateWebhook = async () => {
    try {
      setWebhookSimulating(true);
      const awb = webhookAwb || `BD-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const payload = {
        order_number: order.orderId,
        order_id: order.fulfillment?.qikink?.qikinkOrderId || `QIK-${order.id}`,
        status: webhookStatus,
        courier_name: webhookCourier,
        awb_number: awb,
        tracking_url: `https://${webhookCourier.toLowerCase().replace(/\s+/g, '')}.com/track/${awb}`,
        estimated_delivery: formatOrderDate(new Date(), 3),
      };

      const updated = await triggerQikinkWebhookSimulation(payload);
      setOrder(updated);
      setWebhookModalOpen(false);
      message.success(`Webhook received: Order updated to ${webhookStatus} with AWB ${awb}!`);
    } catch (err) {
      console.error(err);
      message.error(err.message || 'Webhook simulation failed');
    } finally {
      setWebhookSimulating(false);
    }
  };

  const handleMarkAsFulfilled = async () => {
    try {
      setFulfilling(true);
      const updated = await markOrderAsFulfilled(order.orderId, {
        carrier: fulfillCarrier,
        trackingNumber: fulfillTracking || `BD-${Math.floor(10000000 + Math.random() * 90000000)}`,
        estimatedDelivery: fulfillDeliveryDate,
      });
      setOrder(updated);
      setFulfillModalOpen(false);
      message.success(`Order marked as Fulfilled with carrier ${fulfillCarrier}`);
    } catch (err) {
      console.error(err);
      message.error('Failed to mark order as fulfilled');
    } finally {
      setFulfilling(false);
    }
  };

  const handleRefund = async () => {
    try {
      setRefunding(true);
      const updated = await refundOrder(order.orderId, {
        refundType,
        refundAmount: refundType === 'Full Refund' ? order.pricing?.grandTotal : refundAmount,
        reason: refundReason,
      });
      setOrder(updated);
      setRefundModalOpen(false);
      message.success(`Refund of ₹${refundType === 'Full Refund' ? order.pricing?.grandTotal : refundAmount} processed successfully`);
    } catch (err) {
      console.error(err);
      message.error('Failed to process refund');
    } finally {
      setRefunding(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const updated = await cancelOrder(order.orderId, cancelReason || 'Cancelled by admin request');
      setOrder(updated);
      setCancelModalOpen(false);
      message.success(`Order ${order.orderId} has been cancelled`);
    } catch (err) {
      console.error(err);
      message.error('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setResendingEmail(true);
      await resendOrderEmail(order.orderId);
      message.success(`Order confirmation email resent to ${order.customer?.email}`);
    } catch (err) {
      console.error(err);
      message.error('Failed to resend confirmation email');
    } finally {
      setResendingEmail(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px]">
        <Spin size="large" />
        <p className="text-gray-500 mt-4 font-medium">Loading order details...</p>
      </div>
    );
  }

  // Status helper badges
  const getPaymentStatusTag = (status, method) => {
    const s = String(status || '').toLowerCase().trim();
    const m = String(method || '').toLowerCase().trim();
    const isCOD = s === 'cod' || m === 'cod' || m.includes('cash on delivery') || m.includes('cod');

    if (isCOD && s !== 'paid') {
      return <Tag color="warning" className="px-3 py-1 font-bold uppercase text-xs">COD</Tag>;
    }
    switch (s) {
      case 'paid':
        return <Tag color="success" className="px-3 py-1 font-bold uppercase text-xs">Paid</Tag>;
      case 'cod':
        return <Tag color="warning" className="px-3 py-1 font-bold uppercase text-xs">COD</Tag>;
      case 'pending':
        return <Tag color="warning" className="px-3 py-1 font-bold uppercase text-xs">Pending</Tag>;
      case 'failed':
        return <Tag color="error" className="px-3 py-1 font-bold uppercase text-xs">Failed</Tag>;
      case 'refunded':
      case 'partially refunded':
        return <Tag color="purple" className="px-3 py-1 font-bold uppercase text-xs">{status}</Tag>;
      default:
        return <Tag color="default" className="px-3 py-1 font-bold uppercase text-xs">{status || 'Unknown'}</Tag>;
    }
  };

  const getFulfillmentStatusTag = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'unfulfilled':
        return <Tag color="orange" className="px-3 py-1 font-bold uppercase text-xs">Unfulfilled</Tag>;
      case 'processing':
        return <Tag color="processing" className="px-3 py-1 font-bold uppercase text-xs">Processing</Tag>;
      case 'fulfilled':
        return <Tag color="green" className="px-3 py-1 font-bold uppercase text-xs">Fulfilled</Tag>;
      case 'cancelled':
        return <Tag color="default" className="px-3 py-1 font-bold uppercase text-xs">Cancelled</Tag>;
      default:
        return <Tag color="default" className="px-3 py-1 font-bold uppercase text-xs">{status || 'N/A'}</Tag>;
    }
  };

  // Timeline Step calculation
  const isCODOrder = String(order.payment?.status || '').toLowerCase() === 'cod' || String(order.payment?.method || order.paymentMethod || '').toLowerCase().includes('cod');

  const timelineSteps = [
    {
      key: 'orderPlaced',
      title: 'Order Placed',
      description: 'Customer completed checkout',
      date: order.timeline?.orderPlaced || order.createdAt,
      completed: !!(order.timeline?.orderPlaced || order.createdAt),
    },
    {
      key: 'paymentConfirmed',
      title: isCODOrder ? 'Payment Method: COD' : 'Payment Confirmed',
      description: isCODOrder ? 'Cash to be collected upon delivery' : (order.payment?.method || 'Razorpay Gateway'),
      date: isCODOrder ? null : (order.timeline?.paymentConfirmed || order.payment?.date),
      completed: !isCODOrder && ((order.payment?.status || '').toLowerCase() === 'paid' || !!order.timeline?.paymentConfirmed),
    },
    {
      key: 'sentToQikink',
      title: 'Sent to Qikink',
      description: order.fulfillment?.qikink?.qikinkOrderId ? `QIK ID: ${order.fulfillment.qikink.qikinkOrderId}` : 'API POD Integration',
      date: order.timeline?.sentToQikink || order.fulfillment?.qikink?.sentAt,
      completed: !!order.fulfillment?.qikink?.sent || !!order.timeline?.sentToQikink,
    },
    {
      key: 'printed',
      title: 'Printed',
      description: 'Manufactured & Quality Checked',
      date: order.timeline?.printed,
      completed: !!order.timeline?.printed || (order.fulfillment?.status || '').toLowerCase() === 'fulfilled',
    },
    {
      key: 'shipped',
      title: 'Shipped',
      description: order.fulfillment?.tracking?.carrier ? `${order.fulfillment.tracking.carrier} (${order.fulfillment.tracking.trackingNumber || 'Pending'})` : 'Awaiting dispatch',
      date: order.timeline?.shipped,
      completed: !!order.timeline?.shipped || (order.fulfillment?.status || '').toLowerCase() === 'fulfilled',
    },
    {
      key: 'delivered',
      title: 'Delivered',
      description: order.fulfillment?.tracking?.estimatedDelivery ? `Est: ${order.fulfillment.tracking.estimatedDelivery}` : 'Final destination',
      date: order.timeline?.delivered,
      completed: !!order.timeline?.delivered,
    },
  ];

  const isCancelled = (order.fulfillment?.status || '').toLowerCase() === 'cancelled';
  const isFulfilled = (order.fulfillment?.status || '').toLowerCase() === 'fulfilled';
  const isQikinkSent = !!order.fulfillment?.qikink?.sent;

  return (
    <div className="space-y-6 pb-12">
      {/* ── Top Navigation Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link
            to="/shop/orders"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition mb-2"
          >
            <ArrowLeft size={14} />
            Back to All Orders
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              Order {order.orderId}
            </h1>
            {getPaymentStatusTag(order.payment?.status)}
            {getFulfillmentStatusTag(order.fulfillment?.status)}
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <Calendar size={13} />
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Print Invoice / Packing Slip */}
          <button
            onClick={() => printPackingSlip(order)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-xs shadow-sm cursor-pointer"
            title="Print Invoice & Packing Slip"
          >
            <Printer size={15} />
            <span>Print Invoice / Slip</span>
          </button>

          {/* Resend Email */}
          <button
            onClick={handleResendEmail}
            disabled={resendingEmail}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-xs shadow-sm disabled:opacity-50 cursor-pointer"
            title="Resend Order Confirmation Email"
          >
            <Mail size={15} />
            <span>{resendingEmail ? 'Sending...' : 'Resend Email'}</span>
          </button>

          {/* Refund Action */}
          {!isCancelled && order.payment?.status !== 'Refunded' && (
            <button
              onClick={() => {
                setRefundAmount(order.pricing?.grandTotal || 0);
                setRefundModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 text-purple-700 hover:bg-purple-50 rounded-lg transition font-medium text-xs shadow-sm cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>Refund</span>
            </button>
          )}

          {/* Cancel Order */}
          {!isCancelled && !isFulfilled && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition font-medium text-xs shadow-sm cursor-pointer"
            >
              <XCircle size={15} />
              <span>Cancel Order</span>
            </button>
          )}
        </div>
      </div>

      {/* ── SECTION 3: FULFILLMENT SECTION ⭐ (KEY FEATURE) ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
        {/* Header with Star Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-red-100 text-[#DD1215] flex items-center justify-center">
              <Package size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-gray-900 tracking-tight uppercase">
                  Fulfillment Section
                </h2>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                  ⭐ Key Feature
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Automated Qikink Print-on-Demand dispatch, live parcel tracking, and status overrides
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status indicator */}
            <div className="text-right">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</div>
              <div className="mt-0.5">{getFulfillmentStatusTag(order.fulfillment?.status)}</div>
            </div>

            {/* Send to Qikink Button / Sync Live */}
            {!isCancelled && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQikinkModalOpen(true)}
                  disabled={isQikinkSent}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer ${
                    isQikinkSent
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-[#DD1215] text-white hover:bg-red-700'
                  }`}
                >
                  <Send size={14} />
                  <span>{isQikinkSent ? 'Dispatched to Qikink ✓' : 'Push to Qikink'}</span>
                </button>
                {isQikinkSent && (
                  <button
                    onClick={handleSyncQikink}
                    disabled={syncingQikink}
                    title="Fetch live tracking and delivery dates from Qikink API"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <RefreshCw size={13} className={syncingQikink ? 'animate-spin' : ''} />
                    <span>{syncingQikink ? 'Syncing...' : 'Sync Qikink'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Mark as Fulfilled button (manual override) */}
            {!isCancelled && !isFulfilled && (
              <button
                onClick={() => setFulfillModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <CheckCircle2 size={14} />
                <span>Mark as Fulfilled</span>
              </button>
            )}
          </div>
        </div>

        {/* Qikink API & Fulfillment Info Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
          {/* Qikink Integration Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">Qikink Integration</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${isQikinkSent ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}>
                {isQikinkSent ? 'CONNECTED' : 'NOT SENT'}
              </span>
            </div>
            {isQikinkSent ? (
              <div className="space-y-1.5 text-gray-600">
                <div className="flex justify-between">
                  <span>Qikink Order ID:</span>
                  <span className="font-mono font-bold text-gray-900">{order.fulfillment?.qikink?.qikinkOrderId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transmitted At:</span>
                  <span className="text-gray-700">{formatDateTime(order.fulfillment?.qikink?.sentAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Qikink Status:</span>
                  <span className="font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px]">
                    {order.fulfillment?.qikink?.status || 'In Production'}
                  </span>
                </div>
                {order.fulfillment?.tracking?.carrier && (
                  <div className="flex justify-between">
                    <span>Delivery Partner:</span>
                    <span className="font-bold text-gray-900">{order.fulfillment?.tracking?.carrier}</span>
                  </div>
                )}
                {order.fulfillment?.tracking?.trackingNumber && (
                  <div className="flex justify-between items-center">
                    <span>AWB Number:</span>
                    <span className="font-mono font-bold text-blue-600 flex items-center gap-1">
                      {order.fulfillment?.tracking?.trackingNumber}
                      <button
                        onClick={() => copyToClipboard(order.fulfillment?.tracking?.trackingNumber, 'AWB')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy size={11} />
                      </button>
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 space-y-1.5">
                  <button
                    onClick={handleSyncQikink}
                    disabled={syncingQikink}
                    className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <RefreshCw size={12} className={syncingQikink ? 'animate-spin' : ''} />
                    <span>{syncingQikink ? 'Syncing with Qikink...' : 'Sync Live Status from Qikink API'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setWebhookAwb(order.fulfillment?.tracking?.trackingNumber || `BD-${Math.floor(10000000 + Math.random() * 90000000)}`);
                      setWebhookModalOpen(true);
                    }}
                    className="w-full py-1.5 px-2 bg-white border border-gray-300 hover:bg-gray-100 rounded text-[11px] font-bold text-gray-700 flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
                  >
                    <span>⚡ Simulate Qikink Webhook</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                Order has not been dispatched to Qikink yet. Click "Send to Qikink" to push item designs and shipping address directly to the printer.
              </p>
            )}
          </div>

          {/* Tracking Details Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">Tracking Info</span>
              <button
                onClick={() => setFulfillModalOpen(true)}
                className="text-xs text-[#DD1215] hover:underline font-semibold flex items-center gap-1"
              >
                <Edit3 size={11} /> Edit
              </button>
            </div>
            {order.fulfillment?.tracking?.trackingNumber ? (
              <div className="space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <span>Carrier:</span>
                  <span className="font-bold text-gray-900">{order.fulfillment?.tracking?.carrier || 'BlueDart'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tracking #:</span>
                  <span className="font-mono font-bold text-blue-600 flex items-center gap-1">
                    {order.fulfillment?.tracking?.trackingNumber}
                    <button
                      onClick={() => copyToClipboard(order.fulfillment?.tracking?.trackingNumber, 'tracking')}
                      className="text-gray-400 hover:text-gray-600 ml-1"
                    >
                      <Copy size={11} />
                    </button>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Delivery:</span>
                  <span className="font-semibold text-gray-800">{order.fulfillment?.tracking?.estimatedDelivery || 'N/A'}</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <a
                    href={order.fulfillment?.tracking?.trackingUrl || `https://courierupdates.com/?awb=${order.fulfillment?.tracking?.trackingNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition text-center"
                  >
                    <span>Track with Courier</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                No tracking information generated yet. Once marked as fulfilled or shipped by Qikink, tracking will appear here.
              </p>
            )}
          </div>

          {/* Quick Fulfillment Override / Status Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs space-y-2">
            <span className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">Manual Override & Packing</span>
            <p className="text-gray-500">
              Manual fulfillment allows self-shipping or using local couriers without sending to the print facility.
            </p>
            <div className="pt-1 flex gap-2">
              <button
                onClick={() => printPackingSlip(order)}
                className="flex-1 py-1.5 px-2 bg-white border border-gray-300 hover:bg-gray-100 rounded text-gray-700 font-semibold transition text-center"
              >
                Packing Slip
              </button>
              <button
                onClick={() => setFulfillModalOpen(true)}
                className="flex-1 py-1.5 px-2 bg-white border border-gray-300 hover:bg-gray-100 rounded text-gray-700 font-semibold transition text-center"
              >
                Update Tracking
              </button>
            </div>
          </div>
        </div>

        {/* ── Fulfillment Timeline ── */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
            Order & Fulfillment Lifecycle Timeline
          </h3>

          {/* Timeline visualization */}
          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {timelineSteps.map((step, idx) => {
                return (
                  <div
                    key={step.key}
                    className={`relative p-3 rounded-lg border transition ${
                      step.completed
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          step.completed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {step.completed ? '✓' : idx + 1}
                      </div>
                      <span className="font-bold text-xs text-gray-900 leading-tight">
                        {step.title}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-tight line-clamp-2">
                      {step.description}
                    </p>

                    {step.date && (
                      <p className="text-[10px] text-emerald-700 font-mono font-semibold mt-1.5">
                        {formatOrderDate(step.date)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── TWO COLUMN MAIN CONTENT: Items & Payment + Customer Info ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide): Order Items & Pricing */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="text-[#DD1215]" size={18} />
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                  Order Items ({(order.items || []).reduce((a, b) => a + (b.quantity || 1), 0)})
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-mono">
                {order.items?.length || 0} unique SKU{order.items?.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Variant</th>
                    <th className="py-3 px-4 text-center">Quantity</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(order.items || []).map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/60 transition">
                      {/* Product thumbnail + Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.thumbnail || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-gray-900 text-sm leading-snug">{item.name}</p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">SKU: {item.sku || 'INF-SKU'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Variant */}
                      <td className="py-3.5 px-4 text-xs text-gray-600 whitespace-nowrap">
                        <span className="inline-block bg-gray-100 px-2 py-1 rounded text-gray-700 font-medium">
                          Size: {item.variant?.size || 'Standard'}
                        </span>
                        {item.variant?.color && (
                          <span className="inline-block bg-gray-100 px-2 py-1 rounded text-gray-700 font-medium ml-1">
                            {item.variant?.color}
                          </span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 text-center font-bold text-gray-800">
                        {item.quantity}
                      </td>

                      {/* Unit Price */}
                      <td className="py-3.5 px-4 text-right font-medium text-gray-700 whitespace-nowrap">
                        ₹{Number(item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right font-bold text-gray-900 whitespace-nowrap">
                        ₹{Number(item.total || (item.unitPrice * item.quantity)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Breakdown */}
            <div className="bg-gray-50/70 p-6 border-t border-gray-100">
              <div className="max-w-xs ml-auto space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ₹{Number(order.pricing?.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {order.pricing?.shipping > 0 ? `₹${Number(order.pricing.shipping).toFixed(2)}` : 'FREE'}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Tax (18% GST)</span>
                  <span className="font-semibold text-gray-900">
                    ₹{Number(order.pricing?.tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {order.pricing?.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-₹{Number(order.pricing.discount).toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-black text-gray-900">
                  <span className="uppercase">Grand Total</span>
                  <span className="text-[#DD1215] text-base">
                    ₹{Number(order.pricing?.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="text-[#DD1215]" size={18} />
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                  Payment Information
                </h3>
              </div>
              <div>{getPaymentStatusTag(order.payment?.status, order.payment?.method || order.paymentMethod)}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                <p className="text-gray-400 font-bold uppercase text-[10px]">Payment Method</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {isCODOrder ? 'Cash on Delivery (COD)' : (order.payment?.method || 'Razorpay')}
                </p>
                <p className="text-gray-500">
                  {isCODOrder ? 'Cash to be collected upon order delivery' : 'Processed securely via Razorpay gateway'}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                <p className="text-gray-400 font-bold uppercase text-[10px]">Transaction ID</p>
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold text-xs ${isCODOrder ? 'text-amber-700' : 'text-gray-900'}`}>
                    {isCODOrder ? 'COD (Collect on Delivery)' : (order.payment?.transactionId || 'pay_RzpDefault')}
                  </span>
                  {!isCODOrder && (
                    <button
                      onClick={() => copyToClipboard(order.payment?.transactionId, 'Transaction ID')}
                      className="text-gray-400 hover:text-gray-600"
                      title="Copy Transaction ID"
                    >
                      <Copy size={13} />
                    </button>
                  )}
                </div>
                <p className="text-gray-500">{formatDateTime(order.payment?.date || order.createdAt)}</p>
              </div>
            </div>

            {/* If refund exists */}
            {order.refund && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-purple-900">
                  <span>Refund Issued ({order.refund.type || 'Full'})</span>
                  <span>₹{Number(order.refund.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <p className="text-purple-700">Refund ID: <strong className="font-mono">{order.refund.refundId}</strong></p>
                <p className="text-purple-600">Reason: {order.refund.reason || 'Requested by customer'}</p>
                <p className="text-purple-400 text-[10px]">Processed on {formatDateTime(order.refund.date)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col wide): Customer Info Section */}
        <div className="space-y-6">
          {/* Customer Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <User className="text-[#DD1215]" size={18} />
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                Customer Info
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-gray-400 font-bold uppercase text-[10px]">Name</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">
                  {resolveCustomerDisplayName(order.customer, order.shippingAddress, order.orderId)}
                </p>
              </div>

              <div>
                <p className="text-gray-400 font-bold uppercase text-[10px]">Email</p>
                <a
                  href={`mailto:${order.customer?.email}`}
                  className="font-medium text-blue-600 hover:underline mt-0.5 block truncate"
                >
                  {order.customer?.email || 'N/A'}
                </a>
              </div>

              <div>
                <p className="text-gray-400 font-bold uppercase text-[10px]">Phone</p>
                <a
                  href={`tel:${order.customer?.phone}`}
                  className="font-medium text-gray-800 hover:underline mt-0.5 block"
                >
                  {order.customer?.phone || 'N/A'}
                </a>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-gray-500">
                <span>Total Orders Placed:</span>
                <span className="font-bold text-gray-900">{order.customer?.totalOrders || 1}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MapPin className="text-[#DD1215]" size={18} />
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                  Shipping Address
                </h3>
              </div>
              <button
                onClick={() => copyToClipboard(order.shippingAddress?.formatted, 'Shipping Address')}
                className="text-gray-400 hover:text-gray-600 text-xs flex items-center gap-1 font-semibold"
              >
                <Copy size={12} /> Copy
              </button>
            </div>

            <div className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
              <strong className="block text-gray-900 mb-1">
                {resolveCustomerDisplayName(order.shippingAddress, order.customer, order.orderId)}
              </strong>
              <div className="whitespace-pre-line">{order.shippingAddress?.formatted || order.shippingAddress?.line1}</div>
              <div className="mt-2 text-gray-500">
                <strong>Phone:</strong> {order.shippingAddress?.phone || order.customer?.phone || 'N/A'}
              </div>
            </div>
          </div>

          {/* Billing Address Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <FileText className="text-[#DD1215]" size={18} />
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                Billing Address
              </h3>
            </div>

            <div className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
              {order.billingAddress?.isSameAsShipping ? (
                <div className="text-gray-500 italic">
                  ✓ Same as shipping address
                </div>
              ) : (
                <>
                  <strong className="block text-gray-900 mb-1">
                    {resolveCustomerDisplayName(order.billingAddress, order.customer, order.orderId)}
                  </strong>
                  <div className="whitespace-pre-line">{order.billingAddress?.formatted || order.billingAddress?.line1}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: Send to Qikink ── */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-900">
            <Send className="text-[#DD1215]" size={20} />
            <span>Send Order {order.orderId} to Qikink Fulfillment API</span>
          </div>
        }
        open={qikinkModalOpen}
        onOk={handleSendToQikink}
        confirmLoading={qikinkLoading}
        okText="Confirm & Dispatch to Qikink"
        okButtonProps={{ className: 'bg-[#DD1215] hover:bg-red-700' }}
        onCancel={() => setQikinkModalOpen(false)}
        width={580}
      >
        <div className="space-y-4 py-2 text-sm">
          <p className="text-gray-600">
            This transmits the order data directly to Qikink Print-on-Demand API with customer shipping info and item SKU configurations.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Order ID:</span>
              <span className="font-bold text-gray-800">{order.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Recipient:</span>
              <span className="font-semibold text-gray-800">{order.shippingAddress?.name || order.customer?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phone:</span>
              <span className="font-semibold text-gray-800">{order.shippingAddress?.phone || order.customer?.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Destination:</span>
              <span className="text-gray-800">{order.shippingAddress?.city}, {order.shippingAddress?.state} ({order.shippingAddress?.pincode})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Gateway:</span>
              <span className={`font-bold ${isCODOrder ? 'text-amber-700' : 'text-emerald-700'}`}>
                {isCODOrder ? 'COD (Collect on Delivery)' : 'Prepaid'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Value:</span>
              <span className="font-bold text-gray-900">₹{Number(order.pricing?.grandTotal || order.total || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Print Items:</span>
              <span className="font-bold text-[#DD1215]">
                {(order.items || []).map(i => `${i.quantity}x ${i.name} [SKU: ${i.sku || 'INF-ITEM'}]`).join(', ')}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={qikinkAllowSimulation}
                onChange={(e) => setQikinkAllowSimulation(e.target.checked)}
                className="rounded text-[#DD1215] focus:ring-red-500 h-4 w-4"
              />
              <span className="font-medium">Sandbox Fallback: Simulate if SKU is not yet registered in Sandbox portal</span>
            </label>
            <button
              type="button"
              onClick={handleTestQikink}
              disabled={testingQikink}
              className="px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100 rounded text-[11px] font-bold text-amber-800 transition"
            >
              {testingQikink ? 'Checking...' : 'Check API Handshake'}
            </button>
          </div>

          {qikinkTestResult && (
            <div className={`p-2.5 rounded-lg text-xs font-mono border ${qikinkTestResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <strong>API Status:</strong> {qikinkTestResult.message} ({qikinkTestResult.environment || 'sandbox'})
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
            ℹ️ On successful dispatch, status will automatically update to <strong>Processing</strong> and a Qikink tracking reference will be recorded.
          </div>
        </div>
      </Modal>

      {/* ── MODAL: Mark as Fulfilled (Manual Override) ── */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-900">
            <Truck className="text-emerald-600" size={20} />
            <span>Mark Order as Fulfilled (Manual Override)</span>
          </div>
        }
        open={fulfillModalOpen}
        onOk={handleMarkAsFulfilled}
        confirmLoading={fulfilling}
        okText="Save & Fulfill Order"
        okButtonProps={{ className: 'bg-emerald-600 hover:bg-emerald-700' }}
        onCancel={() => setFulfillModalOpen(false)}
        width={520}
      >
        <div className="space-y-4 py-2 text-sm">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Carrier Name</label>
            <Input
              value={fulfillCarrier}
              onChange={(e) => setFulfillCarrier(e.target.value)}
              placeholder="e.g. BlueDart, Delhivery, DTDC, FedEx"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tracking Number / AWB</label>
            <Input
              value={fulfillTracking}
              onChange={(e) => setFulfillTracking(e.target.value)}
              placeholder="e.g. BD-89240182"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Estimated Delivery Date</label>
            <Input
              value={fulfillDeliveryDate}
              onChange={(e) => setFulfillDeliveryDate(e.target.value)}
              placeholder="e.g. 07 Oct, 2026"
            />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800">
            ✓ Marking as fulfilled will complete the shipping milestone on the customer's tracking portal.
          </div>
        </div>
      </Modal>

      {/* ── MODAL: Refund Order ── */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-purple-900">
            <RotateCcw className="text-purple-600" size={20} />
            <span>Issue Refund for {order.orderId}</span>
          </div>
        }
        open={refundModalOpen}
        onOk={handleRefund}
        confirmLoading={refunding}
        okText="Process Refund"
        okButtonProps={{ className: 'bg-purple-600 hover:bg-purple-700' }}
        onCancel={() => setRefundModalOpen(false)}
        width={520}
      >
        <div className="space-y-4 py-2 text-sm">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Refund Type</label>
            <Radio.Group
              value={refundType}
              onChange={(e) => {
                setRefundType(e.target.value);
                if (e.target.value === 'Full Refund') {
                  setRefundAmount(order.pricing?.grandTotal || 0);
                }
              }}
            >
              <Radio value="Full Refund">Full Refund (100%)</Radio>
              <Radio value="Partial Refund">Partial Refund</Radio>
            </Radio.Group>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Refund Amount (₹)</label>
            <InputNumber
              min={1}
              max={order.pricing?.grandTotal || 100000}
              value={refundAmount}
              onChange={(v) => setRefundAmount(v)}
              disabled={refundType === 'Full Refund'}
              className="w-full"
              prefix="₹"
            />
            <p className="text-[11px] text-gray-400 mt-1">Total order paid value: ₹{order.pricing?.grandTotal}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Refund Reason</label>
            <Input.TextArea
              rows={3}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="e.g. Customer requested cancellation due to wrong size selection..."
            />
          </div>
        </div>
      </Modal>

      {/* ── MODAL: Cancel Order ── */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-red-600">
            <XCircle size={20} />
            <span>Cancel Order {order.orderId}</span>
          </div>
        }
        open={cancelModalOpen}
        onOk={handleCancelOrder}
        confirmLoading={cancelling}
        okText="Confirm Order Cancellation"
        okButtonProps={{ danger: true }}
        onCancel={() => setCancelModalOpen(false)}
        width={500}
      >
        <div className="space-y-4 py-2 text-sm">
          <p className="text-gray-600">
            Are you sure you want to cancel this order? This will cancel any pending fulfillment and update the status to <strong>Cancelled</strong>.
          </p>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Cancellation Reason</label>
            <Input.TextArea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Customer requested order cancellation..."
            />
          </div>
        </div>
      </Modal>

      {/* ── MODAL: Simulate Qikink Webhook ── */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-900">
            <Send className="text-[#DD1215]" size={20} />
            <span>Simulate Qikink Webhook Callback</span>
          </div>
        }
        open={webhookModalOpen}
        onOk={handleSimulateWebhook}
        confirmLoading={webhookSimulating}
        okText="Send Webhook Event"
        okButtonProps={{ className: 'bg-[#DD1215] hover:bg-red-700' }}
        onCancel={() => setWebhookModalOpen(false)}
        width={520}
      >
        <div className="space-y-4 py-2 text-sm">
          <p className="text-gray-600 text-xs">
            This tests the live webhook listener (<code>/shop/orders/qikink-webhook</code>) by posting a real tracking event as if dispatched by Qikink's automated print & courier system.
          </p>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Shipment Milestone Status</label>
            <Radio.Group
              value={webhookStatus}
              onChange={(e) => setWebhookStatus(e.target.value)}
              className="flex flex-col gap-2"
            >
              <Radio value="In Production">
                <span className="font-semibold text-gray-800">In Production / Printing</span> — Order is being printed & packed
              </Radio>
              <Radio value="Dispatched">
                <span className="font-semibold text-gray-800">Dispatched / Shipped</span> — Courier has picked up parcel & assigned AWB
              </Radio>
              <Radio value="Out for Delivery">
                <span className="font-semibold text-gray-800">Out for Delivery</span> — Courier is delivering to customer today
              </Radio>
              <Radio value="Delivered">
                <span className="font-semibold text-gray-800">Delivered</span> — Customer received the parcel (Fulfillment Complete)
              </Radio>
            </Radio.Group>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Courier Carrier</label>
            <Input
              value={webhookCourier}
              onChange={(e) => setWebhookCourier(e.target.value)}
              placeholder="e.g. BlueDart Express, Delhivery, DTDC"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">AWB Tracking Number</label>
            <Input
              value={webhookAwb}
              onChange={(e) => setWebhookAwb(e.target.value)}
              placeholder="e.g. BD-89240182"
            />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800">
            ✓ Sending this event will update the database, sync tracking across Admin & Customer storefronts, and mark milestones.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetail;
