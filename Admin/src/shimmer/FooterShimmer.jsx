import React from 'react';

const FooterShimmer = () => {
  return (
    <footer className="bg-gray-100 text-gray-800 px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Logo + Description Block */}
        <div className="px-4">
          <div className="w-44 mx-auto">
            <div className="w-full h-12 bg-gray-300 rounded animate-pulse mb-2" />
            <div className="h-3 w-36 bg-gray-300 rounded animate-pulse mx-auto mb-4" />
            <div className="h-16 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Links Block */}
        <div className="flex flex-wrap gap-6 text-sm">
          {[1, 2].map((col, i) => (
            <div key={i} className="flex flex-col space-y-4">
              <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
              {[1, 2].map((_, j) => (
                <div key={j} className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>

        {/* Social + CTA Block */}
        <div className="px-4">
          <div className="flex flex-col items-start gap-4 w-full max-w-[240px]">

            {/* Social icons shimmer */}
            <div className="flex flex-wrap gap-2">
              {Array(6).fill().map((_, idx) => (
                <div key={idx} className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
              ))}
            </div>

            {/* Text with small logo shimmer */}
            <div className="flex items-center gap-2 px-3 py-2 w-full">
              <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse" />
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Join button shimmer */}
            <div className="w-full h-10 bg-gray-300 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Footer bottom row shimmer */}
      <div className="border-t border-gray-300 mt-10 pt-6 text-xs text-gray-400 text-center">
        <div className="flex flex-wrap justify-center gap-4 mb-2">
          {Array(6).fill().map((_, idx) => (
            <div key={idx} className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default FooterShimmer;
