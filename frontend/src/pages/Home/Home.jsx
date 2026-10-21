import React, { useEffect } from 'react';
import LandingComponent from './LandingComponent';
import CharacterSpotlight from './CharacterSpotlight';
import TodaySpotlight from './TodaySpotlight';
import InfinitoAnimation from './InfinitoAnimation';
import HeroSection from './Merch';
import NewsAndBlogs from './NewsAndBlogs';
import LandingMerch from './LandingMerch';
import JoinUltimate from './JoinUltimate';
import PremiumPlans from './PremiumPlans';
import Spotlight from '../../components/spotlight/Spotlight';
import UpcomingEvents from './UpcomingEvents';
import FoundationSection from './FoundationSection';
import ExclusiveContent from './ExclusiveContent';
import NewsletterSection from '../Footer/Newsletter';
import Comic from '../../components/Comics/Comic.jsx';
import CharacterCarousel from '../Characters/CharacterCarousel';
import Countdown from './Countdown';
import KitComponent from './KitComponent.jsx';

const Home = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div>
      {/* 1. Hero Banner */}
      <LandingComponent />

      {/* Countdown Timer & Characters with Side Ads */}
      <div className="w-full bg-white overflow-x-hidden">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-start justify-center gap-4 lg:gap-6 xl:gap-8">
          {/* Left Ad */}
          <div className="hidden lg:flex w-20 xl:w-24 h-[550px] bg-[#D0D0D0] shrink-0 items-center justify-center mt-24 sm:mt-28 select-none">
            <span className="text-white font-bold text-sm tracking-widest uppercase">
              AD
            </span>
          </div>

          {/* Center Column: Countdown + Characters */}
          <div className="flex-1 max-w-[1200px] min-w-0 flex flex-col">
            <Countdown />
            <CharacterCarousel />
          </div>

          {/* Right Ad */}
          <div className="hidden lg:flex w-20 xl:w-24 h-[550px] bg-[#D0D0D0] shrink-0 items-center justify-center mt-24 sm:mt-28 select-none">
            <span className="text-white font-bold text-sm tracking-widest uppercase">
              AD
            </span>
          </div>
        </div>
      </div>

      
      <KitComponent/>

      {/* 4. Character Spotlight */}
      <CharacterSpotlight />

      

      {/* 5. Today's Spotlight */}
      <TodaySpotlight />

      {/* Infinito Animation */}
      <InfinitoAnimation />

      {/* 6. Style Yourself Like a Super Hero */}
      <HeroSection />

      {/* 7. Infinito News & Blogs */}
      <NewsAndBlogs />

      <FoundationSection />

      

      

     
      
     {/* 8. Join the Ultimate Universe */}
       <JoinUltimate />
      {/* 9. Newsletter */}
      <NewsletterSection />
    </div>
  );
};

export default Home;
