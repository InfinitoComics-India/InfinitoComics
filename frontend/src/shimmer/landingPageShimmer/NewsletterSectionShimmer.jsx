import React from 'react';

const NewsletterSectionShimmer = () => {
  return (
    <div className="w-full bg-[#0e0714] flex items-center min-h-[260px] md:min-h-[340px] px-6 sm:px-12 md:px-16 lg:px-24 py-10 md:py-14">
      {/* Content wrapper */}
      <div className="w-full max-w-lg">
        {/* Heading shimmer */}
        <div className="h-10 sm:h-12 w-64 sm:w-80 bg-white/10 rounded mb-3 animate-pulse" />

        {/* Paragraph shimmer */}
        <div className="h-4 sm:h-5 w-72 sm:w-96 bg-white/10 rounded mb-6 animate-pulse" />

        {/* Form shimmer */}
        <div className="flex w-full max-w-md shadow-lg">
          {/* Email input shimmer */}
          <div className="flex-grow h-11 bg-white/20 animate-pulse" />
          {/* Button shimmer */}
          <div className="w-28 sm:w-32 h-11 bg-red-600/40 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default NewsletterSectionShimmer;
