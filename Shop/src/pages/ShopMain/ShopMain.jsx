import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ChevronLeft, ChevronRight, Check, ArrowRight, Heart, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import {
  fetchCategories,
  fetchFeaturedProducts,
  fetchProducts,
  fallbackCategoryImages,
} from "../../services/productService";
import { isInWishlist, toggleWishlist } from "../../services/wishlistService";
import { addToCart } from "../../redux/cartSlice";
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

  const [characters, setCharacters] = useState([
    { id: '1', name: 'Dead Shot' },
    { id: '2', name: 'Mystery Man' },
    { id: '3', name: 'The Wild Shot' },
    { id: '4', name: 'White women' },
  ]);
  const [selectedCharacter, setSelectedCharacter] = useState('Dead Shot');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const bases = isLocal
          ? ['http://localhost:5000', 'https://infinitocomics-68cr.onrender.com']
          : ['https://infinitocomics-68cr.onrender.com', 'http://localhost:5000'];

        for (const base of bases) {
          try {
            const charRes = await fetch(`${base}/character/list`).then(r => r.ok ? r.json() : null);
            if (!cancelled && charRes?.success && Array.isArray(charRes.data) && charRes.data.length > 0) {
              const list = charRes.data.map(c => ({
                id: c.characterId || c._id || c.id,
                name: c.characterName || c.knownAs || c.originalName || 'Hero',
              }));
              setCharacters(list);
              if (list[0]?.name) setSelectedCharacter(list[0].name);
              break;
            }
          } catch {}
        }
      } catch {}
    })();

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
        const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const bases = isLocal
          ? ['http://localhost:5000', 'https://infinitocomics-68cr.onrender.com']
          : ['https://infinitocomics-68cr.onrender.com', 'http://localhost:5000'];

        for (const base of bases) {
          try {
            const res = await fetch(`${base}/shop/marketing/banners?_t=${Date.now()}`, {
              headers: { 'Cache-Control': 'no-cache' },
              cache: 'no-store',
            }).then((r) => (r.ok ? r.json() : null));

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
              break;
            }
          } catch {}
        }
      } catch {}

      // Dedicated Ultimate Kit endpoint fetch to ensure freshest sync
      try {
        const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const bases = isLocal
          ? ['http://localhost:5000', 'https://infinitocomics-68cr.onrender.com']
          : ['https://infinitocomics-68cr.onrender.com', 'http://localhost:5000'];

        for (const base of bases) {
          try {
            const kitRes = await fetch(`${base}/shop/marketing/ultimate-kit?_t=${Date.now()}`, {
              headers: { 'Cache-Control': 'no-cache' },
              cache: 'no-store',
            }).then((r) => (r.ok ? r.json() : null));

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
              break;
            }
          } catch {}
        }
      } catch {}
    };

    reloadBanners();

    window.addEventListener("storage", reloadBanners);
    window.addEventListener("focus", reloadBanners);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") reloadBanners();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // 3.5s background polling for live instant updates from Admin without reload
    const pollInterval = setInterval(reloadBanners, 3500);

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
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(pollInterval);
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

            <div className="bg-white rounded-3xl border-2 border-gray-300 shadow-md overflow-hidden transition hover:shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
                {/* Left Image / No-Photo Area - Exact 50% Half */}
                <div className="w-full h-full min-h-[380px] md:min-h-[460px] bg-gradient-to-br from-gray-50 via-white to-gray-100 border-b md:border-b-0 md:border-r border-gray-200 overflow-hidden flex items-center justify-center relative">
                  {ultimateKit.noPhoto || ultimateKit.image === "no_photo" ? (
                    <div className="w-full h-full min-h-[380px] md:min-h-[460px] bg-gradient-to-tr from-gray-900 via-gray-800 to-red-950 p-6 sm:p-8 flex flex-col items-center justify-center text-center text-white space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-[#DD1215] shadow-lg">
                        <Gift className="w-8 h-8 text-red-400" />
                      </div>
                      <div>
                        <span className="inline-block px-3 py-0.5 bg-[#DD1215] text-white text-[10px] sm:text-xs font-black tracking-widest rounded-full uppercase mb-1.5">
                          EXCLUSIVE COLLECTOR PACK
                        </span>
                        <h4 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                          {kitTitle}
                        </h4>
                        <p className="text-xs text-gray-300 max-w-sm mt-1">
                          {Array.isArray(ultimateKit.includedProducts) && ultimateKit.includedProducts.length > 0
                            ? `Complete collector box featuring ${ultimateKit.includedProducts.length} official merchandise items.`
                            : "Special collector merchandise & comic package bundled together."}
                        </p>
                      </div>

                      {Array.isArray(ultimateKit.includedProducts) && ultimateKit.includedProducts.length > 0 && (
                        <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                          {ultimateKit.includedProducts.slice(0, 4).map((p, i) => (
                            <div key={i} className="w-11 h-11 rounded-lg bg-white/10 border border-white/20 p-1 flex items-center justify-center overflow-hidden" title={p.title}>
                              {p.image ? (
                                <img src={p.image} alt={p.title} className="w-full h-full object-contain" />
                              ) : (
                                <Package className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          ))}
                          {ultimateKit.includedProducts.length > 4 && (
                            <div className="w-11 h-11 rounded-lg bg-[#DD1215] text-white font-bold text-xs flex items-center justify-center border border-red-400">
                              +{ultimateKit.includedProducts.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <img
                      src={kitImg}
                      alt={kitTitle}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                    />
                  )}
                </div>

                {/* Right Info & Checkout Area */}
                <div className="flex flex-col justify-between p-6 sm:p-8">
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

                    {/* Character Selection Dropdown above Comic of Choice */}
                    <div className="mt-4 mb-3 p-3.5 bg-red-50/70 border-2 border-red-100 rounded-2xl">
                      <label className="block text-xs font-black text-gray-900 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[#DD1215]">
                          <Sparkles className="w-4 h-4 text-[#DD1215]" />
                          Choose Comic Character:
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full border border-red-200 uppercase tracking-wider">
                          Comic of your choice
                        </span>
                      </label>
                      <select
                        value={selectedCharacter}
                        onChange={(e) => setSelectedCharacter(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold bg-white text-gray-900 border-2 border-red-200 rounded-xl focus:outline-none focus:border-[#DD1215] focus:ring-1 focus:ring-[#DD1215] cursor-pointer shadow-xs transition"
                      >
                        {characters.map((char) => (
                          <option key={char.id || char.name} value={char.name}>
                            {char.name} (Comic Edition)
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-gray-500 mt-1.5 font-medium">
                        ✨ Your Ultimate Kit includes the physical comic book featuring your chosen character.
                      </p>
                    </div>

                    {/* Checklist features */}
                    <ul className="py-2 space-y-2.5">
                      {(ultimateKit.features && ultimateKit.features.length > 0
                        ? ultimateKit.features
                        : [
                            "Comic of your choice",
                            "Surprise Superhero Toy",
                            "Digital Wall Paintings",
                            "Superhero Stickers",
                            "Infinito T-shirt",
                          ]
                      ).map((feature, idx) => {
                        const isComicChoice = feature.toLowerCase().includes("comic of");
                        return (
                          <li
                            key={idx}
                            className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-gray-900"
                          >
                            <span className="w-4 h-4 rounded-full border-2 border-[#DD1215] text-[#DD1215] flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                            </span>
                            <span>
                              {feature} {isComicChoice && <strong className="text-[#DD1215]">({selectedCharacter})</strong>}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    {/* Included Bundled Products pills */}
                    {Array.isArray(ultimateKit.includedProducts) && ultimateKit.includedProducts.length > 0 && (
                      <div className="pt-3 pb-3 border-t border-gray-100">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-[#DD1215]" />
                          <span>Includes {ultimateKit.includedProducts.length} Store Items:</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {ultimateKit.includedProducts.map((p, i) => (
                            <span key={i} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-800 rounded-md font-medium border border-gray-200 truncate max-w-[200px]">
                              {p.title} {p.quantity > 1 ? `(${p.quantity}x)` : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
                          selectedCharacter: selectedCharacter,
                          product: {
                            _id: "ultimate-kit",
                            title: `${kitTitle} (${selectedCharacter})`,
                            price: Number(kitSalePrice) || 1999,
                            images: [kitImg],
                            selectedCharacter: selectedCharacter,
                            description: `Selected Comic Character: ${selectedCharacter}. ${(ultimateKit.features || []).join(", ")}`,
                            includedProducts: ultimateKit.includedProducts || [],
                          },
                        };
                        try {
                          localStorage.setItem("checkout_items", JSON.stringify([kitItem]));
                          localStorage.setItem("checkout_mode", "single");
                          localStorage.setItem("ultimate_kit_character", selectedCharacter);
                        } catch (e) {
                          console.error(e);
                        }
                        navigate(`/checkout?mode=single&productId=ultimate-kit&character=${encodeURIComponent(selectedCharacter)}`);
                      }}
                      className="w-full py-3.5 px-6 rounded-lg bg-[#DD1215] hover:bg-red-700 active:scale-[0.99] text-white font-black text-sm md:text-base tracking-wider transition-all duration-150 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 uppercase"
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
  const dispatch = useDispatch();
  const pid = product.slug || product._id || product.id;
  const fallback =
    fallbackCategoryImages[product.category?.toLowerCase()] ||
    fallbackCategoryImages['tshirts'];
  const [imgSrc, setImgSrc] = useState(product.image || fallback);
  const [inWish, setInWish] = useState(() => isInWishlist(product._id || product.id));

  useEffect(() => {
    const handleUpdate = () => {
      setInWish(isInWishlist(product._id || product.id));
    };
    window.addEventListener("wishlist_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("wishlist_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [product._id, product.id]);

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    const added = toggleWishlist(product);
    setInWish(added);
    if (added) {
      toast.success("Added to Wishlist!");
    } else {
      toast.info("Removed from Wishlist");
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const cleanPrice = Number(product.price || product.salePrice || product.basePrice || 1299);
    const cleanMrp = Number(product.mrp || Math.round(cleanPrice * 1.6));
    const effectiveSize = (Array.isArray(product.sizes) && product.sizes[0]) || "Standard";
    const itemSku = String(product.sku || "").trim();
    const itemImage = product.image || "";

    dispatch(
      addToCart({
        productId: product._id || product.id,
        size: effectiveSize,
        sku: itemSku,
        quantity: 1,
        variant: {
          size: effectiveSize,
          price: cleanPrice,
        },
        product: {
          id: product._id || product.id,
          name: product.name || "INFINITO",
          title: product.title || product.name || "INFINITO",
          price: cleanPrice,
          mrp: cleanMrp,
          sku: itemSku,
          image: itemImage,
          description: product.description || "Special Edition INFINITO merchandise.",
          rating: product.rating || 4.5,
        },
      })
    );
    toast.success(`Added ${product.title || product.name || "item"} to cart!`);
  };

  return (
    <div
      onClick={() => navigate(`/product/${pid}`)}
      className="flex-shrink-0 w-[300px] cursor-pointer group border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition-shadow bg-white relative"
    >
      <div className="relative w-full h-[260px] bg-gray-100 flex items-center justify-center overflow-hidden p-2">
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
        {/* Floating Action Buttons: Cart & Wishlist */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-8 h-8 rounded-full bg-white/85 hover:bg-white text-gray-700 hover:text-[#DD1215] flex items-center justify-center transition shadow-md cursor-pointer"
            title="Add to Cart"
            aria-label="Add to Cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleWishlistToggle}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-md cursor-pointer ${
              inWish
                ? "bg-[#DD1215] text-white scale-110"
                : "bg-white/85 hover:bg-white text-gray-700 hover:text-[#DD1215]"
            }`}
            title={inWish ? "Remove from Wishlist" : "Save to Wishlist"}
            aria-label={inWish ? "Remove from Wishlist" : "Save to Wishlist"}
          >
            <Heart className={`w-4 h-4 ${inWish ? "fill-white text-white" : ""}`} />
          </button>
        </div>
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
