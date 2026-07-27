import React from "react";

const SpotlightShimmer = () => {
  return (
    <>
      {/* 🔼 Top background image section (height simulated) */}
      <div
        className="w-full pt-20 -mb-1 bg-gray-200 animate-pulse"
      ></div>

      {/* 🔳 Main Spotlight Section */}
      <div className="w-full bg-[#f9f9f9] px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 py-10 md:py-15 px-4 sm:px-6">
          
          {/* 📝 Left Text Block */}
          <div className="w-full md:max-w-md text-gray-400">
            <div className="h-10 sm:h-12 md:h-16 w-[60%] mx-auto md:mx-0 bg-gray-300 rounded animate-pulse"></div>
            <div className="border-t-2 border-gray-300 w-40 md:w-100 my-6 sm:my-8 md:my-12 mx-auto md:mx-0"></div>
            <div className="h-6 w-[40%] mx-auto md:mx-0 bg-gray-300 rounded animate-pulse"></div>
            <div className="space-y-2 mt-4">
              <div className="h-4 bg-gray-300 w-[90%] mx-auto md:mx-0 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-300 w-[80%] mx-auto md:mx-0 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-300 w-[60%] mx-auto md:mx-0 rounded animate-pulse"></div>
            </div>
            <div className="flex justify-center md:justify-start">
              <div className="mt-6 px-6 py-2 w-32 h-10 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>

          {/* 📸 Right Image Block */}
          <div className="relative w-full sm:w-[80%] md:w-[600px]">
            <div className="w-full h-[350px] bg-gray-300 rounded-md animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gray-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔽 Bottom background image section (height simulated) */}
      <div
        className="w-full pb-20 -mt-1 bg-gray-200 animate-pulse"
      ></div>
    </>
  );
};

export default SpotlightShimmer;
