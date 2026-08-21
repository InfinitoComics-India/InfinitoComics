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

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_BASE_URL || 'https://infinitohq.com';
const FOUNDATION_URL = import.meta.env.VITE_FOUNDATION_BASE_URL || 'https://foundation.infinitohq.com';

const socialLinks = [
  { icon: FaTwitter,    url: 'https://x.com/InfinitoHQ' },
  { icon: FaYoutube,    url: 'https://www.youtube.com/@InfinitoHQ' },
  { icon: FaFacebookF,  url: 'https://www.facebook.com/infinitoHQ' },
  { icon: FaInstagram,  url: 'https://www.instagram.com/infinitoHQ/' },
  { icon: FaLinkedinIn, url: 'https://www.linkedin.com/company/infinitoHQ' },
];

const Footer = () => {
  return (
    <footer className="bg-[#121212] text-white px-4 py-10">

      {/* ── DESKTOP ── */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-8">

          {/* Col 1 — Logo + description */}
          <div className="px-4">
            <div className="w-44 mx-auto">
              <img src={logo} alt="Infinito Logo" className="w-full h-auto" />
              <p className="mt-4 text-[11px] leading-relaxed text-gray-300 text-left">
                India's Most Prominent Character Based Entertainment Company
                With Library Of More Than 2500+ Superheroes
              </p>
            </div>
          </div>

          {/* Col 2 — Links */}
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex flex-col space-y-4">
              <a href={`${FRONTEND_URL}/news`} className="hover:text-red-400 transition-colors">BLOGS &amp; NEWS</a>
              <a href={`${FRONTEND_URL}/careers`} className="hover:text-red-400 transition-colors">CAREER</a>
              <a href={`${FRONTEND_URL}/internships`} className="hover:text-red-400 transition-colors">INTERNSHIP</a>
              <a href={`${FRONTEND_URL}/comics`} className="hover:text-red-400 transition-colors">COMICS</a>
            </div>
            <div className="flex flex-col space-y-4">
              <a href={FOUNDATION_URL} className="hover:text-red-400 transition-colors">FOUNDATION</a>
              <span className="text-white">RESEARCH</span>
              <a href={`${FRONTEND_URL}/support-us`} className="hover:text-red-400 transition-colors">SUPPORT US</a>
            </div>
          </div>

          {/* Col 3 — Socials + CTA */}
          <div className="px-4">
            <div className="flex flex-col items-start gap-4 w-full max-w-[240px]">
              <div className="flex flex-wrap gap-1">
                {socialLinks.map(({ icon: Icon, url }, idx) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                    className="border border-white p-2 rounded hover:text-[#FF2D2D] cursor-pointer">
                    <Icon className="text-lg" />
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-left w-full">
                <img src={smallLogo} alt="logo" className="w-6 h-6 object-contain" />
                <p className="text-white leading-snug">
                  Unlocks Exclusive Comics, Early Access To New Releases &amp; Member-Only Merch!
                </p>
              </div>
              <a href={`${FRONTEND_URL}/ultimate`} className="w-full">
                <button className="w-full bg-white text-black px-5 py-3 text-sm font-bold tracking-wide cursor-pointer">
                  JOIN INFINITO ULTIMATE ›
                </button>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="block md:hidden">
        <div className="text-center px-6">
          <div className="w-56 mx-auto mb-2">
            <img src={logo} alt="Infinito Logo" className="w-full h-auto" />
          </div>
          <p className="mt-3 text-[12px] text-left px-8 text-[#B4B4B4] leading-snug">
            India's Most Prominent Character Based Entertainment Company With
            Library Of More Than 2500+ Superheroes
          </p>

          <div className="mt-8 grid grid-cols-2 gap-y-4 px-5 pr-2 gap-x-12 text-sm font-medium text-left">
            <a href={`${FRONTEND_URL}/news`}>BLOGS &amp; NEWS</a>
            <a href={FOUNDATION_URL}>FOUNDATION</a>
            <a href={`${FRONTEND_URL}/careers`}>CAREER</a>
            <span>RESEARCH</span>
            <a href={`${FRONTEND_URL}/internships`}>INTERNSHIP</a>
            <a href={`${FRONTEND_URL}/support-us`}>SUPPORT US</a>
          </div>

          <div className="mt-8 w-full flex rounded overflow-hidden gap-1 px-1 py-1 h-28">
            <div className="flex items-center justify-center">
              <img src={smallLogo} alt="logo" className="w-48 h-48 object-contain" />
            </div>
            <div className="flex flex-col justify-evenly px-1 flex-grow">
              <p className="text-[9px] text-left text-white leading-snug mb-2">
                Unlocks Exclusive Comics, Early Access To New Releases &amp; Member-Only Merch!
              </p>
              <button className="bg-white text-black px-2 py-2 text-[11px] text-left font-bold tracking-wide w-full">
                JOIN INFINITO ULTIMATE ›
              </button>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {socialLinks.map(({ icon: Icon, url }, idx) => (
              <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                className="border border-white p-2 rounded hover:text-[#FF2D2D] cursor-pointer">
                <Icon className="text-lg" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar — desktop ── */}
      <div className="hidden md:flex border-t border-gray-600 mt-10 pt-6 text-[12px] text-gray-400 justify-center items-center gap-x-14 whitespace-nowrap text-center">
        <a href={`${FRONTEND_URL}/refund-policy`} className="hover:underline">Refund Policy</a>
        <a href={`${FRONTEND_URL}/privacy-policy`} className="hover:underline">Privacy Policy</a>
        <a href={`${FRONTEND_URL}/terms-of-use`} className="hover:underline">Terms Of Use</a>
        <a href={`${FRONTEND_URL}/children-privacy-policy`} className="hover:underline">Children Privacy Policy</a>
        <a href={`${FRONTEND_URL}/anti-harassment`} className="hover:underline">Anti Harassment Policy</a>
        <span>© 2025–26 By Infinito Comics</span>
      </div>

      {/* ── Bottom bar — mobile ── */}
      <div className="flex flex-col md:hidden border-t border-gray-600 mt-10 pt-6 text-[12px] text-gray-400 text-center space-y-2">
        <div className="flex justify-center gap-x-6">
          <a href={`${FRONTEND_URL}/refund-policy`} className="hover:underline">Refund Policy</a>
          <a href={`${FRONTEND_URL}/privacy-policy`} className="hover:underline">Privacy Policy</a>
          <a href={`${FRONTEND_URL}/terms-of-use`} className="hover:underline">Terms Of Use</a>
        </div>
        <div className="flex justify-center gap-x-6">
          <a href={`${FRONTEND_URL}/children-privacy-policy`} className="hover:underline">Children Privacy Policy</a>
          <a href={`${FRONTEND_URL}/anti-harassment`} className="hover:underline">Anti Harassment Policy</a>
        </div>
        <div className="pt-1">© 2025–26 By Infinito Comics</div>
      </div>

    </footer>
  );
};

export default Footer;
