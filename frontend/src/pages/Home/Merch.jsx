import React from 'react';
import heroImage from '../../../assets/Images/merch/MerchModel.png';

const MerchHeroSection = () => {
  return (
    <section className="bg-white">
      {/* Heading */}
      <div className="ml-[250px]">
        <h2 className="text-[36px] font-bold uppercase">
          Style yourself like a super hero
        </h2>
      </div>

      {/* Main Black Section */}
      <div className="relative w-full mt-[40px] bg-[#121212] h-[527.52px] bg-[radial-gradient(#2a2a2a_1px,transparent_1px)] [background-size:24px_24px] ">
        <div className="w-full h-full flex items-center justify-between relative z-10">
        {/* Left content */}
        <div className="text-white max-w-[1100px] mt-[-80px]"> {/* moved up by 40px */}
          <p className="text-[24px] ml-[250px] leading-relaxed font-medium">
            Step into the Infinito Universe with exclusive gear crafted for fans who know every panel, plot twist, and power move.
          </p>
          <p className="text-[24px] ml-[250px] mt-[36.52px] font-semibold">
            Limited drops. Infinite style.
          </p>

          <button className="mt-[46.52px] ml-[250px] px-6 py-3 bg-white text-black font-semibold tracking-wide border border-black hover:bg-black hover:text-white transition">
            SHOP NOW ›
          </button>
        </div>

          {/* Right image */}
          <div className="relative min-w-[492.4px]">
            <img
              src={heroImage}
              alt="Hero Tee"
              className="h-[746.06px] w-[492.4px] object-contain absolute bottom-[-265px] right-50"
            />

            {/* Color swatches */}
            <div className="absolute -bottom-20 left-[250px] space-y-4 z-30">
              <div className="w-[53px] h-[53px] border-[10px] border-white " style={{ backgroundColor: '#e3f172' }}></div>
              <div className="w-[53px] h-[53px] border-[5px] border-white " style={{ backgroundColor: '#a0a7f1' }}></div>
              <div className="w-[53px] h-[53px] border-[5px] border-white " style={{ backgroundColor: '#d5a26c' }}></div>
            </div>
          </div>
        </div>

        {/* Overlay text box */}
        <div className="absolute bottom-[50px] left-0 w-full z-0 h-15 bg-white text-black flex items-center pl-[250px] text-2xl font-bold tracking-widest">
  tees • hoodies • art prints • collectibles
</div>

      </div>
    </section>
  );
};

export default MerchHeroSection;
