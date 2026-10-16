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
    <main className="foundation-page">
      <Banner />
      <Initiatives />
      <PreviousContributions />
      <FoundationPresence />
      <FoundationContact />
      <FoundationFaq />

    </main>
  );
};

export default Foundation;
