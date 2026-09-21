// Home.jsx
import React, { useState, useEffect } from "react";
import slide1 from "../../../assets/Images/banner 1.png";
import slide2 from "../../../assets/Images/banner 2.jpeg";
import slide3 from "../../../assets/Images/banner 3.jpeg";
import slide4 from "../../../assets/Images/banner.png";
import slide5 from "../../../assets/Images/banner 5.png";
import belowImage from "../../../assets/Images/Botton.png";
import LandingShimmer from "../../shimmer/landingPageShimmer/landingShimmer";

const images = [
  { id: 1, url: slide1 },
  { id: 2, url: slide2 },
  { id: 3, url: slide3 },
  { id: 4, url: slide4 },
  { id: 5, url: slide5 },
];

const Home = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => setLoading(false), 2400);
  }, []);

  const [current, setCurrent] = useState(0);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSelect = (index) => {
    setCurrent(index);
  };

  return loading ? (
    <LandingShimmer />
  ) : (
    <div className="w-full text-white">
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



        {/* Bottom gradient so nav text is readable */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent z-20 pointer-events-none" />

        {/* Bottom Navigation */}
        <div className="absolute bottom-5 left-0 right-0 z-30">
          <div className="w-full max-w-7xl mx-auto px-8 md:px-16 flex justify-between items-end">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => handleSelect(index)}
                className={`flex-1 text-left text-xs md:text-sm font-medium relative transition-colors px-2 pb-1 ${
                  current === index ? "text-red-500" : "text-white"
                }`}
              >
                <span className="block text-[11px] leading-tight">
                  Rise of the <span className="font-bold block">Eternal Storm</span>
                </span>
                <span
                  className={`block mt-1 h-[2px] bg-red-500 transition-all duration-300 ${
                    current === index ? "w-full" : "w-0"
                  }`}
                ></span>
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
