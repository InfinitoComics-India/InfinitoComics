import React from "react";

const CollaborationShimmer = () => {
  return (
    <>
      {/* Heading shimmer */}
      <div className="my-6 animate-pulse">
        <div>
          <div className="h-10 w-2/3 mx-auto bg-gray-300 rounded"></div>
        </div>
        <div className="mt-12">
          <div className="h-8 w-1/2 mx-auto bg-gray-200 rounded"></div>
        </div>

        {/* Paragraph shimmer */}
        <div className="mx-80 p-4 my-2 space-y-6 max-[1024px]:mx-20 max-[768px]:mx-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-5 bg-gray-200 rounded w-full"></div>
          ))}
        </div>

        {/* Image grid shimmer */}
        <div className="flex justify-center p-1 m-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-[500px] h-48 bg-gray-300 rounded shadow-sm max-w-full"
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact shimmer */}
      <div className="mt-30 mb-10 animate-pulse">
        <div className="h-10 w-1/5 mx-auto bg-gray-300 rounded mb-4"></div>
        <div className="h-6 w-1/3 mx-auto bg-gray-200 rounded"></div>
      </div>
    </>
  );
};

export default CollaborationShimmer;
