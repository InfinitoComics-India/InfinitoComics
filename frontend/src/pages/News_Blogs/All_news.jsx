import React, { useEffect, useState } from 'react';
import { getICBlogs } from '../../services/userServices';
import Trending from '../../constants/Trending';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const All_news = () => {
  const [blogs, setBlogs] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const visibleSlides = 1;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getICBlogs();
        setBlogs(data);
      } catch (error) {
        console.error('Failed to fetch IC blogs:', error.message);
      }
    };
    fetchBlogs();
  }, []);

  const nextSlide = () => {
    if (slideIndex < Trending.length - visibleSlides) {
      setSlideIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (slideIndex > 0) {
      setSlideIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="flex justify-center items-start text-gray-800 my-16">
      <div className="w-11/12 lg:w-2/3 flex flex-col lg:flex-row gap-6">
        {/* Main News Section */}
        <div className="w-full">
          {blogs.map((item, index) => (
            <div key={index} className="flex flex-col lg:flex-row gap-3 mb-6">
              <img
                src={item.news?.[0]?.imageUrl}
                alt="img news"
                className="w-full lg:w-[45%] h-[20rem]  lg:h-[210px] object-cover"
              />
              <div className="flex-1 flex items-start justify-between flex-col">
                <h3 className="text-lg font-bold text-[#DD1215] uppercase">
                  {item.title}
                </h3>
                <p className="text-gray-700 mb-4 text-md">{item.subject}</p>
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

        {/* Desktop Trending */}
        {/* <div className="hidden lg:block w-full lg:w-[350px] max-h-[57rem] overflow-y-auto bg-[#3C3C3C] border-t-6 border-red-600 px-4 py-3">
          <h1 className="text-white font-bold text-xl tracking-wider mb-5">
            TRENDING NEWS
          </h1>
          <div className="space-y-4">
            {Trending.map((item, index) => (
              <div key={index}>
                <img
                  src={item.image}
                  alt="Trending"
                  className="w-full h-[8.5rem] object-cover"
                />
                <p className="text-[#C6C6C6] uppercase text-xs mt-1">
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div> */}

        {/* Mobile Trending - Slider */}
        {/* <div className="lg:hidden mt-6 w-full">
          <div className="bg-[#3C3C3C] border-t-4 border-red-600 px-4 py-4 relative">
            <h1 className="text-white font-bold text-2xl lg:text-2xl tracking-wider mb-3 flex justify-between items-center">
              <p>TRENDING NEWS</p>
              <p className='text-red-500 text-sm md:text-md tracking-widest'>VIEW MORE &gt;</p> 
            </h1>

            <div className="flex justify-between items-center mb-3">
              <button onClick={prevSlide} disabled={slideIndex === 0}>
                <ChevronLeft className="text-white" />
              </button>
              <button
                onClick={nextSlide}
                disabled={slideIndex >= Trending.length - visibleSlides}
              >
                <ChevronRight className="text-white" />
              </button>
            </div>

            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${slideIndex * 100}%)`,
                  width: `${Trending.length * 100}%`,
                }}
              >
                {Trending.map((item, index) => (
                  <div key={index} className="w-full flex-shrink-0 pr-3">
                    <img
                      src={item.image}
                      alt="Trending"
                      className="w-full h-[18rem] lg:h-[10rem] object-cover"
                    />
                    <p className="text-[#C6C6C6] uppercase text-xs mt-2">
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default All_news;
