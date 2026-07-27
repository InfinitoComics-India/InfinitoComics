// 📁 src/components/JoinUltimateShimmer.jsx
import React from 'react';

const JoinUltimateShimmer = () => {
  return (
    <div className='w-full min-h-[500px] flex flex-col md:flex-row justify-between items-center bg-gray-100 px-4 mt-8 animate-pulse'>
      {/* 🔹 Left Section: Character Image Shimmer */}
      <div className='w-full md:w-[40%] h-[300px] md:h-[500px] bg-gray-300 rounded'></div>

      {/* 🔹 Right Section: Text Content Shimmer */}
      <div className='w-full md:w-[50%] h-full flex flex-col justify-center text-center md:text-left mt-6 md:mt-0'>
        <div className='h-8 sm:h-10 md:h-12 w-3/4 bg-gray-300 rounded mb-4 mx-auto md:mx-0'></div>

        <div className='space-y-2 px-3'>
          <div className='h-4 w-full bg-gray-200 rounded'></div>
          <div className='h-4 w-5/6 bg-gray-200 rounded'></div>
          <div className='h-4 w-4/6 bg-gray-200 rounded'></div>
        </div>

        <div className='flex justify-center md:justify-start mt-6'>
          <div className='w-[120px] h-[48px] bg-gray-300 rounded'></div>
        </div>
      </div>
    </div>
  );
};

export default JoinUltimateShimmer;
