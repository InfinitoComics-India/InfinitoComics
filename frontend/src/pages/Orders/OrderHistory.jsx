import React from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, ArrowLeft, ShoppingBag } from "lucide-react";

const OrderHistory = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen font-sans px-4 sm:px-12 pt-8 pb-16 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition"
        >
          <ArrowLeft size={16} /> Back to Account
        </button>
      </div>

      <h1 className="text-2xl font-black tracking-widest mb-8">ORDER HISTORY</h1>

      {/* Empty state */}
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
        <button
          onClick={() => navigate("/comics")}
          className="flex items-center gap-2 bg-[#DD1215] text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition"
        >
          <ShoppingBag size={14} /> Browse Comics
        </button>
      </div>
    </div>
  );
};

export default OrderHistory;
