import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getFoundationBlogs } from "../../services/userServices.js"; 
import { Link } from "react-router-dom";

const ArcherySlider = () => {
  const [blogs, setBlogs] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getFoundationBlogs();
        setBlogs(data);
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

  const nextSlide = () => {
    setSliding(true);
    setTimeout(() => {
      if (startIndex + itemsPerPage < blogs.length) {
        setStartIndex(startIndex + itemsPerPage);
      } else {
        setStartIndex(0);
      }
      setSliding(false);
    }, 300);
  };

  const prevSlide = () => {
    setSliding(true);
    setTimeout(() => {
      if (startIndex - itemsPerPage >= 0) {
        setStartIndex(startIndex - itemsPerPage);
      } else {
        const lastPageIndex =
          Math.floor((blogs.length - 1) / itemsPerPage) * itemsPerPage;
        setStartIndex(lastPageIndex);
      }
      setSliding(false);
    }, 300);
  };

  return (
    <div className=" py-6 w-11/12 lg:w-2/3 mx-auto">
      <div className="max-w-[1150px] mx-auto">
        <div className="relative">
          {/* left button  */}
          <button
            onClick={prevSlide}
            className="absolute -left-5 lg:-left-16 top-[48%] md:top-[26%] lg:top-1/3 transform -translate-y-1/2 bg-white border p-2 z-20 shadow-md hover:cursor-pointer"
            disabled={sliding}
          >
            <ChevronLeft />
          </button>

          {/* cards box  */}
          <div
            className={`grid transition-all duration-500 ease-in-out ${
              itemsPerPage === 1
                ? "grid-cols-1"
                : "grid-cols-1 sm:grid-cols-4"
            } gap-2 md:gap-3 ${
              sliding
                ? "opacity-0 transform translate-x-[-10px]"
                : "opacity-100 transform translate-x-0"
            }`}
          >
            {blogs.slice(startIndex, startIndex + itemsPerPage).map((item, index) => (
              <Link to={`/news/${item._id}`} key={index} className="text-start ">
                <img
                  src={item.news?.[0]?.imageUrl}
                  alt={item.title}
                  className="w-full h-[240px] md:h-[140px] object-cover mb-1"
                />
                <h3 className="text-red-600 font-bold uppercase text-sm">{item.title}</h3>
                <p className="text-xs text-gray-600">{item.subject}</p>
              </Link>
            ))}
          </div>

          {/* right button  */}
          <button
            onClick={nextSlide}
            className="absolute -right-5 lg:-right-16 top-[48%] md:top-[26%] lg:top-1/3 transform -translate-y-1/2 bg-white border p-2 z-20 shadow-md hover:cursor-pointer"
            disabled={sliding}
          >
            <ChevronRight />
          </button>
        </div>

        <div className="flex justify-center mt-1 gap-2">
          {Array.from({
            length: Math.ceil(blogs.length / itemsPerPage),
          }).map((_, index) => (
            <div
              key={index}
              className={`w-5 h-2 rounded-full transition-all duration-300 ${
                index === Math.floor(startIndex / itemsPerPage)
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

export default ArcherySlider;
