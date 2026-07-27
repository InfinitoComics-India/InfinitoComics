// 📁 src/components/LandingShimmer.jsx
import React from "react";

const LandingShimmer = () => {
  return (
    <div className="w-full animate-pulse text-white">
      {/* Hero Section */}
      <div className="relative w-full h-[80vh] overflow-hidden">
        {/* Dimmed Background */}
        <div className="absolute inset-0 bg-gray-200"></div>

        {/* Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-start justify-center text-left px-8 md:px-16 z-20 md:mx-30">
          <div className="h-[60px] w-[80%] md:w-[65%] bg-gray-300 rounded mb-4"></div>
          <div className="h-[60px] w-[65%] md:w-[50%] bg-gray-300 rounded mb-4"></div>
          <div className="h-[60px] w-[50%] md:w-[40%] bg-gray-300 rounded mb-10"></div>

          <div className="h-[24px] w-[90%] md:w-[65%] bg-gray-300 rounded mb-2"></div>
          <div className="h-[24px] w-[60%] md:w-[45%] bg-gray-300 rounded mb-12"></div>

          <div className="w-[140px] h-[42px] bg-gray-300 rounded"></div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="absolute bottom-5 left-0 right-0 flex justify-center space-x-40 z-30">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-[160px] h-[18px] bg-gray-300 rounded"
            ></div>
          ))}
        </div>
      </div>

      {/* Below Image Shadow Placeholder */}
      <div className="relative w-full -mt-1">
        <div className="absolute -top-16 w-full h-16 bg-gradient-to-t from-gray-200 to-transparent z-10" />
        <div className="w-full h-[120px] bg-gray-200" />
      </div>
    </div>
  );
};

export default LandingShimmer;