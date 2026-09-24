import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { categories, products } from "../../services/productService";
import HeroSlider from "./HeroSlider";
import ultimateKitBanner from "../../assets/ultimateKit.svg";
import promoBanner from "../../assets/hero/slide4.svg";

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

      {/* ─── PROMO BANNER (35% off on The Crimson Bloodline) ── */}
      {/* Artwork already contains the heading, subtext and Buy Now button.
          We render it at its natural aspect ratio with no wrapper chrome. */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-12 py-10">
        <a
          href="#"
          aria-label="Shop the Crimson Bloodline — 35% off"
          className="block w-full"
        >
          <img
            src={promoBanner}
            alt="35% off on The Crimson Bloodline"
            className="block w-full h-auto"
          />
        </a>
      </section>

      {/* ─── CATEGORIES ──────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-12 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 font-dmsans">
          Categories
        </h2>

        {/* 5-up grid on desktop, horizontal scroll on mobile. Card artwork
            already carries the "INFINITO T-Shirts / HOODIES / ..." labels
            so we don't overlay any text. */}
        <div
          ref={categoryRef}
          className="flex md:grid md:grid-cols-5 gap-3 md:gap-4 overflow-x-auto scroll-smooth no-scrollbar"
        >
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => navigate(`/category/${cat.slug}`)}
                className="flex-shrink-0 w-[220px] md:w-auto cursor-pointer group"
              >
                <div className="w-full aspect-[3/4] overflow-hidden">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                      {cat.name}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* ─── TOP TRENDING ────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-12 py-10 relative">
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
      {/* The banner artwork already carries the ULTIMATE KIT heading,
          feature list, ₹2199/₹1999 pricing, and gift illustration.
          We render it edge-to-edge and overlay a real Get Now button
          where the artwork shows one. */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-12 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 font-dmsans uppercase tracking-wider">
          Ultimate Kit
        </h2>

        <a
          href="#"
          className="relative block w-full group"
          aria-label="Get the Infinito Ultimate Kit"
        >
          <img
            src={ultimateKitBanner}
            alt="Infinito Ultimate Kit — First 10,000 customers get exclusive gift! ₹1999"
            className="block w-full h-auto max-w-full object-contain"
          />

          {/* Get Now hotspot — sits over the button drawn into the artwork.
              The percentage-based positioning keeps it lined up as the
              banner scales. Tweak these numbers if you tighten the crop. */}
          <span
            className="absolute right-[4%] bottom-[15%] w-[16%] h-[38%] rounded-md
                       hover:bg-white/10 transition-colors"
            aria-hidden="true"
          />
        </a>
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
