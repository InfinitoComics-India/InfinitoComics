import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JoinUltimateShimmer from "../../shimmer/landingPageShimmer/JoinUltimateShimmer";
import kitImage from "../../../assets/Images/kit/InfyKit.png";
import infinitoLogo from "../../../assets/Images/kit/logo.png";
const KitComponent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  return loading ? (
    <JoinUltimateShimmer />
  ) : (
    <div className="w-full bg-white py-6 sm:py-10 md:py-12">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 md:gap-10 lg:gap-12">
        {/* ── Left Column: Kit Image / Placeholder ── */}
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <div className="w-full max-w-[340px] sm:max-w-[420px] md:max-w-[460px] aspect-square bg-[#F7CDBA] rounded-lg overflow-hidden shadow-lg flex items-center justify-center relative border border-gray-200">
            {kitImage ? (
              <img
                src={kitImage}
                alt="Infinito Ultimate Kit"
                className="w-full h-full object-cover"
              />
            ) : (
              /* Stylized fallback placeholder matching the drawer box design */
              <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none bg-gradient-to-br from-[#FCE1D4] to-[#F7CDBA] relative">
                <div className="w-44 h-44 sm:w-64 sm:h-64 bg-[#111111] rounded shadow-2xl flex flex-col items-center justify-center border-4 border-[#222222] transform -rotate-3 sm:-rotate-6 hover:rotate-0 transition-transform duration-300 relative">
                  <div className="border border-white/30 p-3 sm:p-5 flex flex-col items-center justify-center w-32 h-32 sm:w-48 sm:h-48">
                    <img
                      src={infinitoLogo}
                      alt="INFINITO"
                      className="h-5 sm:h-6 w-auto object-contain mb-1"
                    />
                    <span className="text-white/80 text-[9px] sm:text-[10px] tracking-[0.3em] uppercase">
                      COMICS
                    </span>
                  </div>
                  {/* Pull ribbon tag */}
                  <div className="absolute -bottom-2.5 sm:-bottom-3 right-6 sm:right-8 w-5 sm:w-6 h-6 sm:h-8 bg-[#F7CDBA] rounded-b border border-black/20 shadow" />
                </div>

                <p className="mt-3 sm:mt-4 text-[11px] sm:text-xs font-semibold text-gray-700 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full border border-gray-300 shadow-xs">
                  [ Image Placeholder &mdash; Insert your image in kitImage ]
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Content ── */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
          {/* Infinito Logo Image */}
          <div className="mb-2">
            <img
              src={infinitoLogo}
              alt="INFINITO"
              className="h-6 sm:h-8 md:h-9 w-auto object-contain"
            />
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-black uppercase mb-2 sm:mb-3 leading-tight">
            ULTIMATE KIT
          </h2>

          {/* Pre-Booking Subtitle */}
          <div className="text-xs sm:text-base md:text-lg font-bold tracking-wide uppercase text-black mb-1">
            PRE-BOOKING STARTS FROM THIS{" "}
            <span className="text-[#E50914] font-black">DIWALI</span>
          </div>

          {/* Date */}
          <div className="text-sm sm:text-lg md:text-xl font-extrabold tracking-wide uppercase text-black mb-3 sm:mb-4">
            8<sup>TH</sup> NOVEMBER 2026
          </div>

          {/* Description Paragraph */}
          <p className="text-gray-800 text-xs sm:text-sm md:text-base leading-relaxed max-w-lg mb-5 sm:mb-6 font-normal">
            Bring your favourite Infinito superhero into your life with the
            Infinito Ultimate Kit! Celebrate your love for your favourite
            characters with an exciting collection of exclusive merchandise,
            creative collectibles, and superhero-inspired surprises.
          </p>

          {/* CTA Button */}
          <div className="w-full sm:w-auto flex justify-center md:justify-start">
            <button
              onClick={() => navigate("/ultimate")}
              className="w-full sm:w-auto bg-[#E50914] hover:bg-red-700 text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-7 py-3 rounded-md transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
            >
              KNOW MORE &nbsp;&gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitComponent;
