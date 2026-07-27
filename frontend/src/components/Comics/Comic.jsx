import React, { useEffect, useState, useRef } from 'react';
import { fetchComics } from '../../services/ComicService.js';
import ComicCard from './Card.jsx';
import SoldCard from './SoldCard.jsx';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Optional: you can use any icon library

function Comic() {
  const [comics, setComics] = useState([]);
  const sliderRef = useRef(null);

  const fetchAllComics = async () => {
    try {
      const res = await fetchComics();
      setComics(Array.isArray(res) ? res : []);
    }
    catch (err) {
      console.log("Error fetching comics from frontend file(Comic.js): ", err);
       setComics([]);
    }
  }

  useEffect(() => {
    fetchAllComics();
  }, [])

  const scrollLeft = () => {
    sliderRef.current.scrollBy({ left: -260, behavior: 'smooth' });
  };

  const scrollRight = () => {
    sliderRef.current.scrollBy({ left: 260, behavior: 'smooth' });
  };

  const reversedComics = (comics || []).slice().reverse();

  return (
    <div className="w-11/12 lg:w-2/3 mx-auto mt-16">
      <div className="flex justify-between items-center mb-4 ">
        <h2 className="text-3xl font-bold text-gray-800 uppercase tracking-widest">Fan Favourites &gt;</h2>
        <button className="text-red-600 text-[0.8rem] font-bold tracking-widest hover:underline hover:cursor-pointer">VIEW MORE &gt;</button>
      </div>

      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          className="absolute -left-16 top-1/2 -translate-y-1/2 z-10 bg-white p-2 shadow border border-black hover:bg-gray-50 cursor-pointer"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Slider Container */}
        <div
          ref={sliderRef}
          className="flex overflow-x-auto no-scrollbar scroll-smooth space-x-4 "
        >
          <>
            {/* First 2 as available */}
            {reversedComics.slice(0, 2).map((comic) => (
              <ComicCard key={comic._id} comic={comic} />
            ))}

            {/* Rest as sold out */}
            {reversedComics.slice(2).map((comic) => (
              <SoldCard key={comic._id} comic={comic} />
            ))}
          </>

        </div>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          className="absolute -right-16 top-1/2 -translate-y-1/2 z-10 bg-white p-2 shadow border border-black hover:bg-gray-50 cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default Comic;
