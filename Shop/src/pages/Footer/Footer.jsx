import React from 'react';
import { FRONTEND_BASE_URL } from '../../utils/constants';

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white mt-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-black tracking-wider">INFINITO SHOP</h3>
          <p className="mt-3 text-sm text-gray-400 leading-relaxed">
            Official merchandise from the Infinito multiverse.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide mb-3">Shop</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="/shop/category/tshirts" className="hover:text-white">T-Shirts</a></li>
            <li><a href="/shop/category/hoodies" className="hover:text-white">Hoodies</a></li>
            <li><a href="/shop/category/stickers" className="hover:text-white">Stickers</a></li>
            <li><a href="/shop/category/posters" className="hover:text-white">Posters</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide mb-3">Help</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href={`${FRONTEND_BASE_URL}/contact-us`} className="hover:text-white">Contact Us</a></li>
            <li><a href={`${FRONTEND_BASE_URL}/refund-policy`} className="hover:text-white">Refund Policy</a></li>
            <li><a href={`${FRONTEND_BASE_URL}/terms-of-use`} className="hover:text-white">Terms of Use</a></li>
            <li><a href={`${FRONTEND_BASE_URL}/privacy-policy`} className="hover:text-white">Privacy Policy</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href={FRONTEND_BASE_URL} className="hover:text-white">Main Site</a></li>
            <li><a href={`${FRONTEND_BASE_URL}/ultimate`} className="hover:text-white">Infinito Ultimate</a></li>
            <li><a href={`${FRONTEND_BASE_URL}/animation`} className="hover:text-white">Animation</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Infinito Comics. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
