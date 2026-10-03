import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { getOrderById } from "../../services/orderService";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const ord = getOrderById(orderId);
    setOrder(ord);
  }, [orderId]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Order link copied to clipboard");
    }
  };

  const idText = order?.orderId || (orderId ? `#${orderId}` : "#4721");

  return (
    <div className="bg-white min-h-[85vh] text-black font-sans pb-20">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 pt-8">
        
        {/* Top Header Actions (Go Back & Share) */}
        <div className="flex items-center justify-between pb-6">
          <button
            onClick={() => navigate("/shop")}
            className="flex items-center gap-1 px-4 py-2 border border-black/80 hover:bg-black hover:text-white transition text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 border border-black/80 hover:bg-black hover:text-white transition text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <span>Share</span>
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center Graphic & Congratulations Message */}
        <div className="flex flex-col items-center justify-center text-center mt-8 md:mt-12">
          {/* 3D Shopping Bag */}
          <div className="w-32 h-36 md:w-40 md:h-44 flex items-center justify-center mb-6">
            <img
              src="/order-assets/shopping-bag.png"
              alt="INFINITO Order Placed"
              className="max-h-full max-w-full object-contain drop-shadow-md"
            />
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-black tracking-tight font-dmsans mb-3">
            Congratulations!
          </h1>
          <p className="text-sm md:text-base text-gray-800 font-medium tracking-wide">
            Your Order ({idText}) has been placed.
          </p>

          {/* Action Buttons: View Order Details / Go to Home */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl mt-12">
            <button
              onClick={() => navigate(`/order-details/${order?.id || "4721"}`)}
              className="flex-1 py-3.5 border border-[#DD1215] text-[#DD1215] hover:bg-red-50 font-bold uppercase text-xs md:text-sm tracking-wider transition cursor-pointer text-center"
            >
              View Order Details
            </button>
            <button
              onClick={() => navigate("/shop")}
              className="flex-1 py-3.5 bg-[#DD1215] hover:bg-red-700 text-white font-bold uppercase text-xs md:text-sm tracking-wider transition cursor-pointer text-center shadow-md"
            >
              Go to Home
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;
