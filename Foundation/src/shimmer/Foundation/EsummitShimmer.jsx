import React from 'react';

const EsummitShimmer = () => {
  return (
    <div className="animate-pulse w-full">
      {/* Heading */}
      <div className="mb-16 mt-10 text-center">
        <div className="h-10 w-[300px] bg-gray-300 rounded mx-auto mb-2" />
        <div className="h-10 w-[320px] bg-gray-200 rounded mx-auto" />
      </div>

      {/* Paragraphs */}
      <div className="mx-auto w-full max-w-[80rem] p-4 space-y-6">
        {/* Paragraph 1 */}
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-300 rounded" />
          <div className="h-4 w-full bg-gray-300 rounded" />
          <div className="h-4 w-full bg-gray-300 rounded" />
          <div className="h-4 w-full bg-gray-300 rounded" />
          <div className="h-4 w-full bg-gray-300 rounded" />
        </div>

        {/* Paragraph 2 */}
        <div className="space-y-3 pt-6">
          <div className="h-4 w-full bg-gray-300 rounded" />
          <div className="h-4 w-full bg-gray-300 rounded" />
          <div className="h-4 w-full bg-gray-300 rounded" />
          <div className="h-4 w-full bg-gray-300 rounded" />
        </div>
      </div>

      {/* 4-image Grid */}
      <div className="flex justify-center p-1 m-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl w-full">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="w-full h-48 bg-gray-200 rounded shadow-sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EsummitShimmer;
