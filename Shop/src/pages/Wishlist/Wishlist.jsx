import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Heart, ShoppingBag, Trash2, ArrowLeft, ArrowRight, Sparkles, Plus, Minus } from "lucide-react";
import { addToCart } from "../../redux/cartSlice.js";
import { getWishlist, removeFromWishlist, clearWishlist } from "../../services/wishlistService.js";
import { toast } from "react-toastify";

const WishlistCard = ({ prod, onRemove, onMoveToBag, navigate }) => {
  const pid = prod.id || prod._id;
  const availableSizes = Array.isArray(prod.sizes) && prod.sizes.length > 0
    ? prod.sizes
    : ["XS", "S", "M", "L", "XL", "XXL"];
  const [selectedSize, setSelectedSize] = useState(prod.size || availableSizes[0] || "M");

  const availableColors = Array.isArray(prod.colors) && prod.colors.length > 0
    ? prod.colors
    : ["Black", "Crimson Red", "White", "Navy"];
  const [selectedColor, setSelectedColor] = useState(prod.color || availableColors[0] || "Black");
  const [quantity, setQuantity] = useState(1);

  const img =
    prod.image ||
    prod.thumbnail ||
    (Array.isArray(prod.images) && prod.images[0]?.url) ||
    (Array.isArray(prod.images) && typeof prod.images[0] === "string" ? prod.images[0] : null) ||
    "/products/crimson_tshirt.jpg";
  const price = Number(prod.salePrice || prod.price || 0);
  const mrp = Number(prod.originalPrice || prod.mrp || 0);
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group">
      {/* Image container */}
      <div
        className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer"
        onClick={() => navigate(`/product/${prod.slug || pid}`)}
      >
        <img
          src={img}
          alt={prod.name || prod.title || "Product"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/products/crimson_tshirt.jpg";
          }}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(pid);
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-500 hover:text-red-600 shadow flex items-center justify-center transition cursor-pointer"
          title="Remove from Wishlist"
        >
          <Trash2 size={15} />
        </button>
        {discount > 0 && (
          <span className="absolute bottom-2.5 left-2.5 bg-[#DD1215] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] uppercase font-mono tracking-widest text-[#DD1215] font-bold">
          {prod.category?.name || prod.category || "Official Merch"}
        </p>
        <h3
          className="text-sm font-bold text-gray-900 mt-1 line-clamp-1 cursor-pointer hover:text-[#DD1215] transition"
          onClick={() => navigate(`/product/${prod.slug || pid}`)}
        >
          {prod.name || prod.title || "Infinito Merchandise"}
        </h3>

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-base font-black text-gray-900">
            ₹{price.toLocaleString("en-IN")}
          </span>
          {mrp > price && (
            <span className="text-xs text-gray-400 line-through">
              ₹{mrp.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Size Selector */}
        {availableSizes.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Select Size:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded transition cursor-pointer ${
                    selectedSize === sz
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Selector */}
        {availableColors.length > 0 && (
          <div className="mt-2.5">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Select Color:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {availableColors.map((clr) => {
                const isSelected = String(selectedColor).toLowerCase() === clr.toLowerCase();
                return (
                  <button
                    key={clr}
                    type="button"
                    onClick={() => setSelectedColor(clr)}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded transition cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full border border-gray-300 ${
                        clr.toLowerCase().includes("black")
                          ? "bg-black"
                          : clr.toLowerCase().includes("red")
                          ? "bg-[#DD1215]"
                          : clr.toLowerCase().includes("white")
                          ? "bg-white"
                          : clr.toLowerCase().includes("navy")
                          ? "bg-blue-900"
                          : "bg-gray-400"
                      }`}
                    />
                    {clr}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Quantity:
          </span>
          <div className="flex items-center border border-gray-200 rounded overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-6 h-6 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-40 transition font-bold text-gray-700 cursor-pointer"
              title="Decrease quantity"
            >
              <Minus size={11} />
            </button>
            <span className="w-7 text-center font-bold text-xs text-black">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-6 h-6 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition font-bold text-gray-700 cursor-pointer"
              title="Increase quantity"
            >
              <Plus size={11} />
            </button>
          </div>
        </div>

        {/* Move to Bag Button */}
        <div className="mt-auto pt-3 flex gap-2">
          <button
            type="button"
            onClick={() => onMoveToBag({ ...prod, size: selectedSize, color: selectedColor, quantity })}
            className="flex-1 bg-black hover:bg-[#DD1215] text-white font-bold text-xs uppercase tracking-wider py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <ShoppingBag size={14} /> Move to Bag ({selectedSize} • {selectedColor})
          </button>
        </div>
      </div>
    </div>
  );
};

const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [items, setItems] = useState(() => getWishlist());

  useEffect(() => {
    const handleUpdate = () => setItems(getWishlist());
    window.addEventListener("wishlist_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("wishlist_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleRemove = (productId) => {
    const updated = removeFromWishlist(productId);
    setItems(updated);
    toast.info("Removed from Wishlist");
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear your entire wishlist?")) {
      clearWishlist();
      setItems([]);
      toast.info("Wishlist cleared");
    }
  };

  const handleMoveToBag = (product) => {
    const pid = product.id || product._id;
    const size = product.size || (product.sizes && product.sizes[0]) || "M";
    const color = product.color || "Black";
    const quantity = Number(product.quantity) || 1;
    const cleanPrice = Number(product.salePrice || product.price || 1299);
    const cleanMrp = Number(product.originalPrice || product.mrp || Math.round(cleanPrice * 1.6));

    dispatch(
      addToCart({
        productId: pid,
        size,
        quantity,
        variant: {
          size,
          color,
          price: cleanPrice,
        },
        product: {
          ...product,
          id: pid,
          color,
          price: cleanPrice,
          mrp: cleanMrp,
        },
      })
    );
    removeFromWishlist(pid);
    toast.success(`Moved ${product.name || product.title || "Product"} (${size}, ${color}) to bag!`);
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-10 font-dmsans">
      <div className="max-w-[1200px] mx-auto px-4 md:px-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gray-500 mb-6">
          <Link to="/" className="hover:text-black transition flex items-center gap-1">
            <ArrowLeft size={14} /> Shop Home
          </Link>
          <span>/</span>
          <span className="text-black font-bold">My Wishlist</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-pink-600 mb-1">
              <Sparkles size={14} /> Saved Favorites
            </div>
            <h1 className="text-3xl font-black uppercase tracking-wider text-gray-900 flex items-center gap-3">
              My Wishlist
              <span className="text-sm font-bold bg-pink-100 text-pink-700 px-3 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? "Item" : "Items"}
              </span>
            </h1>
          </div>
          {items.length > 0 && (
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-red-600 transition cursor-pointer"
              >
                Clear Wishlist
              </button>
              <Link
                to="/"
                className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black flex items-center gap-1"
              >
                Continue Shopping <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-20 h-20 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-500 mx-auto mb-6">
              <Heart size={36} className="text-pink-400" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-wide text-gray-900 mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
              Explore our universe of limited edition comics, graphic tees, hoodies, and premium superhero merchandise.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#DD1215] text-white font-bold uppercase tracking-widest text-xs px-8 py-3.5 rounded-lg hover:bg-red-700 transition shadow-md"
            >
              <ShoppingBag size={16} /> Explore Store
            </Link>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((prod) => (
              <WishlistCard
                key={prod.id || prod._id}
                prod={prod}
                onRemove={handleRemove}
                onMoveToBag={handleMoveToBag}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
