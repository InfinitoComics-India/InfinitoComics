import React from 'react';
import image from '../../../assets/Images/quick-vision.png'; // 🔹 Background image for the spotlight section

const Hero = () => {
  return (
    // Main container with background image and overlay
    <div
      className="w-full min-h-[600px] md:min-h-[550px] bg-black text-white relative overflow-hidden bg-cover bg-no-repeat bg-center my-10"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/*  Black semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/*  Content wrapper: Flex column on mobile, row on medium screens and above */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-between mx-[10%] px-6 py-12 md:py-20 gap-8 relative z-10">
        
        {/*  Left Section: Text Content */}
        <div className="md:w-1/2 text-center md:text-left mt-8 md:mt-16">
          {/*  Label */}
          <p className="uppercase text-md font-bold tracking-widest text-white mb-2">
            VOTE FOR YOUR
          </p>

          {/*  Character Name */}
          <h1 className="text-4xl md:text-5xl font-bold text-purple-400 mb-4 tracking-widest">
            HERO OF THE WEEK
          </h1>

          {/*  Description Text */}
          <p className="text-white mb-6 w-3/4 md:w-2/3 mx-auto md:mx-0">
            Our weekly polls ar back! Ready to find out which hero wins this one?
          </p>

          {/*  CTA Button */}
          <button className="border border-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-white hover:text-black transition-all">
           VOTE NOW ›
          </button>
        </div>

        {/* Right section for image is embedded as background, no additional div needed here */}
      </div>
    </div>
  );
};

export default Hero;
