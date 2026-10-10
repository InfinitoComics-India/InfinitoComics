import React from "react";
// Import the downloaded video file
import adsHeroVideo from "../../../../assets/Videos/hero.mp4";

export default function AdsHero() {
  return (
    <section className="relative w-full bg-[#fdfaf5] py-16 sm:py-24 lg:py-28 px-6 sm:px-12 md:px-20 overflow-hidden min-h-[480px] lg:min-h-[560px] flex items-center">
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

      {/* Soft gradient on the left so black text maintains crisp contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#fdfaf5] via-[#fdfaf5]/70 to-transparent md:w-3/5 pointer-events-none z-[1]" />

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="w-full max-w-[1200px] mx-auto px-12">
          <span className="text-amber-500 font-extrabold tracking-widest text-xs sm:text-sm uppercase block mb-3">
            BRANDS BELONG HERE
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-black leading-tight mb-4 tracking-tight">
            ADVERTISE <br /> WITH US
          </h1>
          <p className="text-black text-lg sm:text-xl font-bold mb-3">
            Your brand. Your characters. Infinite possibilities.
          </p>
          <p className="text-gray-800 text-sm sm:text-base max-w-xl mb-8 leading-relaxed font-normal">
            Bring your product or service into the world of Infinito Comics. The industry is evolving, and we create powerful brand experiences that people actually enjoy.
          </p>
          <a
            href="#contact-form"
            className="inline-block bg-[#d01824] hover:bg-[#b0131d] text-white font-bold text-xs sm:text-sm tracking-wider uppercase px-8 py-3.5 transition-colors shadow-md rounded-xs"
          >
            PARTNER WITH INFINITO
          </a>
        </div>
      </div>
    </section>
  );
}