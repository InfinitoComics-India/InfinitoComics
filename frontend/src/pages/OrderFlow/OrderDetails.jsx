import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, XCircle, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import {
  getOrderById,
  downloadInvoicePdf,
  getOrderItemPrice,
  getOrderTotal,
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
  const primaryPrice = getOrderItemPrice(primaryItem);
  const primaryMrp = Number(primaryProd.mrp || Math.round(primaryPrice * 1.6));
  const primarySize = primaryItem.size || primaryItem.variant?.size || "M";

  return (
    <div className="bg-white min-h-screen text-black font-sans pb-24">
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 pt-8">
        
        {/* Back Link */}
        <button
          onClick={() => { window.location.href = "https://shop.infinitohq.com/"; }}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[#DD1215] mb-6 cursor-pointer transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Shop</span>
        </button>

        {/* ─── PAGE TITLE: ORDER DETAILS (MATCHING SS4) ─── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-black tracking-wide uppercase font-dmsans">
            ORDER DETAILS
          </h1>
          <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1.5 rounded">
            {order.orderId || (order.id ? `#${order.id}` : "")} · {order.items?.length || 1} Item{order.items?.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ─── PRODUCT SUMMARY CARDS (SHOWING ALL ORDER ITEMS) ─── */}
        <div className="space-y-6 mb-10">
          {(order.items && order.items.length > 0 ? order.items : [primaryItem]).map((item, idx) => {
            const prod = item.product || {};
            const itemPrice = Number(prod.price || prod.salePrice || item.unitPrice || item.price || 1299);
            const itemMrp = Number(prod.mrp || Math.round(itemPrice * 1.6));
            const itemSize = item.size || item.variant?.size || "M";
            const itemQty = Number(item.quantity || 1);
            const itemImage = prod.image || (Array.isArray(prod.images) ? prod.images[0]?.url || prod.images[0] : null) || item.thumbnail || "/products/crimson_tshirt.jpg";
            const itemName = prod.name || prod.title || item.name || "INFINITO Product";
            const itemDesc = prod.description || "Official INFINITO Special Edition merchandise crafted with premium materials and signature styling.";

            return (
              <div
                key={`order-detail-item-${idx}`}
                className="border-2 border-[#1E88E5] p-5 md:p-6 bg-white shadow-sm flex flex-col md:flex-row gap-6 md:gap-8 items-start"
              >
                {/* Image */}
                <div className="w-full md:w-[220px] h-[220px] bg-black flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={itemImage}
                    alt={itemName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80";
                    }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between w-full h-full min-h-[220px]">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-2xl md:text-3xl font-extrabold text-black uppercase tracking-tight font-dmsans">
                        {itemName}
                      </h2>
                      <span className="bg-[#DD1215] text-white text-xs font-bold px-2.5 py-1 flex items-center gap-1 shadow-sm shrink-0">
                        ★ {prod.rating || 4.5}
                      </span>
                    </div>

                    <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                      {itemDesc}
                    </p>

                    <div className="flex items-baseline gap-3 mt-4">
                      <span className="text-2xl md:text-3xl font-black text-black">
                        ₹{itemPrice}
                      </span>
                      <span className="text-sm md:text-base text-gray-500 line-through font-normal">
                        MRP ₹{itemMrp}
                      </span>
                      {itemQty > 1 && (
                        <span className="text-xs font-bold bg-gray-100 text-gray-800 px-2.5 py-1 rounded">
                          Qty: {itemQty}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 text-sm font-semibold text-gray-900 flex items-center gap-6">
                      <div>
                        <span className="text-gray-500">Selected Size : </span>
                        <span className="font-bold ml-1 text-black">{itemSize}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Quantity : </span>
                        <span className="font-bold ml-1 text-black">{itemQty}</span>
                      </div>
                    </div>
                  </div>

                  {isCancelled && idx === 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>Order Cancelled — Refund of ₹{order.refundAmount || (order.total - 199).toFixed(2)} in process (7-14 days)</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
                  const price = getOrderItemPrice(item);
                  const qty = Number(item.quantity || 1);
                  const rowTotal = price * qty * 1.18;
                  const itemName = item.product?.title || item.product?.name || item.name || item.title || "INFINITO Premium Tshirt";

                  return (
                    <tr
                      key={`order-item-${index}`}
                      className="border-b border-gray-200 hover:bg-gray-50/50"
                    >
                      <td className="py-3.5 px-4 font-bold text-black">
                        {itemName} {item.size || item.variant?.size ? `(${item.size || item.variant?.size})` : ""}
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-gray-800">
                        {qty}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-gray-800">
                        ₹{price}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-gray-800">
                        18%
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                        ₹{rowTotal.toFixed(2)}
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
                    ₹{Number(getOrderTotal(order)).toFixed(2)}
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
