import React from "react";

const PaperCardShimmer = () => {
  return (
    <div className="bg-white p-7 mb-6 w-full animate-pulse rounded">
      {/* Title */}
      <div className="h-6 w-3/4 bg-gray-300 rounded mb-3" />

      {/* Journal Name */}
      <div className="h-5 w-1/3 bg-gray-100 rounded mb-2" />

      {/* Authors */}
      <div className="h-4 w-2/3 bg-gray-200 rounded mb-4" />

      {/* Abstract */}
      <div className="border-l-4 border-l-gray-200 pl-2 mt-4 space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-[90%] bg-gray-200 rounded" />
      </div>

      {/* Footer: Date + Button */}
      <div className="flex justify-between items-center mt-6">
        <div className="h-4 w-24 bg-gray-200 " />
        <div className="h-[42px] w-[150px] bg-gray-300 " />
      </div>
    </div>
  );
};

export default PaperCardShimmer;
