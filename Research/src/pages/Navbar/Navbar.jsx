import React, { useState } from 'react';
import { FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useSelector } from 'react-redux';
import UserIcon from '../../../assets/Images/UserIcon.png';
import Logo from '../../../assets/Logo.png';
import { FRONTEND_BASE_URL, BACKEND_URL } from '../../utils/constants';

const FOUNDATION_BASE_URL = 'http://localhost:3004';

const Navbar = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="text-white font-sans">

      {/* ── Top promo bar ── */}
      <div className="border-b bg-[#202020] border-gray-600 text-sm py-4 flex flex-col md:flex-row items-center">
        <div className="w-full max-w-[1200px] mx-auto px-12 flex justify-between items-center">
          <div className="mb-2 md:mb-0 text-center">
            Use code <strong>INFINT10</strong> to get 10% off on our shop!
          </div>
          <div className="hidden md:flex gap-10 text-[1rem] text-gray-300">
            <a href={`${FRONTEND_BASE_URL}/news`} className="hover:text-white">Blogs &amp; News</a>
            <a href={FOUNDATION_BASE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white">Foundation</a>
            <Link to="/browseResearch" className="hover:text-white">Research</Link>
            <Link to={`${FRONTEND_BASE_URL}/support-us`} className="hover:text-white flex items-center gap-1">
              <Heart size={14} /> Support Us
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main bar: Login | Logo | Search ── */}
      <div className="bg-[#202020] py-1">
        <div className="w-full max-w-[1200px] mx-auto px-12 flex items-center justify-between gap-4">

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>

        {/* Login / User */}
        <div className="hidden cursor-pointer md:block">
          {user ? (
            <div className="flex items-center gap-2 border border-white px-4 py-2 uppercase text-sm"
              onClick={() => navigate(`${FRONTEND_BASE_URL}/dashboard`)}>
              <img src={UserIcon} alt="User" className="w-5 h-5" />
              <span className="tracking-wide">Hi, {user?.name?.split(' ')[0] || 'Guest'}!</span>
            </div>
          ) : (
            <button
              className="border border-white px-6 py-3 uppercase text-md hover:bg-white hover:text-black transition tracking-wider"
              onClick={() => window.open(`${FRONTEND_BASE_URL}/login`, '_self')}
            >
              LOG IN | SIGN UP &gt;
            </button>
          )}
        </div>

        {/* INFINITO Logo — center */}
        <a href={FRONTEND_BASE_URL}>
          <img src={Logo} alt="Infinito" className="h-12 w-auto object-contain" />
        </a>

        {/* Search */}
        <div className="flex items-center gap-4">
          <input
            type="search"
            placeholder="INFINITO ULTIMATE >"
            className="hidden md:block bg-white text-black px-6 py-3 text-xs sm:text-sm uppercase font-bold placeholder-black hover:bg-gray-200 transition tracking-widest w-full max-w-xs"
          />
          <button className="border border-white p-2.5 hover:bg-white hover:text-black transition">
            <FiSearch size={24} />
          </button>
        </div>
        </div>
      </div>

      {/* ── Bottom nav (desktop) ── */}
      <div className="hidden md:block bg-[#171717] text-sm text-gray-300 py-3">
        <div className="w-full max-w-[1200px] mx-auto px-12">
        <ul className="flex flex-wrap justify-center gap-4 items-center">
          <li>
            <a href={`${FRONTEND_BASE_URL}/characters`} className="uppercase tracking-wider font-semibold hover:text-white cursor-pointer">Characters</a>
          </li>
          <li>
            <a href={`${FRONTEND_BASE_URL}/comics`} className="uppercase tracking-wider font-semibold hover:text-white cursor-pointer border-l border-gray-600 px-3">Comics</a>
          </li>
          <li>
            <a href={`${FRONTEND_BASE_URL}/animation`} className="uppercase tracking-wider font-semibold hover:text-white cursor-pointer border-l border-gray-600 px-3">Animation</a>
          </li>
          <li>
            <a href={`${FRONTEND_BASE_URL}/games`} className="uppercase tracking-wider font-semibold hover:text-white cursor-pointer border-l border-gray-600 px-3">Games</a>
          </li>
          <li>
            <a href={`${FRONTEND_BASE_URL}/community`} className="uppercase tracking-wider font-semibold hover:text-white cursor-pointer border-l border-gray-600 px-3">Community</a>
          </li>
          <li>
            <a href={`${FRONTEND_BASE_URL}/aboutUS`} className="uppercase tracking-wider font-semibold hover:text-white cursor-pointer border-l border-gray-600 px-3">About Us</a>
          </li>
          <li>
            <a href="https://www.infinitostyle.com/" target="_blank" rel="noopener noreferrer"
              className="uppercase tracking-wider font-semibold hover:text-white cursor-pointer border-l border-gray-600 px-3 flex items-center gap-2">
              <ShoppingBag size={16} /> SHOP
            </a>
          </li>
        </ul>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      {menuOpen && (
        <div className="md:hidden bg-[#171717] text-sm text-gray-300 px-4 py-6 space-y-4">
          <a href={`${FRONTEND_BASE_URL}/characters`} className="block font-bold hover:text-white">Characters</a>
          <a href={`${FRONTEND_BASE_URL}/comics`} className="block font-bold hover:text-white">Comics</a>
          <a href={`${FRONTEND_BASE_URL}/animation`} className="block font-bold hover:text-white">Animation</a>
          <a href={`${FRONTEND_BASE_URL}/games`} className="block font-bold hover:text-white">Games</a>
          <a href={`${FRONTEND_BASE_URL}/community`} className="block font-bold hover:text-white">Community</a>
          <a href={`${FRONTEND_BASE_URL}/aboutUS`} className="block font-bold hover:text-white">About Us</a>
          <a href="https://www.infinitostyle.com/" target="_blank" rel="noopener noreferrer"
            className="block font-bold hover:text-white flex items-center gap-2"><ShoppingBag size={14} /> SHOP</a>
          <Link to="/browseResearch" className="block font-bold hover:text-white">Research</Link>
          <a href={`${FRONTEND_BASE_URL}/news`} className="block font-bold hover:text-white">Blogs &amp; News</a>
          {!user && (
            <button className="w-full border border-white px-6 py-3 uppercase text-md hover:bg-white hover:text-black transition tracking-wider"
              onClick={() => window.open(`${FRONTEND_BASE_URL}/login`, '_self')}>
              Log In | Sign Up &gt;
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
