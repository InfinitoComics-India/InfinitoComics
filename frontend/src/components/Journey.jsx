import React, { useState, useEffect } from "react";
import { getAllAboutStories } from "../services/aboutUs";

const defaultStories = [
  {
    _id: "1",
    title: "STARTED AT RAIPUR",
    description:
      "In 2023, Infinito is started business at Raipur, Chhattisgarh and company is a result of collaborative efforts and contributions from individuals across India.",
    month: "AUGUST",
    year: "2023",
  },
  {
    _id: "2",
    title: "CORE TEAM DEVELOPMENT",
    description:
      "With a determined mindset, we embarked on building a robust team to drive the growth of Infinito. Additionally, we achieved our first milestone by generating revenue through services in the AVGC-XR industry.",
    month: "MAY",
    year: "2024",
  },
  {
    _id: "3",
    title: "LONG–RUN PLANNING & INTEGRATION",
    description:
      "With a bold vision and unwavering dedication, we are launching an exciting range of merchandise while advancing in-house animation and gaming projects, seamlessly integrating ABM, AR, VR, and MR technologies.",
    month: "AUGUST",
    year: "2025",
  },
  {
    _id: "4",
    title: "WE ARE LIVE!",
    description:
      "We are now live and committed to creating impactful solutions that drive the growth and development of the AVGC–XR industry in India.",
    month: "OCTOBER",
    year: "2026",
  },
];

function Journey() {
  const [stories, setStories] = useState(defaultStories);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const fetchedStories = await getAllAboutStories();
        if (fetchedStories && fetchedStories.length > 0) {
          setStories(fetchedStories);
        }
      } catch (error) {
        console.error("Error fetching About Us stories, using defaults:", error);
      }
    };
    fetchStories();
  }, []);

  return (
    <div className="w-full px-4 sm:px-8 md:px-12 lg:px-20 py-8 sm:py-16 bg-white text-black font-sans mb-16">
      {/* Section Heading */}
      <div className="max-w-6xl mx-auto mb-12 sm:mb-16">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wider uppercase font-['Bebas_Neue','Dharma_Gothic_E',sans-serif]">
          OUR JOURNEY
        </h2>
      </div>

      {/* Timeline Section */}
      <div className="max-w-5xl mx-auto relative">
        {/* Continuous Center Vertical Spine Line */}
        <div className="absolute left-1/2 transform -translate-x-[1.25px] top-0 bottom-0 w-[2.5px] bg-black z-0" />

        <div className="flex flex-col gap-12 sm:gap-20 relative z-10">
          {stories.map((story, index) => {
            const isRedLine = index % 2 === 0;
            const isLeftText = index % 2 === 0;

            return (
              <div key={story._id || index} className="relative w-full flex items-center min-h-[160px]">
                {/* Individual Colored Line Segment on Vertical Spine */}
                <div
                  className={"absolute left-1/2 transform -translate-x-[1.25px] top-0 bottom-0 w-[2.5px] " + (isRedLine ? "bg-[#E50914]" : "bg-black")}
                />

                {isLeftText ? (
                  /* ITEM 1 & 3: Text on LEFT, Date on RIGHT */
                  <div className="w-full flex flex-row items-center">
                    {/* Left Column: Title + Description */}
                    <div className="w-1/2 text-right pr-6 sm:pr-10 md:pr-14">
                      <h3 className="text-[#E50914] font-extrabold text-base sm:text-lg md:text-xl uppercase tracking-wide mb-2 sm:mb-3">
                        {story.title}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base leading-relaxed text-black/90 font-medium max-w-md ml-auto">
                        {story.description}
                      </p>
                      {/* Optional small red indicator arrow */}
                      <span className="text-[#E50914] text-xs font-bold block mt-1">
                        &gt;
                      </span>
                    </div>

                    {/* Right Column: Month + Year */}
                    <div className="w-1/2 text-left pl-6 sm:pl-10 md:pl-14">
                      <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold uppercase text-black tracking-[0.35em] mb-1">
                        {story.month}
                      </div>
                      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-black tracking-tight font-sans">
                        {story.year}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ITEM 2 & 4: Date on LEFT, Text on RIGHT */
                  <div className="w-full flex flex-row items-center">
                    {/* Left Column: Month + Year */}
                    <div className="w-1/2 text-right pr-6 sm:pr-10 md:pr-14">
                      <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold uppercase text-black tracking-[0.35em] mb-1">
                        {story.month}
                      </div>
                      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-black tracking-tight font-sans">
                        {story.year}
                      </div>
                    </div>

                    {/* Right Column: Title + Description */}
                    <div className="w-1/2 text-left pl-6 sm:pl-10 md:pl-14">
                      <h3 className="text-[#E50914] font-extrabold text-base sm:text-lg md:text-xl uppercase tracking-wide mb-2 sm:mb-3">
                        {story.title}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base leading-relaxed text-black/90 font-medium max-w-md">
                        {story.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Journey;
