import React from "react";
import "../../../index.css"; // Custom global styles (used for no-scrollbar)
import captainMarvel from "../../../assets/Images/captainMarvel.png"; // Example comic image
import { comics } from "../../constants/fanfav"; // Comic data


const ComicCards = () => {
  return (
    <div className="w-full px-4">
      <div className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar">
        {comics.map((comic) => (
          <div
            key={comic.id}
            className="flex-shrink-0 w-60 sm:w-64 md:w-72 lg:w-80"
          >
            <img
              src={captainMarvel}
              alt={comic.title}
              className="w-full h-[300px] md:h-[400px] object-cover shadow-lg rounded"
            />
            <h3 className="mt-2 text-sm md:text-base font-semibold truncate">
              {comic.title}
            </h3>
            <p className="text-xs md:text-sm text-gray-600 truncate">
              {comic.creator}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};


export default ComicCards
