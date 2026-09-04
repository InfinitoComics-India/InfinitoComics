import React, { useEffect, useState } from 'react';
import { getICBlogs } from '../../services/userServices';
import { Link } from 'react-router-dom';

const All_news = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getICBlogs();
        setBlogs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch IC blogs:', error.message);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="flex justify-center items-start text-gray-800 my-16">
      <div className="w-11/12 lg:w-2/3 flex flex-col lg:flex-row gap-6">
        {/* Main News Section */}
        <div className="w-full">
          {blogs.map((item, index) => (
            <div key={index} className="flex flex-col lg:flex-row gap-3 mb-6">
              <img
                src={item.coverImage || item.news?.[0]?.imageUrl || ''}
                alt="img news"
                className="w-full lg:w-[45%] h-[20rem]  lg:h-[210px] object-cover"
              />
              <div className="flex-1 flex items-start justify-between flex-col">
                <h3 className="text-lg font-bold text-[#DD1215] uppercase">
                  {item.title}
                </h3>
                <p className="text-gray-700 mb-2 text-md">
                  {item.subject ? item.subject.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') : ''}
                </p>
                {item.createdAt && (
                  <p className="text-gray-500 text-xs mb-3">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(item.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
                <Link
                  to={`/news/${item._id}`}
                  className="text-red-600 font-semibold text-sm tracking-widest mt-4 cursor-pointer"
                >
                  READ MORE &gt;
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default All_news;
