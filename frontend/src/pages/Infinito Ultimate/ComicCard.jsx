import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchComics } from "../../services/ComicService.js";
import "../../../index.css"; // Custom global styles (used for no-scrollbar)

const ComicCards = () => {
  const navigate = useNavigate();
  const [comics, setComics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch comics from API
  useEffect(() => {
    fetchComics()
      .then((data) => {
        const comicsData = Array.isArray(data) ? data : [];
        setComics(comicsData);
      })
      .catch((error) => {
        console.error("Error fetching comics:", error);
        setComics([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="w-full px-4">
      {isLoading ? (
        // Loading shimmer
        <div className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-60 sm:w-64 md:w-72 lg:w-80 animate-pulse">
              <div className="w-full h-[300px] md:h-[400px] bg-gray-200 rounded" />
              <div className="mt-2 h-4 bg-gray-200 rounded w-3/4" />
              <div className="mt-1 h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : comics.length === 0 ? (
        // No comics available
        <div className="text-center py-12">
          <p className="text-gray-500">No comics available</p>
        </div>
      ) : (
        // Display comics
        <div className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar">
          {comics.map((comic) => (
            <div
              key={comic._id}
              onClick={() => navigate(`/comicChap/${comic._id}/chapters`)}
              className="flex-shrink-0 w-60 sm:w-64 md:w-72 lg:w-80 cursor-pointer group"
            >
              <img
                src={comic.coverImg || "https://via.placeholder.com/300x400"}
                alt={comic.title}
                className="w-full h-[300px] md:h-[400px] object-cover shadow-lg rounded transition-transform duration-300 group-hover:scale-105"
              />
              <h3 className="mt-2 text-sm md:text-base font-semibold truncate group-hover:text-[#DD1215] transition-colors">
                {comic.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 truncate">
                {Array.isArray(comic.authors) 
                  ? comic.authors.join(", ") 
                  : comic.authors || "Universe/ Artist"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComicCards;
