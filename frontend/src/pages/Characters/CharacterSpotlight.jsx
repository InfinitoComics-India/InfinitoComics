import React, { useState } from "react";
import bgbottom from "../../../assets/Images/spotlightbottombg.png";
const tabs = [
  {
    key: "heroes",
    label: "OUR BRAVE HEROES",
    title: "QUICK VISION",
    subtitle: "CHARACTER SPOTLIGHT",
    description:
      "A moody Mumbai street surfer with custom weapons, fog-cutting vision, and a speed-boosting ride—meet the rogue who upgrades on the fly and never plays by the rules.",
    image:
      "https://i.imgur.com/8Km9tLL.png", // Replace with your hero image
    button: "KNOW MORE >",
  },
  {
    key: "middle",
    label: "STUCK IN THE MIDDLE",
    title: "MYSTIC M",
    subtitle: "CHARACTER SPOTLIGHT",
    description:
      "A mysterious figure who walks the line between good and evil, always keeping everyone guessing.",
    image:
      "https://i.imgur.com/0y8Ftya.png", // Replace with your middle image
    button: "KNOW MORE >",
  },
  {
    key: "villains",
    label: "THE MASTERMIND VILLAINS",
    title: "THE MASTERMIND",
    subtitle: "CHARACTER SPOTLIGHT",
    description:
      "A genius villain with a plan for every occasion, always one step ahead of the heroes.",
    image:
      "https://i.imgur.com/1X4h5QH.png", // Replace with your villain image
    button: "KNOW MORE >",
  },
];

export default function CharacterSpotlight() {
  const [activeTab, setActiveTab] = useState(0);

  const tab = tabs[activeTab];

  return (
    <>
    <div className="relative min-h-[500px] bg-black">
      {/* Background Image */}
      <img
        src={tab.image}
        alt={tab.title}
        className="absolute inset-0 w-full h-full object-cover object-right md:object-center opacity-90 transition-all duration-500"
        style={{ zIndex: 0 }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent z-10 "></div>
      {/* Content */}
      <div className="relative z-20 flex flex-col justify-center h-[60vh] md:h-[70vh] px-6 md:px-20 md:mx-35 mx-10">
        <div className="max-w-lg pt-16 md:pt-0">
          <div className="text-white text-sm tracking-widest mb-2">
            {tab.subtitle}
          </div>
          <div className="text-4xl md:text-5xl font-extrabold tracking-widest text-pink-400 mb-4">
            {tab.title}
          </div>
          <div className="text-white text-base md:text-lg mb-8">
            {tab.description}
          </div>
          <button className="border border-white text-white px-6 py-2 text-xs tracking-widest hover:bg-white hover:text-black transition">
            {tab.button}
          </button>
        </div>
      </div>
      {/* Tabs */}
      <div className="relative z-30 w-full flex justify-center bg-transparent">
        <div className="flex w-full max-w-3xl mx-auto justify-between items-end px-2 md:px-0 pb-2 md:pb-6">
          {tabs.map((t, idx) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(idx)}
              className={`flex flex-col items-center flex-1 transition-all`}
            >
              <span
                className={`text-xs md:text-sm tracking-widest ${
                  activeTab === idx
                    ? "text-red-500 font-semibold"
                    : "text-white/80"
                }`}
              >
                {t.label}
              </span>
              <span
                className={`mt-1 h-1 w-20 rounded-full transition-all duration-300 ${
                  activeTab === idx ? "bg-red-500" : "bg-white/30"
                }`}
              ></span>
            </button>
          ))}
        </div>
      </div>
    </div>
    <div
            className="w-full pb-20 -mt-1"
            style={{
              backgroundImage: `url(${bgbottom})`, //   template literal used here
              backgroundSize: "cover", // Make it responsive
            }}
          />
    </>
  );
}