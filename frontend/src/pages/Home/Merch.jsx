import React from 'react';
import heroImage from '../../../assets/Images/merch/MerchModel.png';
import modelImg from "../../../assets/Images/merch/MerchModels.png"

const MerchHeroSection = () => {
  return (
    <section className="bg-white">
      {/* Heading */}
      <div className="w-full max-w-7xl mx-auto px-8 md:px-16 py-6">
        <h2 className="text-[36px] font-bold uppercase">
          Fashion Corner
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
            <h2 className="text-2xl leading-relaxed font-bold">
              TOP TRENDING
            </h2>
            <p className=" mt-8">
             Discover the most wanted drops from the INFINITO universe. Explore bold graphic T-shirts, premium hoodies, caps, tote bags, collectibles, keychains, and everyday accessories inspired by iconic heroes. Designed for fans who live beyond the panels, every piece brings fearless style and limited-edition energy.
            </p>
            <button className="mt-10 px-6 py-3 bg-white text-black font-semibold tracking-wide border border-black hover:bg-black hover:text-white transition">
              VIEW ALL ›
            </button>
          </div>

          {/* Right: model overflows upward out of black section */}
          <div className="hidden md:flex items-end self-end relative flex-shrink-0">
            <img
              src={modelImg}
              alt="Hero Tee"
              className="w-auto object-contain object-bottom"
              style={{ height: '540px', marginBottom: '-56px', marginTop: '-180px' }}
            />
            {/* Color swatches */}
            <div className="flex flex-col gap-4 ml-4 mb-20 self-center">
              <div className="w-12 h-12 border-[8px] border-white" style={{ backgroundColor: '#e3f172' }} />
              <div className="w-12 h-12 border-[4px] border-white" style={{ backgroundColor: '#a0a7f1' }} />
              <div className="w-12 h-12 border-[4px] border-white" style={{ backgroundColor: '#d5a26c' }} />
            </div>
          </div>
        </div>

       
    
      </div>
    </section>
  );
};

export default MerchHeroSection;
