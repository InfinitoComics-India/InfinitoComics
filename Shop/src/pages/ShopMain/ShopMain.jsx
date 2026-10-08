import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  fetchCategories,
  fetchFeaturedProducts,
  fetchProducts,
  fallbackCategoryImages,
} from "../../services/productService";
import HeroSlider from "./HeroSlider";
import ultimateKitBanner from "../../assets/ultimateKit.svg";
import promoBanner from "../../assets/hero/slide4.svg";

const ShopMain = () => {
  const navigate = useNavigate();
  const trendingRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [catsLoaded, setCatsLoaded] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchFeaturedProducts(10),
        ]);
        if (cancelled) return;
        let trending = Array.isArray(prods) && prods.length > 0 ? prods : [];
        if (trending.length === 0) {
          const allProds = await fetchProducts();
          trending = Array.isArray(allProds) ? allProds : [];
        }
        setCategories(Array.isArray(cats) ? cats : []);
        setProducts(trending);
      } catch (err) {
        console.error("Error loading shop data:", err);
      } finally {
        if (!cancelled) {
          setCatsLoaded(true);
          setProductsLoaded(true);
        }
      }
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

      {/* ─── PROMO BANNERS (Multiple supported from Admin Marketing Management) ── */}
      {(() => {
        let promoList = [];
        try {
          const raw = localStorage.getItem("infinito_shop_banners");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.promoBanners) && parsed.promoBanners.length > 0) {
              promoList = parsed.promoBanners.filter((b) => b.isActive !== false);
            } else if (parsed.promoBanner && parsed.promoBanner.isActive !== false) {
              promoList = [parsed.promoBanner];
            }
          }
        } catch {}

        if (promoList.length === 0) {
          promoList = [
            {
              id: "default-promo",
              headline: "35% off",
              subtitle: "on The Crimson Bloodline",
              buttonText: "Buy Now",
              buttonLink: "/catalog",
              bgImageUrl: promoBanner,
            },
          ];
        }

        const currentPromo = promoList[promoIndex % promoList.length] || promoList[0];

        return (
          <section className="max-w-[1240px] mx-auto px-4 md:px-8 py-10">
            <div className="relative w-full overflow-hidden rounded-sm shadow-md">
              <img
                src={currentPromo?.bgImageUrl || promoBanner}
                alt=""
                aria-hidden="true"
                className="block w-full h-[220px] md:h-[300px] object-cover"
              />
              <div
                className="absolute inset-0 flex items-center pl-[6%] pr-[40%] text-white"
                style={{
                  backgroundColor: currentPromo?.bgImageUrl ? "rgba(0,0,0,0.35)" : (currentPromo?.bgColor || "#800000"),
                }}
              >
                <div>
                  {currentPromo?.badgeText && (
                    <span className="inline-block bg-black/60 text-[#DD1215] text-[10px] md:text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded mb-2">
                      {currentPromo.badgeText}
                    </span>
                  )}
                  <h2 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-wider font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] drop-shadow-lg leading-none">
                    {currentPromo?.headline || "35% off"}
                  </h2>
                  <p className="mt-1 md:mt-2 text-xs sm:text-sm md:text-base uppercase tracking-wide font-dmsans text-gray-200 font-semibold">
                    {currentPromo?.subtitle || "on The Crimson Bloodline"}
                  </p>
                  <button
                    onClick={() => {
                      if (currentPromo?.buttonLink?.startsWith("http")) {
                        window.location.href = currentPromo.buttonLink;
                      } else {
                        navigate(currentPromo?.buttonLink || "/catalog");
                      }
                    }}
                    className="mt-4 md:mt-6 px-6 md:px-8 py-2 md:py-3 bg-[#DD1215] hover:bg-red-700 text-white text-xs md:text-sm font-bold uppercase tracking-widest transition font-dmsans cursor-pointer shadow-md"
                  >
                    {currentPromo?.buttonText || "Buy Now"}
                  </button>
                </div>
              </div>

              {/* Navigation controls if multiple promo banners exist */}
              {promoList.length > 1 && (
                <>
                  <button
                    onClick={() => setPromoIndex((prev) => (prev - 1 + promoList.length) % promoList.length)}
                    aria-label="Previous promo"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setPromoIndex((prev) => (prev + 1) % promoList.length)}
                    aria-label="Next promo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {promoList.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPromoIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          promoIndex % promoList.length === i ? "w-6 bg-white" : "w-1.5 bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        );
      })()}

      {/* ─── CATEGORIES ──────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-12 py-12">
        <div className="flex items-center justify-between mb-8 pb-2 border-b border-gray-100">
          <h2 className="text-2xl md:text-3xl font-bold font-dmsans">
            Categories
          </h2>
          <button
            onClick={() => navigate("/products")}
            className="text-xs md:text-sm font-bold text-[#DD1215] hover:text-red-700 uppercase tracking-wider flex items-center gap-1 cursor-pointer transition py-1.5 px-3 rounded hover:bg-red-50 border border-red-200 font-dmsans"
          >
            <span>View All</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {!catsLoaded ? (
          <p className="text-center text-gray-500">Loading categories…</p>
        ) : categories.length === 0 ? (
          <p className="text-center text-gray-500">
            No categories yet. Add one from the admin panel to see it here.
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

        {!productsLoaded ? (
          <p className="text-center text-gray-500">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500">
            No featured products yet. Mark a product as{' '}
            <span className="font-semibold">Featured</span> in the admin panel to see it here.
          </p>
        ) : (
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
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>

            <button
              onClick={() => scroll(trendingRef, 1)}
              className="hidden md:flex items-center justify-center absolute -right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      {/* ─── ULTIMATE KIT BANNER ─────────────────────────────── */}
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

  const dragState = useRef({
    isDown: false,
    dragging: false,
    startX: 0,
    scrollLeft: 0,
  });
  const DRAG_THRESHOLD = 6;

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
    setTimeout(() => {
      state.dragging = false;
    }, 0);
  };

  const handleCardClick = (slug) => (e) => {
    if (dragState.current.dragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    navigate(`/category/${slug}`);
  };

  return (
    <div className="relative">
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
          <CategoryItem
            key={cat._id || cat.id}
            cat={cat}
            onClick={handleCardClick(cat.slug)}
          />
        ))}
      </div>

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

