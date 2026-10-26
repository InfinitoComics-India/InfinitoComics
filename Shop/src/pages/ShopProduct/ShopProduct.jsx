import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { 
  Heart, 
  Share2, 
  ShoppingBag, 
  Star, 
  ChevronRight, 
  Check, 
  ThumbsUp, 
  Sparkles,
  X,
  ArrowRight,
  ShieldCheck,
  Edit3,
  Truck,
  CheckCircle2,
  RotateCcw
} from "lucide-react";
import { toast } from "react-toastify";
import {
  fetchProductBySlug,
  fetchProductsByCategory,
  fetchProducts,
  fallbackCategoryImages,
  fetchProductReviews,
  submitProductReview
} from "../../services/productService";
import { addToCart } from "../../redux/cartSlice";
import { isInWishlist, toggleWishlist } from "../../services/wishlistService";

// Safe image component with graceful fallback
const SafeImage = ({ src, alt, className, fallback }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const defaultFallback = fallbackCategoryImages["tshirts"];

  return (
    <img
      src={failed || !src ? fallback || defaultFallback : src}
      alt={alt || "INFINITO"}
      className={className}
      onError={() => setFailed(true)}
    />
  );
};

const ShopProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { productId: slug } = useParams();
  const reviewsSectionRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [wishlistVersion, setWishlistVersion] = useState(0);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showMoreSpecs, setShowMoreSpecs] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);

  useEffect(() => {
    const handleWishSync = () => setWishlistVersion((v) => v + 1);
    window.addEventListener("wishlist_updated", handleWishSync);
    window.addEventListener("storage", handleWishSync);
    return () => {
      window.removeEventListener("wishlist_updated", handleWishSync);
      window.removeEventListener("storage", handleWishSync);
    };
  }, []);

  const isWishlisted = Boolean(product && isInWishlist(product.id || product._id));

  // Reviews state
  const [reviewsData, setReviewsData] = useState({ reviews: [], averageRating: 0, totalRatingsCount: 0 });
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    userName: "",
    headline: "",
    comment: "",
  });

  // Pincode Delivery Estimator state
  const [pincodeInput, setPincodeInput] = useState(() => {
    try {
      return localStorage.getItem("user_pincode") || "";
    } catch {
      return "";
    }
  });
  const [pincodeResult, setPincodeResult] = useState(() => {
    try {
      const saved = localStorage.getItem("user_pincode");
      if (saved && saved.length === 6) {
        return { valid: true, code: saved };
      }
    } catch {}
    return null;
  });
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);

  // Delivery date estimate (3 business days ahead)
  const deliveryEstimateDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  }, []);

  const handleCheckPincode = (e) => {
    e?.preventDefault();
    const clean = pincodeInput.trim();
    if (!/^\d{6}$/.test(clean)) {
      toast.error("Please enter a valid 6-digit Indian PIN code");
      return;
    }
    setIsCheckingPincode(true);
    setTimeout(() => {
      setIsCheckingPincode(false);
      setPincodeResult({ valid: true, code: clean });
      try {
        localStorage.setItem("user_pincode", clean);
      } catch {}
      toast.success(`Delivery available for ${clean}!`);
    }, 350);
  };

  // 1. Fetch Product, Reviews & Category-Filtered Suggested Products
  useEffect(() => {
    let cancelled = false;

    const loadProductData = async () => {
      setLoading(true);
      setProduct(null);
      setSuggested([]);
      setActiveImage(0);

      try {
        const p = await fetchProductBySlug(slug);
        if (cancelled) return;

        setProduct(p);

        if (p) {
          // Initialize reviews
          const revs = await fetchProductReviews(p.slug || slug);
          if (!cancelled) {
            setReviewsData(revs);
          }

          // Initialize color
          const colors = p.colors || ["Black", "Crimson Red", "White", "Navy"];
          setSelectedColor(colors[0] || "Black");

          // Category-matched similar products (EXACTLY 2 lines = 8 items)
          const catSlug = p.categorySlug || p.category || "";
          let related = [];

          if (catSlug) {
            const catList = await fetchProductsByCategory(catSlug);
            related = (catList || []).filter(
              (item) =>
                String(item._id || item.id) !== String(p._id || p.id) &&
                String(item.slug || "") !== String(p.slug || "")
            );
          }

          // If category has fewer than 8 items, supplement with store products
          if (related.length < 8) {
            const all = await fetchProducts();
            const others = (all || []).filter(
              (item) =>
                String(item._id || item.id) !== String(p._id || p.id) &&
                String(item.slug || "") !== String(p.slug || "") &&
                !related.some((r) => String(r._id || r.id) === String(item._id || item.id))
            );
            related = [...related, ...others];
          }

          setSuggested(related.slice(0, 8)); // Exactly 2 rows (4 cols x 2 rows = 8 products)
        }
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProductData();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // 2. Size Options Memo
  const sizeOptions = useMemo(() => {
    if (product?.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes;
    }
    if (Array.isArray(product?.variants) && product.variants.length > 0) {
      const derived = [];
      for (const v of product.variants) {
        if (Array.isArray(v.options) && v.options.length > 0) {
          for (const opt of v.options) {
            const val = String(opt.value || opt.name || opt.size || "").trim();
            if (val) derived.push(val.toUpperCase());
          }
        } else {
          const val = String(v.size || v.value || v.name || "").trim();
          if (val) derived.push(val.toUpperCase());
        }
      }
      if (derived.length > 0) return Array.from(new Set(derived));
    }
    return ["XS", "S", "M", "L", "XL", "XXL"];
  }, [product]);

  // Color options
  const colorOptions = useMemo(() => {
    if (Array.isArray(product?.colors) && product.colors.length > 0) {
      return product.colors;
    }
    return ["Black", "Crimson Red", "White", "Navy"];
  }, [product]);

  // Sync selected size
  useEffect(() => {
    if (sizeOptions.length > 0) {
      if (!selectedSize || !sizeOptions.includes(selectedSize)) {
        setSelectedSize(sizeOptions[0]);
      }
    }
  }, [sizeOptions, selectedSize]);

  // 3. Dynamic Gallery Memo: EXACT count of real images, ZERO fake padding
  const gallery = useMemo(() => {
    if (!product) return [];
    const list = [];
    if (Array.isArray(product.gallery) && product.gallery.length > 0) {
      list.push(...product.gallery.filter(Boolean));
    }
    if (list.length === 0 && product.image) {
      list.push(product.image);
    }
    if (list.length === 0) {
      const fallback =
        fallbackCategoryImages[product.category?.toLowerCase()] ||
        fallbackCategoryImages["tshirts"];
      return [fallback];
    }
    // Return only unique image URLs with no duplicates and no artificial padding
    return Array.from(new Set(list));
  }, [product]);

  // Active Variant matching selected size
  const activeVariant = useMemo(() => {
    if (!product?.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
      return null;
    }
    for (const v of product.variants) {
      if (Array.isArray(v.options)) {
        const found = v.options.find(
          (opt) =>
            String(opt.value || opt.name || opt.size || "").toUpperCase() ===
            String(selectedSize || "").toUpperCase()
        );
        if (found) {
          return {
            size: String(found.value || found.name || "").toUpperCase(),
            sku: found.sku,
            price: Number(found.price) || 0,
            stock: Number(found.stock) || 0,
          };
        }
      } else {
        if (
          String(v.size || v.value || v.name || "").toUpperCase() ===
          String(selectedSize || "").toUpperCase()
        ) {
          return v;
        }
      }
    }
    return product.variants[0] || null;
  }, [product, selectedSize]);

  // Pricing calculations
  const displayedPrice = useMemo(() => {
    if (!product) return 0;
    if (activeVariant?.price && Number(activeVariant.price) > 0) {
      return Number(activeVariant.price);
    }
    return Number(product.price || product.salePrice || product.basePrice || 0);
  }, [product, activeVariant]);

  const mrpPrice = useMemo(() => {
    if (!product) return 0;
    if (product.mrp && Number(product.mrp) > displayedPrice) {
      return Number(product.mrp);
    }
    return Math.round(displayedPrice * 1.6);
  }, [product, displayedPrice]);

  const discountPercent = useMemo(() => {
    if (!mrpPrice || mrpPrice <= displayedPrice) return 0;
    return Math.round(((mrpPrice - displayedPrice) / mrpPrice) * 100);
  }, [mrpPrice, displayedPrice]);

  // Star breakdown calculation from real reviews
  const ratingStats = useMemo(() => {
    const list = reviewsData.reviews || [];
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    list.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      counts[star] = (counts[star] || 0) + 1;
    });
    const total = list.length;
    const avg = total > 0
      ? (list.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / total).toFixed(1)
      : (product?.rating || 0);

    return {
      average: Number(avg) || 0,
      total,
      breakdown: [5, 4, 3, 2, 1].map((s) => ({
        star: s,
        count: counts[s] || 0,
        pct: total > 0 ? Math.round(((counts[s] || 0) / total) * 100) : 0,
      })),
    };
  }, [reviewsData, product]);

  // Specs Memo
  const specsList = useMemo(() => {
    if (!product) return [];
    if (product.specs && typeof product.specs === "object" && Object.keys(product.specs).length > 0) {
      return Object.entries(product.specs).map(([label, value]) => ({ label, value }));
    }
    return [
      { label: "Sleeve Length", value: "Half Sleeve" },
      { label: "Fit", value: "Regular Fit" },
      { label: "Length", value: "Regular" },
      { label: "Neck", value: "Hooded / Crew Neck" },
      { label: "Fabric", value: "100% Premium Cotton" },
      { label: "Transparency", value: "Opaque" },
      { label: "Wash Care", value: "Machine Wash Cold" },
      { label: "Country of Origin", value: "India" },
    ];
  }, [product]);

  // ─── ACTION HANDLERS ────────────────────────────────────────────────────
  const handleAddToCart = (item = product) => {
    if (!item) return;
    const cleanPrice = Number(activeVariant?.price || item.price || item.salePrice || item.basePrice || 1299);
    const cleanMrp = Number(item.mrp || Math.round(cleanPrice * 1.6));
    const effectiveSize = selectedSize || (sizeOptions[0] || "Standard");
    const itemSku = String(activeVariant?.sku || item.sku || "").trim();
    const itemImage = item.image || item.gallery?.[0] || (gallery && gallery[0]) || "";

    dispatch(
      addToCart({
        productId: item._id || item.id,
        size: effectiveSize,
        sku: itemSku,
        quantity: 1,
        variant: {
          size: effectiveSize,
          color: selectedColor,
          sku: itemSku,
          price: cleanPrice,
        },
        product: {
          id: item._id || item.id,
          name: item.name || "INFINITO",
          title: item.title || item.name || "INFINITO",
          price: cleanPrice,
          mrp: cleanMrp,
          sku: itemSku,
          image: itemImage,
          color: selectedColor,
          description: item.description || "Special Edition INFINITO merchandise.",
          rating: ratingStats.average || 4.5,
        },
      })
    );

    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 2400);
    toast.success(`Added ${item.title || item.name || "item"} (${effectiveSize}) to bag!`);
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    const added = toggleWishlist(product);
    setWishlistVersion((v) => v + 1);
    if (added) {
      toast.success("Added to Wishlist!");
    } else {
      toast.info("Removed from Wishlist");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product?.title || product?.name || "INFINITO Product",
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const scrollToReviews = () => {
    if (reviewsSectionRef.current) {
      reviewsSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      toast.error("Please enter your review comments");
      return;
    }

    try {
      setSubmittingReview(true);
      await submitProductReview(product.slug || slug, reviewForm);
      toast.success("Thank you! Your review has been submitted.");
      setReviewModalOpen(false);
      setReviewForm({ rating: 5, userName: "", headline: "", comment: "" });
      // Refresh reviews
      const updated = await fetchProductReviews(product.slug || slug);
      setReviewsData(updated);
    } catch (err) {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSelectSuggested = (item) => {
    const target = item.slug || item._id || item.id;
    navigate(`/product/${target}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── LOADING & NOT FOUND STATES ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full min-h-[70vh] bg-white flex flex-col items-center justify-center text-gray-500 font-sans">
        <div className="w-12 h-12 border-4 border-[#DD1215] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-wider text-gray-700">Loading Product Details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full min-h-[60vh] bg-white flex flex-col items-center justify-center text-gray-700 font-sans px-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6 max-w-md">
          The product you are looking for does not exist or may have been updated.
        </p>
        <button
          onClick={() => navigate("/shop")}
          className="px-6 py-2.5 bg-[#DD1215] hover:bg-red-700 text-white font-bold uppercase tracking-wider rounded transition"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const activeSrc = gallery[activeImage] || product.image || "";
  const fallbackImg =
    fallbackCategoryImages[product.category?.toLowerCase()] ||
    fallbackCategoryImages["tshirts"];

  return (
    <div className="w-full bg-white text-gray-900 font-sans min-h-screen py-6 md:py-8">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8">
        
        {/* ─── BREADCRUMBS ────────────────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 uppercase tracking-wider font-medium">
          <Link to="/" className="hover:text-black transition">Home</Link>
          <ChevronRight size={12} className="text-gray-400" />
          <Link to="/shop" className="hover:text-black transition">Shop</Link>
          {product.category && (
            <>
              <ChevronRight size={12} className="text-gray-400" />
              <Link 
                to={`/shop/category/${product.category}`} 
                className="hover:text-black transition"
              >
                {product.categoryName || product.category}
              </Link>
            </>
          )}
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-900 font-bold truncate max-w-[200px] sm:max-w-xs">
            {product.title || product.name}
          </span>
        </nav>

        {/* ─── TOP SECTION: 2-COLUMN PRODUCT DISPLAY ──────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ─── LEFT COLUMN: PRODUCT GALLERY (DYNAMIC ONLY) ───────────── */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Main Featured Image Container */}
            <div className="relative w-full aspect-[4/5] bg-gray-50 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center group">
              <SafeImage
                src={activeSrc}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                fallback={fallbackImg}
              />

              {/* Wishlist Floating Button on Image */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition cursor-pointer ${
                  isWishlisted 
                    ? "bg-white text-red-600 ring-2 ring-red-500" 
                    : "bg-white/90 text-gray-600 hover:text-red-600 hover:bg-white"
                }`}
                title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-600 text-red-600" : ""}`} />
              </button>
            </div>

            {/* Dynamic Thumbnail Row (EXACT images only, no fake padding, no +5) */}
            {gallery.length > 1 && (
              <div className="flex flex-wrap gap-3 mt-1">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-24 sm:w-24 sm:h-28 bg-gray-100 rounded-md overflow-hidden transition cursor-pointer ${
                      activeImage === idx
                        ? "border-2 border-[#DD1215] shadow-md ring-2 ring-red-100"
                        : "border border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <SafeImage
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      fallback={fallbackImg}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── RIGHT COLUMN: MYNTRA-STYLE INFO & BUYING ACTIONS ──────── */}
          <div className="lg:col-span-5 flex flex-col">
            
            {/* 1. Brand Name (Myntra bold header) */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif]">
                INFINITO
              </h1>
              <button
                type="button"
                onClick={handleShare}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition cursor-pointer"
                title="Share Product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Product Name / Title */}
            <h2 className="text-base sm:text-lg font-medium text-gray-600 mt-1 leading-snug">
              {product.title}
            </h2>

            {/* 3. Rating Pill (Myntra-style) */}
            <div className="mt-3">
              {ratingStats.total > 0 ? (
                <button
                  type="button"
                  onClick={scrollToReviews}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded hover:border-gray-400 text-xs sm:text-sm font-bold text-gray-800 shadow-sm transition cursor-pointer"
                >
                  <span className="flex items-center gap-1 font-extrabold text-gray-900">
                    {ratingStats.average} <Star className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500 font-medium">
                    {ratingStats.total} {ratingStats.total === 1 ? "Rating" : "Ratings"}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded text-xs font-semibold text-amber-800 hover:bg-amber-100 transition cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>No reviews yet — Be the first to review!</span>
                </button>
              )}
            </div>

            <div className="h-px bg-gray-200 my-4" />

            {/* 4. Price Block */}
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-gray-900">
                  ₹{displayedPrice}
                </span>
                {mrpPrice > displayedPrice && (
                  <>
                    <span className="text-sm sm:text-base text-gray-400 line-through font-normal">
                      MRP ₹{mrpPrice}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-orange-600">
                      ({discountPercent}% OFF)
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-emerald-700 font-semibold mt-1">
                inclusive of all taxes
              </p>
            </div>

            {/* 5. Color Variants (Box Only, text-only, NO images as requested) */}
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5">
                Select Color: <span className="text-gray-900 font-extrabold">{selectedColor}</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((clr) => (
                  <button
                    key={clr}
                    type="button"
                    onClick={() => setSelectedColor(clr)}
                    className={`px-3.5 py-2 text-xs font-bold uppercase rounded border transition cursor-pointer ${
                      selectedColor === clr
                        ? "border-[#DD1215] bg-[#DD1215] text-white shadow-sm ring-2 ring-red-100"
                        : "border-gray-300 bg-white text-gray-800 hover:border-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {clr}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Size Selection with Size Chart */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Select Size: <span className="text-gray-900 font-extrabold">({selectedSize})</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowSizeChart(true)}
                  className="text-xs text-[#DD1215] font-bold uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer"
                >
                  SIZE CHART &gt;
                </button>
              </div>

              {/* Size Buttons */}
              <div className="flex flex-wrap gap-2.5">
                {sizeOptions.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-[50px] px-3.5 h-11 flex items-center justify-center font-bold text-xs sm:text-sm rounded border transition cursor-pointer ${
                      selectedSize === sz
                        ? "border-[#DD1215] bg-[#DD1215] text-white shadow-sm"
                        : "border-gray-300 bg-white text-gray-800 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* 7. Action Buttons (ADD TO BAG & WISHLIST) */}
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => handleAddToCart(product)}
                className={`flex-1 py-3.5 px-6 font-bold text-xs sm:text-sm tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-2 rounded shadow-sm ${
                  addedAnim
                    ? "bg-emerald-600 text-white"
                    : "bg-[#DD1215] hover:bg-red-700 text-white"
                }`}
              >
                {addedAnim ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Bag!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Bag
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`py-3.5 px-5 font-bold text-xs sm:text-sm tracking-wider uppercase border rounded flex items-center justify-center gap-2 transition cursor-pointer ${
                  isWishlisted
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-gray-300 hover:border-gray-800 bg-white text-gray-800"
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-600 text-red-600" : ""}`} />
                <span className="hidden sm:inline">{isWishlisted ? "Wishlisted" : "Wishlist"}</span>
              </button>
            </div>

            {/* Success Banner */}
            {addedAnim && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between rounded animate-fadeIn">
                <span>Item successfully added to your shopping bag!</span>
                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  className="font-bold underline hover:text-emerald-700 cursor-pointer ml-2"
                >
                  View Bag →
                </button>
              </div>
            )}

            {/* DELIVERY OPTIONS & PINCODE ESTIMATOR (Myntra Standard) */}
            <div className="my-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                  <Truck size={15} className="text-[#DD1215]" />
                  Delivery Options
                </h4>
                {pincodeResult && (
                  <button
                    type="button"
                    onClick={() => { setPincodeResult(null); setPincodeInput(""); }}
                    className="text-[11px] text-[#DD1215] font-bold hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                )}
              </div>

              {!pincodeResult ? (
                <form onSubmit={handleCheckPincode} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={pincodeInput}
                      onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Enter 6-digit Pincode (e.g. 110001)"
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
                    />
                    <button
                      type="submit"
                      disabled={isCheckingPincode}
                      className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-wider rounded transition cursor-pointer"
                    >
                      {isCheckingPincode ? "Checking..." : "Check"}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Enter PIN code to check delivery time & Cash on Delivery availability
                  </p>
                </form>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-900 flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      Get it by <span className="text-[#DD1215]">{deliveryEstimateDate}</span>
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded">
                      FREE EXPRESS
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600">
                    Dispatched from Infinito Central Hub to PIN <strong>{pincodeResult.code}</strong>.
                  </p>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-200/80 space-y-1.5 text-[11px] text-gray-600">
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-600" />
                  <span>100% Original Products directly from Infinito Comics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-600" />
                  <span>Pay on Delivery may be available</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={12} className="text-emerald-600" />
                  <span>Easy 7-day returns & exchanges</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-200 my-6" />

            {/* 8. PRODUCT DETAILS & SPECIFICATIONS (as in ss4) */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-2">
                Product Details
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>

              {/* Material & Care */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">
                  Material & Care
                </h4>
                <p className="text-xs text-gray-600">100% Breathable Cotton | Machine Wash Cold</p>
              </div>

              {/* Specifications 2-Column Grid */}
              <div className="mt-5 pt-3 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
                  Specifications
                </h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
                  {specsList.slice(0, showMoreSpecs ? specsList.length : 6).map((spec, i) => (
                    <div key={i} className="border-b border-gray-100 pb-2">
                      <p className="text-[11px] text-gray-400 font-medium">{spec.label}</p>
                      <p className="font-semibold text-gray-900 mt-0.5">{spec.value}</p>
                    </div>
                  ))}
                </div>

                {specsList.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowMoreSpecs((prev) => !prev)}
                    className="mt-3 text-xs text-[#DD1215] font-bold hover:underline cursor-pointer"
                  >
                    {showMoreSpecs ? "See Less" : "See More"}
                  </button>
                )}
              </div>

              {/* Product Code / SKU & Seller */}
              <div className="mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1">
                <p>Product Code: <span className="font-mono font-semibold text-gray-700">{product.sku}</span></p>
                <p>Seller: <span className="font-semibold text-gray-700">Infinito Comics Direct</span></p>
              </div>

            </div>

          </div>
        </div>

        {/* ─── RATINGS & REVIEWS SECTION (ss4 Style) ─────────────────── */}
        <div ref={reviewsSectionRef} className="mt-16 pt-10 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
                  Ratings & Reviews
                </h2>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Verified Customer Feedback</p>
            </div>

            <button
              type="button"
              onClick={() => setReviewModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded transition shadow cursor-pointer self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Write a Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left: Overall Score & Distribution */}
            <div className="md:col-span-5 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-200">
                <div className="text-4xl sm:text-5xl font-black text-gray-900">
                  {ratingStats.average > 0 ? ratingStats.average : "—"}
                </div>
                <div>
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(ratingStats.average)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    {ratingStats.total} Verified {ratingStats.total === 1 ? "Buyer" : "Buyers"}
                  </p>
                </div>
              </div>

              {/* Star Bars */}
              <div className="space-y-2 text-xs">
                {ratingStats.breakdown.map((item) => (
                  <div key={item.star} className="flex items-center gap-2.5">
                    <span className="w-6 font-bold text-gray-700">{item.star}★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-gray-500 font-medium">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Reviews List */}
            <div className="md:col-span-7">
              {reviewsData.reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviewsData.reviews.map((rev, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-700 text-white text-[11px] font-bold rounded">
                            {rev.rating} <Star className="w-2.5 h-2.5 fill-white text-white" />
                          </span>
                          {rev.headline && (
                            <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                              {rev.headline}
                            </h4>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "Recent"}
                        </span>
                      </div>

                      <p className="text-xs text-gray-700 leading-relaxed">
                        {rev.comment}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-800">{rev.userName || "Verified Buyer"}</span>
                          {rev.verified !== false && (
                            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 hover:text-gray-700 cursor-pointer">
                          <ThumbsUp size={12} />
                          <span>Helpful ({rev.likes || 0})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center">
                  <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-gray-900">No Reviews Yet</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                    Be the first customer to share your thoughts and rate this product for the community!
                  </p>
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(true)}
                    className="px-5 py-2 bg-[#DD1215] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded transition shadow cursor-pointer"
                  >
                    Write the First Review
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ─── BOTTOM SECTION: SIMILAR PRODUCTS (ss5 Style, exactly 2 rows) ─── */}
        {suggested.length > 0 && (
          <div className="mt-20 pt-10 border-t border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
                  Similar Products
                </h2>
                {product.category && (
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                    From {product.categoryName || product.category}
                  </p>
                )}
              </div>
            </div>

            {/* Exactly 2 lines: 4 items per row on desktop = 8 items total */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {suggested.slice(0, 8).map((item) => {
                const itemImg =
                  item.image ||
                  fallbackCategoryImages[item.category?.toLowerCase()] ||
                  fallbackImg;
                const itemPrice = Number(item.price || item.salePrice || item.basePrice || 0);
                const itemMrp = item.mrp || Math.round(itemPrice * 1.6);
                const itemDisc = Math.round(((itemMrp - itemPrice) / itemMrp) * 100);

                return (
                  <div
                    key={item._id || item.id}
                    onClick={() => handleSelectSuggested(item)}
                    className="border border-gray-200 rounded overflow-hidden bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                  >
                    {/* Image Box */}
                    <div className="relative w-full aspect-[4/5] bg-gray-50 overflow-hidden flex items-center justify-center">
                      <SafeImage
                        src={itemImg}
                        alt={item.title || item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        fallback={fallbackCategoryImages["tshirts"]}
                      />

                      {/* Floating Wishlist Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const added = toggleWishlist(item);
                          setWishlistVersion((v) => v + 1);
                          if (added) {
                            toast.success("Added to Wishlist!");
                          } else {
                            toast.info("Removed from Wishlist");
                          }
                        }}
                        className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition shadow-md cursor-pointer ${
                          isInWishlist(item._id || item.id)
                            ? "bg-[#DD1215] text-white scale-110"
                            : "bg-white/85 hover:bg-white text-gray-700 hover:text-[#DD1215]"
                        }`}
                        title={isInWishlist(item._id || item.id) ? "Remove from Wishlist" : "Save to Wishlist"}
                        aria-label={isInWishlist(item._id || item.id) ? "Remove from Wishlist" : "Save to Wishlist"}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isInWishlist(item._id || item.id) ? "fill-white text-white" : ""}`} />
                      </button>

                      {/* Myntra-style Rating pill floating on image */}
                      <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded text-[11px] font-bold text-gray-900 flex items-center gap-1 shadow-sm">
                        <span>{item.rating || 4.2}</span>
                        <Star className="w-2.5 h-2.5 text-emerald-600 fill-emerald-600" />
                      </div>
                    </div>

                    {/* Card Content (ss5 format) */}
                    <div className="p-3.5 bg-white flex flex-col justify-between flex-grow">
                      <div>
                        <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-wide">
                          INFINITO
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-1 mt-0.5 font-normal">
                          {item.title || item.name}
                        </p>
                      </div>

                      <div className="mt-2.5 flex items-baseline gap-2">
                        <span className="font-bold text-xs sm:text-sm text-gray-900">
                          Rs. {itemPrice}
                        </span>
                        {itemMrp > itemPrice && (
                          <>
                            <span className="text-[11px] text-gray-400 line-through">
                              Rs. {itemMrp}
                            </span>
                            <span className="text-[11px] font-bold text-orange-600">
                              ({itemDisc}% OFF)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Buttons as requested:
                1. View all products from this category
                2. View all products page */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {product.category && (
                <button
                  type="button"
                  onClick={() => navigate(`/shop/category/${product.category}`)}
                  className="w-full sm:w-auto px-6 py-3 border-2 border-black text-black hover:bg-black hover:text-white font-bold text-xs uppercase tracking-wider transition rounded cursor-pointer"
                >
                  View All From This Category
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate("/shop")}
                className="w-full sm:w-auto px-8 py-3 bg-[#DD1215] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition rounded shadow cursor-pointer"
              >
                View All Products
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ─── MODAL: WRITE A REVIEW ──────────────────────────────────── */}
      {reviewModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setReviewModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                Write a Review
              </h3>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                      className="p-1 cursor-pointer transition transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= reviewForm.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-gray-700 ml-2">
                    {reviewForm.rating} of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={reviewForm.userName}
                  onChange={(e) => setReviewForm({ ...reviewForm, userName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  value={reviewForm.headline}
                  onChange={(e) => setReviewForm({ ...reviewForm, headline: e.target.value })}
                  placeholder="e.g. Great quality and perfect fit!"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Your Review *
                </label>
                <textarea
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share details about the fit, fabric quality, comfort, and why you liked this product..."
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 bg-[#DD1215] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-red-700 disabled:opacity-50 cursor-pointer shadow"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: SIZE CHART ──────────────────────────────────────── */}
      {showSizeChart && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowSizeChart(false)}
        >
          <div
            className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                Size Chart (Inches)
              </h3>
              <button
                type="button"
                onClick={() => setShowSizeChart(false)}
                className="text-gray-400 hover:text-gray-900 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-2.5 px-3 font-bold text-gray-700">Size</th>
                    <th className="py-2.5 px-3 font-bold text-gray-700">Chest</th>
                    <th className="py-2.5 px-3 font-bold text-gray-700">Length</th>
                    <th className="py-2.5 px-3 font-bold text-gray-700">Sleeve</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-3 font-bold">XS</td>
                    <td className="py-2 px-3 text-gray-600">36"</td>
                    <td className="py-2 px-3 text-gray-600">26"</td>
                    <td className="py-2 px-3 text-gray-600">7.5"</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3 font-bold">S</td>
                    <td className="py-2 px-3 text-gray-600">38"</td>
                    <td className="py-2 px-3 text-gray-600">27"</td>
                    <td className="py-2 px-3 text-gray-600">8.0"</td>
                  </tr>
                  <tr className="border-b bg-red-50">
                    <td className="py-2 px-3 font-bold text-[#DD1215]">M (Standard)</td>
                    <td className="py-2 px-3 text-gray-700 font-semibold">40"</td>
                    <td className="py-2 px-3 text-gray-700 font-semibold">28"</td>
                    <td className="py-2 px-3 text-gray-700 font-semibold">8.5"</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3 font-bold">L</td>
                    <td className="py-2 px-3 text-gray-600">42"</td>
                    <td className="py-2 px-3 text-gray-600">29"</td>
                    <td className="py-2 px-3 text-gray-600">9.0"</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3 font-bold">XL</td>
                    <td className="py-2 px-3 text-gray-600">44"</td>
                    <td className="py-2 px-3 text-gray-600">30"</td>
                    <td className="py-2 px-3 text-gray-600">9.5"</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold">XXL</td>
                    <td className="py-2 px-3 text-gray-600">46"</td>
                    <td className="py-2 px-3 text-gray-600">31"</td>
                    <td className="py-2 px-3 text-gray-600">10.0"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-gray-500 mt-4">
              * Measurements are in inches. Regular relaxed fit tailored for streetwear.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopProduct;
