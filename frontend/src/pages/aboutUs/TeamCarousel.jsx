import React, { useState, useEffect } from "react";
import { teamData } from "../../constants/aboutUs";
import bgtop from "../../../assets/Images/spotlighttopbg.png";
import bgbottom from "../../../assets/Images/spotlightbottombg.png";

const TeamCarousel = () => {
  const [index, setIndex] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % teamData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setIndex((index + 1) % teamData.length);
  const prevSlide = () => setIndex((index - 1 + teamData.length) % teamData.length);

  return (
    <>
      <div
        className="w-full pt-20 -mb-1"
        style={{
          backgroundImage: `url(${bgtop})`,
          backgroundSize: "cover",
        }}
      />
      <div className="w-full bg-[#171717] text-white py-8 px-4 sm:px-8 md:px-16 lg:px-24 transition-all duration-500 ease-in-out">
        {/* Heading */}
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold tracking-widest mb-8 sm:mb-10 uppercase">
          Team {teamData[index].team}
        </h2>

        {/* Main grid */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between w-full max-w-[1200px] mx-auto">
          <div className="flex w-full items-center justify-between">
            {/* Left arrow */}
            <button
              onClick={prevSlide}
              className="text-white text-2xl sm:text-3xl hover:text-red-500 transition-all px-2 flex-shrink-0 cursor-pointer"
              style={{ order: 1 }}
              aria-label="Previous Slide"
            >
              &lt;
            </button>

            {/* Members */}
            <div
              className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-12 w-full mx-2 sm:mx-6 extra-gap-mobile"
              style={{ order: 2 }}
            >
              {teamData[index].members.map((member, idx) => (
                <div key={idx} className="text-center space-y-2 max-w-[140px] sm:max-w-[180px] md:max-w-[200px]">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="rounded-full border-4 border-white w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 object-cover aspect-square mx-auto shadow-md"
                  />
                  <p className="text-xs sm:text-sm md:text-base font-semibold tracking-wide uppercase mt-3 sm:mt-5">
                    {member.name}
                  </p>
                  <p className="text-[10px] sm:text-xs md:text-sm tracking-widest text-gray-300 uppercase">
                    {member.year}
                  </p>
                </div>
              ))}
            </div>

            {/* Right arrow */}
            <button
              onClick={nextSlide}
              className="text-white text-2xl sm:text-3xl hover:text-red-500 transition-all px-2 flex-shrink-0 cursor-pointer"
              style={{ order: 3 }}
              aria-label="Next Slide"
            >
              &gt;
            </button>
          </div>
        </div>

        {/* Custom style for mobile */}
        <style>{`
          @media (max-width: 470px) {
            .extra-gap-mobile {
              gap: 2.5rem !important;
            }
          }
        `}</style>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-8 space-x-2">
          {teamData.map((_, dotIndex) => (
            <div
              key={dotIndex}
              onClick={() => setIndex(dotIndex)}
              className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                dotIndex === index ? "bg-red-500 w-6" : "bg-white/60 w-3"
              }`}
            ></div>
          ))}
        </div>
      </div>

      <div
        className="w-full pb-20 -mt-1"
        style={{
          backgroundImage: `url(${bgbottom})`,
          backgroundSize: "cover",
        }}
      />
    </>
  );
};

export default TeamCarousel;
