import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../pages/Navbar/Navbar'
import Footer from '../pages/Footer/Footer'

const Body = () => {
  return (
    <div>
      <Navbar/>
      <Outlet/>
      <Footer/>
    </div>
  )
}

export default Body