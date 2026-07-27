import React from "react";

const TedXShimmer = () => {
  return (
    <div className="animate-pulse w-full">
      {/* Top Section Heading */}
      <div className="mb-16 mt-10 text-center">
        <div className="h-10 w-[420px] bg-gray-300 rounded mx-auto" />
      </div>

      {/* TEDx Text */}
      <div className="text-center mb-16">
        <div className="h-20 w-[200px] bg-gray-300 rounded mx-auto" />
      </div>

      {/* Paragraph Content */}
      <div className="mx-auto w-full max-w-[80rem] p-4 space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2 mx-5">
            <div className="h-4 w-full bg-gray-300 rounded" />
            <div className="h-4 w-[94%] bg-gray-300 rounded" />
            <div className="h-4 w-[85%] bg-gray-300 rounded" />
          </div>
        ))}
      </div>

      {/* 4-Image Grid */}
      <div className="flex justify-center p-1 m-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl w-full">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="w-full h-48 bg-gray-200 rounded shadow-sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TedXShimmer;
