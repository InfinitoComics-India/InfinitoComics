// 📁 src/components/JoinInnerCircle.jsx
import React from "react";
import top from "../../../assets/Images/Community/top.png";
import bottom from "../../../assets/Images/Community/bottom2.png";
import gradient from '../../../assets/Images/Community/gradient.png';



const JoinInnerCircle = () => {
  return (
    <div className="mb-8">
      
      {/* Top decorative image */}
      <div
        className="w-full h-20 -my-1"
        style={{
          backgroundImage: `url(${top})`,       // Set top background image
          backgroundSize: "cover",              // Cover the entire div
          backgroundPosition: "center",         // Center the image
        }}
      ></div>

      {/* Main section with dark background */}
      <div className="w-full bg-[#171717] px-4 md:px-10 lg:px-20 py-14 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-10 mx-4 sm:mx-10 lg:mx-40">
          
          {/* Left content: Heading, description, and button */}
          <div className="flex flex-col max-w-xl">
            {/* Heading with responsive size */}
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-widest uppercase mb-6 leading-tight whitespace-nowrap scale-y-140">
              Join Our Inner Circle
            </h2>

            {/* Horizontal divider */}
            <div className="h-[2px] w-full sm:w-[300px] md:w-[400px] bg-white mb-6"></div>

            {/* Subheading and description */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold tracking-widest uppercase mb-2">
                Infinito HQ
              </h3>
              <p className="text-sm md:text-base text-gray-300 mb-6">
                Get the deets, the tea and the gossip before others find out!
                Join our discord server.
              </p>

              {/* Join Server Button */}
              <button className="border border-white px-6 py-4 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition">
                Join Server &rsaquo;
              </button>
            </div>
          </div>

          {/* Right-side QR card with gradient background */}
          <div
            className="w-full max-w-[300px] h-[200px] md:h-[250px] bg-white flex justify-center items-center p-2"
            style={{
              backgroundImage: `url(${gradient})`, // Set card background
              backgroundSize: "cover",             // Ensure coverage
              backgroundPosition: "center",        // Center background
            }}
          >
            comming soon
          </div>
        </div>
      </div>

      {/* Bottom decorative image */}
      <div
        className="w-full h-20"
        style={{
          backgroundImage: `url(${bottom})`, // Set bottom background image
          backgroundSize: "cover",           // Ensure full coverage
          backgroundPosition: "center",      // Center the image
        }}
      ></div>
    </div>
  );
};

export default JoinInnerCircle;
