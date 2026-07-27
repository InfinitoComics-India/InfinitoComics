import React from 'react';
import '../comingSoon/style.css'; 
import gifImage from '../../../../frontend/src/components/comingSoon/Untitled.gif';

const ComingSoonPage = () => {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link
        href="https://fonts.googleapis.com/css2?family=Bungee+Tint&display=swap"
        rel="stylesheet"
      />

      <div>
        {/* Top Navbar */}
        <div className="navbar">
          <div className="scrolling-text">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={`top-${i}`}>COMING SOON</span>
            ))}
          </div>
        </div>

        {/* GIF Image */}
        <img src={gifImage} alt="Coming Soon Animation" className="img" />

        {/* Bottom Navbar */}
        <div className="navbar">
          <div className="scrolling-text">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={`bottom-${i}`}>COMING SOON</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ComingSoonPage;
