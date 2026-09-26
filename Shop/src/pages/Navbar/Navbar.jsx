// Adapted from frontend/src/pages/Navbar/Navbar.jsx so the shop shares the
// exact same header as the main site.
import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";
import logo from "../../assets/Logo.png";
import UserIcon from "../../assets/Images/UserIcon.png";
import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  RESEARCH_BASE_URL,
  FOUNDATION_BASE_URL,
  FRONTEND_BASE_URL,
} from "../../utils/constants.js";

// ── Search Modal ──────────────────────────────────────────────────
// The shop lives on its own subdomain, so we don't wire the search API here
// like the main site does. When the user searches we just bounce them to the
// main site's search UX (they can dispatch from there).
const SearchModal = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    window.location.href = `${FRONTEND_BASE_URL}/?search=${encodeURIComponent(q)}`;
  };

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/70 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-5 py-4 border-b border-gray-100 gap-3">
          <FiSearch size={20} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search characters, comics, blogs…"
            className="flex-1 text-base text-gray-800 outline-none placeholder-gray-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-400 border border-gray-200 px-2 py-1 rounded hover:bg-gray-50 ml-1"
          >
            ESC
          </button>
        </div>

        <div className="px-5 py-8 text-center text-sm text-gray-500">
          Press Enter to search on the main site.
        </div>
      </form>
    </div>
  );
};

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const user = useSelector((store) => store.user);

  useEffect(() => {
    const handler = (e) => {
      if (
        (e.ctrlKey && e.key === "k") ||
        (e.key === "/" &&
          document.activeElement.tagName !== "INPUT" &&
          document.activeElement.tagName !== "TEXTAREA")
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="text-white font-dmsans">
      {/* ── Top promo bar ── */}
      <div className="border-b bg-[#202020] border-gray-600 text-sm py-4 flex flex-col md:flex-row items-center">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-12 flex justify-between items-center">
          {/* Promo Text */}
          <div className="mb-2 md:mb-0 text-center">
            Use code <strong>INFINT10</strong> to get 10% off on our shop!
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex gap-10 text-[1rem] text-gray-300">
            <a
              href={`${FRONTEND_BASE_URL}/news`}
              className="hover:text-white font-bold"
            >
              Blogs &amp; News
            </a>
            <a
              href={FOUNDATION_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white font-bold"
            >
              Foundation
            </a>
            <a
              href={`${RESEARCH_BASE_URL}/research`}
              className="hover:text-white font-bold"
            >
              Research
            </a>
            <a
              href={`${FRONTEND_BASE_URL}/support-us`}
              className="hover:text-white font-bold flex items-center gap-1"
            >
              <Heart size={14} /> Support Us
            </a>
          </div>
        </div>
      </div>

      {/* ── Main bar: Login | Logo | Search ── */}
      <div className="bg-[#202020] py-1">
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
              <a
                className="flex items-center gap-2 pointer border border-white px-4 py-2 uppercase text-sm"
                href={`${FRONTEND_BASE_URL}/dashboard`}
              >
                <img src={UserIcon} alt="User Icon" className="w-5 h-5" />
                <span className="tracking-wide">
                  Hi, {user?.name?.split(" ")[0] || "Guest"}!
                </span>
              </a>
            ) : (
              <a
                className="border border-white px-5 py-2 uppercase text-sm hover:bg-white hover:text-black transition tracking-wider inline-block"
                href={`${FRONTEND_BASE_URL}/login`}
              >
                LOG IN | SIGN UP &gt;
              </a>
            )}
          </div>

          {/* Logo Centered — links back to the main site home */}
          <a href={FRONTEND_BASE_URL}>
            <div className="text-center">
              <img
                src={logo}
                alt="Infinito"
                className="h-12 w-auto object-contain"
              />
            </div>
          </a>

          {/* Right: Infinito Ultimate + Search */}
          <div className="flex items-center gap-3">
            <a
              href={`${FRONTEND_BASE_URL}/ultimate`}
              className="hidden md:inline-block bg-white text-black px-5 py-2 text-sm uppercase font-bold hover:bg-gray-200 transition tracking-widest"
            >
              INFINITO ULTIMATE &gt;
            </a>
            <button
              className="border border-white p-2 hover:bg-white hover:text-black transition"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <FiSearch size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom nav (desktop) ── */}
      <div className="hidden md:block bg-[#171717] text-sm text-gray-300 py-3">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-12">
          <ul className="flex flex-wrap justify-center gap-4 items-center">
            <li>
              <a
                href={`${FRONTEND_BASE_URL}/characters`}
                className="uppercase tracking-wider font-semibold hover:text-white cursor-pointer"
              >
                Characters
              </a>
            </li>
            <li>
              <a
                href={`${FRONTEND_BASE_URL}/comics`}
                className="uppercase tracking-wider font-semibold hover:text-white cursor-pointer border-l border-gray-600 px-3"
              >
                Comics
              </a>
            </li>
            <li>
              <a
                href={`${FRONTEND_BASE_URL}/animation`}
                className="uppercase tracking-wider font-semibold hover:text-white cursor-pointer border-l border-gray-600 px-3"
              >
                Animation
              </a>
            </li>
            <li>
              <a
                href={`${FRONTEND_BASE_URL}/games`}
                className="uppercase tracking-wider font-semibold hover:text-white cursor-pointer border-l border-gray-600 px-3"
              >
                Games
              </a>
            </li>
            <li>
              <a
                href={`${FRONTEND_BASE_URL}/community`}
                className="uppercase tracking-wider font-semibold hover:text-white cursor-pointer border-l border-gray-600 px-3"
              >
                Community
              </a>
            </li>
            <li>
              <a
                href={`${FRONTEND_BASE_URL}/aboutUS`}
                className="uppercase tracking-wider font-semibold hover:text-white cursor-pointer border-l border-gray-600 px-3"
              >
                About Us
              </a>
            </li>
            <li>
              <Link
                to="/"
                className="uppercase tracking-wider font-semibold text-white cursor-pointer border-l border-gray-600 px-3 flex items-center gap-2"
              >
                <ShoppingBag size={16} /> SHOP
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#171717] text-sm text-gray-300 px-4 py-6 space-y-4">
          <a
            href={`${FRONTEND_BASE_URL}/characters`}
            className="block font-bold hover:text-white"
          >
            Characters
          </a>
          <a
            href={`${FRONTEND_BASE_URL}/comics`}
            className="block font-bold hover:text-white"
          >
            Comics
          </a>
          <a
            href={`${FRONTEND_BASE_URL}/animation`}
            className="block font-bold hover:text-white"
          >
            Animation
          </a>
          <a
            href={`${FRONTEND_BASE_URL}/games`}
            className="block font-bold hover:text-white"
          >
            Games
          </a>
          <a
            href={`${FRONTEND_BASE_URL}/community`}
            className="block font-bold hover:text-white"
          >
            Community
          </a>
          <a
            href={`${FRONTEND_BASE_URL}/aboutUs`}
            className="block font-bold hover:text-white"
          >
            About Us
          </a>
          <Link
            to="/"
            className="block font-bold text-white flex items-center gap-2"
          >
            <ShoppingBag size={14} /> SHOP
          </Link>

          <a
            href={`${FRONTEND_BASE_URL}/news`}
            className="block font-bold hover:text-white"
          >
            Blogs &amp; News
          </a>

          <a
            href={`${FOUNDATION_BASE_URL}/?from=main`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline block font-bold"
          >
            Foundation
          </a>

          <a
            href={`${RESEARCH_BASE_URL}/research`}
            className="hover:underline block font-bold"
          >
            Research
          </a>

          <a
            href={`${FRONTEND_BASE_URL}/support-us`}
            className="font-bold hover:text-white flex items-center gap-2"
          >
            <Heart size={14} /> Support Us
          </a>
          {user ? (
            <div className="flex items-center gap-2 border border-white px-4 py-2 uppercase text-sm">
              <img src={UserIcon} alt="User Icon" className="w-5 h-5" />
              <span className="tracking-wide">
                Hi, {user.name.split(" ")[0]}!
              </span>
            </div>
          ) : (
            <a
              className="w-full border border-white px-6 py-3 uppercase text-md hover:bg-white hover:text-black transition tracking-wider inline-block text-center"
              href={`${FRONTEND_BASE_URL}/login`}
            >
              Log In | Sign Up &gt;
            </a>
          )}
        </div>
      )}
      {/* Search Modal */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  );
};

export default Header;
