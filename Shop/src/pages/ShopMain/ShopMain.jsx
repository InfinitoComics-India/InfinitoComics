import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { categories, products } from "../../services/productService";
import HeroSlider from "./HeroSlider";

const ShopMain = () => {
  const navigate = useNavigate();
  const categoryRef = useRef(null);
  const trendingRef = useRef(null);

  const scroll = (ref, dir) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div className="w-full bg-white text-black">
      {/* ─── HERO SLIDER (3 slides) ─────────────────────────── */}
      <HeroSlider />

      {/* ─── PROMO BANNER ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        <div className="relative w-full bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg overflow-hidden py-10 px-8 md:px-14">
          <h2 className="text-3xl md:text-4xl font-black uppercase">35% off</h2>
          <p className="mt-2 text-sm md:text-base uppercase tracking-wide">
            on The Crimson Bloodline
          </p>
          <button className="mt-6 px-8 py-2.5 bg-white text-black font-semibold uppercase tracking-wide hover:bg-gray-100 transition">
            Buy Now
          </button>
        </div>
      </section>

      {/* ─── CATEGORIES ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Categories
        </h2>
        <div className="relative">
          <button
            onClick={() => scroll(categoryRef, -1)}
            className="hidden md:flex items-center justify-center absolute -left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            ref={categoryRef}
            className="flex gap-5 overflow-x-auto scroll-smooth no-scrollbar pb-2"
          >
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => navigate(`/category/${cat.slug}`)}
                className="flex-shrink-0 w-[280px] cursor-pointer group"
              >
                <div className="w-full h-[280px] bg-gray-100 border border-gray-200 rounded-md overflow-hidden group-hover:shadow-lg transition-shadow flex items-center justify-center">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">{cat.name}</span>
                  )}
                </div>
                <p className="mt-3 text-center text-base font-semibold group-hover:text-[#DD1215] transition-colors">
                  {cat.name}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll(categoryRef, 1)}
            className="hidden md:flex items-center justify-center absolute -right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ─── TOP TRENDING ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-10 relative">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Top Trending
        </h2>
        <div className="relative">
          <button
            onClick={() => scroll(trendingRef, -1)}
            className="hidden md:flex items-center justify-center absolute -left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            ref={trendingRef}
            className="flex gap-5 overflow-x-auto scroll-smooth no-scrollbar pb-2"
          >
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <button
            onClick={() => scroll(trendingRef, 1)}
            className="hidden md:flex items-center justify-center absolute -right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ─── ULTIMATE KIT BANNER ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          ULTIMATE KIT
        </h2>
        <div className="relative bg-gradient-to-r from-red-100 via-red-50 to-white border border-red-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="min-h-[280px] bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center">
              <span className="text-white/60 text-sm">Ultimate Kit visual</span>
            </div>

            <div className="p-8 md:p-10">
              <p className="text-xs uppercase tracking-widest text-[#DD1215] font-semibold mb-2">
                Infinito
              </p>
              <h3 className="text-2xl md:text-3xl font-black uppercase mb-4">
                Ultimate Kit
              </h3>
              <ul className="space-y-2 mb-6">
                {[
                  "Comic of your choice",
                  "Surprise Superhero Toy",
                  "Digital Wall Paintings",
                  "Superhero Stickers",
                  "Infinito T-shirt",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#DD1215]" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-lg text-gray-400 line-through">₹2199</span>
                <span className="text-3xl font-black text-black">₹1999</span>
              </div>
              <button className="px-8 py-3 bg-[#DD1215] hover:bg-red-700 text-white font-semibold uppercase tracking-wide transition">
                Get Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="flex-shrink-0 w-[300px] cursor-pointer group border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition-shadow bg-white"
    >
      <div className="w-full h-[260px] bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-gray-400 text-sm">Product Image</span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-widest text-[#DD1215] font-bold">
          {product.name}
        </p>
        <p className="text-sm text-gray-800 line-clamp-1 mt-1">{product.title}</p>
        <p className="text-lg font-bold mt-2">Rs.{product.price}/-</p>
      </div>
    </div>
  );
};

export default ShopMain;
