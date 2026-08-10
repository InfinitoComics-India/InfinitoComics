import React, { useEffect }  from 'react'
import HeroSection from './HeroSection.jsx'
import FundDistributionChart from './FundDistributionChart.jsx'
import Credits from './Credits'
import DonationUtilization from './DonationUtilization'
import Contributors from './Contributors'

function Index() {
    //scroll to top feature
    useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []); // empty dependency array to run only once on mount
  return (
    <>
        <HeroSection />
        <FundDistributionChart/>
        <Contributors />
        {/* <Credits/> */}
        <DonationUtilization/>
    </>
  )
}

export default Index