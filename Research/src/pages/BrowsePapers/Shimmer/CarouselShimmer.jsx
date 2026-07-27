import React from 'react'

const CarouselShimmer = () => {
  return (
  <div className="bg-gray-100 w-full flex justify-center items-start">
    <div className="relative w-full h-[380px] bg-white mt-28 mb-12 text-white flex items-center justify-center">
      {/* Left shimmer section */}
      <div className="w-2/3 pt-32 px-12 space-y-5 animate-pulse">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-10 w-44 bg-gray-200" />
          <div className="h-10 w-44 bg-gray-200" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-3/5 bg-gray-200 rounded" />
          <div className="h-3 w-1/2 bg-gray-200 rounded" />
        </div>

        {/* Carousel indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="w-4 h-1 bg-gray-400 rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Right shimmer card */}
      <div className="absolute right-70 w-[450px] h-[452px] z-50 mb-6 bg-white text-black shadow-xl py-16 px-10 animate-pulse rounded-2xl">
        <div className="h-8 w-3/4 bg-gray-300 rounded mb-4" />
        <div className="h-5 w-1/2 bg-gray-300 rounded mb-4" />
        <div className="space-y-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-3 w-full bg-gray-200 rounded" />
          ))}
        </div>
        <div className="h-[42px] w-[150px] bg-gray-300" />
      </div>
    </div>
  </div>
  )
}

export default CarouselShimmer;
