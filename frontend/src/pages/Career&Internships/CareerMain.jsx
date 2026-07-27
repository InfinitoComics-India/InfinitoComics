import React, {useEffect} from 'react'
import WorkWIthUs from './WorkWIthUs'
import CareerOpportunities from './CareerOpportunities'
import Hiring from './Hiring'
import InfinitoHiring from './InfinitoHiring'
import ImaginationsLeads from './ImaginationsLeads'
const CareerMain = () => {
  //scroll to top feature
      useEffect(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, []); // empty dependency array to run only once on mount
    
  return (
    <>
      <WorkWIthUs />
      <CareerOpportunities />
      <Hiring/>
      <InfinitoHiring />
      <ImaginationsLeads />
    </>
  )
}

export default CareerMain
