import React, { useState, useEffect } from "react";
import {teamData} from "../../constants/aboutUs"
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
              backgroundImage: `url(${bgtop})`, // template literal used here
              backgroundSize: "cover", // Make it responsive
            }}
          />
    <div className="w-full bg-[#171717]  text-white py-8 px-4 sm:px-8 md:px-16 lg:px-24 transition-all duration-500 ease-in-out">
      {/* Heading */}
      <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold tracking-widest mb-8 sm:mb-10 uppercase">
        Team {teamData[index].team}
      </h2>

      {/* Main grid */}
      <div className="flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between w-full">
        {/* Mobile: arrows beside grid, Desktop: arrows at ends */}
        <div className="flex w-full items-center">
          {/* Left arrow */}
          <button
            onClick={prevSlide}
            className="text-white text-2xl sm:text-3xl hover:text-red-500 transition-all px-2 mb-0 sm:mb-0 flex-shrink-0"
            style={{ order: 1 }}
          >
            &lt;
          </button>

          {/* Members */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 justify-items-center w-full mx-20 extra-gap-mobile" style={{ order: 2 }}>
            {teamData[index].members.map((member, idx) => (
              <div key={idx} className="text-center space-y-2">
                <img
                  src={member.img}
                  alt={member.name}
                  className="rounded-full border-4 border-white w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-48 lg:h-48 object-cover aspect-square mx-auto"
                />
                <p className="text-xs sm:text-sm md:text-base font-semibold tracking-wide uppercase mt-3 sm:mt-5">{member.name}</p>
                <p className="text-[10px] sm:text-xs md:text-sm tracking-widest text-gray-300 uppercase">{member.year}</p>
              </div>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={nextSlide}
            className="text-white text-2xl sm:text-3xl hover:text-red-500 transition-all px-2 flex-shrink-0"
            style={{ order: 3 }}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Custom style for extra small screens (470px or less) */}
      <style>{`
        @media (max-width: 470px) {
          .extra-gap-mobile {
            gap: 2.5rem !important;
          }
        }
      `}</style>
      {/* Pagination Dots */}
      <div className="flex justify-center mt-6 space-x-2">
        {teamData.map((_, dotIndex) => (
          <div
            key={dotIndex}
            onClick={() => setIndex(dotIndex)}
            className={`w-4 h-1 rounded-full cursor-pointer ${
              dotIndex === index ? "bg-red-500 w-4" : "bg-white"
            }`}
          ></div>
        ))}
      </div>
    </div>
    <div
            className="w-full pb-20 -mt-1"
            style={{
              backgroundImage: `url(${bgbottom})`, //  template literal used here
              backgroundSize: "cover", // Make it responsive
            }}
          />
    </>
  );
};

export default TeamCarousel;
