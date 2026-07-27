// src/shimmer/landingPageShimmer/CharacterCarouselShimmerLight.jsx

import React from "react";

const CharacterCarouselShimmerLight = () => {
  return (
    <div className="w-full px-4 py-8 sm:py-12 bg-white">
      <div className="max-w-full mx-4 sm:mx-8 lg:mx-20 xl:mx-40">
        
        {/* Title & View All Placeholder */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-10 gap-4">
          <div className="h-6 sm:h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
        </div>

        {/* Carousel Placeholder */}
        <div className="relative">
          {/* Prev Button Placeholder */}
          <div className="absolute left-2 sm:-left-4 lg:-left-8 top-1/2 transform -translate-y-1/2 z-20">
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 animate-pulse rounded-full"></div>
          </div>

          {/* Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 px-2 sm:px-4 md:px-6">
            {Array(4)
              .fill(0)
              .map((_, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-between h-[260px] sm:h-[320px] md:h-[380px] w-full mx-auto"
                >
                  {/* Image Placeholder */}
                  <div className="h-[160px] sm:h-[200px] md:h-[280px] w-full bg-gray-200 animate-pulse rounded"></div>

                  {/* Name Placeholder */}
                  <div className="bg-gray-100 w-full text-center py-2 sm:py-3">
                    <div className="h-4 sm:h-5 w-3/4 mx-auto bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
              ))}
          </div>

          {/* Next Button Placeholder */}
          <div className="absolute right-2 sm:-right-4 lg:-right-8 top-1/2 transform -translate-y-1/2 z-20">
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 animate-pulse rounded-full"></div>
          </div>
        </div>

        {/* Pagination Dots Placeholder */}
        <div className="flex justify-center mt-6 gap-2">
          {Array(4)
            .fill(0)
            .map((_, idx) => (
              <div
                key={idx}
                className="w-4 h-2 bg-gray-200 animate-pulse rounded-full"
              ></div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CharacterCarouselShimmerLight;
