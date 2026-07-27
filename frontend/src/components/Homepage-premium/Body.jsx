import React from "react";
// import { Outlet } from 'react-router-dom'
import Navbar from "../../pages/Navbar/Navbar";
import CharacterCarousel from "../../pages/Characters/CharacterCarousel";
import { Outlet } from "react-router-dom";
import FanFavourites from "../../pages/Home/FanFavourite";
import CharacterSpotlight from "../../pages/Home/CharacterSpotlight";
import TodaySpotlight from "../../pages/Home/TodaySpotlight";
import MerchHeroSection from "../../pages/Home/Merch";


import UpcomingEvents from "../../pages/Home/UpcomingEvents";
import FoundationSection from "../../pages/Home/FoundationSection";
import NewsletterSection from "../../pages/Footer/Newsletter";

import LandingMerch from "../../pages/Home/LandingMerch";
import Spotlight from "../../components/spotlight/Spotlight";

import ExclusiveContent from "../../pages/Home/ExclusiveContent";
const Body = () => {
  return (
    <div>
      <Outlet />
      <FanFavourites />
      <CharacterSpotlight />
      <TodaySpotlight />
      <CharacterCarousel />
      <MerchHeroSection />
      <LandingMerch />

      <Spotlight />
      <FanFavourites />

      <UpcomingEvents />

      <FoundationSection />

      <ExclusiveContent />
      <NewsletterSection />
    </div>
  );
};

export default Body;
