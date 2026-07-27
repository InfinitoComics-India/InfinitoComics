// 📁 src/components/CharacterSpotlightShimmer.jsx
import React from 'react';

const CharacterSpotlightShimmer = () => {
  return (
    <div className="w-full min-h-[600px] md:min-h-[550px] bg-[#f1f1f1] relative overflow-hidden animate-pulse">
      {/* Light semi-transparent overlay */}
      <div className="absolute inset-0 bg-white/50 z-0"></div>

      {/* Content Wrapper */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-between mx-[10%] px-6 py-12 md:py-20 gap-8 relative z-10">
        {/* Left Section */}
        <div className="md:w-1/2 text-center md:text-left mt-8 md:mt-16">
          <div className="w-40 h-4 bg-gray-300 rounded mb-4 mx-auto md:mx-0"></div>
          <div className="w-64 h-10 bg-gray-300 rounded mb-6 mx-auto md:mx-0"></div>
          <div className="w-3/4 md:w-2/3 h-4 bg-gray-300 rounded mb-2 mx-auto md:mx-0"></div>
          <div className="w-2/3 md:w-1/2 h-4 bg-gray-300 rounded mb-6 mx-auto md:mx-0"></div>
          <div className="w-36 h-10 bg-gray-300 rounded mx-auto md:mx-0"></div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSpotlightShimmer;