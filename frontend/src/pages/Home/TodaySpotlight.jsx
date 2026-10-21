import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import spotlightData from '../../constants/spotlight';
import TodaySpotLightShimmer from "../../shimmer/landingPageShimmer/TodaySpotLightShimmer";

const TodaySpotlight = () => {
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(1); // Start with the first one
  useEffect(() => {
    setTimeout(() => setLoading(false), 2400); // demo
  }, []);

  return loading ? (
    <TodaySpotLightShimmer />
  ) : (
    <div className="w-full py-8 sm:py-10 md:py-12 bg-white font-dmsans overflow-x-hidden">
  <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 flex items-start justify-center gap-4 lg:gap-6 xl:gap-8">
        {/* Left Ad */}
        <div className="hidden lg:flex w-20 xl:w-24 h-[406px] bg-[#D0D0D0] shrink-0 items-center justify-center mt-14 select-none">
          <span className="text-white font-bold text-sm tracking-widest uppercase">
            AD
          </span>
        </div>

        {/* Center Content */}
        <div className="flex-1 max-w-7xl flex flex-col min-w-0">
          {/* Section Headings */}
          <div className="flex items-center justify-between mb-4 sm:mb-8 md:mb-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <h2 className="text-xl sm:text-3xl md:text-[36px] font-black tracking-wide uppercase text-black">
                Spotlight
              </h2>
              <h2 className="text-xl sm:text-3xl md:text-[36px] font-black tracking-wide uppercase text-red-600">
                Comics
              </h2>
            </div>

            <Link
              to="/comics"
              className="text-red-600 hover:underline font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-1"
            >
              VIEW ALL &gt;
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 transition-all duration-500 ease-in-out">
            {spotlightData.map((comic) => {
              const isHovered = hoveredId === comic.id;

              return (
                <div
                  key={comic.id}
                  onClick={() => setHoveredId(comic.id)}
                  className={`relative flex flex-col md:flex-row items-start transition-all duration-500 ease-in-out overflow-hidden rounded-md shadow-md bg-white group cursor-pointer
                    ${isHovered ? 'md:w-[783px] w-full ring-2 ring-red-600/20 md:ring-0' : 'md:w-[270px] w-full'} h-auto md:h-[406px]`}
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

                  {/* Mobile-only Tap hint on unexpanded card */}
                  {!isHovered && (
                    <div className="md:hidden w-full px-4 py-2.5 bg-neutral-900 flex justify-between items-center text-white">
                      <span className="text-xs font-bold uppercase truncate">{comic.title}</span>
                      <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider shrink-0 ml-2">Tap to view ›</span>
                    </div>
                  )}

                  {/* Right: Hover content */}
                  <div
                    className={`transition-opacity duration-500 ease-in-out overflow-hidden ${
                      isHovered
                        ? 'opacity-100 md:w-[513px] w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6'
                        : 'opacity-0 md:w-0 w-0 h-0 md:h-auto px-0 py-0'
                    } flex flex-col justify-between`}
                  >
                    {isHovered && (
                      <>
                        <div>
                          <h3 className="text-lg sm:text-2xl md:text-[32px] font-bold leading-snug mb-1">
                            {comic.title}
                          </h3>
                          <div className="flex flex-col sm:flex-row justify-between mb-2">
                            <p className="text-custom-gray uppercase text-xs sm:text-[18px]">
                              {comic.authors}
                            </p>
                            <p className="text-gray-400 text-xs sm:text-[18px] sm:-mt-2 mb-2 sm:mb-4 font-normal">
                              {comic.year}
                            </p>
                          </div>
                          <p className="text-gray-700 text-xs sm:text-[15px] leading-relaxed font-normal">
                            {comic.description}
                          </p>
                        </div>
                        <div className="mt-4 sm:mt-6 flex items-center gap-2 sm:gap-4">
                          <button className="border border-black w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-black hover:text-white transition cursor-pointer">
                            <Bookmark size={18} />
                          </button>
                          <Link
                            to="/comics"
                            className="bg-red-600 hover:bg-red-700 transition text-white px-4 sm:px-6 py-2 text-xs sm:text-[14px] font-semibold tracking-wide flex items-center gap-1 cursor-pointer"
                          >
                            READ NOW →
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Indicator Dots */}
          <div className="flex justify-center items-center gap-2 mt-6">
            {spotlightData.map((comic) => (
              <button
                key={comic.id}
                onClick={() => setHoveredId(comic.id)}
                aria-label={`Select comic ${comic.title}`}
                className={`transition-all duration-300 cursor-pointer ${
                  hoveredId === comic.id
                    ? 'w-5 h-1.5 bg-red-600 rounded-full'
                    : 'w-1.5 h-1.5 bg-neutral-900 rounded-full hover:bg-red-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Ad */}
        <div className="hidden lg:flex w-20 xl:w-24 h-[406px] bg-[#D0D0D0] shrink-0 items-center justify-center mt-14 select-none">
          <span className="text-white font-bold text-sm tracking-widest uppercase">
            AD
          </span>
        </div>
      </div>
    </div>
  );
};

export default TodaySpotlight;
