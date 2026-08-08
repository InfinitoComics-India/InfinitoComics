import React, { useEffect } from 'react'
import WorkWIthUs from './WorkWIthUs'
import CareerOpportunities from './CareerOpportunities'
import Hiring from './Hiring'
import InfinitoHiring from './InfinitoHiring'
import ImaginationsLeads from './ImaginationsLeads'
import ValuesTabs from './ValuesTabs'

const CareerMain = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <WorkWIthUs />
      <CareerOpportunities />
      <Hiring />
      <InfinitoHiring />
      <ImaginationsLeads />
      <ValuesTabs />
    </>
  )
}

export default CareerMain
