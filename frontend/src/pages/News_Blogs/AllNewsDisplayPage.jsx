import React, { useEffect, useState } from 'react';
import { getAllBlogs } from '../../services/userServices';
import { Link } from 'react-router-dom';

const AllNewsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 5;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getAllBlogs();
        setBlogs(data);
      } catch (error) {
        console.error("Error fetching blogs:", error.message);
      }
    };

    fetchBlogs();
  }, []);

  const totalPages = Math.ceil(blogs.length / blogsPerPage);
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((currentPage) => currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((currentPage) => currentPage + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex justify-center items-start text-gray-800 my-16 px-4">
      <div className="w-11/12 lg:w-2/3">
        <h1 className="text-4xl font-extrabold text-center text-[#302626] mb-10">All News & Blogs</h1>

        {blogs.length === 0 ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          currentBlogs.map((blog) => (
            <Link to={`/news/${blog._id}`} key={blog._id} className="block w-full mb-6">
              <div className="flex flex-col md:flex-row items-start gap-4 bg-gray-100 p-2 shadow-sm hover:shadow-md transition-shadow duration-300">
                {blog.news?.[0]?.imageUrl && (
                  <img
                    src={blog.news[0].imageUrl}
                    alt={blog.title}
                    className="w-full md:w-64 h-48 md:h-40 object-cover"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-[#DD1215] mb-2">{blog.title}</h2>
                  <p className="text-gray-700 text-[0.8rem]">{blog.subject}</p>
                  <p className="text-gray-500 text-xs mt-2">
                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}

        {blogs.length > blogsPerPage && (
          <div className="flex justify-center mt-8 gap-3 text-[#DE1215]">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`border py-2 px-4 text-sm font-semibold hover:bg-[#DE1215] hover:text-white hover:cursor-pointer
        ${currentPage === 1 ? "opacity-50 cursor-not-allowed border-[#DE1215]" : "border-[#DE1215]"}`}
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageClick(i + 1)}
                className={`border py-2 px-4 text-sm font-semibold hover:bg-[#DE1215] hover:text-white hover:cursor-pointer
          ${currentPage === i + 1 ? "bg-red-600 text-white" : "border-[#DE1215]"}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`border py-2 px-4 text-sm font-semibold hover:bg-[#DE1215] hover:text-white hover:cursor-pointer
        ${currentPage === totalPages ? "opacity-50 cursor-not-allowed border-[#DE1215]" : "border-[#DE1215]"}`}
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AllNewsPage;
