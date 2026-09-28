import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Star, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import {
  fetchProductBySlug,
  fetchProductsByCategory,
} from "../../services/productService";
import { addToCart } from "../../redux/cartSlice";

// Small helper: an <img> that falls back to a placeholder when the URL
// fails to load (broken file, wrong MIME, etc.).
const SafeImage = ({ src, alt, className, placeholder }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);
  if (!src || failed) {
    return placeholder || null;
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
};

const ShopProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Router path is /product/:productId, but we pass the product slug when
  // navigating from ShopMain / category pages. The route param name stays
  // `productId` for backward compatibility with existing links.
  const { productId: slug } = useParams();

  const [product, setProduct] = useState(null);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showSizeChart, setShowSizeChart] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setProduct(null);
      setSuggested([]);
      setActiveImage(0);
      setSelectedSize(null);

      const p = await fetchProductBySlug(slug);
      if (cancelled) return;
      setProduct(p);

      if (p?.category) {
        const related = await fetchProductsByCategory(p.category);
        if (cancelled) return;
        // Drop the current product from the Suggested rail.
        setSuggested(related.filter((rp) => rp.slug !== p.slug).slice(0, 4));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Derive size options from a "Size" variant if the admin defined one.
  const sizeOptions = useMemo(() => {
    if (!product?.variants) return [];
    const sizeVariant = product.variants.find(
      (v) => v?.name && v.name.toLowerCase().includes("size")
    );
    if (!sizeVariant?.options) return [];
    return sizeVariant.options
      .map((o) => o?.value)
      .filter(Boolean);
  }, [product]);

  if (loading) {
    return (
      <div className="w-full py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#DD1215]" />
        <p className="mt-4 text-gray-500">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full py-24 text-center">
        <p className="text-gray-500">Product not found.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-6 py-2 bg-[#DD1215] text-white rounded"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (sizeOptions.length > 0 && !selectedSize) {
      toast.error("Please select a size first");
      return;
    }
    dispatch(
      addToCart({
        productId: product._id || product.id,
        size: selectedSize || null,
        quantity: 1,
        product: {
          id: product._id || product.id,
          name: product.name,
          title: product.title,
          price: product.price,
          image: product.image,
        },
      })
    );
    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    if (sizeOptions.length > 0 && !selectedSize) {
      toast.error("Please select a size first");
      return;
    }
    dispatch(
      addToCart({
        productId: product._id || product.id,
        size: selectedSize || null,
        quantity: 1,
        product: {
          id: product._id || product.id,
          name: product.name,
          title: product.title,
          price: product.price,
          image: product.image,
        },
      })
    );
    navigate("/cart");
  };

  // Build a gallery from the backend `images` array (already resolved to
  // absolute URLs by mapBackendProduct). Falls back to the primary image
  // repeated so the thumbnail row still renders a nice grid.
  const gallery = useMemo(() => {
    const raw =
      (product.gallery && product.gallery.length > 0)
        ? product.gallery.filter(Boolean)
        : product.image ? [product.image] : [];
    if (raw.length === 0) return ["", "", "", ""];
    // Pad to at least 4 slots for the thumbnail row layout.
    const padded = [...raw];
    while (padded.length < 4) padded.push(raw[0]);
    return padded;
  }, [product]);

  const activeSrc = gallery[activeImage] || product.image || "";
  const ratingBreakdown = product.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const maxRating = Math.max(1, ...Object.values(ratingBreakdown));
  const rating = product.rating || 0;
  const reviewsCount = product.reviewsCount || 0;
  const specs = product.specs || {};

  return (
    <div className="w-full bg-white text-black">
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* LEFT: Images */}
          <div>
            <div className="w-full aspect-square bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
              <SafeImage
                src={activeSrc}
                alt={product.title}
                className="w-full h-full object-cover"
                placeholder={<span className="text-gray-400">Product Image</span>}
              />
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              {gallery.slice(0, 3).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square bg-gray-100 border rounded-md overflow-hidden ${
                    activeImage === i ? "border-[#DD1215] border-2" : "border-gray-200"
                  }`}
                >
                  <SafeImage
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                    placeholder={
                      <span className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        {i + 1}
                      </span>
                    }
                  />
                </button>
              ))}
              <button className="aspect-square bg-gray-100 border border-gray-200 rounded-md flex flex-col items-center justify-center text-gray-600 hover:bg-gray-200 transition">
                <span className="text-2xl font-bold">
                  +{Math.max(0, gallery.length - 3)}
                </span>
                <span className="text-xs">more</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Details */}
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wide">
              {product.name}
            </h1>
            {product.title && (
              <p className="mt-2 text-lg text-gray-800 font-medium">{product.title}</p>
            )}
            <p className="mt-4 text-sm md:text-base text-gray-700 leading-relaxed">
              {product.description}
            </p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-black">₹{product.price}</span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-lg text-gray-400 line-through">
                  MRP ₹{product.mrp}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>

            {sizeOptions.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold">Select Size</h3>
                  <button
                    onClick={() => setShowSizeChart(true)}
                    className="text-sm text-[#DD1215] hover:underline flex items-center gap-1"
                  >
                    Size Chart <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-[70px] h-[70px] border rounded-md font-semibold text-lg transition ${
                        selectedSize === size
                          ? "border-[#DD1215] border-2 bg-red-50 text-[#DD1215]"
                          : "border-gray-300 hover:border-gray-500"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                onClick={handleAddToCart}
                className="py-4 border-2 border-black text-black font-bold text-sm uppercase tracking-wide hover:bg-black hover:text-white transition"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="py-4 bg-[#DD1215] hover:bg-red-700 text-white font-bold text-sm uppercase tracking-wide transition"
              >
                Buy Now
              </button>
            </div>

            {Object.keys(specs).length > 0 && (
              <div className="mt-10">
                <h3 className="text-xl font-bold mb-4">Specification</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  {Object.entries(specs).map(([label, value]) => (
                    <div key={label} className="border-b border-gray-200 pb-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        {label}
                      </p>
                      <p className="text-base font-semibold mt-1">{value}</p>
                    </div>
                  ))}
                </div>
                <button className="mt-4 text-sm text-[#DD1215] hover:underline">
                  See more
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        {reviewsCount > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-2xl">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl font-bold">{rating}</span>
                  <span className="text-gray-500 text-sm">
                    ({reviewsCount} reviews)
                  </span>
                </div>

                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = ratingBreakdown[stars] || 0;
                    const width = (count / maxRating) * 100;
                    return (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="w-4 text-sm">{stars}</span>
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-12 text-right">
                          ({count})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suggested */}
        {suggested.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Suggested</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {suggested.map((p) => (
                <div
                  key={p._id || p.id}
                  onClick={() => navigate(`/product/${p.slug || p._id || p.id}`)}
                  className="cursor-pointer group border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition-shadow bg-white"
                >
                  <div className="w-full h-[240px] bg-gray-100 flex items-center justify-center">
                    <SafeImage
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      placeholder={<span className="text-gray-400 text-sm">Product Image</span>}
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-widest text-[#DD1215] font-bold">
                      {p.name}
                    </p>
                    <p className="text-sm text-gray-800 mt-1 line-clamp-1">
                      {p.title}
                    </p>
                    <p className="text-lg font-bold mt-2">Rs.{p.price}/-</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showSizeChart && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setShowSizeChart(false)}
        >
          <div
            className="bg-white rounded-lg max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Size Chart</h3>
              <button
                onClick={() => setShowSizeChart(false)}
                className="text-2xl text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Add your size chart image or table here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopProduct;
