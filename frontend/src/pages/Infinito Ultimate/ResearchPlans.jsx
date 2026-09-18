import React from "react";
import { Check, Sparkles, Zap, Star } from "lucide-react";

const ResearchPlans = () => {
  const features = [
    "Unlimited Comics",
    "Premium Content",
    "Animated Series",
    "Free Online Games",
    "Exclusive Releases",
  ];

  return (
    <div className="w-full bg-gradient-to-b from-white via-gray-50 to-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-4xl mx-auto relative">
        
        {/* Decorative elements */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#DD1215]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#DD1215]/10 rounded-full blur-3xl" />
        
        {/* Header */}
        <div className="text-center mb-12 relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#DD1215]/10 text-[#DD1215] px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles size={16} />
            <span>Limited Time Offer</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4">
            Everything is <span className="text-[#DD1215]">Free</span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">
            Enjoy full access to all Infinito content at no cost — no hidden fees, no subscriptions
          </p>
        </div>

        {/* Main Card */}
        <div className="relative z-10 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl shadow-gray-200/50 p-8 sm:p-12 max-w-lg mx-auto transform hover:scale-[1.02] transition-all duration-300">
          
          {/* Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#DD1215] text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg">
            Free Access
          </div>

          {/* Price Display */}
          <div className="text-center mb-8 pt-4">
            <div className="relative inline-block">
              <span className="text-7xl sm:text-8xl font-black text-[#DD1215] tracking-tight">
                FREE
              </span>
              <Zap className="absolute -top-2 -right-6 w-8 h-8 text-yellow-500 animate-pulse" />
            </div>
            <p className="text-gray-500 mt-2 text-sm">No credit card required</p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-8" />

          {/* Features List */}
          <div className="space-y-4 mb-8">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-[#DD1215] rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                  <Check size={20} color="#fff" strokeWidth={3} />
                </div>
                <span className="text-base sm:text-lg text-black font-medium flex-1">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button className="w-full bg-[#DD1215] hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 text-base uppercase tracking-wide shadow-lg shadow-[#DD1215]/30 hover:shadow-xl hover:shadow-[#DD1215]/40 hover:-translate-y-0.5 flex items-center justify-center gap-2">
            <Star size={18} />
            Get Started Now
            <Star size={18} />
          </button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Check size={14} className="text-green-500" /> Instant Access
            </span>
            <span className="flex items-center gap-1">
              <Check size={14} className="text-green-500" /> No Ads
            </span>
            <span className="flex items-center gap-1">
              <Check size={14} className="text-green-500" /> Cancel Anytime
            </span>
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-center text-gray-400 text-sm mt-8">
          Join 10,000+ readers already enjoying Infinito
        </p>
      </div>
    </div>
  );
};

export default ResearchPlans;
