import React, { useState, useEffect } from 'react';
import { FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import UserIcon from '../../../assets/Images/UserIcon.png';
import { useSelector } from 'react-redux';
import { FOUNDATION_BASE_URL, FRONTEND_BASE_URL } from '../../../../frontend/src/utils/constants';

const Navbar = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {}, [user]);

  return (
    <div className="text-white font-sans">
      {/* Top Banner */}
      <div className="bg-[#202020] text-white text-sm py-2 px-4 lg:px-32 border-b border-gray-500 flex justify-between items-center">
        <div>
          Use code <span className="font-bold">INFIN10</span> to get 10% off on our shop!
        </div>
        <div className="hidden lg:flex gap-20 pl-4">
          <Link to={FRONTEND_BASE_URL + "/comics"} className="hover:underline">Comics</Link>
          <a href={FOUNDATION_BASE_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">
            Foundation
          </a>
          <a href={FRONTEND_BASE_URL + "/support-us"} target="_blank" rel="noopener noreferrer" className="hover:underline">
            Support Us
          </a>
          <a href={FRONTEND_BASE_URL + "/news"} target="_blank" rel="noopener noreferrer" className="hover:underline">
            News and Blogs
          </a>
          {/* ✅ Browse tab added */}
          <Link to="/browseResearch" className="hover:underline">Browse</Link>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-[#202020] py-4 px-4 lg:px-32 flex items-center justify-between">
        {/* ----------- Mobile Navbar ----------- */}
        <div className="flex items-center justify-between w-full lg:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 border border-white">
            {menuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>

          <img
            src="/assets/Images/research/researchLOGO.png"
            alt="Infinito Logo"
            className="h-8"
          />

          <div className="p-2 border border-white">
            <FiSearch className="text-xl" />
          </div>
        </div>

        {/* ----------- Desktop Navbar ----------- */}
        <div className="hidden lg:flex items-center justify-between w-full">
          {user ? (
            <div className="flex items-center gap-2 border border-white px-4 py-2 uppercase text-sm">
              <img src={UserIcon} alt="User Icon" className="w-5 h-5" />
              <span className="tracking-wide">Hi, {user?.name?.split(" ")[0] || "Guest"}!</span>
            </div>
          ) : (
            <button
              className="border px-4 py-1 text-sm uppercase"
              onClick={() => navigate('/login')}
            >
              Log In | Sign Up &gt;
            </button>
          )}

          <div>
            <img
              src="/assets/Images/research/researchLOGO.png"
              alt="Infinito-logo"
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="INFINITO ULTIMATE"
              className="bg-white border border-white font-bold text-black placeholder-[#202020] px-6 py-2 w-64 focus:outline-none"
            />
            <div className="p-2 border-2 border-white cursor-pointer hover:bg-white hover:text-black transition">
              <FiSearch className="text-white text-xl hover:text-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="bg-[#202020] px-4 pb-4 lg:hidden space-y-2">
          <Link to="/shop" className="block text-sm hover:underline" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/foundation" className="block text-sm hover:underline" onClick={() => setMenuOpen(false)}>Foundation</Link>
          <Link to="/researchPlans" className="block text-sm hover:underline" onClick={() => setMenuOpen(false)}>Research</Link>
          <Link to="/funding" className="block text-sm hover:underline" onClick={() => setMenuOpen(false)}>Funding</Link>
          {/* ✅ Browse tab added */}
          <Link to="/browseResearch" className="block text-sm hover:underline" onClick={() => setMenuOpen(false)}>Browse</Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
