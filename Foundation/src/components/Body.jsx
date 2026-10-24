import React from 'react'
import Home from '../pages/Home'
import Navbar from './Navbar'
import JoinUltimate from '../../../frontend/src/pages/Home/JoinUltimate.jsx'
import FoundationNewsletter from '../pages/Foundation/FoundationNewsletter'
import Footer from './Footer'

const Body = () => {
  return (
    <>
      <Navbar />
      <Home />
      <JoinUltimate />
      <FoundationNewsletter />
      <Footer />
    </>
  )
}

export default Body
