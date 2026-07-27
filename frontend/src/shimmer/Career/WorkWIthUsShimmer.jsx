import React from 'react';

const WorkWithUsShimmer = () => {
  return (
    <div
      className="w-full min-h-[600px] flex items-center bg-gray-100 animate-pulse shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]"
      style={{
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="px-4 sm:px-6 md:px-10 lg:px-20 py-10 rounded-lg max-w-xl">
        {/* Shimmer for Top Label */}
        <div className="mb-4 h-4 sm:h-5 w-40 bg-gray-300 rounded"></div>

        {/* Shimmer for Main Heading */}
        <div className="h-8 sm:h-10 w-60 bg-gray-300 rounded mb-6"></div>

        {/* Shimmer for Description */}
        <div className="space-y-3 mb-6">
          <div className="h-4 sm:h-5 bg-gray-300 rounded w-full"></div>
          <div className="h-4 sm:h-5 bg-gray-300 rounded w-11/12"></div>
          <div className="h-4 sm:h-5 bg-gray-300 rounded w-10/12"></div>
        </div>

        {/* Shimmer for Button */}
        <div className="h-10 sm:h-12 w-40 sm:w-48 bg-gray-300 rounded mb-6"></div>

        {/* Shimmer for Link */}
        <div className="h-4 sm:h-5 w-48 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};

export default WorkWithUsShimmer;
