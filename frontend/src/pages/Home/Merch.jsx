import React from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "../../../assets/Images/merch/MerchModels.png";

const MerchHeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white w-full overflow-x-clip">
      {/* Heading — aligned with Countdown */}
      <div className="w-full pt-6 pb-4 sm:pt-10 sm:pb-7">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold uppercase leading-tight">
            <span className="text-[#0B132B]">INFINITO </span>
            <span className="text-[#E60000]">FASHION CORNER</span>
          </h2>
        </div>
      </div>

      {/* Main Black Banner */}
      <div className="relative w-full bg-[#121212] bg-[radial-gradient(#2a2a2a_1px,transparent_1px)] [background-size:24px_24px] min-h-[290px] sm:min-h-[335px] md:min-h-[345px] flex items-center">
        {/* Model — right side */}
        <div className="hidden md:flex absolute right-[12%] lg:right-[16%] xl:right-[18%] bottom-0 z-10 pointer-events-none items-end">
          <img
            src={heroImage}
            alt="Infinito Fashion Model"
            className="h-[430px] sm:h-[450px] md:h-[465px] lg:h-[475px] w-auto max-w-none object-contain object-bottom"
          />

          {/* Color Swatches */}
          <div className="flex flex-col gap-3 ml-5 mb-14 md:mb-16 pointer-events-auto">
            <div
              className="w-[32px] h-[32px] sm:w-[34px] sm:h-[34px] border-[3px] border-white shadow-sm"
              style={{ backgroundColor: "#d4ea6b" }}
            />

            <div
              className="w-[32px] h-[32px] sm:w-[34px] sm:h-[34px] border-[3px] border-white shadow-sm"
              style={{ backgroundColor: "#9ea7ec" }}
            />

            <div
              className="w-[32px] h-[32px] sm:w-[34px] sm:h-[34px] border-[3px] border-white shadow-sm"
              style={{ backgroundColor: "#d5a26c" }}
            />
          </div>
        </div>

        {/* Content — same horizontal alignment as Countdown */}
        <div className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 py-6 sm:py-7 md:py-8">
          <div className="relative flex items-center">
            {/* Left Content */}
            <div className="relative z-20 w-full md:w-[48%] text-white">
              <h1 className="uppercase font-bold text-[28px] sm:text-[36px] md:text-[38px] leading-[1.07] tracking-tight">
                <span className="block text-[#E60000]">Become</span>
                <span className="block text-white">One of Us</span>
                <span className="block text-[#E60000]">Become</span>
                <span className="block text-white">Infinito</span>
              </h1>

              <p className="mt-2 sm:mt-2.5 max-w-[390px] text-xs sm:text-[12px] leading-[1.5] font-medium text-gray-200">
                Brings you stylish, trendy, and timeless fashion that expresses
                your personality and celebrates your unique style.
              </p>

              {/* Shop Button */}
              <button
                type="button"
                onClick={() => navigate("/shop")}
                className="mt-4 sm:mt-6 flex items-center justify-between gap-6 min-w-[165px] px-5 py-2.5 bg-[#E60000] hover:bg-red-700 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-sm transition-all shadow-md cursor-pointer"
              >
                <span>INFINITO SHOP</span>
                <span>&gt;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MerchHeroSection;