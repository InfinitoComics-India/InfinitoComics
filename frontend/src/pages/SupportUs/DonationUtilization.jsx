import React, { useState, useEffect } from 'react';
import { getAllStories } from '../../services/supportUs.js';
import { TbArrowBigRightLines, TbArrowBigLeftLines } from "react-icons/tb";

function DonationUtilization() {
  const [activeStory, setActiveStory] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const [visibleCount, setVisibleCount] = useState(2);

  const handleSwipe = (direction) => {
    if (direction === 'left' && activeStory < stories.length - 1) {
      setActiveStory(activeStory + 1);
      setExpanded(false);
    } else if (direction === 'right' && activeStory > 0) {
      setActiveStory(activeStory - 1);
      setExpanded(false);
    }
  };

  const [expandedStories, setExpandedStories] = useState({});
  const toggleExpand = (index) => {
    setExpandedStories((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };


  //fetching stories from db
  const [stories, setStories] = useState([]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const allStories = await getAllStories();
        setStories(allStories);
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    };

    fetchStories();
  }, []);

  useEffect(() => {
    console.log("Stories on support us page: ", stories)
  }, [stories]);


  return (
    <div className="flex justify-center items-center ">
      <div className="w-11/12 lg:w-2/3 bg-white text-gray-800">

        {/* Heading */}
        <div className="text-start lg:text-center mb-12">
          <h2 className="text-2xl md:text-[1.9rem] font-bold tracking-widest md:mb-1 lg:mb-2">
            THIS IS HOW WE UTILIZE
          </h2>
          <p className="text-md md:text-xl font-medium text-gray-700 uppercase tracking-widest">
            Your Funds
          </p>
        </div>

        {/* --------- SMALL SCREENS: PAGINATION VIEW --------- */}
        <div className="block lg:hidden relative">
          {stories.length > 0 && (
            <div className="relative flex flex-row items-center py-10">
              {/* Central Line */}
              <div className="absolute left-1/2 transform -translate-x-1 bg-black w-[3px] h-full z-0" />

              {activeStory % 2 === 0 ? (
                <>
                  {/* LEFT SIDE - TEXT */}
                  <div className="w-1/2 text-right pr-4">
                    <h3 className="text-red-600 font-bold text-lg uppercase">
                      {stories[activeStory]?.title}
                    </h3>
                    <p className="text-sm font-bold mb-3 tracking-wider">
                      {stories[activeStory]?.eventDate &&
                      (() => {
                        const date = new Date(stories[activeStory].eventDate);
                        const day = date.toLocaleDateString("en-GB", { day: "numeric" });
                        const month = date.toLocaleDateString("en-GB", { month: "long" }).toUpperCase();
                        const year = date.getFullYear();
                        return `${day} ${month} ${year}`;
                      })()}
                    </p>
                    <p
                      className={`text-sm text-gray-700 mb-4 ${
                        expanded ? "" : "line-clamp-3"
                      }`}
                    >
                      {stories[activeStory]?.description}
                    </p>
                    <button
                      className="bg-red-600 text-white text-xs px-4 py-2 tracking-wider hover:bg-red-700 font-semibold cursor-pointer"
                      onClick={() => setExpanded(!expanded)}
                    >
                      {expanded ? "SHOW LESS" : "READ MORE"} &gt;
                    </button>
                  </div>

                  {/* RIGHT SIDE - IMAGE */}
                  <div className="w-1/2 pl-4">
                    <img
                      src={stories[activeStory]?.imageUrl}
                      alt={`Story ${activeStory + 1}`}
                      className="w-full h-40 object-cover rounded"
                      loading="lazy"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* LEFT SIDE - IMAGE */}
                  <div className="w-1/2 pr-4">
                    <img
                      src={stories[activeStory]?.imageUrl}
                      alt={`Story ${activeStory + 1}`}
                      className="w-full h-40 object-cover rounded"
                      loading="lazy"
                    />
                  </div>

                  {/* RIGHT SIDE - TEXT */}
                  <div className="w-1/2 text-left pl-4">
                    <h3 className="text-red-600 font-bold text-lg uppercase">
                      {stories[activeStory]?.title}
                    </h3>
                    <p className="text-sm font-bold mb-3 tracking-wider">
                      {stories[activeStory]?.eventDate &&
                      (() => {
                        const date = new Date(stories[activeStory].eventDate);
                        const day = date.toLocaleDateString("en-GB", { day: "numeric" });
                        const month = date.toLocaleDateString("en-GB", { month: "long" }).toUpperCase();
                        const year = date.getFullYear();
                        return `${day} ${month} ${year}`;
                      })()}
                    </p>
                    <p
                      className={`text-sm text-gray-700 mb-4 ${
                        expanded ? "" : "line-clamp-3"
                      }`}
                    >
                      {stories[activeStory]?.description}
                    </p>
                    <button
                      className="bg-red-600 text-white text-xs px-4 py-2 tracking-wider hover:bg-red-700 font-semibold cursor-pointer"
                      onClick={() => setExpanded(!expanded)}
                    >
                      {expanded ? "SHOW LESS" : "READ MORE"} &gt;
                    </button>
                  </div>
                </>
              )}

              {/* Colored Central Line */}
              <div
                className={`absolute left-1/2 transform -translate-x-1 w-[3px] h-full ${
                  activeStory % 2 === 0
                    ? "bg-gradient-to-b from-red-500 to-red-500"
                    : "bg-gradient-to-b from-gray-700 to-gray-700"
                }`}
              />
            </div>
          )}

          {/* Pagination Buttons */}
          <div className="flex justify-between mt-3 px-6">
            <button
              onClick={() => setActiveStory((prev) => (prev > 0 ? prev - 1 : prev))}
              disabled={activeStory === 0}
              className={`px-4 py-2 rounded ${
                activeStory === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-600 text-white"
              }`}
            >
              Prev
            </button>

            <button
              onClick={() =>
                setActiveStory((prev) =>
                  prev < stories.length - 1 ? prev + 1 : prev
                )
              }
              disabled={activeStory === stories.length - 1}
              className={`px-4 py-2 rounded ${
                activeStory === stories.length - 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-600 text-white"
              }`}
            >
              Next
            </button>
          </div>

          <p className="text-sm text-gray-600 mt-2 text-center">
            Showing : {activeStory + 1} / {stories.length}
          </p>
        </div>


        {/* --------- LARGE SCREENS: GRID VIEW WITH VIEW MORE --------- */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-x-6 ">
          {stories?.slice(0, visibleCount).map((story, index) => (
            <React.Fragment key={index}>
              {index % 2 === 0 ? (
                <>
                  <div className="col-span-2 lg:grid lg:grid-cols-2 gap-x-6 group">
                    {/* Left Text Side */}
                    <div className="relative flex flex-col justify-center items-end text-center lg:text-right pr-8 pt-12">
                     <div
                    className={`absolute top-0 right-0 w-[3px] h-full ${
                      index % 2 === 0
                        ? "bg-gradient-to-b from-red-600 to-red-400"
                        : "bg-gradient-to-b from-gray-500 to-gray-400"
                    }`}
                  ></div>
                      <h3 className="text-red-600 font-semibold text-2xl mb-1 uppercase">{story.title}</h3>
                      <p className="text-sm font-bold mb-4 tracking-wider">
                        {story.eventDate &&
                          new Date(story.eventDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }).toUpperCase()}
                      </p>
                      <p className={`text-md text-gray-700 leading-relaxed  mt-6 mb-6 ${!expandedStories[index] ? 'line-clamp-3' : ''}`}>
                        {story.description}
                      </p>
                      <button
                        onClick={() => toggleExpand(index)}
                        className="bg-red-600 font-semibold text-white text-sm px-5 py-2 tracking-wider hover:bg-red-700 transition w-fit cursor-pointer"
                      >
                        {expandedStories[index] ? 'SHOW LESS >' : 'READ MORE >'}
                      </button>
                    </div>

                    {/* Right Image Side */}
                    <div className="pt-12 ">
                      <img src={story?.imageUrl} alt={`Story ${index + 1}`} className="w-full h-56 sm:h-54 lg:h-58 object-cover " loading='lazy' />
                    </div>
                  </div>

                </>
              ) : (
                <>
                  <div className="col-span-2 lg:grid lg:grid-cols-2 gap-x-6 group">
                    <div className="relative pt-12 pr-8">
                     <div
                      className={`absolute top-0 right-0 w-[3px] h-full ${
                        index % 2 === 0
                          ? "bg-gradient-to-b from-red-600 to-red-400"
                          : "bg-gradient-to-b from-gray-500 to-gray-400"
                      }`}
                    ></div>
                      <img src={story?.imageUrl} alt={`Story ${index + 1}`} className="w-full h-56 sm:h-54 lg:h-58 object-cover " loading='lazy' />
                    </div>
                    <div className="flex flex-col justify-center text-left pt-12">
                      <h3 className="text-red-600 font-semibold text-2xl mb-1 uppercase">{story.title}</h3>
                      <p className="text-sm font-bold mb-4 tracking-wider">
                        {story.eventDate &&
                          new Date(story.eventDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }).toUpperCase()}
                      </p>
                      <p className={`text-md text-gray-700 leading-relaxed mt-6 mb-6 ${!expandedStories[index] ? 'line-clamp-3' : ''}`}>
                        {story.description}
                      </p>

                      <button
                        onClick={() => toggleExpand(index)}
                        className="bg-red-600 font-semibold text-white text-sm px-5 py-2 tracking-wider hover:bg-red-700 transition w-fit cursor-pointer"
                      >
                        {expandedStories[index] ? 'SHOW LESS >' : 'READ MORE >'}
                      </button>

                    </div>
                  </div>
                </>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* VIEW MORE Button (only for large screens) */}
        {visibleCount < stories?.length && (
          <div className="hidden lg:block text-center mb-16 pt-5">
            <button
              className="text-red-600 border-2 border-red-600 text-sm px-4 py-2 font-semibold tracking-widest transition cursor-pointer hover:text-white hover:bg-red-600"
              onClick={() => setVisibleCount(prev => Math.min(prev + 2, stories.length))}
            >
              VIEW MORE &gt;
            </button>
          </div>
        )}

        {/* End of Stories Message */}
        {visibleCount >= stories?.length && (
          <div className="hidden lg:block text-center mb-16 mt-16">
            <p className="text-gray-500 text-sm italic tracking-wider mt-5">
              You've reached the end of the stories for now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DonationUtilization;