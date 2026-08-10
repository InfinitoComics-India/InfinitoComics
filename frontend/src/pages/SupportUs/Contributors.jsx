import React from 'react';
import contributorNames from '../../constants/contributorNames.js';

function Contributors() {
  // Show only 10 names (2 rows of 5)
  const visibleNames = contributorNames.slice(0, 10);

  return (
    <div className="flex justify-center items-center">
      <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-12 py-16 text-gray-800">

        {/* Heading — same style as DonationUtilization */}
        <div className="text-start lg:text-center mb-12">
          <h2 className="text-2xl md:text-[1.9rem] font-bold tracking-widest md:mb-1 lg:mb-2">
            OUR CONTRIBUTORS
          </h2>
          <p className="text-md md:text-xl font-medium text-gray-700 uppercase tracking-widest">
            The People Who Made It Possible
          </p>
        </div>

        {/* 5-per-row grid, 2 rows = 10 names */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-6 gap-x-4 text-center">
          {visibleNames.map((name, index) => (
            <div
              key={index}
              className="text-sm md:text-base text-black font-medium hover:text-red-600 transition-colors duration-200 cursor-default"
            >
              {name}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Contributors;

