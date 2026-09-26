import React from "react";
import { Check } from "lucide-react";

// Save the banner image as: frontend/assets/Images/Ultimate/everythingFreeBanner.png
import freeBanner from "../../../assets/Images/Ultimate/everythingFreeBanner.png";

const ResearchPlans = () => {
  const features = [
    "Unlimited Comics",
    "Premium Content",
    "Animated Series",
    "Free Online Games",
    "Exclusive Releases",
  ];

  return (
    <div className="w-full bg-white">
      {/* Banner Image - Full Width */}
      <div className="w-full">
        <img
          src={freeBanner}
          alt="Everything is Free - Infinito Comics"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Features Card Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          {/* Main Card */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-xl p-8 sm:p-10">
            
            {/* Badge */}
            <div className="text-center mb-6">
              <span className="inline-block bg-[#DD1215] text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wide">
                Free Access
              </span>
            </div>

            {/* Price Display */}
            <div className="text-center mb-8">
              <span className="text-6xl sm:text-7xl font-black text-[#DD1215] tracking-tight">
                FREE
              </span>
              <p className="text-gray-500 mt-2 text-sm">No credit card required</p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gray-200 mb-8" />

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {features.map((feature, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-[#DD1215] rounded-full flex items-center justify-center">
                    <Check size={18} color="#fff" strokeWidth={3} />
                  </div>
                  <span className="text-base text-black font-medium">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button className="w-full bg-[#DD1215] hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 text-sm uppercase tracking-wide">
              Get Started Now
            </button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Check size={14} className="text-green-500" /> Instant Access
              </span>
              <span className="flex items-center gap-1">
                <Check size={14} className="text-green-500" /> No Ads
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchPlans;
