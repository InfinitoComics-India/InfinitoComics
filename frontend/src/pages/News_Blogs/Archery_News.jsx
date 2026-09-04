import React, { useEffect, useState } from "react";
import { getAllBlogs } from "../../services/userServices";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ArcheryNews = () => {
  const [blogs, setBlogs] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getAllBlogs();
        if (Array.isArray(data) && data.length > 0) {
          // Filter published blogs and sort by createdAt descending (newest first)
          const publishedBlogs = data
            .filter((b) => b.published !== false && b.status !== "draft")
            .sort(
              (a, b) =>
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime()
            );
          setBlogs(publishedBlogs);
        }
      } catch (error) {
        console.error("Failed to fetch blogs for slider:", error.message);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePrev = () => {
    setStartIndex((prev) =>
      prev - itemsPerPage >= 0
        ? prev - itemsPerPage
        : Math.max(0, Math.floor((blogs.length - 1) / itemsPerPage) * itemsPerPage)
    );
  };

  const handleNext = () => {
    setStartIndex((prev) =>
      prev + itemsPerPage < blogs.length ? prev + itemsPerPage : 0
    );
  };

  if (blogs.length === 0) {
    return null;
  }

  const visibleBlogs = blogs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="py-6 w-11/12 lg:w-2/3 mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-4xl font-extrabold">LATEST UPDATES</h2>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          itemsPerPage === 1
            ? "grid-cols-1"
            : itemsPerPage === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        } gap-6`}
      >
        {visibleBlogs.map((blog) => {
          const img = blog.coverImage || blog.news?.[0]?.imageUrl || "";
          return (
            <div
              key={blog._id}
              className="flex flex-col justify-between h-full group bg-white"
            >
              <div>
                <Link
                  to={`/news/${blog._id}`}
                  className="block w-full h-[220px] overflow-hidden rounded-lg bg-gray-100 shadow-sm"
                >
                  {img ? (
                    <img
                      src={img}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No Image Available
                    </div>
                  )}
                </Link>

                <Link to={`/news/${blog._id}`}>
                  <h3 className="text-[#DD1215] font-extrabold text-lg leading-snug line-clamp-2 mt-4 hover:underline">
                    {blog.title}
                  </h3>
                </Link>
              </div>

              <div className="mt-3">
                <Link
                  to={`/news/${blog._id}`}
                  className="text-[#DD1215] font-bold text-xs uppercase tracking-wider hover:text-black transition-colors inline-block"
                >
                  READ MORE &gt;
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {blogs.length > itemsPerPage && (
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
            className="p-2.5 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-100 cursor-pointer flex items-center justify-center transition-colors text-black"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex justify-center items-center gap-2">
            {Array.from({
              length: Math.ceil(blogs.length / itemsPerPage),
            }).map((_, index) => (
              <button
                key={index}
                onClick={() => setStartIndex(index * itemsPerPage)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  index === Math.floor(startIndex / itemsPerPage)
                    ? "w-6 bg-[#DD1215]"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            aria-label="Next slide"
            className="p-2.5 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-100 cursor-pointer flex items-center justify-center transition-colors text-black"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ArcheryNews;
