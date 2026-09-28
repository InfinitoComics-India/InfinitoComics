import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ClipboardList, ArrowLeft, ShoppingBag, CheckCircle, XCircle, Clock, Truck, Loader } from "lucide-react";
import { BASE_URL } from "../../utils/constants";

const STATUS_BADGE = {
  placed:     { label: "Placed",     color: "bg-blue-100 text-blue-700"    },
  processing: { label: "Processing", color: "bg-yellow-100 text-yellow-700"},
  shipped:    { label: "Shipped",    color: "bg-purple-100 text-purple-700"},
  delivered:  { label: "Delivered",  color: "bg-green-100 text-green-700"  },
  cancelled:  { label: "Cancelled",  color: "bg-red-100 text-red-600"      },
};

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const OrderHistory = () => {
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
        setOrders(res.data.data || []);
      } catch (e) {
        setError("Failed to load order history.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="bg-white font-sans px-4 sm:px-12 pt-8 pb-16 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition">
          <ArrowLeft size={16} /> Back to Account
        </button>
      </div>
      <h1 className="text-2xl font-black tracking-widest mb-8">ORDER HISTORY</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader size={28} className="animate-spin text-[#DD1215]" />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500 text-sm">{error}</div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6 border border-dashed border-gray-200 rounded-lg">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
            <ClipboardList size={36} className="text-gray-300" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-700 mb-2">No past orders</h2>
            <p className="text-sm text-gray-400 max-w-sm">
              You haven't placed any orders yet. Start exploring our comics and characters collection.
            </p>
          </div>
          <button onClick={() => navigate("/comics")}
            className="flex items-center gap-2 bg-[#DD1215] text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
            <ShoppingBag size={14} /> Browse Comics
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <p className="text-sm text-gray-500">{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>

          {orders.map(order => {
            const s = STATUS_BADGE[order.status] || STATUS_BADGE.placed;
            return (
              <div key={order._id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition">
                {/* Row */}
                <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Order ID</p>
                    <p className="text-xs font-mono font-bold text-gray-800">
                      #{order._id?.toString().slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Date</p>
                    <p className="text-xs font-semibold text-gray-700">{fmt(order.createdAt)}</p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Items</p>
                    <p className="text-xs font-semibold text-gray-700">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Total</p>
                    <p className="text-sm font-black text-gray-900">₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.color}`}>
                    {s.label}
                  </span>
                </div>

                {/* Items detail */}
                {order.items?.length > 0 && (
                  <div className="px-6 pb-4 pt-2 border-t border-gray-50 bg-gray-50/50">
                    <div className="space-y-1.5">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs text-gray-600">
                          <span className="font-medium">{item.name || `Item ${i + 1}`}</span>
                          <span className="text-gray-400">Qty: {item.quantity || 1} · ₹{Number(item.price || 0).toLocaleString("en-IN")}</span>
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

export default OrderHistory;
