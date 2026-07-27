import React from 'react'
import banner from '../../../assets/Images/career/banner.png';
import bottom from '../../../assets/Images/Community/Bottom.png';

const Banner = () => {
  return (
    <div className='-mt-1'>
      {/* Main banner with background image */}
      <div
        className="
          w-full min-h-[600px]
          flex flex-col items-center
          justify-end sm:justify-end
          sm:pt-0 pt-[25%]  /* Push content down only on mobile to center vertically */
          shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)]
        "
        style={{
          backgroundImage: `url(${banner})`, // Background image for banner
          backgroundSize: 'cover',           // Make sure image covers the div
          backgroundPosition: 'center',      // Center the background image
        }}
      >
        {/* Text wrapper to center on mobile and stay at bottom on larger viewports */}
        <div className="flex flex-col items-center justify-center text-center w-full px-2 sm:px-0">
          
          {/* Welcome text with responsive font and margin */}
          <div className="text-white text-2xl sm:text-4xl font-semibold mb-2 sm:m-5">
            WELCOME TO THE
          </div>

          {/* Main heading */}
          <h1 className="font-sans font-extrabold text-2xl sm:text-4xl text-red-600 tracking-[0.2em] mb-8 sm:mb-16 scale-y-160">
            INFINITO COMMUNITY
          </h1>
        </div>
      </div>

      {/* Decorative bottom image */}
      <div
        className="w-full h-[100px] sm:h-30 -mt-1"
        style={{
          backgroundImage: `url(${bottom})`, // Bottom decorative image
          backgroundSize: 'cover',           // Cover fully
          backgroundPosition: 'center',      // Center the image
        }}
      >
        {/* Decorative div only */}
      </div>
    </div>
  )
}

export default Banner
