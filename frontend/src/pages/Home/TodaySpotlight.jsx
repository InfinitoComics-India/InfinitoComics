import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import spotlightData from '../../constants/spotlight';
import TodaySpotLightShimmer from "../../shimmer/landingPageShimmer/TodaySpotLightShimmer";


const TodaySpotlight = () => {
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(1); // Start with the first one
  useEffect(() => {
    setTimeout(() => setLoading(false), 2400); // demo
  }, []);

  return loading ? <TodaySpotLightShimmer /> : (
    <div className="px-2 sm:px-4 md:px-16 py-8 sm:py-14 bg-white font-dmsans overflow-x-hidden">
      <div className="w-full mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-[36px] font-black tracking-widest uppercase mb-6 sm:mb-10 text-center md:text-left lg:mx-50 mx-10">
          Today's Spotlight
        </h2>

        <div className="flex flex-col md:flex-row gap-6 transition-all duration-500 ease-in-out overflow-x-auto md:overflow-hidden lg:mx-50 mx-10">
          {spotlightData.map((comic) => {
            const isHovered = hoveredId === comic.id;

            return (
              <div
                key={comic.id}
                className={`relative flex flex-col md:flex-row items-start transition-all duration-500 ease-in-out overflow-hidden rounded-md shadow-md bg-white group
                  ${isHovered ? 'md:w-[783px] w-full' : 'md:w-[270px] w-full'} h-auto md:h-[406px]`}
                onMouseEnter={() => setHoveredId(comic.id)}
                onMouseLeave={() => {
                  if (comic.id !== 1) setHoveredId(1);
                }}
              >
                {/* Left: Image */}
                <div className="relative shrink-0 h-[220px] sm:h-[300px] md:h-[406px] w-full md:w-[270px]">
                  <img
                    src={comic.image}
                    alt={comic.title}
                    className="w-full h-full object-cover z-0 rounded-t-md md:rounded-t-none md:rounded-l-md"
                  />
                </div>

                {/* Right: Hover content */}
                <div
                  className={`transition-opacity duration-500 ease-in-out overflow-hidden ${
                    isHovered ? 'opacity-100 md:w-[513px] w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6' : 'opacity-0 md:w-0 w-full px-0 py-0'
                  } flex flex-col justify-between`}
                >
                  {isHovered && (
                    <>
                      <div>
                        <h3 className="text-xl sm:text-2xl md:text-[36px] font-bold leading-snug mb-1">{comic.title}</h3>
                        <div className="flex flex-col sm:flex-row justify-between">
                          <p className="text-custom-gray uppercase text-base sm:text-[20px]">{comic.authors}</p>
                          <p className="text-gray-400 text-base sm:text-[20px] -mt-2 mb-4 font-normal">
                            {comic.year}
                          </p>
                        </div>
                        <p className="text-gray-700 text-sm sm:text-[15px] leading-relaxed font-normal">
                          {comic.description}
                        </p>
                      </div>
                      <div className="mt-4 sm:mt-6 flex items-center gap-2 sm:gap-4">
                        <button className="border border-black w-10 h-10 flex items-center justify-center hover:bg-black hover:text-white transition">
                          <Bookmark size={20} />
                        </button>
                        <button className="bg-red-600 hover:bg-red-700 transition text-white px-4 sm:px-6 py-2 text-xs sm:text-[14px] font-semibold tracking-wide">
                          READ NOW →
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TodaySpotlight;
