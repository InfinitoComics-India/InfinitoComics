import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  Package, 
  Truck, 
  ExternalLink, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShoppingBag, 
  ChevronRight, 
  ArrowLeft,
  Search,
  RefreshCw,
  MapPin
} from "lucide-react";
import { fetchCustomerOrders, printOrderInvoice } from "../../services/orderService";

const getStatusColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (s.includes("deliver")) return "bg-emerald-100 text-emerald-800 border-emerald-300";
  if (s.includes("dispatch") || s.includes("transit") || s.includes("shipped")) return "bg-blue-100 text-blue-800 border-blue-300";
  if (s.includes("cancel")) return "bg-red-100 text-red-800 border-red-300";
  return "bg-amber-100 text-amber-800 border-amber-300";
};

const MyOrders = () => {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.user?.user) || (() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailInput, setEmailInput] = useState(authUser?.email || "");
  const [searchedEmail, setSearchedEmail] = useState(authUser?.email || "");

  const loadOrders = async (emailToSearch) => {
    setLoading(true);
    try {
      const email = emailToSearch || authUser?.email || "";
      const userId = authUser?._id || authUser?.id || "";
      const list = await fetchCustomerOrders(email, userId);
      setOrders(list || []);
    } catch (err) {
      console.error("Failed to load customer orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(searchedEmail);
  }, [searchedEmail]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSearchedEmail(emailInput.trim().toLowerCase());
  };

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans pb-24 pt-6">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link to="/" className="hover:text-black transition">Home</Link>
          <ChevronRight size={12} className="text-gray-400" />
          <Link to="/shop" className="hover:text-black transition">Shop</Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-900 font-bold uppercase tracking-wider">My Orders</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 font-dmsans flex items-center gap-2.5">
              <Package className="text-[#DD1215]" size={28} />
              My Orders & Live Tracking
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Track your past purchases, courier shipments, and Qikink live delivery statuses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadOrders(searchedEmail)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded transition cursor-pointer"
              title="Refresh Orders"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={() => navigate("/catalog")}
              className="px-4 py-2 bg-[#DD1215] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded transition shadow cursor-pointer"
            >
              Shop More
            </button>
          </div>
        </div>

        {/* Order Lookup Search (for guest checkout or checking by email) */}
        <div className="my-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter order email address (e.g. yourname@example.com)..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#DD1215] bg-white"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer"
            >
              Find Orders
            </button>
          </form>
          {searchedEmail && (
            <p className="text-[11px] text-gray-500 mt-2">
              Showing orders associated with: <strong className="text-gray-800">{searchedEmail}</strong>
            </p>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <div className="w-10 h-10 border-4 border-[#DD1215] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider text-gray-600">Loading Order History...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="my-10 py-16 px-4 border border-dashed border-gray-300 rounded-lg text-center bg-gray-50 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-50 text-[#DD1215] flex items-center justify-center mb-3">
              <Package size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Found</h3>
            <p className="text-xs text-gray-500 max-w-md mb-6">
              {searchedEmail 
                ? `We couldn't find any orders placed under "${searchedEmail}". Check your email or explore our catalog.`
                : "You haven't placed any orders yet. Start exploring our exclusive streetwear and graphic tees!"}
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="px-6 py-2.5 bg-[#DD1215] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded transition cursor-pointer shadow"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {orders.map((order, idx) => {
              const orderId = order.orderId || order.id || `#INF-${String(order._id).slice(-8)}`;
              const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }) : "Recent Order";

              const totalAmount = order.pricing?.total || order.total || order.amount || 0;
              const items = Array.isArray(order.items) ? order.items : [];
              const fulfillment = order.fulfillment || {};
              const qikink = fulfillment.qikink || {};
              const trackingNumber = fulfillment.trackingNumber || qikink.qikinkOrderId || fulfillment.qikinkOrderId || "";
              const carrier = fulfillment.carrier || fulfillment.courier || "Qikink Logistics";
              const trackingUrl = fulfillment.trackingUrl || (trackingNumber ? `https://track.qikink.com/?awb=${encodeURIComponent(trackingNumber)}` : "");
              const fulfillmentStatus = fulfillment.status || order.status || "Processing";

              return (
                <div
                  key={order._id || idx}
                  className="border border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition"
                >
                  {/* Card Header */}
                  <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <div>
                        <span className="text-gray-400 block text-[10px] font-medium uppercase">Order ID</span>
                        <span className="font-mono font-bold text-gray-900">{orderId}</span>
                      </div>
                      <div className="hidden sm:block h-6 w-px bg-gray-300" />
                      <div>
                        <span className="text-gray-400 block text-[10px] font-medium uppercase">Placed On</span>
                        <span className="font-medium text-gray-700">{orderDate}</span>
                      </div>
                      <div className="hidden sm:block h-6 w-px bg-gray-300" />
                      <div>
                        <span className="text-gray-400 block text-[10px] font-medium uppercase">Total</span>
                        <span className="font-extrabold text-[#DD1215]">₹{Number(totalAmount).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getStatusColor(fulfillmentStatus)} capitalize`}>
                        {fulfillmentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Items Rows */}
                  <div className="p-5 divide-y divide-gray-100">
                    {items.map((item, itemIdx) => {
                      const itemName = item.name || item.title || item.product?.title || "Infinito Product";
                      const itemImg = item.thumbnail || item.image || item.product?.image || "/products/crimson_tshirt.jpg";
                      const itemSize = item.variant?.size || item.size || "M";
                      const itemQty = item.quantity || 1;
                      const itemPrice = item.unitPrice || item.price || 0;

                      return (
                        <div key={itemIdx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                              <img src={itemImg} alt={itemName} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">{itemName}</h4>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                Size: <span className="font-semibold text-gray-700">{itemSize}</span> | Qty: <span className="font-semibold text-gray-700">{itemQty}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="font-bold text-xs sm:text-sm text-gray-900">
                              ₹{(itemPrice * itemQty).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Live Courier & Qikink Tracking Banner */}
                  <div className="bg-gradient-to-r from-gray-50 to-red-50/40 px-5 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Truck size={16} className="text-[#DD1215]" />
                      <span>
                        Courier: <strong>{carrier}</strong>
                      </span>
                      {trackingNumber && (
                        <span className="hidden sm:inline font-mono text-[11px] bg-white border border-gray-300 px-2 py-0.5 rounded text-gray-600">
                          AWB: {trackingNumber}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {trackingUrl ? (
                        <a
                          href={trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#DD1215] hover:bg-red-700 text-white font-bold text-[11px] uppercase tracking-wider rounded transition shadow-sm"
                        >
                          <ExternalLink size={12} />
                          Live Tracking
                        </a>
                      ) : (
                        <span className="text-[11px] text-gray-500 italic">
                          Tracking updates once dispatched
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => printOrderInvoice(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold text-[11px] rounded transition cursor-pointer"
                        title="Download / Print Invoice"
                      >
                        <FileText size={12} />
                        Invoice
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(`/order-details/${order.orderId || order._id}`)}
                        className="px-2.5 py-1.5 text-gray-600 hover:text-black font-semibold text-[11px] cursor-pointer"
                      >
                        Details →
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyOrders;
