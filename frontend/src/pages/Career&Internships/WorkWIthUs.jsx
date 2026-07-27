import React, { useState, useEffect } from "react";
import WorkWithUsShimmer from '../../shimmer/Career/WorkWIthUsShimmer'
import careerUrls from '../../utils/imagesUrls/carrerUrls.js';

const WorkWIthUs = () => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      setTimeout(() => setLoading(false), 2400); 
    }, []);
  return loading?<WorkWithUsShimmer/>: (
    // Outer container with background image and center alignment
    <div
      className="w-full min-h-[600px] flex items-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)]"
      style={{
        backgroundImage: `url(${careerUrls.BANNER_URL})`, // Background banner image
        backgroundSize: 'cover',           // Cover entire div
        backgroundPosition: 'center',      // Center the image
      }}
    >
      {/* Content container */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-20 py-10 rounded-lg max-w-xl bg-opacity-80">
        {/* Small top label */}
        <p className="mb-4 text-white font-semibold text-sm sm:text-base">
          CAREERS AT INFINITO
        </p>

        {/* Main heading */}
        <h1 className="font-sans font-bold text-3xl sm:text-4xl text-red-600 tracking-tight mb-6 scale-y-110">
          WORK WITH US
        </h1>

        {/* Description paragraph */}
        <p className="text-white text-base sm:text-lg mb-6 leading-relaxed tracking-wide">
          Explore remote-friendly, flexible opportunities and join our mission
          to make work life simpler, more pleasant and more productive.
        </p>

        {/* CTA Button */}
        <button className="py-3 px-6 sm:py-4 sm:px-8 bg-red-700 text-white text-xs sm:text-sm tracking-[3px] sm:tracking-[4px] mb-6">
          VIEW CAREERS
        </button>

        {/* Internship link */}
        <div>
          <a href="#" className="text-blue-800 underline text-sm sm:text-base">
            Looking for internships?
          </a>
        </div>
      </div>
    </div>
  );
};

export default WorkWIthUs;
