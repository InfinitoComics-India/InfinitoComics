import React from "react";

const SoldCard = ({ comic }) => {
    return (
        <div className="w-[132.5rem] flex justify-center items-center bg-white">
            <div className="relative w-[13.5rem] overflow-hidden bg-white">
                {/* SOLD OUT Badge */}
                <div className="absolute top-2 left-2 z-10 bg-green-600 text-white text-[0.65rem] px-2 py-1 rounded shadow tracking-wider font-semibold">
                    UPCOMING
                </div>

                {/* Comic Image */}
                <img
                    src={comic.coverImg || "https://via.placeholder.com/300x400?text=Preview"}
                    alt="Cover"
                    className="w-[15.5rem] h-[18rem] object-cover shadow-md opacity-80 grayscale"
                />

                {/* Comic Title */}
                <h3 className="text-md font-semibold mt-4 tracking-wide text-gray-500">
                    {comic.title || "Comic Title"}{" "}
                    {comic.releasedYear && `(${comic.releasedYear})`}
                </h3>

                {/* Author */}
                <p className="text-sm font-medium text-gray-400 mt-0 tracking-wide">
                    {Array.isArray(comic.authors) ? comic.authors.join(", ") : comic.authors || "Unknown Author"}
                </p>

            </div>
        </div>
    );
};

export default SoldCard;
