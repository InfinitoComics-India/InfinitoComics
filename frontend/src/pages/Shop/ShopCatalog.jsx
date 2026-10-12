import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllCategories, getAllProducts } from '../../services/productService';
import { addToCart } from '../../redux/cartSlice';

import heroTshirt from '../../../assets/Images/merch/MerchModel.png';

const DEFAULT_HERO_SLIDES = [
  {
    id: "slide-1",
    title: "Monthly Drop Incoming",
    headline: "MONTHLY DROP INCOMING",
    highlightText: "MONTHLY DROP",
    subheading: "Only 500 pieces. Book the exclusive INFINITO merchandise right now.",
    buttonText: "Shop Now",
    buttonLink: "https://shop.infinitohq.com/",
    imageUrl: "/banners/hero_monthly_drop.png",
    displayMode: "banner_image",
    variant: "light",
    alignment: "right",
    isActive: true,
  },
  {
    id: "slide-2",
    title: "Become Infinito",
    headline: "BECOME ONE OF US BECOME INFINITO",
    highlightText: "ONE OF US",
    subheading: "Only 500 pieces. Book the exclusive INFINITO merchandise right now.",
    buttonText: "Shop Now",
    buttonLink: "https://shop.infinitohq.com/",
    imageUrl: "/banners/hero_become_infinito.png",
    displayMode: "banner_image",
    variant: "dark",
    alignment: "left",
    isActive: true,
  },
];

const DEFAULT_PROMO_BANNERS = [
  {
    id: "promo-1",
    badgeText: "LIMITED EDITION DROP",
    discountCode: "CRIMSON35",
    headline: "35% off",
    subtitle: "on THE CRIMSON BLOODLINE",
    buttonText: "Buy Now",
    buttonLink: "https://shop.infinitohq.com/",
    bgImageUrl: "/products/crimson_tshirt.jpg",
    bgColor: "#800000",
    isActive: true,
  },
  {
    id: "promo-2",
    badgeText: "GRAPHIC NOVEL SPECIAL",
    discountCode: "INFINITOVIP",
    headline: "FLAT 25% OFF",
    subtitle: "on ALL COMIC BOOKS & PRINTS",
    buttonText: "Explore Now",
    buttonLink: "https://shop.infinitohq.com/",
    bgImageUrl: "",
    bgColor: "#111827",
    isActive: true,
  },
];

