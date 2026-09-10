import React from 'react'
import Carousel from './Carousel'
import NewComicsWeekly from './NewComicsWeekly'
import CreatorAccess from './CreatorAccess'
import MembershipKitCard from './MembershipKitCard'
import Faqs from './Faqs'
import ResearchPlans from './ResearchPlans'

const Ultimate = () => {
  return (
    <div>
      <Carousel/>
      <ResearchPlans/>
      <NewComicsWeekly/>
      <CreatorAccess/>
      <MembershipKitCard/>
      <Faqs/>
    </div>
  )
}

export default Ultimate
