import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

import heroTshirt from '../../../assets/Images/merch/MerchModel.png';

const ShopCatalog = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);

  // Categories data matching exact design
  const categories = [
    {
      id: 't-shirts',
      name: 'INFINITO T-Shirts',
      label: 'INFINITO T-Shirts',
      image: '/products/crimson_tshirt.jpg',
    },
    {
      id: 'caps-hats',
      name: 'INFINITO CAPS/HATS',
      label: 'INFINITO CAPS/HATS',
      image: '/products/category_caps.jpg',
    },
    {
      id: 'accessory',
      name: 'INFINITO ACCESSORY',
      label: 'INFINITO ACCESSORY',
      image: '/products/category_accessories.jpg',
    },
    {
      id: 'hoodies',
      name: 'INFINITO HOODIES',
      label: 'INFINITO HOODIES',
      image: '/products/white_hoodie.jpg',
    },
    {
      id: 'tote-bags',
      name: 'INFINITO TOTE BAGS',
      label: 'INFINITO TOTE BAGS',
      image: '/products/category_totebags.jpg',
    },
  ];

  // Top Trending Products
  const trendingProducts = [
    {
      id: 'tshirt-1',
      slug: 'crimson-red-tshirt',
      title: 'INFINITO',
      subtitle: 'Special Edition Crimson Bloodline...',
      price: 'Rs.1499/-',
      image: '/products/crimson_tshirt.jpg',
      category: 'T-Shirts',
    },
    {
      id: 'hoodie-1',
      slug: 'white-red-hoodie',
      title: 'INFINITO',
      subtitle: 'Elegant Edition White-Red Hoodie...',
      price: 'Rs.1499/-',
      image: '/products/white_hoodie.jpg',
      category: 'Hoodies',
    },
    {
      id: 'tshirt-2',
      slug: 'crimson-bloodline-tee-2',
      title: 'INFINITO',
      subtitle: 'Special Edition Crimson Bloodline...',
      price: 'Rs.1499/-',
      image: '/products/crimson_tshirt.jpg',
      category: 'T-Shirts',
    },
    {
      id: 'hoodie-2',
      slug: 'white-red-hoodie-2',
      title: 'INFINITO',
      subtitle: 'Elegant Edition White-Red Hoodie...',
      price: 'Rs.1499/-',
      image: '/products/white_hoodie.jpg',
      category: 'Hoodies',
    },
  ];

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    toast.success(`Added ${product.subtitle || product.title} to cart!`);
  };

  const handleCategoryClick = (catId) => {
    navigate(`/product/${catId}`);
  };

  const handleProductClick = (prod) => {
    navigate(`/product/${prod.slug || prod.id}`);
  };

  return (
    <div className="w-full bg-white text-black min-h-screen font-sans">
      
      {/* 1. HERO SLIDER CAROUSEL SECTION */}
      <section className="relative w-full bg-[#0a0a0a] text-white py-12 px-6 md:px-16 overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[420px]">
          
          {/* Left Text */}
          <div className="space-y-4 z-10">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-none">
              BECOME <br />
              <span className="text-red-600">ONE OF US</span> <br />
              BECOME <br />
              <span className="text-red-600">INFINITO</span>
            </h1>
            <p className="text-gray-300 text-xs md:text-sm max-w-md font-normal leading-relaxed">
              Only 500 RED BOXES. Be part of the 1st 500 INFINITO fans to receive high-value merchandise rights.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/product/crimson-red-tshirt')}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wider uppercase transition shadow-lg cursor-pointer"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Right Product Spotlight Image */}
          <div className="relative w-full h-[320px] md:h-[400px] flex items-center justify-center z-10">
            <div className="absolute w-[260px] h-[260px] md:w-[340px] md:h-[340px] rounded-full border-4 border-red-600/40 shadow-[0_0_50px_rgba(225,29,72,0.4)] animate-pulse"></div>
            <img
              src={heroTshirt}
              alt="Infinito Hero Merch"
              className="w-full h-full object-contain z-10 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
            />
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center items-center gap-2 mt-6 relative z-10">
          {[0, 1, 2, 3].map((dot) => (
            <button
              key={dot}
              onClick={() => setActiveSlide(dot)}
              className={`w-2 h-2 rounded-full transition-all ${
                activeSlide === dot ? 'bg-red-600 w-4' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. PROMO BANNER BOX SECTION */}
      <section className="max-w-5xl mx-auto my-10 px-4">
        <div className="relative border-2 border-cyan-400 bg-gradient-to-r from-[#800000] via-[#a00000] to-[#600000] rounded-sm text-white p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-xl">
          {/* Navigation arrow left */}
          <button className="hidden md:flex absolute -left-5 top-12 w-9 h-9 bg-white text-black border border-gray-300 rounded-sm items-center justify-center shadow-md hover:bg-gray-100">
            <ChevronLeft size={20} />
          </button>

          {/* Left Text */}
          <div className="space-y-2 text-center md:text-left z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              35% off
            </h2>
            <p className="text-sm md:text-base font-bold tracking-wider uppercase text-gray-200">
              on THE CRIMSON BLOODLINE
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/product/crimson-red-tshirt')}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest shadow-md cursor-pointer"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Right Banner Product Image */}
          <div className="relative w-48 h-36 md:w-64 md:h-44 mt-4 md:mt-0 flex items-center justify-center">
            <img
              src="/products/crimson_tshirt.jpg"
              alt="Crimson Bloodline Offer"
              className="w-full h-full object-contain filter drop-shadow-lg"
            />
          </div>

          {/* Navigation arrow right */}
          <button className="hidden md:flex absolute -right-5 top-12 w-9 h-9 bg-white text-black border border-gray-300 rounded-sm items-center justify-center shadow-md hover:bg-gray-100">
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="max-w-6xl mx-auto py-10 px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-black tracking-tight mb-8">
          Categories
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="group cursor-pointer flex flex-col items-center border border-gray-200 rounded-sm overflow-hidden bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="w-full aspect-square bg-gray-100 overflow-hidden flex items-center justify-center p-2">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>

              {/* Red Badge Button at bottom */}
              <div className="w-full bg-red-600 text-white py-2 text-center text-[11px] font-extrabold uppercase tracking-wider group-hover:bg-red-700 transition">
                {cat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. TOP TRENDING SECTION */}
      <section className="max-w-6xl mx-auto py-10 px-4 relative">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-black tracking-tight mb-8">
          Top Trending
        </h2>

        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {trendingProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => handleProductClick(prod)}
                className="border border-gray-200 rounded-sm overflow-hidden bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between cursor-pointer group"
              >
                <div className="relative w-full aspect-square bg-black overflow-hidden">
                  <img
                    src={prod.image}
                    alt={prod.subtitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <button
                    onClick={(e) => handleAddToCart(e, prod)}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/70 hover:bg-red-600 text-white flex items-center justify-center rounded-sm transition"
                    title="Add to Cart"
                  >
                    <ShoppingCart size={15} />
                  </button>
                </div>

                <div className="p-4 bg-white flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-extrabold text-sm text-black uppercase tracking-tight">
                      {prod.title}
                    </h3>
                    <p className="text-xs text-gray-600 truncate mt-0.5 font-medium">
                      {prod.subtitle}
                    </p>
                  </div>
                  <p className="font-bold text-sm text-black mt-3">{prod.price}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Navigation Circle Arrow */}
          <button
            onClick={() => toast.info('Viewing next trending items')}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-red-500 text-red-600 bg-white items-center justify-center shadow-md hover:bg-red-50 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* 5. ULTIMATE KIT SECTION */}
      <section className="max-w-5xl mx-auto my-12 px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-black tracking-tight mb-8">
          ULTIMATE KIT
        </h2>

        <div className="border border-gray-300 rounded-sm bg-white overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-2 items-center">
          {/* Left Collector's Box Artwork */}
          <div className="relative w-full h-[280px] md:h-[340px] bg-black overflow-hidden flex items-center justify-center p-4">
            <img
              src="/products/ultimate_kit_box.jpg"
              alt="INFINITO Ultimate Kit Box Set"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Checklist Details & CTA */}
          <div className="p-6 md:p-8 flex flex-col justify-between h-full bg-white text-black space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-xl font-extrabold text-black uppercase">
                  INFINITO <span className="text-red-600">ULTIMATE KIT</span>
                </h3>
                <div className="text-right">
                  <span className="text-xs text-gray-400 line-through mr-1 font-medium">MRP ₹4999</span>
                  <span className="text-xl font-black text-black">₹2999</span>
                </div>
              </div>

              {/* Checklist */}
              <ul className="mt-4 space-y-2 text-xs md:text-sm font-semibold text-gray-700">
                <li className="flex items-center gap-2 text-green-700">
                  <span>✓</span> Collector's Box Set
                </li>
                <li className="flex items-center gap-2 text-green-700">
                  <span>✓</span> Special Edition T-Shirt &amp; Pin Set
                </li>
                <li className="flex items-center gap-2 text-green-700">
                  <span>✓</span> Digital Certificate of Authenticity
                </li>
                <li className="flex items-center gap-2 text-green-700">
                  <span>✓</span> Instant Member Access to Exclusive Drops
                </li>
                <li className="flex items-center gap-2 text-green-700">
                  <span>✓</span> FREE EXPRESS SHIPPING
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/ultimate')}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm uppercase tracking-widest transition shadow-md cursor-pointer"
            >
              Get Now
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ShopCatalog;
