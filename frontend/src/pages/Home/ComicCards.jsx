import React from "react";
import "../../../index.css"; // Custom global styles (used for no-scrollbar)
import captainMarvel from "../../../assets/Images/captainMarvel.png"; // Example comic image
import { comics } from "../../constants/fanfav"; // Comic data


const ComicCards = () => {
  return (
    
    <div className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar  md:mx-50">
        {comics.map((comic) => (
          <div
            key={comic.id}
            className="flex-shrink-0
              w-[70%] sm:w-[45%] md:w-[30%] lg:w-[20%] 
              min-w-[70%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[20%] 
              max-w-[70%] sm:max-w-[45%] md:max-w-[30%] lg:max-w-[20%]"
          >
            {/* Comic Image */}
            <img
              src={captainMarvel}
              alt={comic.title}
              className="w-full h-[300px] md:h-[400px] object-cover shadow-lg rounded"
            />

            {/* Comic Title */}
            <h3 className="mt-2 text-sm md:text-base font-semibold truncate">
              {comic.title}
            </h3>

            {/* Comic Creator */}
            <p className="text-xs md:text-sm text-gray-600 truncate">
              {comic.creator}
            </p>
          </div>
        ))}
      </div>

  )
}

export default ComicCards
