// 📁 src/components/HeaderShimmer.jsx
import React from "react";
import { FiSearch, FiMenu } from "react-icons/fi";

const HeaderShimmer = () => {
  return (
    <div className="text-white font-sans animate-pulse">
      {/* Top Promo & Links Section */}
      <div className="border-b bg-[#f1f1f1] border-gray-300 text-sm px-4 sm:px-8 py-4 flex flex-col md:flex-row justify-around items-center gap-40">
        <div className="mb-2 md:mb-0 text-center w-[290px] h-[20px] bg-gray-300 rounded"></div>

        <div className="hidden md:flex gap-16 text-[1rem]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-[100px] h-[18px] bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>

      {/* Middle Section: Logo, Buttons, Mobile Menu */}
      <div className="bg-[#f1f1f1] px-4 sm:px-8 py-2 flex items-center justify-between md:justify-around gap-4">
        {/* Mobile Hamburger Icon */}
        <div className="md:hidden">
          <div className="w-[28px] h-[28px] bg-gray-300 rounded"></div>
        </div>

        {/* Login Button (Desktop) */}
        <div className="hidden md:block">
          <div className="w-[160px] h-[40px] bg-gray-300 rounded"></div>
        </div>

        {/* Logo */}
        <div className="text-center">
          <div className="w-[140px] h-[50px] bg-gray-300 rounded"></div>
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block w-[260px] h-[42px] bg-gray-300 rounded"></div>
          <div className="w-[42px] h-[42px] bg-gray-300 rounded-full"></div>
        </div>
      </div>

      {/* Bottom Nav (Desktop only) */}
      <div className="hidden md:block bg-[#ececec] text-sm px-4 sm:px-8 py-3">
        <ul className="flex flex-wrap justify-center gap-10 items-center">
          {[...Array(7)].map((_, i) => (
            <li key={i} className="w-[80px] h-[18px] bg-gray-300 rounded"></li>
          ))}
        </ul>
      </div>

      {/* Mobile Menu Placeholder */}
      <div className="md:hidden bg-[#ececec] text-sm px-4 py-6 space-y-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="w-full h-[18px] bg-gray-300 rounded"></div>
        ))}

        <div className="w-full h-[42px] bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};

export default HeaderShimmer;