import React from "react";
// Import the downloaded video file
import adsHeroVideo from "../../../../assets/Videos/hero.mp4";

export default function AdsHero() {
  return (
    <section className="relative w-full bg-[#fdfaf5] py-12 sm:py-20 lg:py-28 px-4 sm:px-8 md:px-12 overflow-hidden min-h-[460px] lg:min-h-[560px] flex items-center">
      {/* Background Animated Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center md:object-right pointer-events-none"
      >
        <source src={adsHeroVideo} type="video/mp4" />
      </video>

      {/* Responsive overlay: tinted on mobile for crisp text legibility, gradient on desktop */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none z-[1]" />

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="w-full max-w-[1200px] mx-auto px-0 sm:px-4 md:px-6">
          <span className="text-amber-500 font-extrabold tracking-widest text-xs sm:text-sm uppercase block mb-2 sm:mb-3">
            BRANDS BELONG HERE
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase text-black leading-[1.1] mb-3 sm:mb-4 tracking-tight">
            ADVERTISE <br /> WITH US
          </h1>
          <p className="text-black text-base sm:text-xl font-bold mb-2 sm:mb-3">
            Your brand. Your characters. Infinite possibilities.
          </p>
          <p className="text-gray-800 text-xs sm:text-base max-w-xl mb-6 sm:mb-8 leading-relaxed font-normal">
            Bring your product or service into the world of Infinito Comics. The industry is evolving, and we create powerful brand experiences that people actually enjoy.
          </p>
          <a
            href="#contact-form"
            className="w-full sm:w-auto text-center inline-block bg-[#d01824] hover:bg-[#b0131d] text-white font-bold text-xs sm:text-sm tracking-wider uppercase px-7 py-3 sm:px-8 sm:py-3.5 transition-colors shadow-md rounded-xs"
          >
            PARTNER WITH INFINITO
          </a>
        </div>
      </div>
    </section>
  );
}