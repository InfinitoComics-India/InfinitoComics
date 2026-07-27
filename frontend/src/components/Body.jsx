import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../pages/Navbar/Navbar';
import Footer from '../pages/Footer/Footer';
import LogoLoader from '../components/loader/logoLoader';

const Body = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const isInitialLoad =
      performance.getEntriesByType('navigation')[0]?.type === 'reload' ||
      performance.getEntriesByType('navigation')[0]?.type === 'navigate';

    if (location.pathname === '/' && isInitialLoad) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <LogoLoader />;
  }

  const isReaderView = location.pathname.includes("/comicChap/") && location.pathname.includes("/pdfView");

  return (
    <div>
       {!isReaderView && <Navbar />}
      <Outlet />
      {!isReaderView && <Footer />}
    </div>
  );
};

export default Body;
