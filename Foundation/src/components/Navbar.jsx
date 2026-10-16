import React, { useState } from "react";
import { FiMenu, FiSearch, FiX } from "react-icons/fi";
import { Heart, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../../frontend/assets/Logo.png";
import userIcon from "../../../frontend/assets/Images/UserIcon.png";
import { FRONTEND_BASE_URL } from "../utils/constants.js";

const mainUrl = (path = "") => `${FRONTEND_BASE_URL}${path}`;

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="text-white font-sans border-b border-gray-800">
      <div className="border-b bg-[#202020] border-gray-600 text-sm py-3 flex flex-col md:flex-row items-center">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-12 flex justify-between items-center">
          <div className="mb-2 md:mb-0 text-center text-xs md:text-sm">
            Use code <strong>INFINT10</strong> to get 10% off on our shop!
          </div>
          <div className="hidden md:flex gap-8 text-[0.9rem] text-gray-300">
            <a href={mainUrl("/news")} className="hover:text-white font-semibold">Blogs &amp; News</a>
            <a href={mainUrl("/foundation")} className="hover:text-white font-semibold">Foundation</a>
            <a href={mainUrl("/research/browseResearch")} className="hover:text-white font-semibold">Research</a>
            <a href={mainUrl("/support-us")} className="hover:text-white font-semibold flex items-center gap-1"><Heart size={14} /> Support Us</a>
          </div>
        </div>
      </div>

      <div className="bg-[#202020] py-2">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-12 flex items-center justify-between gap-4">
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"}>
              {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
            </button>
          </div>
          <div className="hidden cursor-pointer md:block">
            {user ? (
              <button className="flex items-center gap-2 border border-white px-3 py-1.5 uppercase text-xs font-semibold hover:bg-white hover:text-black transition" onClick={() => navigate(mainUrl("/dashboard"))}>
                <img src={userIcon} alt="User Icon" className="w-4 h-4" />
                <span className="tracking-wide">Hi, {user?.name?.split(" ")[0] || "Guest"}!</span>
              </button>
            ) : (
              <a href={mainUrl("/login")} className="inline-block border border-white px-4 py-1.5 uppercase text-xs font-bold hover:bg-white hover:text-black transition tracking-wider">LOG IN | SIGN UP &gt;</a>
            )}
          </div>
          <a href={FRONTEND_BASE_URL} className="text-center"><img src={logo} alt="INFINITO" className="h-10 md:h-12 w-auto object-contain" /></a>
          <div className="flex items-center gap-3">
            <a href={mainUrl("/ultimate")} className="hidden md:block bg-white text-black px-4 py-1.5 text-xs uppercase font-bold hover:bg-gray-200 transition tracking-widest">INFINITO ULTIMATE &gt;</a>
            <a href={mainUrl("/comics")} className="border border-white p-1.5 hover:bg-white hover:text-black transition" aria-label="Search comics"><FiSearch size={18} /></a>
          </div>
        </div>
      </div>

      <nav className="hidden md:block bg-[#171717] text-xs text-gray-300 py-3" aria-label="Main navigation">
        <div className="w-full max-w-[1200px] mx-auto px-12">
          <ul className="flex flex-wrap justify-center gap-2 items-center uppercase font-bold tracking-wider">
            {["characters", "comics", "animation", "games", "community", "aboutUs"].map((path, index) => (
              <li key={path}><a href={mainUrl(`/${path}`)} className={`hover:text-white px-3 ${index ? "border-l border-gray-600" : ""}`}>{path === "aboutUs" ? "About Us" : path}</a></li>
            ))}
            <li><a href={mainUrl("/shop")} className="hover:text-white border-l border-gray-600 px-3 flex items-center gap-1.5 text-red-500 font-extrabold"><ShoppingBag size={15} /> SHOP</a></li>
          </ul>
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden bg-[#171717] text-sm text-gray-300 px-4 py-6 space-y-4">
          {user ? <a href={mainUrl("/dashboard")} className="block font-bold text-white border-b border-gray-800 pb-3" onClick={closeMenu}><img src={userIcon} alt="User" className="w-4 h-4 inline mr-2" />My Account</a> : <a href={mainUrl("/login")} className="block font-bold text-white uppercase text-xs tracking-wider border-b border-gray-800 pb-3" onClick={closeMenu}>LOG IN | SIGN UP &gt;</a>}
          {["characters", "comics", "animation", "games", "community", "aboutUs", "news", "foundation", "research/browseResearch"].map((path) => (
            <a key={path} href={mainUrl(`/${path}`)} className="block font-bold hover:text-white" onClick={closeMenu}>{path === "aboutUs" ? "About Us" : path === "research/browseResearch" ? "Research" : path === "news" ? "Blogs & News" : path[0].toUpperCase() + path.slice(1)}</a>
          ))}
          <a href={mainUrl("/support-us")} className="font-bold hover:text-white flex items-center gap-2" onClick={closeMenu}><Heart size={14} /> Support Us</a>
        </div>
      )}
    </header>
  );
};

export default Navbar;