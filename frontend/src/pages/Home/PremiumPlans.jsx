import Slider from "react-slick";
import "../Infinito Ultimate/Research.css";
import React, { useState, useEffect } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";
import { BASE_URL } from "../../utils/constants.js";
import PremiumPlansShimmer from '../../shimmer/landingPageShimmer/PremiumPlansShimmer.jsx'

import {
  Gift,
  Leaf,
  LeafyGreen,
  Flower,
  TreeDeciduous,
  CircleCheck,
  Rss,
} from "lucide-react";

// Main component
const PremiumPlans = () => {
  const [loading, setLoading] = useState(true);
  const [isUserPremium, setIsUserPremium] = useState(null);
  const [isMobile, setIsMobile] = useState(false); // Track screen size

    useEffect(() => {
       setTimeout(() => setLoading(false), 2400)
    },[])
  // Detect screen size on mount & resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024); // Below lg breakpoint → slider
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Verify premium user
  const verifyPremiumUser = async () => {
    try {
      const res = await axios.get(BASE_URL + "/payment/verify", {
        withCredentials: true,
      });
      console.log("here: ",res.data)
      setIsUserPremium(res.data.isPremium || false);
    } catch (error) {
      console.error("Error verifying premium user:", error);
      setIsUserPremium(false);
    }
  };

  // Handle payment
  const handleBuyClick = async (type) => {
    if (type === "FREE") return;

    try {
      const token = localStorage.getItem("authtoken");
      console.log(BASE_URL)
      const res = await axios.post(
        `${BASE_URL}/payment/create`,
        { membershipType: type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data.data;
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: "INR",
        name: "Infinito Comics",
        description: `${type} Membership Purchase`,
        order_id: data.orderId,
        theme: { color: "#3399cc" },
        handler: verifyPremiumUser,
        // handler: function(res)
        // {
        //   alert("successfully");
        // }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error initiating Razorpay payment: ", error);
      alert("Something went wrong while creating the order. Please try again!");
    }
  };

  // Plan data
  const plans = [
    {
      icon: <Gift size={80} color="currentColor" />,
      price: 1999,
      originalPrice: "₹2199",
      title: "INFINITO ULTIMATE KIT",
      features: [
        "Comics of your choice",
        "Surprise superhero toy",
        "Infinito T-shirt",
        "Superhero Stickers",
        "Digital wall paintings",
      ],
      badge: "UltimateKit",
      textColor: "text-white",
      borderColor: "border-black",
      bgColor: "bg-black",
    },
    {
      icon: <Leaf size={80} color="white" />,
      price: "FREE",
      title: "FREE",
      features: ["Limited Comics", "Ad-Supported"],
      badge: "FREE",
      textColor: "text-white",
      borderColor: "border-black",
      bgColor: "bg-gray-900",
    },
    {
      icon: <LeafyGreen size={80} color="white" />,
      price: 129,
      title: "MONTHLY",
      features: [
        "Unlimited Comics",
        "Premium Content",
        "Animated Series",
        "Free Online Games",
        "Ad-Supported",
      ],
      badge: "Monthly",
      textColor: "text-white",
      borderColor: "border-black",
      bgColor: "bg-gray-900",
    },
    {
      icon: <Flower size={80} color="white" />,
      price: 599,
      title: "HALF YEAR",
      features: [
        "Unlimited Comics",
        "Premium Content",
        "Animated Series",
        "Free Online Games",
        "Ad-Supported",
      ],
      badge: "HalfYear",
      textColor: "text-white",
      borderColor: "border-black",
      bgColor: "bg-gray-900",
    },
    {
      icon: <TreeDeciduous size={80} color="white" />,
      price: 999,
      title: "ANNUAL",
      features: [
        "Unlimited Comics",
        "Premium Content",
        "Animated Series",
        "Free Online Games",
        "Exclusive Releases",
        "No Ads",
        "VIP Event Access",
      ],
      badge: "Annual",
      textColor: "text-white",
      borderColor: "border-black",
      bgColor: "bg-gray-900",
    },
  ];

  // Render card
  const renderCard = (plan, index) => (
    <div
      key={index}
      className={`flex flex-col card-shine 
        ${plan.title === "INFINITO ULTIMATE KIT" ? "lg:w-[380px]" : "lg:w-[300px]"} 
        w-full max-w-[300px] mx-auto h-[600px]`}
    >
      <div
        className={`${plan.bgColor} ${plan.textColor} ${plan.borderColor} flex flex-col flex-grow p-6 rounded-t-2xl h-[calc(100%-56px)]`}
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 97%, 0 100%)" }}
      >
        <div className="flex flex-col items-center">
          {plan.icon}
          <div className="p-5 text-2xl font-bold text-center">
            {plan.price === "FREE" ? "FREE" : `₹${plan.price}`}
            {plan.originalPrice && (
              <span className="ml-2 line-through text-sm text-gray-400">
                {plan.originalPrice}
              </span>
            )}
          </div>
          <p className="text-2xl font-semibold border-b border-t text-center break-words">
            {plan.title}
          </p>
        </div>

        <div className="flex flex-col flex-grow justify-between mt-5">
          <div className="space-y-3 mb-4 overflow-y-auto max-h-[280px]">
            {plan.features.map((feature, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <CircleCheck
                  size={24}
                  color={
                    feature === "Limited Comics" ||
                    feature === "VIP Event Access"
                      ? "gray"
                      : feature.includes("Ad") ||
                        feature.includes("Exclusive") ||
                        feature.includes("No Ads")
                      ? "gray"
                      : "red"
                  }
                />
                <span className="break-words">{feature}</span>
              </div>
            ))}

            {plan.title === "INFINITO ULTIMATE KIT" && (
              <div className="mt-4 w-full">
                <h2 className="font-bold text-white text-md text-center px-2 leading-snug">
                  First 10,000 customers get exclusive gifts!
                </h2>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        onClick={
          plan.badge === "FREE"
            ? undefined
            : () => {
                handleBuyClick(plan.badge);
              }
        }
        className={`w-full h-14 text-white flex justify-center items-center text-center font-bold rounded-b-2xl ${
          plan.badge === "FREE"
            ? "bg-gray-500 opacity-80 cursor-not-allowed"
            : "bg-red-500 hover:cursor-pointer"
        }`}
        style={{
          clipPath: "polygon(0 30%, 100% 0, 100% 100%, 0 100%)",
        }}
        aria-disabled={plan.badge === "FREE"}
        role="button"
      >
        {plan.badge === "FREE" ? "FREE" : "BUY NOW"}
      </div>
    </div>
  );

  // Slider settings for mobile/tablet
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };

return  loading ? <PremiumPlansShimmer/>:  (
    <div className="w-full mt-5 p-4 lg:p-16">
      {isMobile ? (
        // Mobile & tablet → slider
        <Slider {...sliderSettings} className="!overflow-visible">
          {plans.map((plan, index) => (
            <div key={index} className="px-3">
              {renderCard(plan, index)}
            </div>
          ))}
        </Slider>
      ) : (
        // Desktop → show all in one row
        <div className="flex justify-center gap-6 flex-wrap">
          {plans.map((plan, index) => renderCard(plan, index))}
        </div>
      )}
    </div>
  );
};

export default PremiumPlans;
