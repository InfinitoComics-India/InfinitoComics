import React from "react";

const ExclusiveContentShimmer = () => {
  return (
    <div className="flex flex-col w-full min-h-[500px] gap-5 px-4 md:px-8 lg:px-0">
      {/* Title shimmer */}
      <div className="mx-4 sm:mx-8 md:mx-40 lg:mx-60 mt-5">
        <div className="h-6 w-80 bg-gray-300 rounded animate-pulse mx-auto lg:mx-0" />
      </div>

      {/* Content shimmer section */}
      <div className="flex flex-col lg:flex-row justify-around w-full min-h-[450px]">
        {/* Left shimmer image block */}
        <div className="w-full lg:w-[45%] lg:ml-40">
          <div className="m-4 sm:m-8 md:m-12 lg:m-16">
            <div className="w-full h-[300px] sm:h-[400px] bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Right shimmer block */}
        <div className="w-full lg:w-[45%] px-4 sm:px-8 lg:px-0">
          <div className="flex flex-col items-center lg:items-start justify-start lg:w-[50%] gap-6 my-8 lg:my-40">
            {/* Text paragraph shimmer */}
            <div className="space-y-3 w-full">
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-4/5 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Store buttons shimmer */}
            <div className="flex flex-col sm:flex-row gap-5 items-center">
              <div className="flex flex-row sm:flex-col gap-4">
                <div className="w-40 h-10 bg-gray-300 rounded-full animate-pulse" />
                <div className="w-40 h-10 bg-gray-300 rounded-full animate-pulse" />
              </div>

              {/* QR code shimmer */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] bg-gray-300 rounded animate-pulse" />
                <div className="w-[100px] h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExclusiveContentShimmer;
