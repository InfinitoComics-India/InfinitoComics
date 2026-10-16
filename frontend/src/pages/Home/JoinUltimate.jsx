import React, { useState, useEffect } from "react";
import bgImage from "../../../assets/Images/bgImage.png";
import character from "../../../assets/Images/Ultimate/character.png";
import JoinUltimateShimmer from "../../shimmer/landingPageShimmer/JoinUltimateShimmer";
import { useNavigate } from "react-router-dom";

const JoinUltimate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  return loading ? (
    <JoinUltimateShimmer />
  ) : (
    <div className="w-full bg-white relative overflow-hidden">
      <div
        className="w-full min-h-[380px] sm:min-h-[440px] md:min-h-[480px] lg:min-h-[540px] bg-cover bg-center relative flex flex-col-reverse md:flex-row items-center justify-between px-4 sm:px-8 md:px-12 lg:px-16"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* Left Section: Character (anchored to bottom on both mobile and desktop) */}
        <div className="w-full md:w-[55%] lg:w-[55%] relative self-center md:self-end flex justify-center md:justify-start items-end z-10 -ml-0 md:-ml-6 lg:-ml-8 mt-4 md:mt-0">
          <img
            src={character}
            alt="Ninja Character"
            className="block w-full sm:w-[110%] md:w-[115%] lg:w-[120%] max-w-[340px] sm:max-w-[500px] md:max-w-[760px] lg:max-w-[850px] h-auto object-contain object-bottom md:object-left-bottom drop-shadow-2xl"
          />
        </div>

        {/* Right Section: Text Content */}
        <div className="w-full md:w-[45%] lg:w-[45%] pt-8 pb-4 md:py-16 flex flex-col justify-center items-center md:items-start text-center md:text-left text-white space-y-3 sm:space-y-5 lg:space-y-6 z-10 pr-0 sm:pr-4 md:pr-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight font-sans text-white">
            Join the Ultimate Universe
          </h2>

          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-200 leading-relaxed max-w-lg font-sans">
            Be the first to know about new releases, exclusive content, and
            special events. Plus, get a free digital comic when you sign up!
          </p>

          <div className="pt-2 flex justify-center md:justify-start w-full">
            <button
              onClick={() => navigate("/ultimate")}
              className="bg-[#E50914] hover:bg-red-700 text-white text-xs md:text-sm font-bold uppercase tracking-wider px-6 py-2.5 sm:py-3 transition-all duration-300 flex items-center gap-1 cursor-pointer shadow-md"
            >
              JOIN NOW &rsaquo;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinUltimate;
