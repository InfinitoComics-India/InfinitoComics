import React from 'react'
import Home from '../pages/Home'
import Navbar from './Navbar'
import Footer from './Footer'
import FoundationJoinUltimate from '../pages/Foundation/FoundationJoinUltimate'
import FoundationNewsletter from '../pages/Foundation/FoundationNewsletter'

const Body = () => {
  return (
    <>
      <Navbar />
      <Home />
      <section className="w-full">
        <FoundationJoinUltimate />
        <FoundationNewsletter />
      </section>
      <Footer />
    </>
  )
}

export default Body
