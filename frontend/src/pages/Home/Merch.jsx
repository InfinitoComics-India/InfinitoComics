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

      {/* Main Black Section — fixed height so bottom bar stays inside */}
      <div
        className="relative w-full bg-[#121212] bg-[radial-gradient(#2a2a2a_1px,transparent_1px)] [background-size:24px_24px]"
        style={{ height: '420px' }}
      >
        {/* Content row */}
        <div className="w-full max-w-7xl mx-auto px-8 md:px-16 h-full flex items-center justify-between relative z-10 pb-14">

          {/* Left text */}
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

          {/* Right: model overflows upward out of black section */}
          <div className="hidden md:flex items-end self-end relative flex-shrink-0">
            <img
              src={heroImage}
              alt="Hero Tee"
              className="w-auto object-contain object-bottom"
              style={{ height: '540px', marginBottom: '56px', marginTop: '-180px' }}
            />
            {/* Color swatches */}
            <div className="flex flex-col gap-4 ml-4 mb-20 self-center">
              <div className="w-12 h-12 border-[8px] border-white" style={{ backgroundColor: '#e3f172' }} />
              <div className="w-12 h-12 border-[4px] border-white" style={{ backgroundColor: '#a0a7f1' }} />
              <div className="w-12 h-12 border-[4px] border-white" style={{ backgroundColor: '#d5a26c' }} />
            </div>
          </div>
        </div>

        {/* Bottom bar — always sticks to bottom of black section */}
        <div className="absolute bottom-0 left-0 w-full bg-white text-black flex items-center justify-center h-14 text-lg font-bold tracking-widest z-20">
          tees • hoodies • art prints • collectibles
        </div>
      </div>
    </section>
  );
};

export default MerchHeroSection;
