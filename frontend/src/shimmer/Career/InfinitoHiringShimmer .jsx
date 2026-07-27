import React from "react";

const InfinitoHiringShimmer = () => {
  return (
    <div className="w-full px-4 sm:px-6 md:px-10 lg:px-20 py-12 animate-pulse">
      {/* Heading */}
      <div className="h-6 sm:h-8 md:h-10 w-64 sm:w-80 mx-auto bg-gray-300 rounded mb-2"></div>
      <div className="h-4 w-64 sm:w-80 mx-auto bg-gray-200 rounded mb-10"></div>

      {/* Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            {/* Step number and title */}
            <div className="flex flex-col items-start mb-5">
              {/* Circle step number */}
              <div className="w-8 h-8 rounded-full bg-gray-300 mb-2"></div>

              {/* Title shimmer */}
              <div className="h-5 w-40 bg-gray-300 rounded"></div>
            </div>

            {/* Description shimmer */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-11/12 bg-gray-200 rounded"></div>
              <div className="h-4 w-10/12 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfinitoHiringShimmer;
