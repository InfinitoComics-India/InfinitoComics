import React from "react";
import { useNavigate } from 'react-router-dom';
const Card = ({ comic }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/comicChap/${comic._id}/chapters`);
  };
  return (
    <div className="w-[132.5rem] flex justify-center items-center bg-white">
      <div  onClick={handleClick} className="w-[13.5rem] overflow-hidden">
        <img
          src={
            comic.coverImg ||
            "https://via.placeholder.com/300x400?text=Preview"
          }
          alt="Cover"
          className="w-[15.5rem] h-[18rem] object-cover shadow-sm"
        />
        <h3 className="text-md font-semibold mt-2 tracking-wide text-gray-800">
          {comic.title || "Comic Title"} {comic.releasedYear && `(${comic.releasedYear})`}
        </h3>

        <p className="text-sm font-medium text-gray-400 mt-0 tracking-wide">
          {Array.isArray(comic.authors) ? comic.authors.join(", ") : comic.authors || "Unknown Author"}
        </p>

      </div>
    </div>
  );
};

export default Card;
