// LandingComponent.jsx (Home.jsx)
import React, { useState, useEffect } from "react";
import slide1 from "../../../assets/Images/banner 1.png";
import slide2 from "../../../assets/Images/banner 2.jpeg";
import slide3 from "../../../assets/Images/banner 3.jpeg";
import slide4 from "../../../assets/Images/banner.png";
import slide5 from "../../../assets/Images/banner 5.png";
import slide1Mobile from "../../../assets/Images/banners/banner1.png";
import slide2Mobile from "../../../assets/Images/banners/banner2.png";
import slide3Mobile from "../../../assets/Images/banners/banner3.png";
import slide4Mobile from "../../../assets/Images/banners/banner4.png";
import slide5Mobile from "../../../assets/Images/banners/banner5.png";
import belowImage from "../../../assets/Images/Botton.png";
import LandingShimmer from "../../shimmer/landingPageShimmer/landingShimmer";

const images = [
  { id: 1, desktopUrl: slide1,mobileUrl: slide1Mobile,  title: "Rise of the", subtitle: "Eternal Storm" },
  { id: 2, desktopUrl: slide3, mobileUrl: slide2Mobile, title: "Agent Black:", subtitle: "04-36" },
  { id: 3, desktopUrl: slide2, mobileUrl: slide3Mobile, title: "Protectors of", subtitle: "MagmaVerse" },
  { id: 4, desktopUrl: slide5, mobileUrl: slide4Mobile, title: "Magic Beyond Limits:", subtitle: "Mystery Man" },
  { id: 5, desktopUrl: slide4, mobileUrl: slide5Mobile, title: "Infinito Universe:", subtitle: "Assemble Again" },
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
      <div className="relative w-full aspect-[900/1400] sm:aspect-auto sm:h-[75vh] md:h-[80vh] bg-[#121212] overflow-hidden">
        {/* Slides with crossfade */}
        {images.map((image, index) => (
          <picture
            key={image.id}
            className={`absolute inset-0 w-full h-full block transition-opacity duration-1000 ${
              index === current ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Mobile (screens under 768px) */}
            <source media="(max-width: 767px)" srcSet={image.mobileUrl} />
            {/* Desktop (screens 768px and up) */}
            <img
              src={image.desktopUrl}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-contain md:object-cover md:object-top"
            />
          </picture>
        ))}

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-black/50 to-transparent z-20 pointer-events-none" />

        {/* 🌟 Bottom Navigation (Centered White Box) 🌟 */}
        <div className="absolute bottom-1.5 sm:bottom-2 md:bottom-3 left-0 right-0 z-30 flex items-center justify-center px-2 sm:px-6">
          {/* Centered White Box (Compact & Responsive) */}
          <div className="w-full max-w-5xl lg:max-w-6xl bg-white/85 backdrop-blur-md py-2 sm:py-2.5 px-3 sm:px-6 md:px-10 shadow-xl rounded-sm flex flex-col justify-center">
            {/* Mobile: Active slide title & subtitle centered */}
            <div className="sm:hidden text-center pb-1.5 flex items-center justify-center gap-1.5 px-2">
              <span className="text-xs font-bold text-red-600 truncate">
                {images[current].title}
              </span>
              <span className="text-xs font-semibold text-black truncate">
                {images[current].subtitle}
              </span>
            </div>

            {/* Buttons & Progress Bars */}
            <div className="w-full flex justify-between items-center gap-2 sm:gap-4 md:gap-6">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => handleSelect(index)}
                  className="flex-1 text-left relative cursor-pointer px-0.5 sm:px-1 py-1 sm:py-0 group"
                  aria-label={`Go to slide ${index + 1}`}
                >
                  {/* Desktop Title & Subtitle (hidden on mobile, visible on sm and up) */}
                  <div className="hidden sm:flex flex-col leading-snug">
                    <span
                      className={`block text-[13px] md:text-[15px] font-medium ${
                        current === index ? "text-red-600" : "text-black"
                      } truncate`}
                    >
                      {image.title}
                    </span>
                    <span
                      className={`block text-[13px] md:text-[15px] font-normal ${
                        current === index ? "text-red-600" : "text-black"
                      } truncate`}
                    >
                      {image.subtitle}
                    </span>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full sm:mt-2 h-[3px] bg-neutral-300 overflow-hidden relative rounded-full">
                    {current === index ? (
                      <div
                        key={current} // Resets animation on slide change
                        className="h-full bg-red-600 rounded-full"
                        style={{
                          animation: `progressBarAnim ${SLIDE_DURATION}ms linear forwards`,
                        }}
                      />
                    ) : (
                      <div className="h-full bg-neutral-800 sm:bg-black rounded-full" />
                    )}
                  </div>
                </button>
              ))}
            </div>
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