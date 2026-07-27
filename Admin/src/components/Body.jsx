import React from 'react'
import { Outlet } from 'react-router-dom';
import Navbar from '../Pages/Navbar/Navbar';
import Home from '../Pages/Home/home';
import Footer from '../Pages/Footer/Footer';
const Body = () => {
  return (
    <div>
      <Navbar/>
      <Outlet /> 
      <Footer />  

    </div>
  )
}

export default Body;