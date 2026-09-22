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
  useEffect(() => {
    setTimeout(() => setLoading(false), 2400);
  }, []);

  const [current, setCurrent] = useState(0);

  // Auto-advance every 5 seconds (resets whenever 'current' changes)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [current]);

  const handleSelect = (index) => {
    setCurrent(index);
  };

  return loading ? (
    <LandingShimmer />
  ) : (
    <div className="w-full text-white">
      <style>{`
        @keyframes progressBarAnim {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
      <div className="relative w-full h-[80vh] overflow-hidden">
        {/* Slides with crossfade */}
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

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent z-20 pointer-events-none" />

        {/* 🌟 Bottom Navigation (Centered White Box) 🌟 */}
        <div className="absolute bottom-1 md:bottom-2 left-0 right-0 z-30 flex items-center justify-center px-4">
          {/* Centered White Box (Compact & Shifted Down) */}
          <div className="w-full max-w-5xl lg:max-w-6xl bg-white/80 backdrop-blur-md py-2 md:py-2.5 px-4 sm:px-8 md:px-10 shadow-xl flex justify-between items-center gap-3 sm:gap-6 rounded-sm">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => handleSelect(index)}
                className="flex-1 text-left relative cursor-pointer px-1 group"
              >
                <div className="flex flex-col leading-snug">
                  <span className="block text-xs sm:text-[13px] md:text-[15px] font-medium text-black truncate">
                    {image.title}
                  </span>
                  <span className="block text-xs sm:text-[13px] md:text-[15px] font-bold text-black truncate">
                    {image.subtitle}
                  </span>
                </div>

                {/* Progress Line */}
                <div className="w-full mt-2 h-[2.5px] bg-neutral-300 overflow-hidden relative">
                  {current === index ? (
                    <div
                      key={current} // Resets animation on slide change
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
          className="w-full object-cover relative z-0"
        />
      </div>
    </div>
  );
};

export default Home;