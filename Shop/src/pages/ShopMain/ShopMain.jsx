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
  const [promoIndex, setPromoIndex] = useState(0);
  const [promoBannersList, setPromoBannersList] = useState(() => {
    try {
      const raw = localStorage.getItem("infinito_shop_banners");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.promoBanners) && parsed.promoBanners.length > 0) {
          const enabled = parsed.promoBanners.filter((b) => b && b.isActive !== false);
          if (enabled.length > 0) return enabled;
        } else if (parsed.promoBanner && parsed.promoBanner.isActive !== false) {
          return [parsed.promoBanner];
        }
      }
    } catch {}
    return [
      {
        id: "default-promo",
        headline: "35% off",
        subtitle: "on The Crimson Bloodline",
        buttonText: "Buy Now",
        buttonLink: "/catalog",
        bgImageUrl: promoBanner,
        bgColor: "#800000",
        isActive: true,
      },
    ];
  });

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

  // Auto rotate promo banners every 7 seconds
  useEffect(() => {
    if (promoBannersList.length <= 1) return;
    const timer = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % promoBannersList.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [promoBannersList.length]);

  // Sync banners across tabs & Admin BroadcastChannel
  useEffect(() => {
    const reloadBanners = () => {
      try {
        const raw = localStorage.getItem("infinito_shop_banners");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.promoBanners) && parsed.promoBanners.length > 0) {
            const enabled = parsed.promoBanners.filter((b) => b && b.isActive !== false);
            if (enabled.length > 0) {
              setPromoBannersList(enabled);
              return;
            }
          }
        }
      } catch {}
    };

    window.addEventListener("storage", reloadBanners);
    let bc;
    try {
      bc = new BroadcastChannel("infinito_banners_channel");
      bc.onmessage = () => reloadBanners();
    } catch {}

    return () => {
      window.removeEventListener("storage", reloadBanners);
      if (bc) bc.close();
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

      {/* ─── PROMO BANNERS (Multiple supported from Admin Marketing Management - Sized matching SS2) ── */}
      {(() => {
        const promoList = promoBannersList;
        const currentPromo = promoList[promoIndex % promoList.length] || promoList[0];

        return (
          <section className="py-8 md:py-10">
            <div className="max-w-[1200px] mx-auto px-4 md:px-12 flex items-center justify-center gap-3 md:gap-5">
              {/* Navigation button left */}
              <button
                type="button"
                onClick={() => setPromoIndex((prev) => (prev - 1 + promoList.length) % promoList.length)}
                aria-label="Previous promo"
                className="w-8 h-8 md:w-9 md:h-9 bg-white border border-gray-300 rounded hover:border-gray-500 hover:text-black text-gray-500 flex items-center justify-center transition shadow-sm shrink-0 cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Exact SS2 Sized Banner */}
              <div
                className="relative w-full max-w-[780px] h-[160px] sm:h-[175px] md:h-[180px] rounded-xl overflow-hidden shadow-md flex items-center bg-black bg-cover bg-center shrink-0"
                style={{
                  backgroundColor: currentPromo?.bgColor || "#800000",
                  backgroundImage: currentPromo?.bgImageUrl ? `url(${currentPromo.bgImageUrl})` : `url(${promoBanner})`,
                }}
              >
                {/* Subtle gradient to keep left text readable while right side merch artwork stays clear */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent pointer-events-none" />

                {/* Content aligned to left */}
                <div className="relative z-10 pl-6 sm:pl-8 md:pl-10 max-w-[65%] sm:max-w-[55%] space-y-1 text-white">
                  {(currentPromo?.badgeText || currentPromo?.discountCode) && (
                    <span className="inline-block bg-black/70 text-[#DD1215] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                      {currentPromo.badgeText || currentPromo.discountCode}
                    </span>
                  )}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow">
                    {currentPromo?.headline || "35% off"}
                  </h2>
                  <p className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide text-gray-200 uppercase drop-shadow">
                    {currentPromo?.subtitle || "on The Crimson Bloodline"}
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const link = currentPromo?.buttonLink || "/catalog";
                        if (link.startsWith("http")) {
                          window.location.href = link;
                        } else {
                          navigate(link);
                        }
                      }}
                      className="px-4 sm:px-5 py-1.5 sm:py-2 bg-[#DD1215] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer shadow-sm"
                    >
                      {currentPromo?.buttonText || "Buy Now"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation button right */}
              <button
                type="button"
                onClick={() => setPromoIndex((prev) => (prev + 1) % promoList.length)}
                aria-label="Next promo"
                className="w-8 h-8 md:w-9 md:h-9 bg-white border border-gray-300 rounded hover:border-gray-500 hover:text-black text-gray-500 flex items-center justify-center transition shadow-sm shrink-0 cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
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
