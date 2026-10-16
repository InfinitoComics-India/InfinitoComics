import React, { useState, useEffect } from "react";
import FoundationSectionShimmer from "../../shimmer/landingPageShimmer/FoundationSectionShimmer";
import foundationBg from "../../../assets/Images/Foundation/foundationbg.png";

const FoundationSection = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <FoundationSectionShimmer />;
  }

  return (
   <section className="w-full bg-white py-6 sm:py-10 md:py-12">
      {/* Section Heading */}
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 mb-4 sm:mb-6">
        <h2 className="uppercase tracking-widest font-bold text-black text-base sm:text-lg md:text-xl">
          Supporting the Real Heroes
        </h2>
      </div>

      {/* Foundation Banner */}
      <div
        className="relative w-full min-h-[290px] sm:min-h-[350px] md:min-h-[410px] bg-cover bg-[position:75%_center] sm:bg-center bg-no-repeat overflow-hidden"
        style={{
          backgroundImage: `url(${foundationBg})`,
        }}
      >
        {/* Responsive readable overlay for mobile */}
        <div className="absolute inset-0 bg-white/65 sm:bg-white/20 md:bg-white/5 backdrop-blur-[1px] sm:backdrop-blur-none" />

        {/* Text Content */}
        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 min-h-[290px] sm:min-h-[350px] md:min-h-[410px] flex items-center">
          <div className="w-full md:w-1/2 py-6 sm:py-10">
            {/* Foundation Heading */}
            <h1 className="inline-flex flex-wrap items-center mb-4 sm:mb-5 text-white font-bold uppercase leading-none gap-1 sm:gap-0">
              <span className="bg-red-600 px-2 py-1 text-lg sm:text-2xl md:text-3xl tracking-wide">
                INFINITO®
              </span>

              <span className="bg-black px-2 py-1 text-lg sm:text-2xl md:text-3xl tracking-wide">
                FOUNDATION
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-[430px] text-xs sm:text-sm md:text-[15px] leading-relaxed text-gray-950 sm:text-gray-900 text-left mb-4 sm:mb-5 font-medium sm:font-normal">
              Initiatives focused on education, sports, research, skill
              development, and social welfare, the foundation supports young
              talent, encourages innovation, and helps individuals unlock their
              potential.
            </p>

            {/* Know More Button */}
            <a
              href="#foundation"
              className="inline-flex items-center justify-between gap-5 sm:gap-6 min-w-[140px] bg-red-600 hover:bg-red-700 text-white px-5 sm:px-7 py-2.5 sm:py-3 text-[11px] font-bold uppercase transition-colors duration-300 shadow-sm"
            >
              <span>Know More</span>
              <span className="text-sm">&gt;</span>
            </a>
          </div>
        </div>
      </div>

      {/* Advertisement Section */}
      <div className="w-full max-w-[1200px] mx-auto mt-6 sm:mt-10 md:mt-12 px-4 sm:px-6 md:px-12">
        <div className="w-full bg-gray-200 text-center py-6 sm:py-10 text-gray-700 font-bold text-sm sm:text-lg tracking-widest select-none">
          AD
        </div>
      </div>
    </section>
  );
};

export default FoundationSection;