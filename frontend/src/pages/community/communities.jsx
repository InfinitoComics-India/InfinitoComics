import React from 'react'
import Banner from './Banner'
import CommunitySection from './CommunitySection'
import TrendingPosts from './TrendingPosts'
import FanArtSpotlight from './FanartSpotlight'
import EventsGallery from './Eventsgallery'
import JoinInnerCircle from './joinInnerCircle'
import UpcommingEvents from '../Home/UpcomingEvents'
import JoinUltimate from '../Home/JoinUltimate'
import Hero from './Hero'
import ComingSoon from '../../components/comingSoon/comingSoon'
const communities = () => {
  const comingSoonActive = true;

  if (comingSoonActive) {
    return <ComingSoon />;
  }
  return (
    <div>
      <Banner />
      <CommunitySection/>
      <TrendingPosts/>
      <JoinInnerCircle/>
      <FanArtSpotlight/>
      <UpcommingEvents/>
      <Hero/>
      <EventsGallery/>
      <JoinUltimate/>
    </div>
  )
}

export default communities
