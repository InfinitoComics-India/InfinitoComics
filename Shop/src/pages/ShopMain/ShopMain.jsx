import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  products as staticProducts,
  fetchCategories,
  fetchProducts,
} from "../../services/productService";
import HeroSlider from "./HeroSlider";
import ultimateKitBanner from "../../assets/ultimateKit.svg";
import promoBanner from "../../assets/hero/slide4.svg";

const ShopMain = () => {
  const navigate = useNavigate();
  const trendingRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState(staticProducts);
  const [catsLoaded, setCatsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts()]);
      if (cancelled) return;
      // Always trust what the backend returns for categories, even if empty.
      if (Array.isArray(cats)) setCategories(cats);
      if (Array.isArray(prods) && prods.length > 0) setProducts(prods);
      setCatsLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const scroll = (ref, dir) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div className="w-full bg-white text-black">
      {/* ─── HERO SLIDER (3 slides) ─────────────────────────── */}
      <HeroSlider />

      {/* ─── PROMO BANNER (35% off on The Crimson Bloodline) ── */}
      {/* Image sets its own natural aspect ratio — no wrapper chrome.
          Text sits absolutely over the artwork on the left side. */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-12 py-10">
        <div className="relative w-full">
          <img
            src={promoBanner}
            alt=""
            aria-hidden="true"
            className="block w-full h-auto"
          />

          {/* Overlay copy — positioned in the left column of the artwork.
              Sizes scale with the container so text stays balanced when
              the banner shrinks. */}
          <div className="absolute inset-0 flex items-center pl-[5%] pr-[50%] text-white">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-wider font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] drop-shadow-lg">
                35% off
              </h2>
              <p className="mt-1 md:mt-2 text-[10px] sm:text-xs md:text-sm uppercase tracking-wide font-dmsans">
                on The Crimson Bloodline
              </p>
              <button
                className="mt-3 md:mt-5 px-4 md:px-8 py-1.5 md:py-2.5 bg-[#DD1215] hover:bg-red-700 text-white text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide transition font-dmsans"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ──────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-12 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 font-dmsans">
          Categories
        </h2>

        {!catsLoaded ? (
          <p className="text-center text-gray-500">Loading categories…</p>
        ) : categories.length === 0 ? (
          <p className="text-center text-gray-500">
            No categories yet. Check back soon.
          </p>
        ) : (
          <CategorySlider categories={categories} navigate={navigate} />
        )}
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

// Horizontal category slider with mouse-drag support, click-through preserved,
// and arrow buttons that appear when the content is wider than the viewport.
const CategorySlider = ({ categories, navigate }) => {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Drag-to-scroll state. We only treat a pointer gesture as a "drag" once
  // the pointer has moved more than a few pixels; otherwise it stays a click.
  const dragState = useRef({
    isDown: false,
    dragging: false,
    startX: 0,
    scrollLeft: 0,
  });
  const DRAG_THRESHOLD = 6; // px before we start treating the gesture as a drag

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => updateArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateArrows);
    };
  }, [categories.length]);

  const scrollByAmount = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    // Slide roughly one card at a time (card ~ 220px + gap).
    el.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  const onPointerDown = (e) => {
    const el = trackRef.current;
    if (!el) return;
    dragState.current = {
      isDown: true,
      dragging: false,
      startX: e.pageX,
      scrollLeft: el.scrollLeft,
    };
  };

  const onPointerMove = (e) => {
    const state = dragState.current;
    if (!state.isDown) return;
    const el = trackRef.current;
    if (!el) return;
    const dx = e.pageX - state.startX;
    if (!state.dragging && Math.abs(dx) > DRAG_THRESHOLD) {
      state.dragging = true;
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
    }
    if (state.dragging) {
      e.preventDefault();
      el.scrollLeft = state.scrollLeft - dx;
    }
  };

  const endDrag = () => {
    const state = dragState.current;
    const el = trackRef.current;
    if (el) {
      el.style.cursor = "";
      el.style.userSelect = "";
    }
    state.isDown = false;
    // Keep `dragging` true briefly so the click handler can suppress the click.
    setTimeout(() => {
      state.dragging = false;
    }, 0);
  };

  const handleCardClick = (slug) => (e) => {
    // If this click is the tail-end of a drag, don't navigate.
    if (dragState.current.dragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    navigate(`/category/${slug}`);
  };

  return (
    <div className="relative">
      {/* Left arrow (desktop only) */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-1)}
          aria-label="Scroll categories left"
          className="hidden md:flex items-center justify-center absolute -left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      <div
        ref={trackRef}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        className="flex gap-3 md:gap-4 overflow-x-auto scroll-smooth no-scrollbar cursor-grab select-none"
      >
        {categories.map((cat) => (
          <div
            key={cat._id || cat.id}
            onClick={handleCardClick(cat.slug)}
            className="flex-shrink-0 w-[180px] md:w-[220px] cursor-pointer group"
          >
            <div className="w-full aspect-[3/4] overflow-hidden rounded-md bg-gray-50">
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  draggable={false}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#DD1215] text-white font-bold text-xl uppercase tracking-wide p-4 text-center">
                  {cat.name}
                </div>
              )}
            </div>
            <p className="mt-2 text-center text-sm font-semibold text-gray-800 uppercase tracking-wide">
              {cat.name}
            </p>
          </div>
        ))}
      </div>

      {/* Right arrow (desktop only) */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(1)}
          aria-label="Scroll categories right"
          className="hidden md:flex items-center justify-center absolute -right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
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
