import React from 'react';
import belowImage from "../../../assets/Images/Ultimate/Botton.png";
import universetext from "../../../assets/Images/Ultimate/universeText.png";

// Import the new banner image - save your banner as this filename
import heroBanner from "../../../assets/Images/Ultimate/ultimateBanner.png";

const Home = () => {
  return (
    <div className="w-full text-white">

      {/* Desktop View - Full Width Banner */}
      <div className="relative w-full hidden md:block">
        {/* Banner Image */}
        <img
          src={heroBanner}
          alt="Infinito Ultimate"
          className="w-full h-auto object-cover"
        />
        
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Text Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-12">
          <div className="max-w-4xl">
            <img src={universetext} alt="A Universe of Stories Unlocked" className='mb-3 max-w-md' />
            <p className="mt-4 max-w-xl text-lg md:text-xl">
              Welcome to Infinito Ultimate — your all-access pass to India's first multiverse comic subscription.
            </p>
            <button className="mt-8 h-14 w-64 bg-[#DD1215] hover:bg-red-600 text-white font-semibold py-2 px-4 transition duration-300">
              TRY INFINITO ULTIMATE
            </button>
            <p className="mt-6 text-lg">
              Already a subscriber? <span className="underline cursor-pointer hover:text-[#DD1215]">Start reading!</span>
            </p>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden w-full">
        <div className="relative w-full">
          {/* Banner Image */}
          <img
            src={heroBanner}
            alt="Infinito Ultimate"
            className="w-full h-auto object-cover"
          />
          
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          
          {/* Mobile Text Content */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 text-left">
            <h2 className="text-2xl font-bold mb-1">A UNIVERSE OF STORIES.</h2>
            <h3 className="text-[#DD1215] text-2xl font-bold mb-4">UNLOCKED.</h3>
            <p className="text-base mb-5">
              Welcome to Infinito Ultimate — your all-access pass to India's first multiverse comic subscription.
            </p>
            <button className="w-2/3 bg-[#DD1215] text-sm hover:bg-red-600 h-10 text-white font-semibold transition duration-300">
              TRY INFINITO ULTIMATE
            </button>
            <p className="mt-4 text-base">
              Already a subscriber? <span className="underline">Start reading!</span>
            </p>
          </div>
        </div>
      </div>

      {/* Below Image with Shadow */}
      <div className="relative w-full -mt-1">
        <div className="absolute -top-16 w-full h-16 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
        <img src={belowImage} alt="Below Carousel" className="w-full object-cover relative z-0" />
      </div>

    </div>
  );
};

export default Home;
