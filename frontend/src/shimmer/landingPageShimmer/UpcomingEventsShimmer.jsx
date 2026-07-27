import React from "react";

const UpcomingEventsShimmer = () => {
  return (
    <div className="w-full flex justify-center py-8 md:py-12 bg-white">
      <div className="relative w-full max-w-7xl mx-2 sm:mx-6 md:mx-20 lg:mx-40 xl:mx-60 h-56 sm:h-72 md:h-[492px]">
        {/* 🔲 Shimmered event image background */}
        <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse"></div>

        {/* ⏳ Countdown shimmer blocks */}
        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 md:bottom-6 md:right-10 lg:right-20 flex gap-2 sm:gap-3 md:gap-4">
          {[...Array(4)].map((_, idx) => (
            <div className="flex flex-col items-center" key={idx}>
              {/* Top countdown box */}
              <div className="flex items-center justify-center bg-gray-300 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-md animate-pulse" />
              {/* Label shimmer */}
              <div className="w-8 sm:w-10 h-2 sm:h-3 bg-gray-300 mt-1 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpcomingEventsShimmer;
