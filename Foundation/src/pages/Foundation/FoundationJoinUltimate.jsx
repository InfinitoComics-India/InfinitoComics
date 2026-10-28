import React from "react";
import bgImage from "../../../../frontend/assets/Images/bgImage.png";
import character from "../../../../frontend/assets/Images/character.png";
import { FRONTEND_BASE_URL } from "../../utils/constants.js";

const FoundationJoinUltimate = () => {
  return (
    <div className="w-full bg-white relative overflow-hidden">
      <div
        className="w-full min-h-[380px] sm:min-h-[440px] md:min-h-[480px] lg:min-h-[540px] bg-cover bg-center relative flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 md:px-12 lg:px-16"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="w-full md:w-[55%] lg:w-[55%] relative self-end flex justify-start items-end z-10 pt-2 -ml-2 sm:-ml-4 md:-ml-6 lg:-ml-8">
          <img
            src={character}
            alt="Ninja Character"
            className="w-[115%] sm:w-[110%] md:w-[115%] lg:w-[120%] max-w-[650px] md:max-w-[760px] lg:max-w-[850px] h-auto object-contain object-left-bottom transform -translate-y-2 md:-translate-y-4 lg:-translate-y-6 drop-shadow-2xl"
          />
        </div>

        <div className="w-full md:w-[45%] lg:w-[45%] py-8 md:py-16 flex flex-col justify-center text-center md:text-left text-white space-y-4 sm:space-y-5 lg:space-y-6 z-10 pr-2 sm:pr-4 md:pr-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight font-sans text-white">
            Join the Ultimate Universe
          </h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-200 leading-relaxed max-w-lg font-sans mx-auto md:mx-0">
            Be the first to witness Infinito Universe - Get Infinito Ultimate Kit now!
          </p>
          <div className="pt-2 flex justify-center md:justify-start">
            <a
              href={`${FRONTEND_BASE_URL}/ultimate`}
              className="bg-[#E50914] hover:bg-red-700 text-white text-xs md:text-sm font-bold uppercase tracking-wider px-6 py-3 transition-all duration-300 flex items-center gap-1 cursor-pointer shadow-md inline-block"
            >
             Buy Now &rsaquo;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoundationJoinUltimate;
