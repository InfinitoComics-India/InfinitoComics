import React from "react";

const ImaginationsLeadsShimmer = () => {
  return (
    <div className="w-full px-4 md:px-20 py-12 space-y-16 animate-pulse">
      {/* Section Title */}
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto py-10">
        <div className="h-6 md:h-8 w-64 bg-gray-300 rounded mb-4"></div>
        <div className="h-4 w-[80%] sm:w-[70%] bg-gray-200 rounded"></div>
      </div>

      {/* Three Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center max-w-6xl mx-auto">
        {[...Array(3)].map((_, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-md ${
              idx === 1 ? "bg-gray-300 text-white" : "border bg-gray-100"
            }`}
          >
            <div className="h-5 w-40 bg-gray-300 rounded mx-auto mb-2"></div>
            <div className="h-4 w-[90%] mx-auto bg-gray-200 rounded mb-1"></div>
            <div className="h-4 w-[75%] mx-auto bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Core Values Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto my-20">
        {/* Left: Text Content */}
        <div className="space-y-6">
          <div className="mb-12">
            <div className="h-6 md:h-8 w-60 bg-gray-300 rounded mb-5"></div>
            <div className="space-y-2">
              <div className="h-4 w-[95%] bg-gray-200 rounded"></div>
              <div className="h-4 w-[90%] bg-gray-200 rounded"></div>
              <div className="h-4 w-[85%] bg-gray-200 rounded"></div>
              <div className="h-4 w-[80%] bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Bullet List Shimmer */}
          <ul className="grid grid-cols-2 gap-y-3 text-sm text-gray-400 list-none">
            {[...Array(6)].map((_, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-3 h-3 bg-gray-300 rounded-full inline-block"></span>
                <div className="h-3 w-24 bg-gray-300 rounded"></div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Image */}
        <div className="w-full h-72 md:h-96 lg:h-[350px] max-w-lg mx-auto bg-gray-200 rounded shadow-md"></div>
      </div>

      {/* Working and Thriving Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-25 items-center max-w-6xl mx-auto mb-20 md:mt-40">
        {/* Left Image */}
        <div className="w-full h-72 md:h-96 lg:h-[350px] max-w-lg bg-gray-200 rounded shadow-md"></div>

        {/* Right Text Content */}
        <div className="space-y-4">
          <div className="h-6 md:h-8 w-64 bg-gray-300 rounded mb-2"></div>
          <div className="space-y-2">
            <div className="h-4 w-[95%] bg-gray-200 rounded"></div>
            <div className="h-4 w-[90%] bg-gray-200 rounded"></div>
            <div className="h-4 w-[85%] bg-gray-200 rounded"></div>
          </div>

          {/* Benefits List */}
          <div className="flex flex-col gap-4 text-lg mt-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 w-[80%] bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImaginationsLeadsShimmer;
