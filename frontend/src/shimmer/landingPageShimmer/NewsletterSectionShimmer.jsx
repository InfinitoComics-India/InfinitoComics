import React from 'react';

const NewsletterSectionShimmer = () => {
  return (
    <div className="w-full bg-gray-100 bg-opacity-60 flex flex-col md:flex-row items-center justify-between px-12 md:px-76 py-12 md:py-20">
      {/* Content wrapper */}
      <div className="w-full mt-14 md:mt-24 mx-4 md:mx-40">
        {/* Heading shimmer */}
        <div className="h-8 w-64 bg-gray-300 rounded animate-pulse mb-4" />

        {/* Paragraph shimmer */}
        <div className="h-5 w-80 bg-gray-200 rounded animate-pulse mb-6" />

        {/* Form shimmer */}
        <div className="flex w-full max-w-md">
          {/* Email input shimmer */}
          <div className="flex-grow h-12 bg-gray-300 rounded-l-md animate-pulse" />
          {/* Button shimmer */}
          <div className="w-32 h-12 bg-gray-400 rounded-r-md animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default NewsletterSectionShimmer;
