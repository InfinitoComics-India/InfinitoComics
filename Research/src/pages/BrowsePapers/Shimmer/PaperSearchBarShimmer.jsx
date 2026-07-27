import React from 'react';

const PaperSearchBarShimmer = () => {
  return (
    <div className="w-full bg-gray-100 flex justify-between animate-pulse">
      <div className="flex flex-col py-6">
        {/* Shimmer Title */}
        <div className="h-8 w-64 bg-gray-200 rounded mb-6"></div>

        <div className="flex items-end gap-20 flex-wrap">
          {/* Input shimmer block 1 */}
          <div className="flex flex-col w-[320px] space-y-2">
            <div className="h-4 w-40 bg-gray-200 rounded"></div>
            <div className="h-9 w-full bg-white rounded-sm"></div>
          </div>

          {/* Input shimmer block 2 */}
          <div className="flex flex-col w-[320px] space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-9 w-full bg-white rounded-sm"></div>
          </div>

          {/* Input shimmer block 3 */}
          <div className="flex flex-col w-[320px] space-y-2">
            <div className="h-4 w-28 bg-gray-200 rounded"></div>
            <div className="h-9 w-full bg-white rounded-sm"></div>
          </div>

          {/* Optional Button shimmer */}
          {/* <div className="h-9 w-[150px] bg-gray-300 rounded"></div> */}
        </div>
      </div>
    </div>
  );
};

export default PaperSearchBarShimmer;
