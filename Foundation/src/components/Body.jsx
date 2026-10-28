import React from 'react'
import Home from '../pages/Home'
import Navbar from './Navbar'
import FoundationJoinUltimate from '../pages/Foundation/FoundationJoinUltimate'
import FoundationNewsletter from '../pages/Foundation/FoundationNewsletter'
import Footer from './Footer'

const Body = () => {
  return (
    <>
      <Navbar />
      <Home />
      <FoundationJoinUltimate />
      <FoundationNewsletter />
      <Footer />
    </>
  )
}

export default Body
