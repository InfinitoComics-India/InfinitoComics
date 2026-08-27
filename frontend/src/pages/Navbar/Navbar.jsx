// 📁 src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { FiSearch, FiMenu, FiX, FiUser } from "react-icons/fi";
import logo from "../../../assets/Logo.png";
import { Heart, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import UserIcon from "../../../assets/Images/UserIcon.png";
import {
  RESEARCH_BASE_URL,
  FOUNDATION_BASE_URL,
} from "../../utils/constants.js";
import NavbarShimmer from "../../shimmer/landingPageShimmer/navbarShimmer";

const Header = () => {
  const [loading, setLoading] = useState(true);
  // State to handle mobile menu toggle
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  useEffect(() => {
    // fetch data / preload hero image ...
    setTimeout(() => setLoading(false), 2400); // demo
  }, []);

  return loading ? (
    <NavbarShimmer />
  ) : (
    <div className="text-white font-sans">
      {/* ── Top promo bar ── */}
      <div className="border-b bg-[#202020] border-gray-600 text-sm py-4 flex flex-col md:flex-row items-center">
        <div className="w-full max-w-[1200px] mx-auto px-12 flex justify-between items-center">
          {/* Promo Text */}
          <div className="mb-2 md:mb-0 text-center">
            Use code <strong>INFINT10</strong> to get 10% off on our shop!
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex gap-10 text-[1rem] text-gray-300">
            <Link to="/news" className="hover:text-white font-bold">
              Blogs &amp; News
            </Link>
            <a href={FOUNDATION_BASE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white font-bold">
              Foundation
            </a>
            <a href={`${RESEARCH_BASE_URL}/research`} className="hover:text-white font-bold">
              Research
            </a>
            <Link
              to="/support-us"
              className="hover:text-white font-bold flex items-center gap-1"
            >
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
              <div
                className="flex items-center gap-2 pointer border border-white px-4 py-2 uppercase text-sm"
                onClick={() => navigate("/dashboard")}
              >
                <img src={UserIcon} alt="User Icon" className="w-5 h-5" />
                <span className="tracking-wide">
                  Hi, {user?.name?.split(" ")[0] || "Guest"}!
                </span>
              </div>
            ) : (
              <button
                className="border border-white px-5 py-2 uppercase text-sm hover:bg-white hover:text-black transition tracking-wider"
                onClick={() => navigate("/login")}
              >
                LOG IN | SIGN UP &gt;
              </button>
            )}
          </div>

          {/* Logo Centered */}
          <Link to="/">
            <div className="text-center">
              <img src={logo} alt="infinto" className="h-12 w-auto object-contain" />
            </div>
          </Link>

          {/* Right: Infinito Ultimate + Search */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/ultimate")}
              className="hidden md:block bg-white text-black px-5 py-2 text-sm uppercase font-bold hover:bg-gray-200 transition tracking-widest"
            >
              INFINITO ULTIMATE &gt;
            </button>
            <button className="border border-white p-2 hover:bg-white hover:text-black transition">
              <FiSearch size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom nav (desktop) ── */}
      <div className="hidden md:block bg-[#171717] text-sm text-gray-300 py-3">
        <div className="w-full max-w-[1200px] mx-auto px-12">
          <ul className="flex flex-wrap justify-center gap-4 items-center">
            <li>
              <Link
                to="/characters"
                className="uppercase tracking-wider font-semibold hover:text-white cursor-pointer"
              >
                Characters
              </Link>
            </li>
            <li>
              <Link
                to="/comics"
                className="uppercase tracking-wider font-semibold hover:text-white cursor-pointer border-l border-gray-600 px-3"
              >
                Comics
              </Link>
            </li>
            <li>
              <Link
                to="/animation"
                className="uppercase tracking-wider font-semibold hover:text-white cursor-pointer border-l border-gray-600 px-3"
              >
                Animation
              </Link>
            </li>
            <li>
              <Link
                to="/games"
                className="uppercase tracking-wider font-semibold hover:text-white cursor-pointer border-l border-gray-600 px-3"
              >
                Games
              </Link>
            </li>
            <li>
              <Link
                to="/community"
                className="uppercase tracking-wider font-semibold hover:text-white cursor-pointer border-l border-gray-600 px-3"
              >
                Community
              </Link>
            </li>
            <li>
              <Link
                to="/aboutUS"
                className="uppercase tracking-wider font-semibold hover:text-white cursor-pointer border-l border-gray-600 px-3"
              >
                About Us
              </Link>
            </li>
            <li>
              <a
                href="https://www.infinitostyle.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="uppercase tracking-wider font-semibold hover:text-white cursor-pointer border-l border-gray-600 px-3 flex items-center gap-2"
              >
                <ShoppingBag size={16} /> SHOP
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#171717] text-sm text-gray-300 px-4 py-6 space-y-4">
          <Link to="/characters" className="block font-bold hover:text-white">
            Characters
          </Link>
          <Link to="/comics" className="block font-bold hover:text-white">
            Comics
          </Link>
          <Link to="/animation" className="block font-bold hover:text-white">
            Animation
          </Link>
          <Link to="/games" className="block font-bold hover:text-white">
            Games
          </Link>
          <Link to="/community" className="block font-bold hover:text-white">
            Community
          </Link>
          <Link to="/aboutUs" className="block font-bold hover:text-white">
            About Us
          </Link>
          <a
            href="https://www.infinitostyle.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block font-bold hover:text-white flex items-center gap-2"
          >
            <ShoppingBag size={14} /> SHOP
          </a>

          <Link to="/news" className="block font-bold hover:text-white">
            Blogs &amp; News
          </Link>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.open(`${FOUNDATION_BASE_URL}/?from=main`, "_blank");
            }}
            className="hover:underline block font-bold"
          >
            Foundation
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `${RESEARCH_BASE_URL}/research`;
            }}
            className="hover:underline block font-bold"
          >
            Research
          </a>

          <Link
            to="/support-us"
            className="font-bold hover:text-white flex items-center gap-2"
          >
            <Heart size={14} /> Support Us
          </Link>
          {user ? (
            <div className="flex items-center gap-2 border border-white px-4 py-2 uppercase text-sm">
              <img src={UserIcon} alt="User Icon" className="w-5 h-5" />
              <span className="tracking-wide">
                Hi, {user.name.split(" ")[0]}!
              </span>
            </div>
          ) : (
            <button
              className="w-full border border-white px-6 py-3 uppercase text-md hover:bg-white hover:text-black transition tracking-wider"
              onClick={() => navigate("/login")}
            >
              Log In | Sign Up &gt;
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Header;
