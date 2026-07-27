import React from 'react'
import Carousel from './Carousel'
import NewComicsWeekly from './NewComicsWeekly'

import JoinUltimate from '../Home/JoinUltimate'
import CreatorAccess from './CreatorAccess'
import MembershipKitCard from './MembershipKitCard'
import ResearchCards from '../../../../Research/src/pages/Home/ResearchCards';
import Faqs from './Faqs'
import ResearchPlans from './ResearchPlans'
import InfinitoUltimateKit from './InfinitoUltimateKit'

const Ultimate = () => {
  return (
    <div>
      <Carousel/>
      <ResearchPlans/>
      <NewComicsWeekly/>
      <CreatorAccess/>
      <MembershipKitCard/>
      <Faqs/>
      {/* <JoinUltimate/> */}

    </div>
  )
}

export default Ultimate