const ShopCatalog = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeSlide, setActiveSlide] = useState(0);
  const [activePromoIndex, setActivePromoIndex] = useState(0);
  const [heroSlides, setHeroSlides] = useState(DEFAULT_HERO_SLIDES);
  const [promoBanners, setPromoBanners] = useState(DEFAULT_PROMO_BANNERS);
  const [categories, setCategories] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMarketingBanners = () => {
    try {
      const stored = localStorage.getItem("infinito_shop_banners");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.heroSlider) && parsed.heroSlider.length > 0) {
          const activeSlides = parsed.heroSlider.filter((s) => s.isActive !== false);
          if (activeSlides.length > 0) {
            setHeroSlides(activeSlides);
          }
        }
        if (Array.isArray(parsed.promoBanners) && parsed.promoBanners.length > 0) {
          const activePromos = parsed.promoBanners.filter((b) => b.isActive !== false);
          if (activePromos.length > 0) {
            setPromoBanners(activePromos);
          }
        } else if (parsed.promoBanner && parsed.promoBanner.isActive !== false) {
          setPromoBanners([parsed.promoBanner]);
        }
      }
    } catch (e) {
      console.warn("Failed to parse infinito_shop_banners in ShopCatalog", e);
    }
  };

  useEffect(() => {
    loadMarketingBanners();

    const handleStorage = (e) => {
      if (e.key === "infinito_shop_banners") loadMarketingBanners();
    };
    window.addEventListener("storage", handleStorage);

    let channel;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel("infinito_banners_channel");
        channel.onmessage = () => loadMarketingBanners();
      } catch (err) { }
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
      if (channel) channel.close();
    };
  }, []);

  // Auto rotate hero slides every 6s
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Auto rotate promo banners every 7s
  useEffect(() => {
    if (promoBanners.length <= 1) return;
    const interval = setInterval(() => {
      setActivePromoIndex((prev) => (prev + 1) % promoBanners.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [promoBanners.length]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [cats, prods] = await Promise.all([
          getAllCategories(),
          getAllProducts(),
        ]);
        if (!isMounted) return;
        setCategories(cats);
        setTrendingProducts(prods);
      } catch (err) {
        console.error('Failed to load shop catalog data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const cleanPrice = typeof product.price === 'string'
      ? parseFloat(product.price.replace(/[^\d.]/g, '')) || 1299
      : Number(product.price || product.salePrice || product.basePrice || 1299);

    const cleanMrp = typeof product.mrp === 'string'
      ? parseFloat(product.mrp.replace(/[^\d.]/g, '')) || Math.round(cleanPrice * 1.6)
      : Number(product.mrp || product.basePrice || Math.round(cleanPrice * 1.6));

    const primaryImg = (Array.isArray(product.images) && product.images.length > 0)
      ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url)
      : (product.image || '/products/crimson_tshirt.jpg');

    dispatch(
      addToCart({
        productId: product._id || product.id || product.slug,
        size: 'M',
        quantity: 1,
        product: {
          id: product._id || product.id || product.slug,
          name: product.name || product.title || 'Special Edition Crimson Red T-Shirt',
          title: product.name || product.title || 'Special Edition Crimson Red T-Shirt',
          price: cleanPrice,
          mrp: cleanMrp,
          image: primaryImg,
          description: product.description || product.shortDescription || '',
          rating: product.rating || 4.5,
        },
      })
    );
    toast.success(`Added ${product.name || product.title || 'item'} to cart!`);
  };

  const handleCategoryClick = (cat) => {
    const target = cat.slug || cat.id || cat.name;
    navigate(`/product/${target}`);
  };

  const handleProductClick = (prod) => {
    navigate(`/product/${prod.slug || prod.id}`);
  };

  const currentSlide = heroSlides[activeSlide % heroSlides.length] || heroSlides[0];
  const currentPromo = promoBanners[activePromoIndex % promoBanners.length] || promoBanners[0];

  const handleCtaClick = (link) => {
    if (!link) return;
    if (link.startsWith('http')) {
      window.location.href = link;
    } else {
      navigate(link);
    }
  };

  return (
    <div className="w-full bg-white text-black min-h-screen font-sans">

      {/* 1. HERO SLIDER CAROUSEL SECTION */}
      <section className="relative w-full bg-[#0a0a0a] text-white overflow-hidden select-none">
        {/* Full Artwork / Visual Slide */}
        <div className="relative w-full min-h-[380px] sm:min-h-[460px] md:min-h-[540px] flex items-center justify-center">
          {currentSlide?.imageUrl ? (
            <img
              src={currentSlide.imageUrl}
              alt={currentSlide.title || "Infinito Hero Slide"}
              className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-black via-[#1c0205] to-black" />
          )}

          {/* If custom overlay is selected or text overlay requested */}
          {currentSlide?.displayMode === "custom_overlay" ? (
            <div className="relative z-10 max-w-[1200px] w-full mx-auto px-4 md:px-12 py-12 flex items-center">
              <div
                className={`max-w-xl space-y-4 ${currentSlide.alignment === "right" ? "ml-auto text-right" : "mr-auto text-left"
                  }`}
              >
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-none drop-shadow-md">
                  {currentSlide.headline || "BECOME ONE OF US BECOME INFINITO"}
                </h1>
                <p className="text-gray-200 text-xs md:text-sm font-normal leading-relaxed drop-shadow">
                  {currentSlide.subheading || "Only 500 pieces. Book the exclusive merchandise right now."}
                </p>
                <div className={`pt-2 flex ${currentSlide.alignment === "right" ? "justify-end" : "justify-start"}`}>
                  <button
                    onClick={() => handleCtaClick(currentSlide.buttonLink || "https://shop.infinitohq.com/")}
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wider uppercase transition shadow-xl cursor-pointer"
                  >
                    {currentSlide.buttonText || "Shop Now"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Banner image mode: full clickable overlay with action button */
            <div
              onClick={() => handleCtaClick(currentSlide?.buttonLink || "https://shop.infinitohq.com/")}
              className="absolute inset-0 z-10 cursor-pointer"
            />
          )}

          {/* Carousel Prev/Next Arrows */}
          {heroSlides.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
                }}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur text-white flex items-center justify-center transition border border-white/20 cursor-pointer shadow-lg"
                aria-label="Previous Hero Slide"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlide((prev) => (prev + 1) % heroSlides.length);
                }}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur text-white flex items-center justify-center transition border border-white/20 cursor-pointer shadow-lg"
                aria-label="Next Hero Slide"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* Carousel Dots */}
          {heroSlides.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {heroSlides.map((_, dot) => (
                <button
                  key={dot}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSlide(dot);
                  }}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${activeSlide === dot ? "bg-red-600 w-8" : "bg-white/50 hover:bg-white/80 w-2.5"
                    }`}
                  aria-label={`Slide ${dot + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. PROMO BANNER BOX SECTION (MULTIPLE PROMOS SUPPORTED - MATCHING SS2) */}
      <section className="my-8 md:my-10">
        <div className="max-w-[1200px] mx-auto px-4 md:px-12 flex items-center justify-center gap-3 md:gap-5">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => setActivePromoIndex((prev) => (prev - 1 + promoBanners.length) % promoBanners.length)}
            className="w-8 h-8 md:w-9 md:h-9 bg-white border border-gray-300 rounded hover:border-gray-500 hover:text-black text-gray-500 flex items-center justify-center transition shadow-sm shrink-0 cursor-pointer"
            aria-label="Previous promo"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Exact SS2 Sized Banner Card */}
          <div
            className="relative w-full max-w-[780px] h-[160px] sm:h-[175px] md:h-[180px] rounded-xl overflow-hidden shadow-md flex items-center bg-black bg-cover bg-center shrink-0"
            style={{
              backgroundColor: currentPromo?.bgColor || "#800000",
              backgroundImage: currentPromo?.bgImageUrl ? `url(${currentPromo.bgImageUrl})` : "none",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent pointer-events-none" />

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
                {currentPromo?.subtitle || "on THE CRIMSON BLOODLINE"}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleCtaClick(currentPromo?.buttonLink || "https://shop.infinitohq.com/")}
                  className="px-4 sm:px-5 py-1.5 sm:py-2 bg-[#DD1215] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer shadow-sm"
                >
                  {currentPromo?.buttonText || "Buy Now"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => setActivePromoIndex((prev) => (prev + 1) % promoBanners.length)}
            className="w-8 h-8 md:w-9 md:h-9 bg-white border border-gray-300 rounded hover:border-gray-500 hover:text-black text-gray-500 flex items-center justify-center transition shadow-sm shrink-0 cursor-pointer"
            aria-label="Next promo"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="max-w-[1200px] mx-auto py-10 px-4 md:px-12">
        <div className="flex items-center justify-between mb-8 pb-2 border-b border-gray-100">
          <h2 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight">
            Categories
          </h2>
          <button
            onClick={() => setShowAllCategories((prev) => !prev)}
            className="text-xs md:text-sm font-bold text-red-600 hover:text-red-700 uppercase tracking-wider flex items-center gap-1 cursor-pointer transition py-1.5 px-3 rounded hover:bg-red-50 border border-red-200"
          >
            <span>{showAllCategories ? 'View Less' : 'View All'}</span>
            <ChevronRight size={16} className={`transition-transform duration-200 ${showAllCategories ? 'rotate-90' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
          {(showAllCategories ? categories : categories.slice(0, 5)).map((cat) => (
            <div
              key={cat.id || cat._id}
              onClick={() => handleCategoryClick(cat)}
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
              <div className="w-full bg-red-600 text-white py-2 text-center text-[11px] font-extrabold uppercase tracking-wider group-hover:bg-red-700 transition truncate px-1">
                {cat.label || cat.name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. TOP TRENDING SECTION */}
      <section className="max-w-[1200px] mx-auto py-10 px-4 md:px-12 relative">
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
      <section className="max-w-[1240px] mx-auto my-12 px-4 md:px-8">
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
