import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CharacterCarouselShimmer from "../../shimmer/landingPageShimmer/characterCarouselShimmer";
import { getAll } from "../../services/CharacterServices";

// Decide slides per view dynamically
const getSlidesToShow = () => {
  if (window.innerWidth < 640) return 1; // Mobile
  if (window.innerWidth < 1024) return 2; // Tablet
  return 4; // Desktop
};

const FeaturedCharactersCarousel = () => {
  const [loading, setLoading] = useState(true);
  const [slidesToShow, setSlidesToShow] = useState(getSlidesToShow());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [characters, setCharacters] = useState([]);
  const [sliding, setSliding] = useState(false);
  const navigate = useNavigate();

  // Fetch characters from API
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const resData = await getAll();
        const charArray = Array.isArray(resData.data) ? resData.data : [];
        const formatted = charArray.map((char) => ({
          id: char._id,
          name: char.originalName || "Unknown",
          image: char.mainImageUrl || "",
        }));
        setCharacters(formatted);
      } catch (err) {
        console.error("Error fetching characters:", err);
      } finally {
        setTimeout(() => setLoading(false), 2400);
      }
    };
    fetchCharacters();
  }, []);

  // Update slidesToShow on resize
  useEffect(() => {
    const handleResize = () => {
      setSlidesToShow(getSlidesToShow());
      setCurrentIndex(0);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Pagination
  const totalGroups = Math.ceil(characters.length / slidesToShow);

  const nextSlide = () => {
    setSliding(true);
    setTimeout(() => {
      if (currentIndex + slidesToShow < characters.length) {
        setCurrentIndex(currentIndex + slidesToShow);
      } else {
        setCurrentIndex(0);
      }
      setSliding(false);
    }, 300);
  };

  const prevSlide = () => {
    setSliding(true);
    setTimeout(() => {
      if (currentIndex - slidesToShow >= 0) {
        setCurrentIndex(currentIndex - slidesToShow);
      } else {
        const lastPageIndex =
          Math.floor((characters.length - 1) / slidesToShow) * slidesToShow;
        setCurrentIndex(lastPageIndex);
      }
      setSliding(false);
    }, 300);
  };

  if (loading) return <CharacterCarouselShimmer />;

  return (
    <div className="w-full px-4 py-8 sm:py-12 bg-white">
      <div className="max-w-full mx-4 sm:mx-8 lg:mx-20 xl:mx-40">
        {/* Title & View All */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-10 gap-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-widest uppercase text-center sm:text-left">
            Featured Characters
          </h2>
          <Link
            to="/characters"
            className="text-sm sm:text-base md:text-lg text-red-600 hover:underline"
          >
            View All ›
          </Link>
        </div>

        <div className="relative">
          {/* Prev Arrow */}
          <button
            onClick={prevSlide}
            disabled={sliding}
            className="absolute left-2 sm:-left-4 lg:-left-8 top-1/2 transform -translate-y-1/2 bg-white border p-1 sm:p-2 z-20 shadow-md"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Carousel */}
          <div
            className={`grid transition-all duration-500 ease-in-out ${
              slidesToShow === 1
                ? "grid-cols-1"
                : slidesToShow === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
            } gap-4 sm:gap-6 md:gap-8 px-2 sm:px-4 md:px-6 ${
              sliding
                ? "opacity-0 transform translate-x-[-10px]"
                : "opacity-100 transform translate-x-0"
            }`}
          >
            {characters
              .slice(currentIndex, currentIndex + slidesToShow)
              .map((char) => (
                <div
                  key={char.id}
                  className="relative flex flex-col items-center justify-between h-[260px] sm:h-[320px] md:h-[380px] w-full mx-auto cursor-pointer"
                  onClick={() =>
                    navigate("/characters/biography", { state: char.id })
                  }
                >
                  <img
                    src={char.image}
                    alt={char.name}
                    className="h-[160px] sm:h-[200px] md:h-[280px] object-contain"
                  />
                  <div className="bg-black w-full text-center py-2 sm:py-3">
                    <p className="text-white text-xs sm:text-sm md:text-base tracking-widest truncate px-2">
                      {char.name}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          {/* Next Arrow */}
          <button
            onClick={nextSlide}
            disabled={sliding}
            className="absolute right-2 sm:-right-4 lg:-right-8 top-1/2 transform -translate-y-1/2 bg-white border p-1 sm:p-2 z-20 shadow-md"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalGroups }).map((_, index) => (
            <div
              key={index}
              className={`w-4 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex / slidesToShow
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

export default FeaturedCharactersCarousel;
