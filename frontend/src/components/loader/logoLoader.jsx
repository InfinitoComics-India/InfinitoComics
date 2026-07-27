import React from 'react';
import './logoLoader.css';
import logo from '../../../assets/Logo.png'; 

const LogoLoader = () => {
  return (
    <div className="logo-loader-wrapper">
      <div className="logo-loader">
        <img src={logo} alt="Infinito Logo" className="logo" />
      </div>
    </div>
  );
};

export default LogoLoader;
