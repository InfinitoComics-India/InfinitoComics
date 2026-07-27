// PremiumPlansShimmer.jsx
import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// A single shimmer card component (light theme)
const ShimmerCard = ({ isLarge }) => {
  return (
    <div
      className={`flex flex-col animate-pulse bg-white border border-gray-200 rounded-2xl 
      ${isLarge ? "lg:w-[380px]" : "lg:w-[300px]"} 
      w-full max-w-[300px] mx-auto h-[600px]`}
    >
      {/* Card upper section */}
      <div
        className="flex flex-col flex-grow p-6 rounded-t-2xl bg-gray-100"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 97%, 0 100%)" }}
      >
        {/* Icon placeholder */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-300 rounded-full"></div>

          {/* Price placeholder */}
          <div className="mt-5 w-24 h-6 bg-gray-300 rounded"></div>

          {/* Title placeholder */}
          <div className="mt-3 w-32 h-5 bg-gray-300 rounded"></div>
        </div>

        {/* Features placeholder */}
        <div className="flex flex-col flex-grow justify-between mt-5">
          <div className="space-y-3 mb-4 overflow-y-auto max-h-[280px]">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                <div className="flex-1 h-4 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom button placeholder */}
      <div
        className="w-full h-14 bg-gray-300 rounded-b-2xl"
        style={{
          clipPath: "polygon(0 30%, 100% 0, 100% 100%, 0 100%)",
        }}
      ></div>
    </div>
  );
};

const PremiumPlansShimmer = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size to decide between slider/grid
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  // Number of shimmer cards to render
  const shimmerCount = 5;

  return (
    <div className="w-full mt-5 p-4 lg:p-16">
      {isMobile ? (
        // Mobile/tablet view → slider
        <Slider {...sliderSettings} className="!overflow-visible">
          {Array.from({ length: shimmerCount }).map((_, index) => (
            <div key={index} className="px-3">
              <ShimmerCard isLarge={index === 0} />
            </div>
          ))}
        </Slider>
      ) : (
        // Desktop view → grid
        <div className="flex justify-center gap-6 flex-wrap">
          {Array.from({ length: shimmerCount }).map((_, index) => (
            <ShimmerCard key={index} isLarge={index === 0} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PremiumPlansShimmer;
