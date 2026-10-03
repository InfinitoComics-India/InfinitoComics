import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderById } from "../../services/orderService";

const OrderCancelled = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const ord = getOrderById(orderId);
    setOrder(ord);
  }, [orderId]);

  const targetId = order?.id || orderId || "4721";

  return (
    <div className="bg-white min-h-[85vh] text-black font-sans pb-20">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 pt-12">
        
        {/* Center Graphic & Cancellation Message */}
        <div className="flex flex-col items-center justify-center text-center mt-6 md:mt-12">
          {/* 3D Shopping Bag */}
          <div className="w-32 h-36 md:w-40 md:h-44 flex items-center justify-center mb-6">
            <img
              src="/order-assets/shopping-bag.png"
              alt="INFINITO Order Cancelled"
              className="max-h-full max-w-full object-contain drop-shadow-md"
            />
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-black tracking-tight font-dmsans mb-3">
            Order Cancelled!
          </h1>
          <p className="text-sm md:text-base text-gray-800 font-medium tracking-wide max-w-lg leading-relaxed">
            You Order has been cancelled and Refund has been initiated and the process will take 7-14 business days.
          </p>

          {/* Action Buttons: View Orders / Go to Home (Matching SS6) */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl mt-12">
            <button
              onClick={() => navigate(`/order-details/${targetId}`)}
              className="flex-1 py-3.5 border border-[#DD1215] text-[#DD1215] hover:bg-red-50 font-bold uppercase text-xs md:text-sm tracking-wider transition cursor-pointer text-center"
            >
              View Orders
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

export default OrderCancelled;
