import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRegUserCircle } from 'react-icons/fa';
import { getBlogsById } from '../../services/userServices';
import Trending from '../../constants/Trending';
import { IoStarSharp } from "react-icons/io5";

const NewsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const blog = await getBlogsById(id);
        setSelectedNews(blog.data);
      } catch (error) {
        console.error("Failed to fetch blog:", error.message);
      }
    };

    fetchBlog();
  }, [id]);

  if (!selectedNews) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="flex justify-center my-8">
      <div className="w-11/12 lg:w-2/3">
        <button
          onClick={() => navigate(-1)}
          className="text-sm hover:underline mb-8 tracking-widest font-semibold cursor-pointer"
        >
          ← BACK TO BLOGS & NEWS
        </button>

        <h1
          className="text-4xl sn:text-4xl lg:text-5xl font-black text-[#DD1215] mb-2"
          style={{ fontFamily: 'DM Sans' }}
        >
          {selectedNews.title}
        </h1>

        <p
          className="text-xl md:text-xl text-[#111111] mb-4"
          style={{ fontFamily: 'DM Sans', fontWeight: '500' }}
        >
          {selectedNews.subject}
        </p>

        <div className="flex items-center gap-2 pt-3 mb-6 text-sm text-gray-700">
          <FaRegUserCircle className="text-2xl" />
          <p className="text-base md:text-md font-semibold">
            By <span>{selectedNews.authorName}</span>&nbsp;&nbsp;-&nbsp;&nbsp;
            {new Date(selectedNews.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row pt-6">
          {/* Left content */}
          <div className="flex-1 w-full lg:w-4/7 lg:pr-10">
            {selectedNews.news?.map((item, idx) => (
              <div key={idx} className="mb-8">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt="news"
                    className="w-full lg:h-[24rem] mb-4 object-cover"
                  />
                )}
                <p
                  className="text-md sm:text-lg lg:text-md leading-relaxed mb-6 text-[#111111]"
                  style={{ fontFamily: 'DM Sans', fontWeight: '500' }}
                >
                  {item.story}
                </p>
              </div>
            ))}
          </div>

          {/* Right sidebar */}
          <div className="scrollbar-hide hidden lg:block w-full lg:w-2/7 border-t-6 border-red-600 bg-[#3C3C3C] p-4 max-h-[1600px] overflow-y-auto scrollbar-hide">
            <h1 className="text-white font-black text-xl text-center mb-6 flex justify-start items-center gap-1">
              <IoStarSharp className='text-yellow-300' /> TRENDING NEWS
            </h1>
            {Trending.map((item, index) => (
              <div key={index} className="mb-4">
                <img
                  src={item.image}
                  alt="Trending news"
                  className="w-full h-[8rem] mb-1 object-cover"
                />
                <p className="text-[#C6C6C6] text-[0.7rem] tracking-wide uppercase leading-snug whitespace-pre-wrap">
                  {item.title}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default NewsDetails;
