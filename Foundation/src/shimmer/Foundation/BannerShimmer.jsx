import React from 'react';

const BannerShimmer = () => {
  return (
    <div className="w-full min-h-[600px] relative">
      {/* Background shimmer (image placeholder) */}
      <div className="w-full h-[600px] bg-gray-200 animate-pulse object-cover object-center" />

      {/* Two shimmer lines centered over the image */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 space-y-4 text-center px-4 w-full max-w-xl">
        <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto animate-pulse" />
        <div className="h-6 bg-gray-300 rounded w-2/5 mx-auto animate-pulse" />
      </div>
    </div>
  );
};

export default BannerShimmer;
