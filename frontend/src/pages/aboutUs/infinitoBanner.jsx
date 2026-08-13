import React from 'react';
import banner from '../../../assets/Images/aboutUs/banner.png';
import bottom from '../../../assets/Images/aboutUs/Bottom.png';

const InfinitoBanner = () => {
  return (
    <>
      <div
        className="relative w-full bg-cover bg-center min-h-[50vh] sm:min-h-[55vh] md:min-h-[60vh] flex items-center justify-center px-4 md:px-8 py-16 sm:py-20 md:py-24"
        style={{
          backgroundImage: `url(${banner})`,
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/65 z-0" />

        {/* Centered Text Content */}
        <div className="relative z-10 w-full max-w-[1200px] text-center text-white space-y-6 px-4">
          {/* Main Heading in Dharma Gothic E font */}
          <h1 className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-black tracking-widest text-[#E50914] uppercase font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif]">
            INFINITO COMICS
          </h1>

          {/* Subtitle Lines in DM Sans font */}
          <div className="space-y-4 text-gray-100 font-normal text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-5xl mx-auto font-dmsans">
            <p className="tracking-wide font-dmsans">
              India’s Most Prominent Character Based Entertainment Company With Library Of More Than 2500+ Superheroes. We Are<br className="hidden md:inline" />{' '}
              Committed To Bringing You The Best In Comics, Animation, Games And Merchandise.
            </p>

            <p className="tracking-wide pt-1 font-dmsans">
              Discover Our Passion, Expertise, And Mission To Revolutionize The World Of AVGC-XR!
            </p>
          </div>
        </div>
      </div>

      {/* Torn-Paper Bottom Transition */}
      <div
        className="w-full h-16 sm:h-24 md:h-28 bg-cover bg-center bg-no-repeat -mt-1 pointer-events-none"
        style={{
          backgroundImage: `url(${bottom})`,
        }}
      />
    </>
  );
};

export default InfinitoBanner;
