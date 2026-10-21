import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../pages/Navbar/Navbar';
import Footer from '../pages/Footer/Footer';
import TopPromoBar from './TopPromoBar';

const Body = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopPromoBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Body;
