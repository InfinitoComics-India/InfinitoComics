import React from 'react';

const BrowseSectionShimmer = () => {
  return (
    <div className="w-full border-b border-[#B5B5B5] mt-4 animate-pulse">
      {/* Heading shimmer */}
      <div className="h-8 w-64 bg-gray-200 rounded mb-3"></div>

      {/* Category buttons shimmer */}
      <div className="flex space-x-6 mt-10 gap-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-6 w-20 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );
};

export default BrowseSectionShimmer;
