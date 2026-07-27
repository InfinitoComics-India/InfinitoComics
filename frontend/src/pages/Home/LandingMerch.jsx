import { useState, useEffect } from "react";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import tshirtImage from '../../../assets/Images/tShirts&Collectibles/tshirt.jpg';
import shareIcon from '../../../assets/Images/shareIcon.png';
import LandingMerchShimmer from "../../shimmer/landingPageShimmer/landingMerchShimmer";


const items = [
  {
    id: 1,
    title: 'Studio Ghibli Graphicx',
    price: '₹599.00',
    image: tshirtImage,
    tag: 'NEW RELEASES',
  },
  {
    id: 2,
    title: 'Studio Ghibli Graphicx',
    price: '₹599.00',
    image: tshirtImage,
    tag: 'TSHIRTS',
  },
  {
    id: 3,
    title: 'Studio Ghibli Graphicx',
    price: '₹599.00',
    image: tshirtImage,
    tag: 'COLLECTIBLES',
  },
];

const CollectorShowcase = () => {
    const [loading, setLoading] = useState(true);
     useEffect(() => {
        // fetch data / preload hero image ...
        setTimeout(() => setLoading(false), 2400); // demo
      }, []);
  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

const renderCard = (item) => (
  
  <div
    key={item.id}
    className="w-full relative shadow-md  overflow-hidden flex flex-col justify-between"
    style={{ height: "33.5rem" }} // 500px
  >
    {/* Top Section (Image & Info with skew) */}
    <div
      className="flex flex-col flex-grow bg-[#E0E0E0] p-[1.5rem] relative"
      style={{
        clipPath: "polygon(0 0, 100% 0, 100% 97%, 0 100%)",
      }}
    >
      {/* Share icon */}
     

      {/* Text overlay */}
      <div
        className="absolute z-10 text-black"
        style={{ top: "1rem", left: "1rem" }}
      >
        <p className="text-[1rem] md:text-[1.125rem] font-semibold">
          {item.title}
        </p>
        <p className="text-[1.375rem] md:text-[1.375rem] font-extrabold">
          {item.price}
        </p>
      </div>

      {/* Centered Image */}
      <div className="flex-1 flex items-end justify-center z-0 mt-auto">
        <img
          src={item.image}
          alt={item.title}
          className="object-contain"
          style={{ height: "27rem" }}
        />
      </div>
    </div>

    {/* Bottom Tag with skew and rounded bottom */}
    <div
      className="w-full h-[2.5rem] text-white bg-[#202020] flex justify-center items-center text-center font-bold "
      style={{
        clipPath: "polygon(0 30%, 100% 0, 100% 100%, 0 100%)",
        marginTop: "0.5rem",
      }}
    >
      {item.tag}
    </div>
  </div>
);



  return loading?<LandingMerchShimmer/>: (
    <div className="bg-white py-16 px-4 md:px-10 lg:px-20">
      <div className="w-full">
{/* Headings */}
<div className="mb-10 mx-5 md:mx-50 text-center md:text-left">
  <p className="text-sm sm:text-base md:text-lg font-medium text-black tracking-wide">
    Exclusive Merch
  </p>
  <h2 className="text-xl sm:text-2xl md:text-4xl font-bold tracking-widest uppercase leading-tight">
    Collector’s Paradise
  </h2>
</div>


        {/* Mobile View Slider */}
        <div className="md:hidden">
          <Slider {...settings}>
            {items.map((item) => (
              <div key={item.id} className="px-2">{renderCard(item)}</div>
            ))}
          </Slider>
        </div>

        {/* Desktop View Grid */}
        <div className="hidden md:flex justify-center gap-35 flex-wrap">
          {items.map((item) => (
            <div key={item.id} className="w-[350px]">{renderCard(item)}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectorShowcase;
