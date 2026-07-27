import React, { useState, useEffect } from "react";
import { getAllAboutStories } from "../services/aboutUs";

function Journey() {
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const allStories = await getAllAboutStories();
        setStories(allStories);
      } catch (error) {
        console.error("Error fetching About Us stories:", error);
      }
    };
    fetchStories();
  }, []);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  return (
    <div className="flex justify-center">
      <div className="relative w-11/12 lg:w-2/3">
        <h2 className="text-start text-3xl font-bold mb-12 tracking-widest">
          OUR JOURNEY
        </h2>

        {/* 🔹 MOBILE VIEW – Pagination with same layout */}
        <div className="block lg:hidden relative">
          {stories.length > 0 && (
            <div className="relative flex flex-row items-center py-12">
              {/* Central Line */}
              <div className="absolute left-1/2 transform -translate-x-1 bg-black w-[3px] h-full z-0" />

              {currentIndex % 2 === 0 ? (
                <>
                  {/* LEFT TEXT */}
                  <div className="w-1/2 text-right pr-4">
                    <h3 className="text-red-600 font-bold text-lg uppercase">
                      {stories[currentIndex]?.title}
                    </h3>
                    <p className="text-gray-700 text-sm mt-3">
                      {stories[currentIndex]?.description}
                    </p>
                  </div>

                  {/* RIGHT DATE */}
                  <div className="w-1/2 text-center text-2xl font-bold tracking-widest text-gray-900">
                    <div>{stories[currentIndex]?.month?.toUpperCase()}</div>
                    <div className="text-5xl tracking-widest">
                      {stories[currentIndex]?.year}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* LEFT DATE */}
                  <div className="w-1/2 text-center text-2xl font-bold tracking-widest text-gray-900">
                    <div>{stories[currentIndex]?.month?.toUpperCase()}</div>
                    <div className="text-5xl tracking-widest">
                      {stories[currentIndex]?.year}
                    </div>
                  </div>

                  {/* RIGHT TEXT */}
                  <div className="w-1/2 text-left pl-4">
                    <h3 className="text-red-600 font-bold text-lg uppercase">
                      {stories[currentIndex]?.title}
                    </h3>
                    <p className="text-gray-700 text-sm mt-3">
                      {stories[currentIndex]?.description}
                    </p>
                  </div>
                </>
              )}

              {/* 🔹 Colored Line */}
              <div
                className={`absolute left-1/2 transform -translate-x-1 w-[3px] h-full ${
                  currentIndex % 2 === 0
                    ? "bg-gradient-to-b from-red-500 to-red-500"
                    : "bg-gradient-to-b from-gray-700 to-gray-700"
                }`}
              />
            </div>
          )}

          {/* 🔹 Pagination Controls */}
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`px-4 py-2 rounded ${
                currentIndex === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-600 text-white"
              }`}
            >
              Prev
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === stories.length - 1}
              className={`px-4 py-2 rounded ${
                currentIndex === stories.length - 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-600 text-white"
              }`}
            >
              Next
            </button>
          </div>

          <p className="text-sm text-gray-600 mt-2 text-center">
            Showing : {currentIndex + 1} / {stories.length}
          </p>
        </div>

        {/* 🔹 DESKTOP VIEW – Show all blocks */}
        <div className="hidden lg:block relative">
          <div className="absolute left-1/2 transform -translate-x-1 bg-black w-[3px] h-full z-0" />
          {stories.map((story, index) => {
            const isOdd = index % 2 === 0;
            return (
              <div
                key={story._id}
                className="relative z-10 flex flex-row items-center py-12"
              >
                {isOdd ? (
                  <>
                    <div className="w-1/2 text-right pr-5">
                      <h3 className="text-red-600 font-bold text-lg uppercase">
                        {story.title}
                      </h3>
                      <p className="text-gray-700 text-sm mt-3">
                        {story.description}
                      </p>
                    </div>
                    <div className="w-1/2 text-center text-2xl font-bold tracking-widest text-gray-900">
                      <div className="text-4xl">{story.month?.toUpperCase()}</div>
                      <div className="text-6xl tracking-widest">
                        {story.year}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-1/2 text-center text-2xl font-bold tracking-widest text-gray-900">
                      <div className="text-4xl">{story.month?.toUpperCase()}</div>
                      <div className="text-6xl tracking-widest">
                        {story.year}
                      </div>
                    </div>
                    <div className="w-1/2 text-left pl-5">
                      <h3 className="text-red-600 font-bold text-lg uppercase">
                        {story.title}
                      </h3>
                      <p className="text-gray-700 text-sm mt-3">
                        {story.description}
                      </p>
                    </div>
                  </>
                )}

                {/* Colored Line */}
                <div
                  className={`absolute left-1/2 transform -translate-x-1 w-[3px] h-full ${
                    isOdd
                      ? "bg-gradient-to-b from-red-500 to-red-500"
                      : "bg-gradient-to-b from-gray-700 to-gray-700"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Journey;
