import React from 'react';
import heroImage from '../../../assets/Images/merch/MerchModel.png';

const MerchHeroSection = () => {
  return (
    <section className="bg-white">
      {/* Heading */}
      <div className="w-full max-w-7xl mx-auto px-8 md:px-16 py-6">
        <h2 className="text-[36px] font-bold uppercase">
          Style yourself like a super hero
        </h2>
      </div>

      {/* Main Black Section */}
      <div className="relative w-full bg-[#121212] min-h-[527px] bg-[radial-gradient(#2a2a2a_1px,transparent_1px)] [background-size:24px_24px] overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-8 md:px-16 h-full flex items-center justify-between relative z-10 py-16">

          {/* Left content */}
          <div className="text-white max-w-lg">
            <p className="text-xl leading-relaxed font-medium">
              Step into the Infinito Universe with exclusive gear crafted for fans who know every panel, plot twist, and power move.
            </p>
            <p className="text-xl mt-8 font-semibold">
              Limited drops. Infinite style.
            </p>
            <button className="mt-10 px-6 py-3 bg-white text-black font-semibold tracking-wide border border-black hover:bg-black hover:text-white transition">
              SHOP NOW ›
            </button>
          </div>

          {/* Right image */}
          <div className="relative hidden md:block">
            <img
              src={heroImage}
              alt="Hero Tee"
              className="h-[600px] w-auto object-contain absolute bottom-[-120px] right-0"
            />
            {/* Color swatches */}
            <div className="absolute top-0 right-[-70px] space-y-4 z-30">
              <div className="w-[53px] h-[53px] border-[10px] border-white" style={{ backgroundColor: '#e3f172' }}></div>
              <div className="w-[53px] h-[53px] border-[5px] border-white" style={{ backgroundColor: '#a0a7f1' }}></div>
              <div className="w-[53px] h-[53px] border-[5px] border-white" style={{ backgroundColor: '#d5a26c' }}></div>
            </div>
          </div>
        </div>

        {/* Bottom text bar */}
        <div className="absolute bottom-0 left-0 w-full bg-white text-black flex items-center justify-center h-14 text-lg font-bold tracking-widest z-20">
          tees • hoodies • art prints • collectibles
        </div>
      </div>
    </section>
  );
};

export default MerchHeroSection;
