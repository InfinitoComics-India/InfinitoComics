import React, { useState, useEffect } from "react";
import rival from "../../../assets/Images/rival.png";
import { PlayCircle } from "lucide-react";
import bgtop from "../../../assets/Images/spotlighttopbg.png";
import bgbottom from "../../../assets/Images/spotlightbottombg.png";
import SpotlightShimmer from "../../shimmer/landingPageShimmer/SpotlightShimmer";

const Spotlight = () => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      // fetch data / preload hero image ...
      setTimeout(() => setLoading(false), 2400); // demo
    }, []);
  return loading?<SpotlightShimmer/>: (
    <>
      <div
        className="w-full pt-20 -mb-1"
        style={{
          backgroundImage: `url(${bgtop})`, // template literal used here
          backgroundSize: "cover", // Make it responsive
        }}
      />
      <div className="w-full bg-cover bg-center bg-no-repeat px-4  bg-[#171717] ">
        {/* Wrapper with responsive max-width and padding */}
        <div className="max-w-7xl  mx-auto flex flex-col md:flex-row items-center justify-between gap-10 py-10 md:py-15 px-4 sm:px-6">
          {/* Left section for text content */}
          <div className="text-white w-full md:max-w-md">
            {/* Heading text styled as shown in design */}
            <h2 className="text-white text-[40px] sm:text-[50px] md:text-[80px] font-black tracking-[0.1em] md:tracking-[0.2em] leading-none text-center md:text-left">
              SPOTLIGHT
            </h2>

            {/* Divider line below heading */}
            <div className="border-t-2 border-white w-40 sm:w-40 md:w-100 my-6 sm:my-8 md:my-12 mx-auto md:mx-0"></div>

            {/* Actor name text */}
            <h3 className="text-white text-lg sm:text-xl md:text-2xl font-black tracking-[0.05em] md:tracking-[0.1em] leading-none text-center md:text-left">
              RYAN GOSLING
            </h3>

            {/* Description paragraph */}
            <p className="text-sm text-gray-300 mt-2 leading-relaxed text-center md:text-left">
              First of all, you're going to look so bad in that shot. Haha lol!{" "}
              <br />
              Also I don't know who wrote this. So sorry. T_T I love you. <br />
              Also I know, you know, that I know, that you know, that I know!
            </p>

            {/* Play button */}
            <div className="flex justify-center md:justify-start">
              <button className="mt-6 px-6 py-2 border border-white text-white text-lg hover:bg-white hover:text-black transition-all duration-300">
                PLAY →
              </button>
            </div>
          </div>

          {/* Right section for image with play icon overlay */}
          <div className="relative w-full sm:w-[80%] md:w-[600px]">
            <img
              src={rival}
              alt="Spotlight"
              className="w-full h-auto rounded-md object-cover"
            />
            {/* Centered play icon over image */}
            <button className="absolute inset-0 flex items-center justify-center">
              <PlayCircle className="w-16 h-16 text-white hover:scale-105 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>
      <div
        className="w-full pb-20 -mt-1"
        style={{
          backgroundImage: `url(${bgbottom})`, //   template literal used here
          backgroundSize: "cover", // Make it responsive
        }}
      />
    </>
  );
};

export default Spotlight;
