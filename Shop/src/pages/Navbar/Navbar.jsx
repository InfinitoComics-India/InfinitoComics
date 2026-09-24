import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Heart, ShoppingBag } from 'lucide-react';
import { FRONTEND_BASE_URL, FOUNDATION_BASE_URL, RESEARCH_BASE_URL } from '../../utils/constants';
import logo from '../../assets/Logo.png';

const subNavItems = [
  { label: 'CHARACTERS', href: `${FRONTEND_BASE_URL}/characters` },
  { label: 'COMICS',     href: `${FRONTEND_BASE_URL}/comics` },
  { label: 'ANIMATION',  href: `${FRONTEND_BASE_URL}/animation` },
  { label: 'GAMES',      href: `${FRONTEND_BASE_URL}/games` },
  { label: 'COMMUNITY',  href: `${FRONTEND_BASE_URL}/community` },
  { label: 'ABOUT US',   href: `${FRONTEND_BASE_URL}/aboutUS` },
  { label: 'SHOP',       to: '/', icon: <ShoppingBag className="w-4 h-4" /> },
];

const Navbar = () => {
  const user = useSelector((state) => state.user);
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="w-full bg-black text-white sticky top-0 z-40">
      {/* ── Top strip: promo code + external links ────────────── */}
      <div className="w-full bg-black text-white text-xs border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-2.5 flex items-center justify-between gap-4">
          <span className="tracking-wide">
            Use code <span className="font-semibold">INFINITO10</span> to get 10% off on our shop!
          </span>
          <nav className="hidden md:flex items-center gap-8 text-xs tracking-wide">
            <a href={`${FRONTEND_BASE_URL}/news`} className="hover:text-red-400 transition">Blogs &amp; News</a>
            <a href={FOUNDATION_BASE_URL} className="hover:text-red-400 transition">Foundation</a>
            <a href={RESEARCH_BASE_URL} className="hover:text-red-400 transition">Research</a>
            <a href={`${FRONTEND_BASE_URL}/support-us`} className="flex items-center gap-1.5 hover:text-red-400 transition">
              <Heart className="w-3.5 h-3.5" />
              Support Us
            </a>
          </nav>
        </div>
      </div>

      {/* ── Main bar: Login button | Logo | Ultimate + Search ── */}
      <div className="w-full bg-black">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 grid grid-cols-3 items-center gap-4">
          {/* Left: Login/Sign up */}
          <div className="justify-self-start">
            {user ? (
              <span className="text-sm font-semibold tracking-wide">
                Hi, {user.name?.split(' ')[0] || 'Reader'}
              </span>
            ) : (
              <a
                href={`${FRONTEND_BASE_URL}/login`}
                className="hidden md:inline-flex items-center border border-white/70 px-6 py-3 text-xs font-bold tracking-widest hover:bg-white hover:text-black transition"
              >
                LOG IN | SIGN UP &gt;
              </a>
            )}
          </div>

          {/* Center: Logo */}
          <Link to="/" className="justify-self-center">
            <img src={logo} alt="Infinito" className="h-12 md:h-14 w-auto object-contain" />
          </Link>

          {/* Right: Ultimate + Cart + Search */}
          <div className="justify-self-end flex items-center gap-3">
            <a
              href={`${FRONTEND_BASE_URL}/ultimate`}
              className="hidden md:inline-flex items-center bg-white text-black px-5 py-3 text-xs font-bold tracking-widest hover:bg-gray-200 transition"
            >
              INFINITO ULTIMATE &gt;
            </a>

            <Link
              to="/cart"
              className="relative w-11 h-11 flex items-center justify-center border border-white/40 hover:border-white transition"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#DD1215] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-11 h-11 flex items-center justify-center border border-white/40 hover:border-white transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search input (drops down when open) */}
        {searchOpen && (
          <div className="border-t border-white/10 bg-black">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3">
              <input
                autoFocus
                type="text"
                placeholder="Search products..."
                className="w-full bg-white/10 text-white placeholder-white/50 px-4 py-3 outline-none text-sm"
                onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Sub-nav: category links with dividers ─────────────── */}
      <nav className="w-full bg-black border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-center overflow-x-auto no-scrollbar">
            {subNavItems.map((item, idx) => (
              <React.Fragment key={item.label}>
                {item.to ? (
                  <Link
                    to={item.to}
                    className="flex items-center gap-2 px-6 py-3 text-[11px] md:text-xs font-bold tracking-[0.2em] uppercase whitespace-nowrap hover:text-red-400 transition"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className="flex items-center gap-2 px-6 py-3 text-[11px] md:text-xs font-bold tracking-[0.2em] uppercase whitespace-nowrap hover:text-red-400 transition"
                  >
                    <span>{item.label}</span>
                  </a>
                )}
                {idx < subNavItems.length - 1 && (
                  <span className="h-4 w-px bg-white/30" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
