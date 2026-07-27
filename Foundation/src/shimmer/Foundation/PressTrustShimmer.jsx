import React from "react";

const PressTrustShimmer = () => {
  return (
    <div className="animate-pulse w-full">
      {/* Heading */}
      <div className="text-center mt-10">
        <div className="h-10 w-[360px] bg-gray-300 rounded mx-auto" />
      </div>

      {/* PTI Logo */}
      <div className="flex justify-center items-center w-full h-full mt-10 mb-10">
        <div className="w-[220px] h-[180px] bg-gray-200 rounded-md" />
      </div>

      {/* Paragraph Section */}
      <div className="mx-auto w-full max-w-[80rem] p-4 space-y-6">
        {/* Paragraph 1 */}
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-300 rounded" />
          <div className="h-4 w-full bg-gray-300 rounded" />
          <div className="h-4 w-full bg-gray-300 rounded" />
          <div className="h-4 w-full bg-gray-300 rounded" />
          <div className="h-4 w-full bg-gray-300 rounded" />
        </div>

        {/* Spacer between paragraphs */}
        <div className="h-3" />

        {/* Paragraph 2 */}
        <div className="space-y-3">
            <div className="h-4 w-full bg-gray-300 rounded" />
            <div className="h-4 w-full bg-gray-300 rounded" />
            <div className="h-4 w-full bg-gray-300 rounded" />
            <div className="h-4 w-full bg-gray-300 rounded" />
            <div className="h-4 w-full bg-gray-300 rounded" />
        </div>

        {/* Group Image */}
        <div className="flex justify-center items-center w-full h-full mt-20">
          <div className="w-full max-w-5xl h-[400px] bg-gray-200 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default PressTrustShimmer;
