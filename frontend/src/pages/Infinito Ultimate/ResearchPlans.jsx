import React from "react";
import { Check, X } from "lucide-react";

const ResearchPlans = () => {
  const plans = [
    {
      title: "Monthly",
      price: "₹129",
      features: [
        { name: "Unlimited Comics", included: true },
        { name: "Premium Content", included: true },
        { name: "Animated Series", included: true },
        { name: "Free Online Games", included: true },
        { name: "Ad-Supported", included: false },
      ],
      buttonText: "GET STARTED",
      popular: false,
    },
    {
      title: "Half Year",
      price: "₹599",
      features: [
        { name: "Unlimited Comics", included: true },
        { name: "Premium Content", included: true },
        { name: "Animated Series", included: true },
        { name: "Free Online Games", included: true },
        { name: "Ad-Supported", included: false },
      ],
      buttonText: "CHOOSE HALF YEAR",
      popular: false,
    },
    {
      title: "Annual",
      price: "₹999",
      features: [
        { name: "Unlimited Comics", included: true },
        { name: "Premium Content", included: true },
        { name: "Animated Series", included: true },
        { name: "Free Online Games", included: true },
        { name: "No Ads", included: true },
        { name: "Exclusive Releases", included: true },
        { name: "VIP Event Access", included: true },
      ],
      buttonText: "GO ANNUAL",
      popular: true,
    },
  ];

  return (
    <div className="w-full bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-2">
            Choose Your Plan
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Flexible Options for every comic fan
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="relative bg-white border-2 border-gray-300 rounded-none flex flex-col"
            >
              {/* Most Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 right-4 bg-[#DD1215] text-white px-4 py-1 text-xs font-bold uppercase">
                  MOST POPULAR
                </div>
              )}

              {/* Card Content */}
              <div className="p-6 sm:p-8 flex flex-col flex-grow">
                {/* Plan Title */}
                <h3 className="text-2xl font-bold text-black mb-4">
                  {plan.title}
                </h3>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl sm:text-5xl font-bold text-black">
                    {plan.price}
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-6 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {feature.included ? (
                          <div className="w-5 h-5 rounded-full border-2 border-[#DD1215] flex items-center justify-center">
                            <Check size={14} color="#DD1215" strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center">
                            <X size={14} color="#999" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <span className={`text-sm ${feature.included ? 'text-black' : 'text-gray-500'}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button className="w-full bg-[#DD1215] hover:bg-red-700 text-white font-bold py-3 px-6 transition-colors duration-300 text-sm uppercase tracking-wide">
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResearchPlans;
