import React from "react";
import Banner from "./Banner";
import Initiatives from "./Initiatives";
import PreviousContributions from "./PreviousContributions";
import FoundationPresence from "./FoundationPresence";
import FoundationContact from "./FoundationContact";
import FoundationFaq from "./FoundationFaq";
import "./foundation.css";

const Foundation = () => {
  return (
    <main className="foundation-page w-full bg-white overflow-x-hidden">
      {/* Hero Banner Section */}
      <Banner />

      {/* Responsive Content Container matching Home Page layout */}
      <div className="w-full bg-white overflow-x-hidden">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="flex-1 max-w-[1200px] min-w-0 flex flex-col">
            <Initiatives />
            <PreviousContributions />
            <FoundationPresence />
            <FoundationContact />
            <FoundationFaq />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Foundation;
