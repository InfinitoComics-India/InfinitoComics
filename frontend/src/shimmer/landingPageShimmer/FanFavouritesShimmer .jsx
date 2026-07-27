import React from "react";
import "../../../index.css"; // for no-scrollbar class

const FanFavouritesShimmer = () => {
  const shimmerCards = Array(6).fill(0); // rendering 6 cards

  return (
    <div className="w-full px-4 md:px-12 py-16 my-16">
      {/* 🔹 Top Title + View All */}
      <div className="flex justify-between items-center mb-10 px-2 md:px-20 md:mx-30">
        <div className="h-6 sm:h-7 md:h-9 w-40 bg-gray-300 rounded animate-pulse"></div>
        <div className="h-4 sm:h-5 w-20 bg-gray-300 rounded animate-pulse"></div>
      </div>

      {/* 🔹 Scrollable Cards */}
      <div className="flex overflow-x-auto no-scrollbar gap-5 px-2 md:px-45">
        {shimmerCards.map((_, idx) => (
          <div
            key={idx}
            className="min-w-[150px] sm:min-w-[180px] md:min-w-[220px] h-[470px] sm:h-[300px] md:h-[320px] bg-gray-200 animate-pulse rounded-lg shadow-sm flex flex-col"
          >
            {/* Image placeholder */}
            <div className="h-[75%] w-full bg-gray-300 rounded-t-lg"></div>

            {/* Text lines */}
            <div className="flex flex-col gap-2 px-3 py-3">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FanFavouritesShimmer;
