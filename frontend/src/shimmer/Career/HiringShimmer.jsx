import React from "react";

const HiringShimmer = () => {
  return (
    <div className="w-full px-4 md:px-20 py-12 text-center animate-pulse">
      {/* Heading */}
      <div className="h-6 md:h-8 w-48 md:w-64 mx-auto bg-gray-300 rounded mb-3"></div>
      <div className="h-4 w-72 md:w-96 mx-auto bg-gray-200 rounded mb-16"></div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-35 gap-x-6 justify-items-center mx-16">
        {[...Array(15)].map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            {/* Circular avatar placeholder */}
            <div className="w-20 h-20 rounded-full bg-gray-300 shadow-md"></div>

            {/* Label placeholder */}
            <div className="h-3 w-16 bg-gray-200 rounded"></div>
            <div className="h-3 w-12 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HiringShimmer;
