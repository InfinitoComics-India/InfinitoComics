// 📁 src/components/FanFavourites.jsx
import React, { useState, useEffect } from "react";
import "../../../index.css"; // Custom global styles (used for no-scrollbar)
import captainMarvel from "../../../assets/Images/captainMarvel.png"; // Example comic image
import { comics } from "../../constants/fanfav"; // Comic data
import ComicCards from "./ComicCards"; // Importing the ComicCards component
import FanFavouritesShimmer  from "../../shimmer/landingPageShimmer/FanFavouritesShimmer ";


const FanFavourites = () => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      // fetch data / preload hero image ...
      setTimeout(() => setLoading(false), 2400); // demo
    }, []);
  return loading ? <FanFavouritesShimmer/>: (
    <div className="w-full px-4 md:px-12 py-16 my-8 ">
      {/* Top section with title and link */}
      <div className="flex justify-between items-center mb-10 px-2 md:px-20 md:mx-30">
        <h2 className="text-lg sm:text-xl md:text-3xl font-bold tracking-wide">
          FAN FAVOURITES
        </h2>
        <a
          href="#"
          className="text-red-600 text-sm md:text-base font-semibold"
        >
          VIEW ALL &gt;
        </a>
      </div>

      {/* Scrollable section with comic cards */}
       <ComicCards/>
    </div>
  );
};

export default FanFavourites;
