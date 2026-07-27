import React, { useState } from 'react';
import slide1 from "../../../assets/Images/Ultimate/ultimateCarousel.jpg";
import belowImage from "../../../assets/Images/Ultimate/Botton.png";
import overlayImage from "../../../assets/Images/Ultimate/OverlayImage.png";
import leftOverlayImage from "../../../assets/Images/Ultimate/leftoverlay.png";
import rightOverlayImage from "../../../assets/Images/Ultimate/rightoverlay.png";
import universetext from "../../../assets/Images/Ultimate/universeText.png";


const images = [
  { id: 1, url: slide1 },
  { id: 2, url: slide1 },
  { id: 3, url: slide1 },
  { id: 4, url: slide1 },
  { id: 5, url: slide1 },
];

const Home = () => {
  const [current, setCurrent] = useState(0);

  return (
    <div className="w-full text-white">

      {/* Desktop View (Untouched) */}
      <div className="relative w-full h-[80vh] overflow-hidden hidden md:block">

        {/* Background Image */}
        <img
          src={images[current].url}
          alt={`Slide ${current + 1}`}
          className="w-full h-full object-cover object-top"
        />

        {/* Main Overlay */}
        <img
          src={overlayImage}
          alt="Overlay"
          className="absolute inset-0 w-full  h-full z-10 pointer-events-none object-cover"
        />
        <img
          src={leftOverlayImage}
          alt="Left Overlay"
          className="absolute left-0 top-0 h-full z-10 pointer-events-none object-contain"
        />
        <img
          src={rightOverlayImage}
          alt="Right Overlay"
          className="absolute right-0 top-0 h-full z-10 pointer-events-none object-contain"
        />

        {/* Desktop Text Content */}
        <div className='w-full flex justify-center'>
          <div className="absolute w-2/3 inset-0 flex flex-col items-start justify-center text-left px-8 md:px-16 z-20 md:mx-30">
            <img src={universetext} alt="" className='mb-3' />
            <p className="mt-4 max-w-2xl w-[29rem] text-lg md:text-xl">
              Welcome to Infinito Ultimate — your all-access pass to India's first multiverse comic subscription. anywhere else.
            </p>
            <button className="mt-8 h-16 w-72 bg-[#DD1215] hover:bg-red-600 text-white font-semibold py-2 px-4 transition duration-300">
              TRY INFINITO ULTIMATE
            </button>
            <p className="mt-8 text-xl">
              Already a subscriber? <span className="underline">Start reading!</span>
            </p>
          </div>
        </div>
      </div>

      {/* Mobile View (60% Image + 40% Black Text) */}
      <div className="block md:hidden w-full">

        {/* 60% Image with Shadow */}
        <div className="relative w-full h-[45vh]  overflow-hidden">
          <img
            src={images[current].url}
            alt={`Slide ${current + 1}`}
            className="w-full h-full object-cover object-top "
          />
          <div className="absolute bottom-0 w-full mt-5 h-45 mb-[-20px] bg-gradient-to-t from-black/90 to-transparent z-20" />
        </div>

        {/* 40% Text Section */}
        <div className="w-full bg-black   px-8  text-left h-[35vh] flex flex-col justify-center">
          <h2 className="text-2xl font-bold  mt-[-4rem] z-50 ">A UNIVERSE OF STORIES.</h2>
          <h3 className="text-[#DD1215] text-2xl font-bold mb-4 z-50">UNLOCKED.</h3>
          <p className="text-base mb-5 z-50">
            Welcome to Infinito Ultimate — your all-access pass to India’s first multiverse comic subscription. anywhere else.
          </p>
          <button className="w-2/3 bg-[#DD1215] text-[0.8rem] hover:bg-red-600 h-8 text-white  transition duration-300">
            TRY INFINITO ULTIMATE &gt;
          </button>
          <p className="mt-4 text-base">
            Already a subscriber? <span className="underline">Start reading!</span>
          </p>
        </div>
      </div>

      {/* Below Image with Shadow (Untouched) */}
      <div className="relative w-full -mt-1">
        <div className="absolute -top-16 w-full h-16 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
        <img src={belowImage} alt="Below Carousel" className="w-full object-cover relative z-0" />
      </div>

    </div>
  );
};

export default Home;
