import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShoppingCart, Search, User } from 'lucide-react';
import { FRONTEND_BASE_URL } from '../../utils/constants';

const Navbar = () => {
  const user = useSelector((state) => state.user);
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="w-full bg-black text-white sticky top-0 z-40">
      {/* Top row: logo, search, actions */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
        {/* Logo → main site */}
        <a href={FRONTEND_BASE_URL} className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-wider">
            INFINITO
          </span>
          <span className="text-xs text-red-500 uppercase tracking-widest">
            Shop
          </span>
        </a>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-6">
          <div className="w-full flex items-center bg-white/10 rounded-md px-3 py-2">
            <Search className="w-4 h-4 text-gray-300" />
            <input
              type="text"
              placeholder="Search products..."
              className="ml-2 flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-5">
          {user ? (
            <span className="hidden md:flex items-center gap-2 text-sm">
              <User className="w-4 h-4" />
              {user.name || 'Account'}
            </span>
          ) : (
            <a
              href={`${FRONTEND_BASE_URL}/login`}
              className="hidden md:block text-sm hover:text-red-400"
            >
              Login
            </a>
          )}

          <Link to="/cart" className="relative">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#DD1215] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Sub-nav */}
      <nav className="bg-[#DD1215] text-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-2 flex items-center gap-6 text-sm font-semibold uppercase tracking-wide">
          <Link to="/" className="hover:opacity-80">Home</Link>
          <Link to="/category/tshirts" className="hover:opacity-80">T-Shirts</Link>
          <Link to="/category/hoodies" className="hover:opacity-80">Hoodies</Link>
          <Link to="/category/stickers" className="hover:opacity-80">Stickers</Link>
          <Link to="/category/posters" className="hover:opacity-80">Posters</Link>
          <Link to="/category/collectibles" className="hover:opacity-80">Collectibles</Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
