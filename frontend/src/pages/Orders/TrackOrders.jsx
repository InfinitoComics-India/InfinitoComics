import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Package, ArrowLeft, ShoppingBag, Clock, CheckCircle, Truck, MapPin, Loader } from "lucide-react";
import { BASE_URL } from "../../utils/constants";

const STATUS_CONFIG = {
  placed:      { label: "Order Placed",   icon: Package,       color: "text-blue-500",  bg: "bg-blue-100"  },
  processing:  { label: "Processing",     icon: Clock,         color: "text-yellow-500",bg: "bg-yellow-100"},
  shipped:     { label: "Shipped",        icon: Truck,         color: "text-purple-500",bg: "bg-purple-100"},
  delivered:   { label: "Delivered",      icon: CheckCircle,   color: "text-green-500", bg: "bg-green-100" },
};

const TrackOrders = () => {
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user  = JSON.parse(localStorage.getItem("user") || "{}");
        const token = localStorage.getItem("authtoken");
        if (!user._id || !token) { setLoading(false); return; }

        const res = await axios.get(
          `${BASE_URL}/api/orders/user/${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Only active (non-delivered) orders
        const all = res.data.data || [];
        setOrders(all.filter(o => o.status !== "delivered"));
      } catch (e) {
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="bg-white font-sans px-4 sm:px-12 pt-8 pb-16 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition">
          <ArrowLeft size={16} /> Back to Account
        </button>
      </div>
      <h1 className="text-2xl font-black tracking-widest mb-8">TRACK ORDERS</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader size={28} className="animate-spin text-[#DD1215]" />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500 text-sm">{error}</div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6 border border-dashed border-gray-200 rounded-lg">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
            <Package size={36} className="text-gray-300" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-700 mb-2">No active orders</h2>
            <p className="text-sm text-gray-400 max-w-sm">
              You don't have any orders being tracked right now. Once you place an order, you'll be able to track it here.
            </p>
          </div>
          <button onClick={() => navigate("/comics")}
            className="flex items-center gap-2 bg-[#DD1215] text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
            <ShoppingBag size={14} /> Browse Comics
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
            const StatusIcon = sc.icon;
            const steps = ["placed","processing","shipped","delivered"];
            const currentStep = steps.indexOf(order.status);
            return (
              <div key={order._id} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Order header */}
                <div className="bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Order ID</p>
                    <p className="text-sm font-mono font-bold text-gray-800">{order._id?.toString().slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Placed On</p>
                    <p className="text-sm font-semibold text-gray-700">{fmt(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Total</p>
                    <p className="text-sm font-black text-gray-900">₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${sc.bg} ${sc.color}`}>
                    <StatusIcon size={13} />
                    {sc.label}
                  </div>
                </div>

                {/* Progress stepper */}
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between relative">
                    {steps.map((step, i) => {
                      const s = STATUS_CONFIG[step];
                      const SI = s.icon;
                      const done = i <= currentStep;
                      return (
                        <React.Fragment key={step}>
                          <div className="flex flex-col items-center gap-1 z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${done ? `${s.bg} ${s.color} border-current` : "bg-gray-100 text-gray-300 border-gray-200"}`}>
                              <SI size={18} />
                            </div>
                            <p className={`text-[10px] font-semibold uppercase tracking-wider text-center ${done ? "text-gray-800" : "text-gray-400"}`}>
                              {s.label}
                            </p>
                          </div>
                          {i < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? "bg-[#DD1215]" : "bg-gray-200"}`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Items */}
                {order.items?.length > 0 && (
                  <div className="px-6 pb-4 border-t border-gray-100 pt-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Items</p>
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 font-medium">{item.name || `Item ${i + 1}`}</span>
                          <span className="text-gray-500">Qty: {item.quantity || 1} · ₹{Number(item.price || 0).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrackOrders;
