import React from "react";
import { useEffect,useState } from "react";
import image from "../../../assets/Images/quick-vision.png"; // 🔹 Background image for the spotlight section
import CharacterSpotlightShimmer from "../../shimmer/landingPageShimmer/CharacterSpotlightShimmer";

const CharacterSpotlight = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // fetch data / preload hero image ...
    setTimeout(() => setLoading(false), 2400); // demo
  }, []);
  return loading? <CharacterSpotlightShimmer/>:(
    // Main container with background image and overlay
    <div
      className="w-full min-h-[600px] md:min-h-[550px] bg-black text-white relative overflow-hidden bg-cover bg-no-repeat bg-center"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/*  Black semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/*  Content wrapper */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 py-12 md:py-20">
        {/*  Left Section: Text Content */}
        <div className="md:w-1/2 text-center md:text-left mt-8 md:mt-16">
          {/*  Label */}
          <p className="uppercase text-md font-bold tracking-widest text-white mb-2">
            Character Spotlight
          </p>

          {/*  Character Name */}
          <h1 className="text-4xl md:text-5xl font-bold text-purple-400 mb-4 tracking-widest">
            QUICK VISION
          </h1>

          {/*  Description Text */}
          <p className="text-white mb-6 w-3/4 md:w-2/3 mx-auto md:mx-0">
            A moody Mumbai street surfer with custom weapons, fog-cutting
            vision, and a speed-boosting ride—meet the rogue who upgrades on the
            fly and never plays by the rules.
          </p>

          {/*  CTA Button */}
          <button className="border border-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-white hover:text-black transition-all">
            Know More ›
          </button>
        </div>

        {/* Right section for image is embedded as background, no additional div needed here */}
      </div>
    </div>
  );
};

export default CharacterSpotlight;
