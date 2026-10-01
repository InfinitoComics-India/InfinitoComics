import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Share2, ShoppingCart, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import {
  fetchProductBySlug,
  fetchProductsByCategory,
  fetchProducts,
  fallbackCategoryImages,
} from "../../services/productService";
import { addToCart } from "../../redux/cartSlice";

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
  // ─── STRICT TOP-LEVEL HOOK DECLARATIONS (NEVER CONDITIONAL) ─────────────
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { productId: slug } = useParams();

  const [product, setProduct] = useState(null);
  const [suggested, setSuggested] = useState([]);
  const [visibleSuggestedCount, setVisibleSuggestedCount] = useState(4);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showMoreSpecs, setShowMoreSpecs] = useState(false);

  // 1. Fetch Product & Category-Filtered Suggested Products
  useEffect(() => {
    let cancelled = false;

    const loadProductData = async () => {
      setLoading(true);
      setProduct(null);
      setSuggested([]);
      setVisibleSuggestedCount(4);
      setActiveImage(0);

      try {
        const p = await fetchProductBySlug(slug);
        if (cancelled) return;

        setProduct(p);

        if (p) {
          // Select first available size if product has defined sizes
          if (Array.isArray(p.sizes) && p.sizes.length > 0) {
            setSelectedSize(p.sizes[0]);
          } else {
            setSelectedSize("M");
          }

          // Category-matched suggested products
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

          // If there are fewer than 8 in the category, supplement with catalog products
          // so that clicking "View More" can cleanly reveal another line of 4 products.
          const all = await fetchProducts();
          const others = (all || []).filter(
            (item) =>
              String(item._id || item.id) !== String(p._id || p.id) &&
              String(item.slug || "") !== String(p.slug || "") &&
              !related.some((r) => String(r._id || r.id) === String(item._id || item.id))
          );
          const shuffledOthers = [...others].sort(() => 0.5 - Math.random());
          const combined = [...related, ...shuffledOthers];
          setSuggested(combined);
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

  // 2. Size Options Memo (ALWAYS at top level)
  const sizeOptions = useMemo(() => {
    if (product?.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes;
    }
    return ["XS", "S", "M", "L", "XL", "XXL"];
  }, [product]);

  // 3. Gallery Images Memo (ALWAYS at top level)
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
      return [fallback, fallback, fallback];
    }
    // Pad to 3 previews if only 1 is uploaded, so the thumbnail grid matches design
    const padded = [...list];
    while (padded.length < 3) {
      padded.push(list[0]);
    }
    return padded;
  }, [product]);

  // 4. Specs Memo (ALWAYS at top level)
  const specsList = useMemo(() => {
    if (!product) return [];
    if (product.specs && typeof product.specs === "object" && Object.keys(product.specs).length > 0) {
      return Object.entries(product.specs).map(([label, value]) => ({ label, value }));
    }
    return [
      { label: "Sleeve Length", value: "Half Sleeve" },
      { label: "Fit", value: "Regular Fit" },
      { label: "Length", value: "Regular" },
      { label: "Transparency", value: "Opaque" },
    ];
  }, [product]);

  // ─── ACTION HANDLERS ────────────────────────────────────────────────────
  const handleAddToCart = (item = product) => {
    if (!item) return;
    const cleanPrice = Number(item.price || item.salePrice || item.basePrice || 1299);
    const cleanMrp = Number(item.mrp || item.basePrice || Math.round(cleanPrice * 1.6));
    dispatch(
      addToCart({
        productId: item._id || item.id,
        size: selectedSize || "M",
        quantity: 1,
        product: {
          id: item._id || item.id,
          name: item.name || "INFINITO",
          title: item.title || item.name || "INFINITO",
          price: cleanPrice,
          mrp: cleanMrp,
          image: item.image,
          description: item.description || item.shortDescription || "The Special Edition Crimson Red T-Shirt is designed to capture the energy, passion, and spirit of INFINITO.",
          rating: item.rating || 4.5,
        },
      })
    );
    toast.success(`Added ${item.title || item.name || "item"} (${selectedSize}) to cart!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    handleAddToCart(product);
    navigate("/cart");
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

  const handleSelectSuggested = (item) => {
    const target = item.slug || item._id || item.id;
    navigate(`/product/${target}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── LOADING & NOT FOUND STATES ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full min-h-[70vh] bg-white flex flex-col items-center justify-center text-gray-500 font-dmsans">
        <div className="w-12 h-12 border-4 border-[#DD1215] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-wider text-gray-700">Loading Product Details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full min-h-[60vh] bg-white flex flex-col items-center justify-center text-gray-700 font-dmsans px-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6 max-w-md">
          The product you are looking for does not exist or may have been updated.
        </p>
        <button
          onClick={() => navigate("/")}
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
    <div className="w-full bg-white text-black font-dmsans min-h-screen py-8 md:py-12">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* TOP SECTION: 2-COLUMN PRODUCT DISPLAY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          
          {/* ─── LEFT COLUMN: IMAGES & REVIEWS ───────────────────────────── */}
          <div>
            {/* Main Product Image */}
            <div className="relative w-full aspect-square bg-[#0a0a0a] rounded-lg overflow-hidden flex items-center justify-center shadow-sm border border-gray-100">
              <SafeImage
                src={activeSrc}
                alt={product.title}
                className="w-full h-full object-cover"
                fallback={fallbackImg}
              />
            </div>

            {/* Thumbnail Carousel Row */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              {gallery.slice(0, 3).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square bg-gray-100 rounded-md overflow-hidden transition cursor-pointer ${
                    activeImage === idx
                      ? "border-2 border-[#DD1215] shadow-sm"
                      : "border border-gray-200 hover:border-gray-400"
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

              {/* +5 more block */}
              <button
                onClick={() => {
                  if (gallery.length > 3) {
                    setActiveImage((prev) => (prev + 1) % gallery.length);
                  } else {
                    toast.info("Viewing product gallery");
                  }
                }}
                className="aspect-square bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-md flex flex-col items-center justify-center text-gray-700 transition cursor-pointer"
              >
                <span className="text-xl md:text-2xl font-black text-black">
                  +{gallery.length > 3 ? gallery.length - 3 : 5}
                </span>
                <span className="text-xs text-gray-500 font-semibold lowercase">more</span>
              </button>
            </div>

            {/* Reviews Section */}
            <div className="mt-10 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl md:text-2xl font-bold text-black tracking-tight">Reviews</h3>
                <div className="bg-[#DD1215] text-white px-3 py-1 font-bold text-sm flex items-center gap-1 rounded shadow-sm">
                  ★ {product.rating || 4.5}
                </div>
              </div>

              {/* Rating Star Bars */}
              <div className="space-y-2.5">
                {[
                  { star: 5, pct: "90%", count: product.reviewsCount || 35 },
                  { star: 4, pct: "85%", count: product.reviewsCount || 35 },
                  { star: 3, pct: "55%", count: product.reviewsCount || 35 },
                  { star: 2, pct: "35%", count: product.reviewsCount || 35 },
                  { star: 1, pct: "15%", count: product.reviewsCount || 35 },
                ].map((item) => (
                  <div key={item.star} className="flex items-center gap-3 text-sm">
                    <span className="w-6 font-semibold text-black">{item.star}★</span>
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#DD1215] rounded-full"
                        style={{ width: item.pct }}
                      />
                    </div>
                    <span className="w-8 text-right text-gray-500 font-medium text-xs">
                      ({item.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: DETAILS & CTAS ────────────────────────────── */}
          <div className="flex flex-col">
            {/* Title & Share Icon Header */}
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif]">
                INFINITO
              </h1>
              <button
                onClick={handleShare}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition cursor-pointer"
                title="Share Product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Subtitle / Product Title if distinct */}
            {product.title && product.title !== "INFINITO" && (
              <h2 className="text-base md:text-lg font-bold text-gray-800 mt-1">
                {product.title}
              </h2>
            )}

            {/* Description */}
            <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed font-normal">
              {product.description}
            </p>

            {/* Price Block */}
            <div className="mt-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl md:text-4xl font-black text-black">
                  ₹{product.price}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <span className="text-base md:text-lg text-gray-400 line-through font-normal">
                    MRP ₹{product.mrp}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">Inclusive of all taxes</p>
            </div>

            {/* Select Size */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-base text-black">Select Size</h4>
                <button
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
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-[50px] px-3 h-12 flex items-center justify-center font-bold text-sm rounded-none transition cursor-pointer ${
                      selectedSize === sz
                        ? "bg-[#DD1215] text-white shadow-sm"
                        : "bg-[#E5E7EB] text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons (Add to Cart & Buy Now) */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAddToCart(product)}
                className="w-full py-3.5 border-2 border-[#DD1215] text-[#DD1215] font-bold text-sm tracking-wide uppercase hover:bg-red-50 transition cursor-pointer text-center rounded-none"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 bg-[#DD1215] text-white font-bold text-sm tracking-wide uppercase hover:bg-red-700 transition cursor-pointer text-center rounded-none shadow-sm"
              >
                Buy Now
              </button>
            </div>

            {/* Specification Section */}
            <div className="mt-8 pt-4 border-t border-gray-100">
              <h3 className="text-lg font-bold text-black pb-2">Specification</h3>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-3 border-y border-gray-200 text-sm">
                {/* Column 1 */}
                <div className="space-y-4">
                  {specsList.slice(0, Math.ceil(specsList.length / 2)).map((spec, i) => (
                    <div key={i}>
                      <p className="text-xs text-gray-400 font-medium">{spec.label}</p>
                      <p className="font-bold text-black text-sm mt-0.5">{spec.value}</p>
                    </div>
                  ))}
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  {specsList.slice(Math.ceil(specsList.length / 2)).map((spec, i) => (
                    <div key={i}>
                      <p className="text-xs text-gray-400 font-medium">{spec.label}</p>
                      <p className="font-bold text-black text-sm mt-0.5">{spec.value}</p>
                    </div>
                  ))}
                  {/* Default fallback rows matching screenshot if specs are short */}
                  {specsList.length <= 4 && (
                    <>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Sleeve Length</p>
                        <p className="font-bold text-black text-sm mt-0.5">Half Sleeve</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Transparency</p>
                        <p className="font-bold text-black text-sm mt-0.5">Opaque</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Extended Specs on Toggle */}
              {showMoreSpecs && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-3 border-b border-gray-200 text-sm animate-fadeIn">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Material</p>
                    <p className="font-bold text-black text-sm mt-0.5">100% Cotton</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Wash Care</p>
                    <p className="font-bold text-black text-sm mt-0.5">Machine Wash Cold</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Country of Origin</p>
                    <p className="font-bold text-black text-sm mt-0.5">India</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Occasion</p>
                    <p className="font-bold text-black text-sm mt-0.5">Casual Streetwear</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowMoreSpecs((prev) => !prev)}
                className="mt-3 text-sm text-[#DD1215] font-bold hover:underline cursor-pointer"
              >
                {showMoreSpecs ? "See less" : "See more"}
              </button>
            </div>

          </div>
        </div>

        {/* ─── BOTTOM SECTION: SUGGESTED PRODUCTS (CATEGORY-FILTERED) ─── */}
        {suggested.length > 0 && (
          <div className="mt-16 md:mt-20 pt-10 border-t border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-black">Suggested</h2>
              {product.category && (
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded">
                  {product.categoryName || product.category}
                </span>
              )}
            </div>

            {/* Suggested Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {suggested.slice(0, visibleSuggestedCount).map((item) => {
                const itemImg =
                  item.image ||
                  fallbackCategoryImages[item.category?.toLowerCase()] ||
                  fallbackImg;

                return (
                  <div
                    key={item._id || item.id}
                    onClick={() => handleSelectSuggested(item)}
                    className="border border-gray-200 rounded-none overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                  >
                    {/* Image Box */}
                    <div className="relative w-full aspect-square bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
                      <SafeImage
                        src={itemImg}
                        alt={item.title || item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        fallback={fallbackImg}
                      />
                      {/* Floating Cart Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item);
                        }}
                        className="absolute top-2.5 right-2.5 w-8 h-8 bg-black/70 hover:bg-[#DD1215] text-white flex items-center justify-center rounded transition shadow cursor-pointer"
                        title="Add to cart"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 bg-white flex flex-col justify-between flex-grow">
                      <div>
                        <h3 className="font-extrabold text-sm text-black uppercase tracking-wide font-dmsans">
                          {item.name || "INFINITO"}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-1 mt-1 font-medium">
                          {item.title || item.name}
                        </p>
                      </div>
                      <p className="font-bold text-sm text-black mt-3">
                        Rs.{item.price}/-
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View More Button - reveals another line of 4 products */}
            {suggested.length > visibleSuggestedCount && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => {
                    setVisibleSuggestedCount((prev) => prev + 4);
                  }}
                  className="px-8 py-3 bg-[#DD1215] hover:bg-red-700 text-white font-bold text-sm uppercase tracking-wider transition shadow-md cursor-pointer rounded-none"
                >
                  View More
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Size Chart Modal */}
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
              <h3 className="text-xl font-bold text-black">Size Chart (Inches)</h3>
              <button
                onClick={() => setShowSizeChart(false)}
                className="text-2xl text-gray-500 hover:text-black font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
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
                    <td className="py-2.5 px-3 font-bold">XS</td>
                    <td className="py-2.5 px-3 text-gray-600">36"</td>
                    <td className="py-2.5 px-3 text-gray-600">26"</td>
                    <td className="py-2.5 px-3 text-gray-600">7.5"</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2.5 px-3 font-bold">S</td>
                    <td className="py-2.5 px-3 text-gray-600">38"</td>
                    <td className="py-2.5 px-3 text-gray-600">27"</td>
                    <td className="py-2.5 px-3 text-gray-600">8.0"</td>
                  </tr>
                  <tr className="border-b bg-red-50">
                    <td className="py-2.5 px-3 font-bold text-[#DD1215]">M (Standard)</td>
                    <td className="py-2.5 px-3 text-gray-700 font-semibold">40"</td>
                    <td className="py-2.5 px-3 text-gray-700 font-semibold">28"</td>
                    <td className="py-2.5 px-3 text-gray-700 font-semibold">8.5"</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2.5 px-3 font-bold">L</td>
                    <td className="py-2.5 px-3 text-gray-600">42"</td>
                    <td className="py-2.5 px-3 text-gray-600">29"</td>
                    <td className="py-2.5 px-3 text-gray-600">9.0"</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2.5 px-3 font-bold">XL</td>
                    <td className="py-2.5 px-3 text-gray-600">44"</td>
                    <td className="py-2.5 px-3 text-gray-600">30"</td>
                    <td className="py-2.5 px-3 text-gray-600">9.5"</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">XXL</td>
                    <td className="py-2.5 px-3 text-gray-600">46"</td>
                    <td className="py-2.5 px-3 text-gray-600">31"</td>
                    <td className="py-2.5 px-3 text-gray-600">10.0"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              * Measurements are in inches. Regular relaxed fit tailored for streetwear.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopProduct;