const CategoryItem = ({ cat, onClick }) => {
  const fallback =
    fallbackCategoryImages[cat.slug?.toLowerCase()] ||
    fallbackCategoryImages[cat.name?.toLowerCase()] ||
    fallbackCategoryImages['tshirts'];
  const [imgSrc, setImgSrc] = useState(cat.image || fallback);

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-[180px] md:w-[220px] cursor-pointer group"
    >
      <div className="w-full aspect-[3/4] overflow-hidden rounded-md bg-gray-50 flex items-center justify-center p-2">
        <img
          src={imgSrc}
          alt={cat.name}
          draggable={false}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 pointer-events-none"
          onError={() => {
            if (imgSrc !== fallback) {
              setImgSrc(fallback);
            }
          }}
        />
      </div>
      <p className="mt-2 text-center text-sm font-semibold text-gray-800 uppercase tracking-wide">
        {cat.name}
      </p>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const target = product.slug || product._id || product.id;
  const fallback =
    fallbackCategoryImages[product.category?.toLowerCase()] ||
    fallbackCategoryImages['tshirts'];
  const [imgSrc, setImgSrc] = useState(product.image || fallback);

  return (
    <div
      onClick={() => navigate(`/product/${target}`)}
      className="flex-shrink-0 w-[300px] cursor-pointer group border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition-shadow bg-white"
    >
      <div className="w-full h-[260px] bg-gray-100 flex items-center justify-center overflow-hidden p-2">
        <img
          src={imgSrc}
          alt={product.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          onError={() => {
            if (imgSrc !== fallback) {
              setImgSrc(fallback);
            }
          }}
        />
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-widest text-[#DD1215] font-bold">
          {product.name}
        </p>
        <p className="text-sm text-gray-800 line-clamp-1 mt-1 font-medium">{product.title}</p>
        <p className="text-lg font-bold mt-2">₹{product.price}/-</p>
      </div>
    </div>
  );
};

export default ShopMain;
