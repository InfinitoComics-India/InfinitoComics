import React from "react";
import { Check } from "lucide-react";

const ResearchPlans = () => {
  const features = [
    "Unlimited Comics",
    "Premium Content",
    "Animated Series",
    "Free Online Games",
    "Exclusive Releases",
  ];

  return (
    <div className="w-full bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-3">
            Everything is Free
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Enjoy full access to all Infinito content at no cost
          </p>
        </div>

        {/* Features Card */}
        <div className="bg-white border-2 border-gray-300 rounded-lg p-8 sm:p-10 max-w-md mx-auto">
          <div className="text-center mb-8">
            <span className="text-5xl sm:text-6xl font-bold text-[#DD1215]">FREE</span>
          </div>

          {/* Features List */}
          <div className="space-y-4">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-[#DD1215] flex items-center justify-center">
                    <Check size={16} color="#fff" strokeWidth={3} />
                  </div>
                </div>
                <span className="text-base sm:text-lg text-black font-medium">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button className="w-full mt-8 bg-[#DD1215] hover:bg-red-700 text-white font-bold py-4 px-6 transition-colors duration-300 text-sm uppercase tracking-wide">
            GET STARTED
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResearchPlans;
