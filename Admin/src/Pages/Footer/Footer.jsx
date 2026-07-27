import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom'
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaTwitter
} from 'react-icons/fa';
import URLs from "../../Utils/utils.js";
import FooterShimmer from '../../shimmer/FooterShimmer';

const socialLinks = [
  { icon: FaTwitter, url: 'https://x.com/InfinitoHQ' },
  { icon: FaYoutube, url: 'https://www.youtube.com/@InfinitoHQ' },
  { icon: FaFacebookF, url: 'https://www.facebook.com/infinitoHQ' },
  { icon: FaInstagram, url: 'https://www.instagram.com/infinitoHQ/' },
  { icon: FaLinkedinIn, url: 'https://www.linkedin.com/company/infinitoHQ' },
];

const Footer = () => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      // fetch data / preload hero image ...
      setTimeout(() => setLoading(false), 2400); // demo
    }, []);
  return loading?<FooterShimmer/>:(
    <footer className="bg-[#121212] text-white px-4 py-10">

      {/* =================== DESKTOP VIEW =================== */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="px-4">
            <div className="w-44 mx-auto">
              <img src={URLs.Logo_url} alt="Infinito Logo" className="w-full h-auto" />
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
              <span>BLOGS & NEWS</span>
              <Link to="/career"><span>CAREER</span></Link>
              <span>INTERNSHIP</span>
            </div>
            <div className="flex flex-col space-y-4">
              <span>FOUNDATION</span>
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

              <div className="flex items-center gap-2 px-3 py-2 text-xs text-left w-full">
                <img src={URLs.foot_url} alt="logo" className="w-6 h-6 object-contain" />
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
      </div>


      {/* =================== MOBILE VIEW =================== */}
      <div className="block md:hidden">
        <div className="text-center px-6">
          <div className="w-56 mx-auto mb-2">
            <img src={URLs.Logo_url} alt="Infinito Logo" className="w-full h-auto" />
          </div>
          <p className="text-[10.5px]  leading-tight">WHERE IMAGINATIONS BREAKS BOUNDARIES</p>
          <p className="mt-3  text-[12px] text-left px-8  text-[#B4B4B4] leading-snug">
            India’s Most Prominent Character Based Entertainment Company With Library Of More Than 2500+ Superheroes
          </p>


          <div className="mt-8 grid grid-cols-2 gap-y-4 px-5 pr-2 gap-x-12 text-sm font-medium text-left">
            <span>BLOGS & NEWS</span>
            <span>FOUNDATION</span>
            <Link to="/career">CAREER</Link>
            <span>RESEARCH</span>
            <span>INTERNSHIP</span>
            <span>SUPPORT US</span>
          </div>
          
<div className="mt-8 w-full flex rounded overflow-hidden gap-1  px-1 py-1 h-28">
  {/* Left: Logo Box */}


  <div className=" flex items-center justify-center">
    <img src={URLs.foot_url} alt="logo" className="w-48 h-48 object-contain" />
  </div>


  {/* Right: Text and Button */}
  <div className="flex flex-col justify-evenly px-1   flex-grow">
    <p className="text-[9px] text-left text-white leading-snug mb-2">
      Unlocks Exclusive Comics, Early Access To New Releases & Member-Only Merch!
    </p>
    <button className="bg-white text-black px-2 py-2 text-[11px] text-left font-bold tracking-wide w-full">
      JOIN INFINITO ULTIMATE ›
    </button>
  </div>
</div>



          <div className="mt-10 flex flex-wrap justify-center  gap-2">
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
        </div>
      </div>

{/* Desktop View */}
<div className="hidden md:flex border-t border-gray-600 mt-10 pt-6 text-[12px] text-gray-400 justify-center items-center gap-x-14 whitespace-nowrap text-center">
  <span>Terms Of Use</span>
  <span>Privacy Policy</span>
  <span>FAQs</span>
  <span>Children’s Privacy Policy</span>
  <span>Help Centre</span>
  <span>© 2025–26 By Infinito Comics</span>
</div>

{/* Mobile View */}
<div className="flex flex-col md:hidden border-t border-gray-600 mt-10 pt-6 text-[12px] text-gray-400 text-center space-y-2">
  <div className="flex justify-center gap-x-6">
    <span>Terms Of Use</span>
    <span>Privacy Policy</span>
    <span>Help Centre</span>
  </div>
  <div className="flex justify-center gap-x-6">
    <span>Children’s Privacy Policy</span>
    <span>FAQs</span>
  </div>
  <div className="pt-1">
    © 2025–26 By Infinito Comics
  </div>
</div>




    </footer>
  );
};

export default Footer;
