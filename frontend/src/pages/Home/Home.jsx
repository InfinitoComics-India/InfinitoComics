import React, {useEffect} from 'react';
import LandingComponent from './LandingComponent';
import CharacterSpotlight from './CharacterSpotlight';
import TodaySpotlight from './TodaySpotlight';
import HeroSection from './Merch';
import LandingMerch from './LandingMerch';
import JoinUltimate from './JoinUltimate';
import PremiumPlans from './PremiumPlans';
import FanFavourite from './FanFavourite';
import Spotlight from '../../components/spotlight/Spotlight';
import UpcomingEvents from './UpcomingEvents';
import FoundationSection from './FoundationSection';
import ExclusiveContent from './ExclusiveContent';
import NewsletterSection from '../Footer/Newsletter';
import Otp from '../resentOtp/resendOtp';
import Comic from '../../components/Comics/Comic.jsx'
import CharacterCarousel from '../Characters/CharacterCarousel'

const Home = () => {

  const user = JSON.parse(localStorage.getItem('user'));

    //scroll to top feature
      useEffect(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

  return (
    <div>
      <LandingComponent />
      <CharacterCarousel/>
      <CharacterSpotlight />
      {/* <TodaySpotlight /> */}
      {/* <Comic/> */}
      {/* <HeroSection/> */}
      <LandingMerch />
      <JoinUltimate />
      <PremiumPlans />
    
      <ExclusiveContent />
      
      {user && !user.newsLetter && <NewsletterSection />}

      {/* <Otp/> */}
    </div>
  );
};

export default Home;
