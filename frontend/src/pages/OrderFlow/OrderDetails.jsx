import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, XCircle, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import {
  getOrderById,
  downloadInvoicePdf,
} from "../../services/orderService";

const OrderDetails = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const ord = getOrderById(orderId);
    setOrder(ord);
  }, [orderId]);

  if (!order) {
    return (
      <div className="bg-white min-h-[70vh] flex items-center justify-center">
        <p className="text-gray-500 font-bold">Loading order details...</p>
      </div>
    );
  }

  const isCancelled = order.status === "Cancelled";
  const primaryItem = order.items?.[0] || {};
  const primaryProd = primaryItem.product || {};
  const primaryPrice = Number(primaryProd.price || 1299);
  const primaryMrp = Number(primaryProd.mrp || Math.round(primaryPrice * 1.6));
  const primarySize = primaryItem.size || "M";

  return (
    <div className="bg-white min-h-screen text-black font-sans pb-24">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 pt-8">
        
        {/* Back Link */}
        <button
          onClick={() => navigate("/shop")}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black mb-6 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Shop</span>
        </button>

        {/* ─── PAGE TITLE: ORDER DETAILS (MATCHING SS4) ─── */}
        <h1 className="text-3xl md:text-4xl font-black text-black tracking-wide uppercase font-dmsans mb-8">
          ORDER DETAILS
        </h1>

        {/* ─── PRODUCT SUMMARY CARD (MATCHING SS4 BLUE-BORDER BOX) ─── */}
        <div className="border-2 border-[#1E88E5] p-5 md:p-6 bg-white mb-10 shadow-sm flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Image */}
          <div className="w-full md:w-[240px] h-[240px] bg-black flex-shrink-0 flex items-center justify-center overflow-hidden">
            <img
              src={primaryProd.image || "/products/crimson_tshirt.jpg"}
              alt={primaryProd.title || primaryProd.name || "INFINITO"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80";
              }}
            />
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between w-full h-full min-h-[240px]">
            <div>
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl md:text-3xl font-extrabold text-black uppercase tracking-tight font-dmsans">
                  {primaryProd.name || "INFINITO"}
                </h2>
                <span className="bg-[#DD1215] text-white text-xs font-bold px-2.5 py-1 flex items-center gap-1 shadow-sm">
                  ★ {primaryProd.rating || 4.5}
                </span>
              </div>

              <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                {primaryProd.description ||
                  "The Special Edition Crimson Red T-Shirt is designed to capture the energy, passion, and spirit of INFINITO. Featuring a deep crimson red color with a clean, statement-driven d..."}
              </p>

              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-2xl md:text-3xl font-black text-black">
                  ₹{primaryPrice}
                </span>
                <span className="text-sm md:text-base text-gray-500 line-through font-normal">
                  MRP ₹{primaryMrp}
                </span>
              </div>

              <div className="mt-4 text-sm font-semibold text-gray-900">
                <span>Select Size : </span>
                <span className="font-bold ml-1">{primarySize}</span>
              </div>
            </div>

            {isCancelled && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                <span>Order Cancelled — Refund of ₹{order.refundAmount || (order.total - 199).toFixed(2)} in process (7-14 days)</span>
              </div>
            )}
          </div>
        </div>

        {/* ─── SECTION 2: DELIVERY STATUS (MATCHING SS4) ─── */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-black text-black tracking-wide font-dmsans">
              Delivery Status
            </h2>

            {!isCancelled && (
              <button
                onClick={() => navigate(`/order-cancel/${order.id || "4721"}`)}
                className="flex items-center gap-1.5 px-4 py-1.5 border border-[#DD1215] text-[#DD1215] hover:bg-red-50 transition text-xs font-bold tracking-wide cursor-pointer"
              >
                <span>Cancel Order</span>
                <XCircle className="w-4 h-4 text-[#DD1215]" />
              </button>
            )}
          </div>

          {/* 4 Milestones Progress Line */}
          <div className="border border-gray-200 p-6 md:p-8 bg-white shadow-sm">
            <div className="flex items-center justify-between relative max-w-4xl mx-auto">
              
              {/* Step 1: Order Placed */}
              <div className="flex flex-col items-center text-center z-10 w-1/4">
                <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mb-2">
                  <img
                    src="/order-assets/status-placed.png"
                    alt="Order Placed"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <h4 className="text-xs md:text-sm font-bold text-black uppercase tracking-tight">
                  Order Placed
                </h4>
                <p className="text-[11px] md:text-xs text-gray-500 mt-1">
                  {order.timeline?.placedDate}
                </p>
              </div>

              {/* Connecting Line 1 */}
              <div className="h-1 flex-1 bg-[#DD1215] mx-1 md:mx-2 -mt-8" />

              {/* Step 2: Dispatched */}
              <div className="flex flex-col items-center text-center z-10 w-1/4">
                <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mb-2">
                  <img
                    src="/order-assets/status-dispatched.png"
                    alt="Dispatched"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <h4 className="text-xs md:text-sm font-bold text-black uppercase tracking-tight">
                  Dispatched
                </h4>
                <p className="text-[11px] md:text-xs text-gray-500 mt-1">
                  {order.timeline?.dispatchedDate}
                </p>
              </div>

              {/* Connecting Line 2 */}
              <div className="h-1 flex-1 bg-gray-300 mx-1 md:mx-2 -mt-8" />

              {/* Step 3: Out for Delivery */}
              <div className="flex flex-col items-center text-center z-10 w-1/4">
                <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mb-2">
                  <img
                    src="/order-assets/status-truck.png"
                    alt="Out for Delivery"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <h4 className="text-xs md:text-sm font-bold text-black uppercase tracking-tight">
                  Out for Delivery
                </h4>
                <p className="text-[11px] md:text-xs text-gray-500 mt-1">
                  {order.timeline?.outForDeliveryDate}
                </p>
              </div>

              {/* Connecting Line 3 */}
              <div className="h-1 flex-1 bg-gray-300 mx-1 md:mx-2 -mt-8" />

              {/* Step 4: Order Delivered */}
              <div className="flex flex-col items-center text-center z-10 w-1/4">
                <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mb-2">
                  <img
                    src="/order-assets/status-delivered.png"
                    alt="Order Delivered"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <h4 className="text-xs md:text-sm font-bold text-black uppercase tracking-tight">
                  Order Delivered
                </h4>
                <p className="text-[11px] md:text-xs text-gray-500 mt-1">
                  {order.timeline?.deliveredDate}
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* ─── SECTION 3: DELIVER AT THIS ADDRESS (MATCHING SS4) ─── */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-wide font-dmsans mb-4">
            Deliver At This Address
          </h2>

          <div className="border border-black p-5 md:p-6 bg-white min-h-[90px] flex items-center">
            <p className="text-base md:text-lg font-medium text-black leading-relaxed whitespace-pre-line">
              {order.address?.formatted ||
                `${order.address?.line1 || "Sector 18, House No. 42, Green Park Extension, Sector 18"}\n${order.address?.city || "Chandigarh"}, ${order.address?.state || "Punjab"}\n${order.address?.pincode || "160018"}, ${order.address?.country || "India"}`}
            </p>
          </div>
        </div>

        {/* ─── SECTION 4: INVOICE WITH DOWNLOAD INVOICE (MATCHING SS4) ─── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl md:text-3xl font-black text-black tracking-wide font-dmsans">
              Invoice
            </h2>

            <button
              onClick={() => downloadInvoicePdf(order)}
              className="flex items-center gap-1.5 px-4 py-2 border border-black hover:bg-black hover:text-white transition text-xs md:text-sm font-bold tracking-wide cursor-pointer shadow-sm"
              title="Print and download this invoice as a PDF file"
            >
              <span>Download Invoice</span>
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="border border-gray-300 overflow-hidden bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-gray-300 bg-white">
                  <th className="py-3 px-4 font-bold text-gray-800 w-2/5">Item</th>
                  <th className="py-3 px-4 font-bold text-gray-800 text-center">Qty</th>
                  <th className="py-3 px-4 font-bold text-gray-800 text-right">Price</th>
                  <th className="py-3 px-4 font-bold text-gray-800 text-right">Tax</th>
                  <th className="py-3 px-4 font-bold text-gray-800 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item, index) => {
                  const price = Number(item.product?.price || 0);
                  const qty = Number(item.quantity || 1);
                  const rowTotal = price * qty * 1.18;
                  const itemName = item.product?.title || item.product?.name || "INFINITO Premium Tshirt";

                  return (
                    <tr
                      key={`order-item-${index}`}
                      className="border-b border-gray-200 hover:bg-gray-50/50"
                    >
                      <td className="py-3.5 px-4 font-bold text-black">
                        {itemName} {item.size ? `(${item.size})` : ""}
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-gray-800">
                        {qty}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-gray-800">
                        {price}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-gray-800">
                        18%
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                        {rowTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
                {/* TOTAL ROW */}
                <tr className="border-t-2 border-gray-300 bg-white">
                  <td
                    colSpan={4}
                    className="py-4 px-4 font-black text-sm md:text-base text-black uppercase tracking-wider"
                  >
                    TOTAL
                  </td>
                  <td className="py-4 px-4 text-right font-black text-base md:text-lg text-black">
                    ₹{Number(order.total).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderDetails;
