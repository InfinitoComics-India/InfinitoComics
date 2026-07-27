import React, { useState } from "react";
import { Gift, CircleCheck } from "lucide-react";

const InfinitoUltimateKit = () => {
  const [includeResearch, setIncludeResearch] = useState(true);

  const plan = {
    icon: <Gift size={"5rem"} color="currentColor" />, // 80px => 5rem
    price: 1900,
    originalPrice: "₹2199 + ₹49",
    title: "INFINITO ULTIMATE KIT",
    features: [
      "Comics of your choice",
      "Surprise superhero toy",
      "Infinito T-shirt",
      "Superhero Stickers",
      "Digital wall paintings",
    ],
    badge: "Special Offer",
    textColor: "text-white",
    borderColor: "border-black",
    bgColor: "bg-black",
  };

  const finalPrice = plan.price + (includeResearch ? 50 : 0);

  return (
    <div className="flex flex-col card-shine w-full max-w-[25rem] min-h-[25rem] mb-[0.3rem]">
      <div
        className={`${plan.bgColor} ${plan.textColor} ${plan.borderColor} flex flex-col flex-grow p-[1.5rem] rounded-t-2xl`}
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 97%, 0 100%)" }}
      >
        <div className="flex flex-col items-center">
          {plan.icon}
          <div className="p-[1.25rem] text-[1.5rem] font-bold">
            ₹{finalPrice}
            {plan.originalPrice && (
              <span className="ml-[0.5rem] line-through text-[0.875rem] text-gray-400">
                {plan.originalPrice}
              </span>
            )}
          </div>
          <p className="text-[1.5rem] font-semibold border-b border-t text-center">
            {plan.title}
          </p>
        </div>

        <div className="flex flex-col flex-grow justify-between  mt-[1.25rem]">
          <div className="space-y-[0.75rem] mb-[1rem]">
            {plan.features.map((feature, idx) => (
              <div key={idx} className="flex gap-[0.5rem]">
                <CircleCheck size={"1.5rem"} color="red" /> {/* 24px => 1.5rem */}
                <span>{feature}</span>
              </div>
            ))}

            {includeResearch && (
              <div className="flex gap-[0.5rem]">
                <CircleCheck size={"1.5rem"} color="red" />
                <span>Research Papers</span>
              </div>
            )}
          </div>

        </div>
      </div>

      <div
        className="w-full h-[3.5rem] text-white bg-red-500 flex justify-center items-center text-center font-bold rounded-b-2xl"
        style={{
          clipPath: "polygon(0 30%, 100% 0, 100% 100%, 0 100%)",
        }}
      >
        {plan.badge}
      </div>
    </div>
  );
};

export default InfinitoUltimateKit;
