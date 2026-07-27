import React, { useEffect }  from 'react'
import HeroSection from './HeroSection.jsx'
import FundsDistribution from './FundsDistribution'
import Credits from './Credits'
import DonationUtilization from './DonationUtilization'
import Contributors from './Contributors.jsx'
function Index() {
    //scroll to top feature
    useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []); // empty dependency array to run only once on mount
  return (
    <>
        <HeroSection />
        <FundsDistribution/>
        <Contributors/>
        {/* <Credits/> */}
        <DonationUtilization/>
    </>
  )
}

export default Index