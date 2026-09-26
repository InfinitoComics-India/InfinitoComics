import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Star, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import { getProductById, products } from "../../services/productService";
import { addToCart } from "../../redux/cartSlice";

const ShopProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { productId } = useParams();
  const product = getProductById(productId);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showSizeChart, setShowSizeChart] = useState(false);

  const suggested = useMemo(
    () => products.filter((p) => p.id !== productId).slice(0, 4),
    [productId]
  );

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
    if (!selectedSize) {
      toast.error("Please select a size first");
      return;
    }
    dispatch(
      addToCart({
        productId: product.id,
        size: selectedSize,
        quantity: 1,
        product: {
          id: product.id,
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
    if (!selectedSize) {
      toast.error("Please select a size first");
      return;
    }
    dispatch(
      addToCart({
        productId: product.id,
        size: selectedSize,
        quantity: 1,
        product: {
          id: product.id,
          name: product.name,
          title: product.title,
          price: product.price,
          image: product.image,
        },
      })
    );
    navigate("/cart");
  };

  const gallery =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : ["", "", "", ""];
  const maxRating = Math.max(...Object.values(product.ratingBreakdown || { 5: 1 }));

  return (
    <div className="w-full bg-white text-black">
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* LEFT: Images */}
          <div>
            <div className="w-full aspect-square bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
              {gallery[activeImage] ? (
                <img
                  src={gallery[activeImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">Product Image</span>
              )}
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
                  {img ? (
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      {i + 1}
                    </span>
                  )}
                </button>
              ))}
              <button className="aspect-square bg-gray-100 border border-gray-200 rounded-md flex flex-col items-center justify-center text-gray-600 hover:bg-gray-200 transition">
                <span className="text-2xl font-bold">+5</span>
                <span className="text-xs">more</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Details */}
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wide">
              {product.name}
            </h1>
            <p className="mt-4 text-sm md:text-base text-gray-700 leading-relaxed">
              {product.description}
            </p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-black">₹{product.price}</span>
              <span className="text-lg text-gray-400 line-through">
                MRP ₹{product.mrp}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>

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
                {product.sizes.map((size) => (
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

            <div className="mt-10">
              <h3 className="text-xl font-bold mb-4">Specification</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                {Object.entries(product.specs).map(([label, value]) => (
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
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-2xl">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold">{product.rating}</span>
                <span className="text-gray-500 text-sm">
                  ({product.reviewsCount} reviews)
                </span>
              </div>

              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = product.ratingBreakdown[stars] || 0;
                  const width = (count / maxRating) * 100;
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="w-4 text-sm">{stars}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400" style={{ width: `${width}%` }} />
                      </div>
                      <span className="text-sm text-gray-500 w-12 text-right">({count})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Suggested */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Suggested</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {suggested.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  navigate(`/product/${p.id}`);
                  setActiveImage(0);
                  setSelectedSize(null);
                }}
                className="cursor-pointer group border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition-shadow bg-white"
              >
                <div className="w-full h-[240px] bg-gray-100 flex items-center justify-center">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Product Image</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs uppercase tracking-widest text-[#DD1215] font-bold">
                    {p.name}
                  </p>
                  <p className="text-sm text-gray-800 mt-1 line-clamp-1">{p.title}</p>
                  <p className="text-lg font-bold mt-2">Rs.{p.price}/-</p>
                </div>
              </div>
            ))}
          </div>
        </div>
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
