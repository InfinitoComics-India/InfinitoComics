import React from "react";

const FoundationSectionShimmer = () => {
  return (
    <section className="w-full bg-white py-16">
      {/* Top Heading */}
      <div className="max-w-6xl mx-auto mb-9 px-4">
        <div className="h-5 w-64 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Black Text Block + Archery Image */}
      <div className="relative flex flex-col md:flex-row items-center md:items-stretch">
        {/* Left White Background with Grey Shimmer Text */}
        <div className="flex flex-col md:flex-row w-full mx-auto bg-white border border-gray-300 overflow-hidden md:h-80 relative z-10">
          <div className="px-8 md:p-12 flex flex-col justify-center w-full md:w-1/2">
            {/* Logo Placeholder */}
            <div className="w-40 h-10 bg-gray-300 rounded animate-pulse mb-4"></div>

            {/* Text Shimmer Lines */}
            <div className="space-y-3 mb-6">
              <div className="w-3/4 h-4 bg-gray-300 rounded animate-pulse"></div>
              <div className="w-2/3 h-4 bg-gray-300 rounded animate-pulse"></div>
              <div className="w-4/5 h-4 bg-gray-300 rounded animate-pulse"></div>
            </div>

            {/* CTA Link Shimmer */}
            <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Image Block on Right */}
        <div className="w-full md:w-auto md:absolute md:top-[-40px] md:right-[190px] max-w-[420px] z-20">
          <div className="w-full h-[400px] bg-gray-200 rounded shadow-xl animate-pulse"></div>
        </div>
      </div>

      {/* AD Banner Placeholder */}
      <div className="mt-20 bg-gray-100 text-center py-10 text-black font-bold text-lg tracking-widest">
        <div className="w-20 h-4 mx-auto bg-gray-300 rounded animate-pulse"></div>
      </div>
    </section>
  );
};

export default FoundationSectionShimmer;
