import React, { useEffect } from 'react';
import LandingComponent from './LandingComponent';
import CharacterSpotlight from './CharacterSpotlight';
import TodaySpotlight from './TodaySpotlight';
import HeroSection from './Merch';
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

const Home = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div>
      {/* 1. Hero Banner */}
      <LandingComponent />

      {/* 2. Know Our Characters */}
      <CharacterCarousel />

      {/* 3. Character Spotlight */}
      <CharacterSpotlight />

      {/* 4. Today's Spotlight */}
      <TodaySpotlight />

      {/* 5. Style Yourself Like a Super Hero */}
      <HeroSection />

      {/* 6. Collector's Paradise */}
      <LandingMerch />

      {/* 7. Join the Ultimate Universe */}
      <JoinUltimate />

      {/* 8. Premium Plans */}
      <PremiumPlans />

      {/* 9. Fan Favourites */}
      <Comic />

      {/* 10. Spotlight (video) */}
      <Spotlight />

      {/* 11. Upcoming Events */}
      <UpcomingEvents />

      {/* 12. Foundation Section */}
      <FoundationSection />

      {/* 13. Check Out Our App */}
      <ExclusiveContent />

      {/* 14. Newsletter */}
      {user && !user.newsLetter && <NewsletterSection />}
    </div>
  );
};

export default Home;
