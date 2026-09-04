import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getFoundationBlogs } from "../../services/userServices.js"; 
import { Link } from "react-router-dom";

const ArcherySlider = () => {
  const [blogs, setBlogs] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getFoundationBlogs();
        setBlogs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching blogs:", error.message);
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 1 : 4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const prevSlide = () => {
    setStartIndex((prev) =>
      prev - itemsPerPage >= 0
        ? prev - itemsPerPage
        : Math.max(0, Math.floor((blogs.length - 1) / itemsPerPage) * itemsPerPage)
    );
  };

  const nextSlide = () => {
    setStartIndex((prev) =>
      prev + itemsPerPage < blogs.length ? prev + itemsPerPage : 0
    );
  };

  if (blogs.length === 0) {
    return null;
  }

  return (
    <div className="py-6 w-11/12 lg:w-2/3 mx-auto">
      <div className="max-w-[1150px] mx-auto">
        <div className="relative">
          {/* left button  */}
          <button
            onClick={prevSlide}
            className="absolute -left-5 lg:-left-12 top-1/2 transform -translate-y-1/2 bg-white border border-gray-300 p-2 z-20 shadow-md rounded hover:bg-gray-100 cursor-pointer text-black"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>

          {/* cards box  */}
          <div
            className={`grid transition-all duration-500 ease-in-out ${
              itemsPerPage === 1
                ? "grid-cols-1"
                : "grid-cols-1 sm:grid-cols-4"
            } gap-2 md:gap-3`}
          >
            {blogs.slice(startIndex, startIndex + itemsPerPage).map((item, index) => (
              <Link to={`/news/${item._id}`} key={index} className="text-start group">
                <img
                  src={item.coverImage || item.news?.[0]?.imageUrl || ''}
                  alt={item.title}
                  className="w-full h-[240px] md:h-[140px] object-cover mb-1 group-hover:opacity-90 transition-opacity"
                />
                <h3 className="text-red-600 font-bold uppercase text-sm group-hover:underline line-clamp-1">{item.title}</h3>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {item.subject ? item.subject.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') : ''}
                </p>
              </Link>
            ))}
          </div>

          {/* right button  */}
          <button
            onClick={nextSlide}
            className="absolute -right-5 lg:-right-12 top-1/2 transform -translate-y-1/2 bg-white border border-gray-300 p-2 z-20 shadow-md rounded hover:bg-gray-100 cursor-pointer text-black"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {blogs.length > itemsPerPage && (
          <div className="flex justify-center mt-3 gap-2">
            {Array.from({
              length: Math.ceil(blogs.length / itemsPerPage),
            }).map((_, index) => (
              <button
                key={index}
                onClick={() => setStartIndex(index * itemsPerPage)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  index === Math.floor(startIndex / itemsPerPage)
                    ? "w-6 bg-red-600"
                    : "w-2 bg-gray-300 border border-black hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArcherySlider;
