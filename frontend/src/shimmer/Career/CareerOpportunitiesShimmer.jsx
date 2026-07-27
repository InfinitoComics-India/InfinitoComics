import React from "react";

const CareerOpportunitiesShimmer = () => {
  return (
    <div className="w-full py-8 animate-pulse">
      {/* Page Header Section */}
      <div className="flex flex-col justify-center bg-gray-100 h-70 w-full items-center px-4 sm:px-8">
        <div className="h-8 w-48 sm:w-72 bg-gray-300 rounded mb-4"></div>
        <div className="h-4 w-72 sm:w-[400px] bg-gray-200 rounded mb-10"></div>
      </div>

      {/* Application Section - Main Wrapper */}
      <div className="bg-white mx-4 sm:mx-10 md:mx-20 lg:mx-40 xl:mx-60 -mt-12">
        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center p-5 rounded mb-8 mx-4 sm:mx-10 md:mx-20 gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
            <div className="h-4 w-20 bg-gray-300 rounded"></div>
            <div className="h-10 w-[180px] bg-gray-200 rounded"></div>
            <div className="h-10 w-[180px] bg-gray-200 rounded"></div>
          </div>
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
        </div>

        {/* Department Block Shimmers (repeat as placeholder) */}
        {[...Array(2)].map((_, deptIdx) => (
          <div
            key={deptIdx}
            className="mb-10 mx-4 sm:mx-10 md:mx-20 lg:mx-40"
          >
            {/* Department Label */}
            <div className="border-t relative mb-3">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-300 text-white px-4 py-2 text-sm font-bold rounded w-32 h-6"></span>
            </div>

            {/* Jobs under department */}
            <div className="flex flex-col gap-4 mx-2 my-16">
              {[...Array(3)].map((_, jobIdx) => (
                <div
                  key={jobIdx}
                  className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-start sm:items-center px-4 md:px-10 my-2"
                >
                  <div className="h-4 w-full sm:w-64 bg-gray-200 rounded"></div>
                  <div className="h-4 w-full sm:w-40 bg-gray-200 rounded"></div>
                  <div className="h-4 w-full sm:w-32 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerOpportunitiesShimmer;
