import React from 'react';
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaTwitter
} from 'react-icons/fa';
import logo from '../../../assets/Logo (1).png'; 
import smallLogo from '../../../assets/Images/foot.png';

const socialLinks = [
  { icon: FaTwitter, url: 'https://x.com/InfinitoHQ' },
  { icon: FaYoutube, url: 'https://www.youtube.com/@InfinitoHQ' },
  { icon: FaFacebookF, url: 'https://www.facebook.com/infinitoHQ' },
  { icon: FaInstagram, url: 'https://www.instagram.com/infinitoHQ/' },
  { icon: FaLinkedinIn, url: 'https://www.linkedin.com/company/infinitoHQ' },
];
const Footer = () => {
  return (
    <footer className="bg-[#121212] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      
<div className="px-4">
  <div className="w-44 mx-auto">
    <img
      src={logo}
      alt="Infinito Logo"
      className="w-full h-auto"
    />
    <p className="text-[8px] pt-1 leading-tight text-white text-center">
      WHERE IMAGINATIONS BREAKS BOUNDARIES
    </p>
    <p className="mt-4 text-[11px] leading-relaxed text-gray-300 text-left">
      India’s Most Prominent Character Based Entertainment Company With Library Of
      More Than 2500+ Superheroes
    </p>
  </div>
</div>




        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex flex-col space-y-4">
            <span className="font-bold">BLOGS & NEWS</span>
            <span>CAREER</span>
            <span>INTERNSHIP</span>
          </div>
          <div className="flex flex-col space-y-4">
            <span className="font-bold">FOUNDATION</span>
            <span>RESEARCH</span>
            <span>SUPPORT US</span>
          </div>
        </div>
<div className="px-4">
  <div className="flex flex-col items-start gap-4 w-full max-w-[240px]">
   
    <div className="flex flex-wrap gap-1">
      {socialLinks.map(({ icon: Icon, url }, idx) => (
        <a
          key={idx}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-white p-2 rounded hover:text-[#FF2D2D] cursor-pointer"
        >
          <Icon className="text-lg" />
        </a>
      ))}
    </div>


    <div className="flex items-center gap-2  px-3 py-2 text-xs text-left w-full">
      <img src={smallLogo} alt="logo" className="w-6 h-6 object-contain" />
      <p className="text-white leading-snug">
        Unlocks Exclusive Comics, Early Access To New Releases & Member-Only Merch!
      </p>
    </div>


    <button className="w-full bg-white text-black px-5 py-3 text-sm font-bold tracking-wide">
      JOIN INFINITO ULTIMATE ›
    </button>
  </div>
</div>


      </div>

      <div className="border-t border-gray-600 mt-10 pt-6 text-xs text-gray-400 text-center">
        <div className="flex flex-wrap justify-center gap-4 mb-2">
          <span>Terms Of Use</span>
          <span>Privacy Policy</span>
          <span>FAQs</span>
          <span>Children’s Privacy Policy</span>
          <span>Help Centre</span>
          <span>© 2025–26 By Infinito Comics</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
