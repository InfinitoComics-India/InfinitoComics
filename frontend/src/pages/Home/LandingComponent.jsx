// LandingComponent.jsx (Home.jsx)
import React, { useState, useEffect } from "react";
import slide1 from "../../../assets/Images/banner 1.png";
import slide2 from "../../../assets/Images/banner 2.jpeg";
import slide3 from "../../../assets/Images/banner 3.jpeg";
import slide4 from "../../../assets/Images/banner.png";
import slide5 from "../../../assets/Images/banner 5.png";
import belowImage from "../../../assets/Images/Botton.png";
import LandingShimmer from "../../shimmer/landingPageShimmer/landingShimmer";

const images = [
  { id: 1, url: slide1, title: "Rise of the", subtitle: "Eternal Storm" },
  { id: 2, url: slide3, title: "Agent Black:", subtitle: "04-36" },
  { id: 3, url: slide2, title: "Protectors of", subtitle: "MagmaVerse" },
  { id: 4, url: slide5, title: "Magic Beyond Limits:", subtitle: "Mystery Man" },
  { id: 5, url: slide4, title: "Infinito Universe:", subtitle: "Assemble Again" },
];

const SLIDE_DURATION = 5000;

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, []);

  const handleSelect = (index) => {
    setCurrent(index);
  };

  return loading ? (
    <LandingShimmer />
  ) : (
    <div className="w-full text-white overflow-x-clip">
      <style>{`
        @keyframes progressBarAnim {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>

      {/* Main Carousel */}
      <div className="relative w-full h-[55vh] sm:h-[68vh] md:h-[80vh] min-h-[380px] overflow-hidden">
        {/* Slides */}
        {images.map((image, index) => (
          <img
            key={image.id}
            src={image.url}
            alt={`Slide ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-1000 ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-24 bg-gradient-to-t from-black/75 to-transparent z-20 pointer-events-none" />

        {/* Bottom Navigation */}
        <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 z-30 flex justify-center px-2 sm:px-6 md:px-12">
          <div className="w-full max-w-[1200px] bg-white/85 backdrop-blur-md py-1.5 sm:py-2 md:py-2.5 px-2 sm:px-6 md:px-8 shadow-xl flex justify-between items-center gap-1.5 sm:gap-4 md:gap-6 rounded-sm">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => handleSelect(index)}
                className="flex-1 min-w-0 text-left relative cursor-pointer px-0.5 sm:px-1 group"
              >
                {/* Desktop/Tablet text */}
                <div className="hidden sm:flex flex-col leading-snug">
                  <span className="block text-xs sm:text-[13px] md:text-[15px] font-medium text-black truncate">
                    {image.title}
                  </span>
                  <span className="block text-xs sm:text-[13px] md:text-[15px] font-bold text-black truncate">
                    {image.subtitle}
                  </span>
                </div>

                {/* Mobile slide number indicator */}
                <div className="sm:hidden text-center">
                  <span className={`block text-[10px] font-bold tracking-wider ${current === index ? 'text-red-600' : 'text-black'}`}>
                    0{image.id}
                  </span>
                </div>

                {/* Progress Line */}
                <div className="w-full mt-1 sm:mt-2 h-[2px] sm:h-[2.5px] bg-neutral-300 overflow-hidden relative">
                  {current === index ? (
                    <div
                      key={current}
                      className="h-full bg-red-600"
                      style={{
                        animation: `progressBarAnim ${SLIDE_DURATION}ms linear forwards`,
                      }}
                    />
                  ) : (
                    <div className="h-full bg-black" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Below Image */}
      <div className="relative w-full -mt-1">
        <img
          src={belowImage}
          alt="Below Carousel"
          className="relative z-0 block w-full h-auto object-cover"
        />
      </div>
    </div>
  );
};

export default Home;