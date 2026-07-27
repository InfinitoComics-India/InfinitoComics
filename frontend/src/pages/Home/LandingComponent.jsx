// Home.jsx
import React, { useState, useEffect } from "react";
import slide1 from "../../../assets/Images/landing .png";
import belowImage from "../../../assets/Images/Botton.png";
import LandingShimmer from "../../shimmer/landingPageShimmer/landingShimmer";

const images = [
  {
    id: 1,
    url: slide1,
  },
  {
    id: 2,
    url: slide1,
  },
  {
    id: 3,
    url: slide1,
  },
  {
    id: 4,
    url: slide1,
  },
  {
    id: 5,
    url: slide1,
  },
];

const Home = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => setLoading(false), 2400); 
  }, []);

  const [current, setCurrent] = useState(0);

  const handleSelect = (index) => {
    setCurrent(index);
  };

  return loading ? (
    <LandingShimmer />
  ) : (
    <div className="w-full text-white">
      <div className="relative w-full h-[80vh] overflow-hidden">
        {/* Background Image with Dimming */}
        <img
          src={images[current].url}
          alt={`Slide ${current + 1}`}
          className="w-full h-full object-cover object-top filter brightness-50"
        />

        {/* Dark Overlay (optional, for extra depth) */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Text Overlay (aligned to left) */}
        <div className="absolute inset-0 flex flex-col items-start justify-center text-left px-8 md:px-16 z-20 md:mx-30">
          <h2 className="text-5xl md:text-6xl font-bold uppercase py-10 leading-tight">
            Rise of the <br />{" "}
            <span className="text-red-500">Eternal Storm</span>
          </h2>
          <p className="mt-4 max-w-2xl text-lg md:text-xl">
            An ancient force awakens in the cosmic depths. Heroes will rise,
            dimensions will collide, and the Infinito Universe will never be the
            same.
          </p>
          <button className="mt-14 bg-[#DD1215] hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition duration-300">
            Read Now
          </button>
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-5 left-0 right-0 flex justify-center space-x-40 z-30">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => handleSelect(index)}
              className={`text-lg md:text-base font-large relative transition-colors ${
                current === index ? "text-red-500" : "text-white"
              }`}
            >
              Rise of the <span className="font-bold">Eternal Storm</span>
              <span
                className={`block h-[2px] bg-red-500 transition-all duration-300 ${
                  current === index ? "w-full" : "w-0"
                }`}
              ></span>
            </button>
          ))}
        </div>
      </div>

      {/* Below Image with Shadow */}
      <div className="relative w-full -mt-1">
        <div className="absolute -top-16 w-full h-16 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
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
