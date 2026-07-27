// 📁 src/components/CollectorShowcaseShimmer.jsx
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const CollectorShowcaseShimmer = () => {
  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const renderShimmerCard = (key) => (
    <div
      key={key}
      className="w-full relative shadow-md overflow-hidden flex flex-col justify-between animate-pulse"
      style={{ height: '33.5rem' }}
    >
      {/* Top Section */}
      <div
        className="flex flex-col flex-grow bg-[#E0E0E0] p-[1.5rem] relative"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 97%, 0 100%)' }}
      >
        {/* Share icon placeholder */}
        <div className="absolute top-4 right-4 w-12 h-12 bg-gray-300 rounded-full z-10" />

        {/* Text overlay shimmer */}
        <div className="absolute top-4 left-4 z-10">
          <div className="w-40 h-4 bg-gray-300 rounded mb-2"></div>
          <div className="w-32 h-6 bg-gray-300 rounded"></div>
        </div>

        {/* Image Placeholder */}
        <div className="flex-1 flex items-end justify-center mt-auto">
          <div className="w-full h-[27rem] bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Bottom tag shimmer */}
      <div
        className="w-full h-[2.5rem] bg-[#c7c7c7]"
        style={{
          clipPath: 'polygon(0 30%, 100% 0, 100% 100%, 0 100%)',
          marginTop: '0.5rem',
        }}
      ></div>
    </div>
  );

  return (
    <div className="bg-white py-16 px-4 md:px-10 lg:px-20">
      <div className="w-full">
        {/* Headings shimmer */}
        <div className="mb-10 animate-pulse">
          <div className="w-40 h-5 bg-gray-300 mb-2 rounded"></div>
          <div className="w-80 h-9 bg-gray-300 rounded"></div>
        </div>

        {/* Mobile Slider View */}
        <div className="md:hidden">
          <Slider {...settings}>
            {[1, 2, 3].map((key) => (
              <div key={key} className="px-2">{renderShimmerCard(key)}</div>
            ))}
          </Slider>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden md:flex justify-center gap-[35px] flex-wrap">
          {[1, 2, 3].map((key) => (
            <div key={key} className="w-[350px]">{renderShimmerCard(key)}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectorShowcaseShimmer;