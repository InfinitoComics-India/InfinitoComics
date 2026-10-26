import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, ArrowRight } from "lucide-react";
import {
  fetchCategories,
  fetchFeaturedProducts,
  fetchProducts,
  fallbackCategoryImages,
} from "../../services/productService";
import HeroSlider from "./HeroSlider";
import ultimateKitBanner from "../../assets/ultimateKit.svg";
import promoBanner from "../../assets/hero/slide4.svg";

const normalizeKitData = (rawKit) => {
  if (!rawKit) return null;
  const img = rawKit.image || rawKit.imageUrl || '';
  const title = rawKit.cardTitle || rawKit.title || 'ULTIMATE KIT';
  const cleanOriginalPrice = String(rawKit.originalPrice || '').replace(/^₹\s*/, '');
  const cleanSalePrice = String(rawKit.salePrice || '1999').replace(/^₹\s*/, '');

  return {
    ...rawKit,
    image: img,
    imageUrl: img,
    cardTitle: title,
    title,
    cleanOriginalPrice,
    cleanSalePrice,
  };
};

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
    } catch { }
    return [
      {
        id: "promo-1",
        headline: "35% off",
        subtitle: "on The Crimson Bloodline",
        badgeText: "LIMITED EDITION DROP",
        discountCode: "CRIMSON35",
        buttonText: "Buy Now",
        buttonLink: "/catalog",
        bgImageUrl: promoBanner,
        bgColor: "#800000",
        isActive: true,
      },
      {
        id: "promo-2",
        headline: "FLAT 25% OFF",
        subtitle: "on ALL COMIC BOOKS & PRINTS",
        badgeText: "GRAPHIC NOVEL SPECIAL",
        discountCode: "INFINITOVIP",
        buttonText: "Explore Now",
        buttonLink: "/catalog",
        bgImageUrl: "/products/crimson_tshirt.jpg",
        bgColor: "#111827",
        isActive: true,
      },
    ];
  });

  const [ultimateKit, setUltimateKit] = useState(() => {
    try {
      const raw = localStorage.getItem("infinito_shop_banners");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.ultimateKit) {
          const norm = normalizeKitData(parsed.ultimateKit);
          if (norm) return norm;
        }
      }
    } catch {}
    return {
      sectionTitle: "ULTIMATE KIT",
      badgeText: "INFINITO",
      cardTitle: "ULTIMATE KIT",
      title: "ULTIMATE KIT",
      originalPrice: "2199",
      salePrice: "1999",
      cleanOriginalPrice: "2199",
      cleanSalePrice: "1999",
      buttonText: "Get Now",
      image: "",
      imageUrl: "",
      features: [
        "Comic of your choice",
        "Surprise Superhero Toy",
        "Digital Wall Paintings",
        "Superhero Stickers",
        "Infinito T-shirt",
      ],
      isActive: true,
    };
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

  // Auto rotate promo banners automatically every 4.5 seconds
  useEffect(() => {
    if (!promoBannersList || promoBannersList.length <= 1) return;
    const timer = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % promoBannersList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [promoBannersList.length]);

  // Sync banners across tabs & Admin BroadcastChannel
  useEffect(() => {
    const reloadBanners = async () => {
      try {
        const raw = localStorage.getItem("infinito_shop_banners");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.promoBanners) && parsed.promoBanners.length > 0) {
            const enabled = parsed.promoBanners.filter((b) => b && b.isActive !== false);
            if (enabled.length > 0) {
              setPromoBannersList(enabled);
            }
          }
          if (parsed.ultimateKit) {
            const norm = normalizeKitData(parsed.ultimateKit);
            if (norm) setUltimateKit(norm);
          }
        }
      } catch { }

      // Fetch from backend API to ensure live sync across tabs and devices
      try {
        const base = "https://infinitocomics-68cr.onrender.com";
        let res;
        try {
          res = await fetch(`${base}/shop/marketing/banners?_t=${Date.now()}`).then((r) => r.json());
        } catch {
          res = await fetch(`http://localhost:5000/shop/marketing/banners?_t=${Date.now()}`).then((r) => r.json());
        }
        if (res?.success && res.data) {
          if (Array.isArray(res.data.promoBanners) && res.data.promoBanners.length > 0) {
            const enabled = res.data.promoBanners.filter((b) => b && b.isActive !== false);
            if (enabled.length > 0) {
              setPromoBannersList(enabled);
            }
          }
          if (res.data.ultimateKit) {
            const norm = normalizeKitData(res.data.ultimateKit);
            if (norm) setUltimateKit(norm);
          }
          try {
            localStorage.setItem("infinito_shop_banners", JSON.stringify(res.data));
          } catch {}
        }
      } catch {}

      // Dedicated Ultimate Kit endpoint fetch to ensure freshest sync
      try {
        const base = "https://infinitocomics-68cr.onrender.com";
        let kitRes;
        try {
          kitRes = await fetch(`${base}/shop/marketing/ultimate-kit?_t=${Date.now()}`).then((r) => r.json());
        } catch {
          kitRes = await fetch(`http://localhost:5000/shop/marketing/ultimate-kit?_t=${Date.now()}`).then((r) => r.json());
        }
        if (kitRes?.success && kitRes.data) {
          const norm = normalizeKitData(kitRes.data);
          if (norm) {
            setUltimateKit(norm);
            try {
              const currentRaw = localStorage.getItem("infinito_shop_banners");
              const currentObj = currentRaw ? JSON.parse(currentRaw) : {};
              currentObj.ultimateKit = kitRes.data;
              localStorage.setItem("infinito_shop_banners", JSON.stringify(currentObj));
            } catch {}
          }
        }
      } catch {}
    };

    reloadBanners();

    window.addEventListener("storage", reloadBanners);
    window.addEventListener("focus", reloadBanners);
    let bc;
    try {
      bc = new BroadcastChannel("infinito_banners_channel");
      bc.onmessage = (e) => {
        if (e.data?.type === "banners_updated") {
          if (e.data.data?.ultimateKit) {
            const norm = normalizeKitData(e.data.data.ultimateKit);
            if (norm) setUltimateKit(norm);
          }
          if (Array.isArray(e.data.data?.promoBanners) && e.data.data.promoBanners.length > 0) {
            const enabled = e.data.data.promoBanners.filter((b) => b && b.isActive !== false);
            if (enabled.length > 0) setPromoBannersList(enabled);
          } else {
            reloadBanners();
          }
        }
      };
    } catch { }

    return () => {
      window.removeEventListener("storage", reloadBanners);
      window.removeEventListener("focus", reloadBanners);
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

              {/* Exact Responsive Promo Banner - image fills container cleanly */}
              {(() => {
                // If photo is set to empty (No Photo option), do not force fallback svg
                const hasExplicitBg = currentPromo?.bgImageUrl !== undefined;
                const hasExplicitImg = currentPromo?.imageUrl !== undefined;
                const bannerImg = hasExplicitBg
                  ? currentPromo.bgImageUrl
                  : (hasExplicitImg ? currentPromo.imageUrl : promoBanner);
                const isRight = currentPromo?.alignment === "right";
                const isCenter = currentPromo?.alignment === "center";

                return (
                  <div
                    className="relative w-full max-w-[840px] min-h-[170px] sm:min-h-[190px] md:min-h-[210px] rounded-xl overflow-hidden shadow-md flex items-center bg-black shrink-0"
                    style={{
                      backgroundColor: currentPromo?.bgColor || "#800000",
                    }}
                  >
                    {/* The image fills the size of the banner container if provided */}
                    {bannerImg ? (
                      <img
                        src={bannerImg}
                        alt={currentPromo?.headline || "Promotional Banner"}
                        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-all duration-300 scale-[1.08] min-w-full min-h-full"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: currentPromo?.bgColor || "#800000" }}
                      />
                    )}

                    {/* Gradient scrim to maintain text readability while artwork remains bright */}
                    <div className={`absolute inset-0 pointer-events-none ${
                      isRight
                        ? "bg-gradient-to-l from-black/85 via-black/40 to-transparent"
                        : isCenter
                        ? "bg-black/55"
                        : "bg-gradient-to-r from-black/85 via-black/40 to-transparent"
                    }`} />

                    {/* Content overlaid on banner matching slider aesthetic */}
                    <div className={`relative z-10 px-6 sm:px-8 md:px-10 py-4 max-w-[70%] sm:max-w-[60%] space-y-1 text-white ${
                      isRight ? "ml-auto text-right" : isCenter ? "mx-auto text-center" : "text-left"
                    }`}>
                      {(currentPromo?.badgeText || currentPromo?.discountCode) && (
                        <div className={`flex items-center gap-2 ${
                          isRight ? "justify-end" : isCenter ? "justify-center" : "justify-start"
                        }`}>
                          <span className="inline-block bg-black/70 text-[#DD1215] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                            {currentPromo.badgeText || currentPromo.discountCode}
                          </span>
                        </div>
                      )}
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight uppercase text-white drop-shadow font-sans">
                        {currentPromo?.headline || "35% off"}
                      </h2>
                      <p className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide text-gray-200 uppercase drop-shadow">
                        {currentPromo?.subtitle || "on The Crimson Bloodline"}
                      </p>
                      <div className={`pt-2 flex ${
                        isRight ? "justify-end" : isCenter ? "justify-center" : "justify-start"
                      }`}>
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
                );
              })()}

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
      {ultimateKit.isActive !== false && (() => {
        const kitImg = ultimateKit.image || ultimateKit.imageUrl || ultimateKitBanner;
        const kitTitle = ultimateKit.cardTitle || ultimateKit.title || "ULTIMATE KIT";
        const kitOrigPrice = String(ultimateKit.cleanOriginalPrice || ultimateKit.originalPrice || "").replace(/^₹\s*/, "");
        const kitSalePrice = String(ultimateKit.cleanSalePrice || ultimateKit.salePrice || "1999").replace(/^₹\s*/, "");

        return (
          <section className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-10 py-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-8 font-dmsans uppercase tracking-widest text-black">
              {ultimateKit.sectionTitle || "ULTIMATE KIT"}
            </h2>

            <div className="bg-white rounded-3xl border-2 border-gray-300 shadow-md p-4 sm:p-6 transition hover:shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Image Area */}
                <div className="lg:col-span-7 bg-linear-to-b from-gray-50 via-white to-gray-100 rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center p-3 sm:p-4 min-h-[260px] md:min-h-[340px]">
                  <img
                    src={kitImg}
                    alt={kitTitle}
                    className="w-full h-full max-h-[380px] object-contain transition-transform duration-300 hover:scale-[1.02]"
                  />
                </div>

                {/* Right Info & Checkout Area */}
                <div className="lg:col-span-5 flex flex-col justify-between py-1">
                  <div>
                    {/* Header: Badge + Card Title, Prices */}
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-200">
                      <div>
                        <div className="inline-block bg-[#DD1215] text-white font-black text-xs md:text-sm px-2.5 py-0.5 rounded tracking-wider uppercase mb-1">
                          {ultimateKit.badgeText || "INFINITO"}
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight">
                          {kitTitle}
                        </h3>
                      </div>

                      <div className="text-right shrink-0">
                        {kitOrigPrice && (
                          <span className="text-gray-400 font-bold line-through text-base md:text-lg mr-2">
                            ₹{kitOrigPrice}
                          </span>
                        )}
                        <span className="text-2xl md:text-3xl font-black text-black">
                          ₹{kitSalePrice}
                        </span>
                      </div>
                    </div>

                    {/* Checklist features */}
                    <ul className="py-5 space-y-3">
                      {(ultimateKit.features && ultimateKit.features.length > 0
                        ? ultimateKit.features
                        : [
                            "Comic of your choice",
                            "Surprise Superhero Toy",
                            "Digital Wall Paintings",
                            "Superhero Stickers",
                            "Infinito T-shirt",
                          ]
                      ).map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-gray-900"
                        >
                          <span className="w-4 h-4 rounded-full border-2 border-[#DD1215] text-[#DD1215] flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Buy Now / Get Now button */}
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        const kitItem = {
                          productId: "ultimate-kit",
                          size: "Standard",
                          quantity: 1,
                          unitPrice: Number(kitSalePrice) || 1999,
                          product: {
                            _id: "ultimate-kit",
                            title: kitTitle,
                            price: Number(kitSalePrice) || 1999,
                            images: [kitImg],
                            description: (ultimateKit.features || []).join(", "),
                          },
                        };
                        try {
                          localStorage.setItem("checkout_items", JSON.stringify([kitItem]));
                          localStorage.setItem("checkout_mode", "single");
                        } catch (e) {
                          console.error(e);
                        }
                        navigate("/checkout?mode=single&productId=ultimate-kit");
                      }}
                      className="w-full py-3.5 px-6 rounded-lg bg-[#DD1215] hover:bg-red-700 active:scale-[0.99] text-white font-black text-sm md:text-base tracking-wider transition-all duration-150 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{ultimateKit.buttonText || "Get Now"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })()}
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
