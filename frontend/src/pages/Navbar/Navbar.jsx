import React, { useState, useEffect } from "react";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";
import logo from "../../../assets/Logo.png";
import { Heart, ShoppingBag, Package } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import UserIcon from "../../../assets/Images/UserIcon.png";
import {
  RESEARCH_BASE_URL,
  FOUNDATION_BASE_URL,
  FRONTEND_BASE_URL,
  SHOP_BASE_URL,
} from "../../utils/constants.js";
import NavbarShimmer from "../../shimmer/landingPageShimmer/navbarShimmer";

const Header = () => {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  const isShopSubdomain = hostname.includes('shop');

  return loading ? (
    <NavbarShimmer />
  ) : (
    <div className="text-white font-sans border-b border-gray-800">
      {/* ── Top promo bar ── */}
      <div className="border-b bg-[#202020] border-gray-600 text-sm py-3 flex flex-col md:flex-row items-center">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-12 flex justify-between items-center">
          {/* Promo Text */}
          <div className="mb-2 md:mb-0 text-center text-xs md:text-sm">
            Use code <strong>INFINT10</strong> to get 10% off on our shop!
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex gap-8 text-[0.9rem] text-gray-300">
            <Link to="/news" className="hover:text-white font-semibold">
              Blogs &amp; News
            </Link>
            <a
              href={FOUNDATION_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white font-semibold"
            >
              Foundation
            </a>
            <a
              href={`${RESEARCH_BASE_URL}/research/browseResearch`}
              className="hover:text-white font-semibold"
            >
              Research
            </a>
            <Link
              to="/support-us"
              className="hover:text-white font-semibold flex items-center gap-1"
            >
              <Heart size={14} /> Support Us
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main bar: Login | Logo | Search ── */}
      <div className="bg-[#202020] py-2">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-12 flex items-center justify-between gap-4">
          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
            </button>
          </div>

          {/* Login / User */}
          <div className="hidden cursor-pointer md:block">
            {user ? (
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-2 pointer border border-white px-3 py-1.5 uppercase text-xs font-semibold hover:bg-white hover:text-black transition"
                  onClick={() => navigate("/dashboard")}
                  title="My Account"
                >
                  <img src={UserIcon} alt="User Icon" className="w-4 h-4" />
                  <span className="tracking-wide">
                    Hi, {user?.name?.split(" ")[0] || "Guest"}!
                  </span>
                </div>
              </div>
            ) : (
              <button
                className="border border-white px-4 py-1.5 uppercase text-xs font-bold hover:bg-white hover:text-black transition tracking-wider"
                onClick={() => navigate("/login")}
              >
                LOG IN | SIGN UP &gt;
              </button>
            )}
          </div>

          {/* Logo Centered - Always redirects to Main Domain https://infinitohq.com */}
          <a href={FRONTEND_BASE_URL || "https://infinitohq.com"} className="text-center">
            <img src={logo} alt="INFINITO" className="h-10 md:h-12 w-auto object-contain" />
          </a>

          {/* Right: Infinito Ultimate + Search */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/ultimate")}
              className="hidden md:block bg-white text-black px-4 py-1.5 text-xs uppercase font-bold hover:bg-gray-200 transition tracking-widest"
            >
              INFINITO ULTIMATE &gt;
            </button>
            <button className="border border-white p-1.5 hover:bg-white hover:text-black transition">
              <FiSearch size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom nav (desktop) ── */}
      <div className="hidden md:block bg-[#171717] text-xs text-gray-300 py-3">
        <div className="w-full max-w-[1200px] mx-auto px-12">
          <ul className="flex flex-wrap justify-center gap-2 items-center uppercase font-bold tracking-wider">
            <li>
              <Link to="/characters" className="hover:text-white px-3">
                Characters
              </Link>
            </li>
            <li>
              <Link to="/comics" className="hover:text-white border-l border-gray-600 px-3">
                Comics
              </Link>
            </li>
            <li>
              <Link to="/animation" className="hover:text-white border-l border-gray-600 px-3">
                Animation
              </Link>
            </li>
            <li>
              <Link to="/games" className="hover:text-white border-l border-gray-600 px-3">
                Games
              </Link>
            </li>
            <li>
              <Link to="/community" className="hover:text-white border-l border-gray-600 px-3">
                Community
              </Link>
            </li>
            <li>
              <Link to="/aboutUs" className="hover:text-white border-l border-gray-600 px-3">
                About Us
              </Link>
            </li>
            <li>
              {/* SHOP Link: opens https://shop.infinitohq.com/ or internal /shop route */}
              <a
                href={SHOP_BASE_URL}
                className="hover:text-white border-l border-gray-600 px-3 flex items-center gap-1.5 text-red-500 font-extrabold"
              >
                <ShoppingBag size={15} /> SHOP
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#171717] text-sm text-gray-300 px-4 py-6 space-y-4">
          {user ? (
            <div className="pb-3 border-b border-gray-800 space-y-2">
              <Link to="/dashboard" className="block font-bold text-white flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                <img src={UserIcon} alt="User" className="w-4 h-4" /> My Account ({user?.name?.split(" ")[0] || "Profile"})
              </Link>
            </div>
          ) : (
            <div className="pb-3 border-b border-gray-800">
              <Link to="/login" className="block font-bold text-white uppercase text-xs tracking-wider" onClick={() => setMenuOpen(false)}>
                LOG IN | SIGN UP &gt;
              </Link>
            </div>
          )}
          <Link to="/characters" className="block font-bold hover:text-white" onClick={() => setMenuOpen(false)}>
            Characters
          </Link>
          <Link to="/comics" className="block font-bold hover:text-white" onClick={() => setMenuOpen(false)}>
            Comics
          </Link>
          <Link to="/animation" className="block font-bold hover:text-white" onClick={() => setMenuOpen(false)}>
            Animation
          </Link>
          <Link to="/games" className="block font-bold hover:text-white" onClick={() => setMenuOpen(false)}>
            Games
          </Link>
          <Link to="/community" className="block font-bold hover:text-white" onClick={() => setMenuOpen(false)}>
            Community
          </Link>
          <Link to="/aboutUs" className="block font-bold hover:text-white" onClick={() => setMenuOpen(false)}>
            About Us
          </Link>
          <a
            href={SHOP_BASE_URL}
            className="block font-bold hover:text-white flex items-center gap-2 text-red-500"
            onClick={() => setMenuOpen(false)}
          >
            <ShoppingBag size={14} /> SHOP
          </a>

          <Link to="/news" className="block font-bold hover:text-white" onClick={() => setMenuOpen(false)}>
            Blogs &amp; News
          </Link>

          <a
            href={FOUNDATION_BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-bold hover:text-white"
          >
            Foundation
          </a>

          <a
            href={`${RESEARCH_BASE_URL}/research/browseResearch`}
            className="block font-bold hover:text-white"
          >
            Research
          </a>

          <Link
            to="/support-us"
            className="font-bold hover:text-white flex items-center gap-2"
            onClick={() => setMenuOpen(false)}
          >
            <Heart size={14} /> Support Us
          </Link>
        </div>
      )}
    </div>
  );
};

export default Header;
