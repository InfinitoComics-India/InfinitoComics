// 📁 src/components/Header.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";
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
import { getAllBlogs } from "../../services/userServices.js";
import { getAll as getAllCharacters } from "../../services/CharacterServices.js";
import { fetchComics } from "../../services/ComicService.js";

// ── Search Modal ──────────────────────────────────────────────────
const SearchModal = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({ blogs: [], characters: [], comics: [] });
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Load all data once on mount
  useEffect(() => {
    inputRef.current?.focus();
    const load = async () => {
      try {
        const [blogs, chars, comics] = await Promise.allSettled([
          getAllBlogs(),
          getAllCharacters(),
          fetchComics(),
        ]);
        setAllData({
          blogs:      blogs.status      === "fulfilled" ? (blogs.value      || []) : [],
          characters: chars.status      === "fulfilled" ? (chars.value?.data || chars.value || []) : [],
          comics:     comics.status     === "fulfilled" ? (comics.value      || []) : [],
        });
      } catch {}
    };
    load();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Search across all data
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const blogHits = allData.blogs
      .filter(b => b?.title?.toLowerCase().includes(q) || b?.category?.toLowerCase().includes(q))
      .slice(0, 4)
      .map(b => ({ type: "Blog", label: b.title, sub: b.category || "", path: `/news/${b._id}` }));

    const charHits = allData.characters
      .filter(c => c?.name?.toLowerCase().includes(q) || c?.universe?.toLowerCase().includes(q))
      .slice(0, 4)
      .map(c => ({ type: "Character", label: c.name, sub: c.universe || "", path: `/characters` }));

    const comicHits = allData.comics
      .filter(c => c?.title?.toLowerCase().includes(q) || c?.genre?.toLowerCase().includes(q))
      .slice(0, 4)
      .map(c => ({ type: "Comic", label: c.title, sub: c.genre || "", path: `/comics` }));

    setResults([...blogHits, ...charHits, ...comicHits]);
  }, [query, allData]);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  const typeBadgeColor = { Blog: "bg-blue-100 text-blue-700", Character: "bg-red-100 text-red-700", Comic: "bg-purple-100 text-purple-700" };

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/70 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center px-5 py-4 border-b border-gray-100 gap-3">
          <FiSearch size={20} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search characters, comics, blogs…"
            className="flex-1 text-base text-gray-800 outline-none placeholder-gray-400"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
              <FiX size={18} />
            </button>
          )}
          <button onClick={onClose} className="text-xs text-gray-400 border border-gray-200 px-2 py-1 rounded hover:bg-gray-50 ml-1">ESC</button>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto">
          {!query.trim() ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">
              Start typing to search across comics, characters, and blogs
            </div>
          ) : results.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">
              No results found for "<strong>{query}</strong>"
            </div>
          ) : (
            <ul>
              {results.map((r, i) => (
                <li key={i}>
                  <button
                    onClick={() => handleSelect(r.path)}
                    className="w-full flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition text-left"
                  >
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded shrink-0 ${typeBadgeColor[r.type]}`}>
                      {r.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{r.label}</p>
                      {r.sub && <p className="text-xs text-gray-400 truncate">{r.sub}</p>}
                    </div>
                    <FiSearch size={14} className="text-gray-300 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        {results.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 flex gap-4">
            <span>↵ to navigate</span>
            <span>ESC to close</span>
          </div>
        )}
      </div>
    </div>
  );
};

const Header = () => {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2400);
  }, []);

  // Global keyboard shortcut: Ctrl+K or / to open search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey && e.key === "k") || (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA")) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return loading ? (
    <NavbarShimmer />
  ) : (
    <div className="text-white font-sans">
      {/* ── Top promo bar ── */}
      <div className="border-b bg-[#202020] border-gray-600 text-sm py-4 flex flex-col md:flex-row items-center">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-12 flex justify-between items-center">
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
      {/* Search Modal */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  );
};

export default Header;
