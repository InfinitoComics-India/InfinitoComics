import React, { useState, useEffect } from "react";
import research from "../../../assets/Images/ResearchPaper/ResearchImg.png";
import infinito from "../../../assets/Images/ResearchPaper/InfinitoImg.png";
import CarouselShimmer from "./Shimmer/CarouselShimmer";
import { readResearchService } from "../../services/readResearchService";
import { useNavigate } from "react-router-dom";

const InfinitoCarousel = ({ researchPaper, isLoading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const handlePaperClick = async (id) => {
    try {
      const paperDetails = await readResearchService(id); // fetch full paper
      console.log("Full paper data:", paperDetails);

      // Navigate with state
      navigate(`/readresearch/${id}`, { state: { paper: paperDetails.data } });
    } catch (error) {
      console.error("Failed to fetch paper details:", error);
    }
  };

  useEffect(() => {
    if (researchPaper.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % researchPaper.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [researchPaper]);

  if (isLoading) return <CarouselShimmer />;
  if (researchPaper.length === 0) return null;

  return (
    <div className="bg-gray-100 w-full flex justify-center items-start">
      <div className="relative w-full lg:h-[23.75rem] bg-black mt-[7rem] mb-[3rem] text-white flex flex-col lg:flex-row items-start lg:items-center justify-center lg:gap-[5rem] px-4 sm:px-6">
        
        {/* Branding section */}
        <div className="w-full lg:w-auto pt-10 lg:pt-32 px-0">
          <div className="flex items-center gap-2 mb-3 max-w-full overflow-hidden">
            <img
              src={infinito}
              alt="Infinito"
              className="h-10 sm:h-12 lg:h-16 w-auto object-contain"
            />
            <img
              src={research}
              alt="Research"
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </div>

          {/* Desktop Indicators */}
          <div className="hidden lg:flex gap-2 mb-4">
            {researchPaper.map((_, index) => (
              <div
                key={index}
                className={`w-4 h-1 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-[#FF0000] w-6" : "bg-white"
                }`}
              ></div>
            ))}
          </div>

          <p className="text-sm lg:text-[0.875rem] max-w-md">
            One day Spiderman ate a spider, he choked on it, he died. You think that’s the end. NAAAAH!!!
          </p>
        </div>

        {/* Carousel Card */}
        <div className="w-full lg:w-[28.125rem] lg:h-[28.25rem] bg-white text-black shadow-xl mt-6 lg:mt-0 lg:ml-20 py-6 px-5 sm:px-8 lg:py-12 lg:px-10 z-50">
          <h2 className="text-xl lg:text-[1.875rem] font-bold mb-2 line-clamp-2">
            {researchPaper[currentIndex].title}
          </h2>
          <p className="text-[#515151] text-base lg:text-[1.375rem] mb-3">
            {researchPaper[currentIndex].authors?.join(", ")}
          </p>
          <div className="border-l-4 border-[#BAB7B7] pl-3 text-sm text-gray-800 mb-4 line-clamp-5">
            {researchPaper[currentIndex].abstract}
          </div>
          <button
            onClick={() => handlePaperClick(researchPaper[currentIndex]._id)}
            className="border-2 h-[2.625rem] w-[9.375rem] text-[#202020] border-[#202020] text-[0.75rem] font-semibold hover:bg-black hover:text-white transition"
          >
            VIEW PAPER ›
          </button>
        </div>

        {/* Mobile Indicators */}
        <div className="flex lg:hidden justify-center mt-5 pb-2 gap-2 z-50">
          {researchPaper.map((_, index) => (
            <div
              key={index}
              className={`w-4 h-1 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-[#FF0000] w-6" : "bg-white"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfinitoCarousel;
