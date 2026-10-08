import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import {
  getOrderById,
  cancelOrder,
} from "../../services/orderService";

const REASONS = [
  "Ordered by Mistake",
  "Selected wrong address",
  "No Longer Needed",
  "Delivery is taking too long",
  "Other",
];

const OrderCancel = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  // Single select cancellation reason
  const [selectedReason, setSelectedReason] = useState("No Longer Needed");
  const [otherText, setOtherText] = useState("");

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

  const orderAmount = Number(order.total || 3065.64);
  const cancellationFee = 199;
  const refundAmount = Number(Math.max(0, orderAmount - cancellationFee).toFixed(2));

  const handleKeepOrder = () => {
    navigate(`/order-details/${order.id || "4721"}`);
  };

  const handleConfirmCancel = () => {
    if (selectedReason === "Other" && !otherText.trim()) {
      toast("Please specify your reason for cancellation");
      return;
    }

    cancelOrder(order.id || "4721", {
      reason: selectedReason,
      otherText: selectedReason === "Other" ? otherText : "",
    });

    toast.success("Order cancellation initiated");
    navigate(`/order-cancelled/${order.id || "4721"}`);
  };

  return (
    <div className="bg-white min-h-screen text-black font-sans pb-24">
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 pt-8">
        
        {/* Back button */}
        <button
          onClick={handleKeepOrder}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black mb-6 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Order Details</span>
        </button>

        {/* ─── SECTION 1: ORDER SUMMARY (MATCHING SS5) ─── */}
        <div className="mb-12">
          <h1 className="text-2xl md:text-3xl font-black text-black tracking-wide font-dmsans mb-4">
            Order Summary
          </h1>

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
                      key={`cancel-summary-${index}`}
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
                    ₹{orderAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── SECTION 2: CANCELLATION REASON (MATCHING SS5) ─── */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-wide font-dmsans mb-4">
            Cancellation Reason
          </h2>

          <div className="space-y-2.5">
            {REASONS.map((reason) => {
              const isSelected = selectedReason === reason;

              return (
                <div key={reason}>
                  <div
                    onClick={() => setSelectedReason(reason)}
                    className={`flex items-center gap-3 p-3.5 border transition cursor-pointer bg-white ${
                      isSelected
                        ? "border-[#1E88E5] shadow-sm"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {/* Checkbox Icon Box */}
                    <div
                      className={`w-5 h-5 flex items-center justify-center border transition ${
                        isSelected
                          ? "bg-[#DD1215] border-[#DD1215] text-white"
                          : "border-gray-400 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <span className="text-sm font-semibold text-gray-900 select-none">
                      {reason}
                    </span>
                  </div>

                  {/* Typing box for 'Other' option */}
                  {reason === "Other" && isSelected && (
                    <div className="mt-2.5 pl-8 pr-2 animate-fadeIn">
                      <textarea
                        rows={3}
                        value={otherText}
                        onChange={(e) => setOtherText(e.target.value)}
                        placeholder="Please tell us why you want to cancel this order..."
                        className="w-full border border-gray-300 p-3 text-sm focus:border-black focus:outline-none bg-gray-50/50"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── SECTION 3: REFUND DETAILS (MATCHING SS5) ─── */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-wide font-dmsans mb-4">
            Refund Details
          </h2>

          <div className="border border-gray-300 overflow-hidden bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-gray-300 bg-white">
                  <th className="py-3 px-4 font-bold text-gray-800 w-3/4">Item</th>
                  <th className="py-3 px-4 font-bold text-gray-800 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3.5 px-4 font-bold text-black">Order Amount</td>
                  <td className="py-3.5 px-4 text-right font-medium text-black">
                    {orderAmount.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3.5 px-4 font-bold text-black">Cancellation Fee</td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#DD1215]">
                    - {cancellationFee}
                  </td>
                </tr>
                {/* REFUND AMOUNT ROW */}
                <tr className="border-t-2 border-gray-300 bg-white">
                  <td className="py-4 px-4 font-black text-sm md:text-base text-black">
                    Refund Amount
                  </td>
                  <td className="py-4 px-4 text-right font-black text-base md:text-lg text-black">
                    ₹{refundAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs md:text-sm text-gray-700 font-semibold mt-4">
            ** Refund will be credited to your original payment method in 7-14 business days. **
          </p>
        </div>

        {/* ─── SECTION 4: ACTION BUTTONS (KEEP MY ORDER / CANCEL ORDER) ─── */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleKeepOrder}
            className="w-1/2 py-3.5 border border-[#DD1215] text-[#DD1215] hover:bg-red-50 font-bold uppercase text-xs md:text-sm tracking-wider transition cursor-pointer text-center"
          >
            Keep my Order
          </button>
          <button
            onClick={handleConfirmCancel}
            className="w-1/2 py-3.5 bg-[#DD1215] hover:bg-red-700 text-white font-bold uppercase text-xs md:text-sm tracking-wider transition cursor-pointer text-center shadow-md"
          >
            Cancel Order
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderCancel;
