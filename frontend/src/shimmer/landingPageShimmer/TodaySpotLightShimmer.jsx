// 📁 src/components/TodaySpotlightShimmer.jsx
import React from "react";

const TodaySpotlightShimmer = () => {
  return (
    <div className="px-4 md:px-16 py-14 bg-white font-dmsans overflow-x-hidden animate-pulse">
      <div className="w-full md:mx-50 mx-auto">
        <div className="w-72 h-10 bg-gray-300 rounded mb-10 mx-auto md:mx-0"></div>

        <div className="flex gap-6 overflow-hidden">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className={`relative flex items-start rounded-md shadow-md bg-white overflow-hidden transition-all duration-500 ease-in-out w-[270px] h-[406px]`}
            >
              {/* Image Placeholder */}
              <div className="h-full w-[270px] bg-gray-300"></div>

              {/* Hover Content Placeholder */}
              <div className="hidden md:flex flex-col justify-between w-[513px] px-8 py-6">
                <div>
                  <div className="w-56 h-8 bg-gray-300 rounded mb-3"></div>
                  <div className="flex justify-between mb-4">
                    <div className="w-24 h-4 bg-gray-300 rounded"></div>
                    <div className="w-10 h-4 bg-gray-300 rounded"></div>
                  </div>
                  <div className="w-full h-16 bg-gray-300 rounded"></div>
                </div>
                <div className="flex items-center gap-4 mt-6">
                  <div className="w-[42px] h-[42px] bg-gray-300 rounded"></div>
                  <div className="w-32 h-10 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodaySpotlightShimmer;
