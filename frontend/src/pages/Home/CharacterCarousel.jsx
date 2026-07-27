import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {characters} from '../../constants/characterCarousel'
import CharacterCarouselShimmer from '../../shimmer/landingPageShimmer/characterCarouselShimmer'


const CharacterCarousel = () => {
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  // Adjust number of items shown per slide based on screen size
  useEffect(() => {
     setTimeout(() => setLoading(false), 2400); // demo
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 1 : 4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  

  // Show next set of characters
  const nextSlide = () => {
    setSliding(true);
    setTimeout(() => {
      if (startIndex + itemsPerPage < characters.length) {
        setStartIndex(startIndex + itemsPerPage);
      } else {
        setStartIndex(0);
      }
      setSliding(false);
    }, 300);
  };

  // Show previous set of characters
  const prevSlide = () => {
    setSliding(true);
    setTimeout(() => {
      if (startIndex - itemsPerPage >= 0) {
        setStartIndex(startIndex - itemsPerPage);
      } else {
        const lastPageIndex =
          Math.floor((characters.length - 1) / itemsPerPage) * itemsPerPage;
        setStartIndex(lastPageIndex);
      }
      setSliding(false);
    }, 300);
  };

  return loading? <CharacterCarouselShimmer/>: (
    <div className="w-full px-4 py-12 bg-white">
      <div className="max-w-full mx-5 md:mx-60">
        {/* Section title and link */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-widest uppercase text-center md:text-left">
            Know Our Characters
          </h2>
          <Link to="/characters" className="text-lg text-red-600 hover:underline">
            View All ›
          </Link>
        </div>

        <div className="relative">
          {/* Previous arrow button */}
          <button
            onClick={prevSlide}
            className="absolute -left-4 md:-left-8 top-1/2 transform -translate-y-1/2 bg-white border p-2 z-20 shadow-md hover:cursor-pointer"
            disabled={sliding}
          >
            <ChevronLeft />
          </button>

          {/* Character cards carousel */}
          <div
            className={`grid transition-all duration-500 ease-in-out ${
              itemsPerPage === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
            } gap-8 md:gap-10 px-4 md:px-8 ${
              sliding
                ? 'opacity-0 transform translate-x-[-10px]'
                : 'opacity-100 transform translate-x-0'
            }`}
          >
            {characters
              .slice(startIndex, startIndex + itemsPerPage)
              .map((char, index) => (
                <div
                  key={`${char.id}-${index}`}
                  className="relative flex flex-col items-center justify-between h-[300px] md:h-[400px] w-full max-w-[280px] mx-auto transition-all duration-500 ease-in-out"
                >
                  {/* Decorative background shape */}
                  <div className="absolute bottom-0 w-full h-[65%] bg-[#ffeaea] z-0 transform -skew-y-6 mb-3"></div>

                  {/* Character image */}
                  <img
                    src={char.img}
                    alt={char.name}
                    className="h-[200px] md:h-[320px] object-contain relative z-10"
                  />

                  {/* Character name label */}
                  <div className="bg-black w-full text-center py-3  relative z-10">
                    <p className="text-white text-sm tracking-widest">{char.name}</p>
                  </div>
                </div>
              ))}
          </div>

          {/* Next arrow button */}
          <button
            onClick={nextSlide}
            className="absolute -right-4 md:-right-8 top-1/2 transform -translate-y-1/2 bg-white border p-2 z-20 shadow-md hover:cursor-pointer "
            disabled={sliding}
          >
            <ChevronRight />
          </button>
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({
            length: Math.ceil(characters.length / itemsPerPage),
          }).map((_, index) => (
            <div
              key={index}
              className={`w-5 h-2 rounded-full transition-all duration-300 ${
                index === startIndex / itemsPerPage
                  ? "bg-red-600"
                  : "bg-gray-300 border border-black"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CharacterCarousel;
