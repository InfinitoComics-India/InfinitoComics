import React from "react";

const ArcheryAssociationShimmer = () => {
  return (
    <>
      {/* Top Section */}
      <div className="flex flex-col my-14 items-center animate-pulse px-4 sm:px-6 md:px-12">
        {/* Heading */}
        <div className="h-10 w-[340px] bg-gray-300 rounded mb-10" />

        {/* Logo */}
        <div className="w-[180px] h-[180px] bg-gray-200 rounded-full mb-10" />

        {/* Paragraph block */}
        <div className="w-full max-w-4xl space-y-3">
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-full" />
        </div>
      </div>

      {/* Grid of shimmer images */}
      <div className="flex justify-center px-4 sm:px-6 md:px-12 mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl w-full animate-pulse">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="w-full h-48 bg-gray-200 rounded shadow-sm"
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ArcheryAssociationShimmer;
