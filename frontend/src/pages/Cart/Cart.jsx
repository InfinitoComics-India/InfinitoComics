import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Share2, ShoppingCart, Trash2, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import {
  addToCart,
  removeFromCart,
  clearCart,
  setCart,
  updateSize,
} from "../../redux/cartSlice";
import { fetchProducts } from "../../services/productService";

// Safe Image component with fallback
const SafeImage = ({ src, alt, className, fallback }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const defaultFallback =
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80";

  return (
    <img
      src={failed || !src ? fallback || defaultFallback : src}
      alt={alt || "INFINITO"}
      className={className}
      onError={() => setFailed(true)}
    />
  );
};

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart?.items || []);

  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [visibleSuggestedCount, setVisibleSuggestedCount] = useState(4);
  const [loadingSuggested, setLoadingSuggested] = useState(true);

  // ─── 1. HANDLE SHARE CART PARAMETER ON PAGE LOAD ─────────────────────────
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const shareCode = searchParams.get("share");

    if (shareCode) {
      try {
        const decodedString = decodeURIComponent(escape(atob(shareCode)));
        const parsedItems = JSON.parse(decodedString);

        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          dispatch(setCart(parsedItems));
          toast.success("Shared cart loaded successfully!");
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err) {
        console.error("Failed to decode shared cart:", err);
      }
    }
  }, [location.search, dispatch]);

  // ─── 2. FETCH REAL CATALOG PRODUCTS FOR SUGGESTIONS ──────────────────────
  useEffect(() => {
    let isMounted = true;
    const loadCatalog = async () => {
      setLoadingSuggested(true);
      try {
        const allProducts = await fetchProducts();
        if (isMounted) {
          setSuggestedProducts(allProducts || []);
        }
      } catch (err) {
        console.error("Failed to load suggested products:", err);
      } finally {
        if (isMounted) setLoadingSuggested(false);
      }
    };

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter out products already present in cart to avoid duplicate recommendations
  const filteredSuggestions = useMemo(() => {
    const inCartIds = new Set(cartItems.map((item) => String(item.productId)));
    const available = suggestedProducts.filter(
      (p) => !inCartIds.has(String(p.id || p._id || p.slug))
    );
    return available.length >= 4 ? available : suggestedProducts;
  }, [suggestedProducts, cartItems]);

  // ─── 3. CART ACTIONS ─────────────────────────────────────────────────────
  // Remove single item
  const handleRemoveItem = (item) => {
    dispatch(
      removeFromCart({
        productId: item.productId,
        size: item.size,
      })
    );
    toast.success(`Removed ${item.product?.name || item.product?.title || "item"} from cart`);
  };

  // Remove all items
  const handleRemoveAll = () => {
    if (cartItems.length === 0) return;
    dispatch(clearCart());
    toast.success("All items removed from cart");
  };

  // Buy single product (sets checkout session to only this product)
  const handleBuySingle = (item) => {
    try {
      localStorage.setItem("checkout_items", JSON.stringify([item]));
      localStorage.setItem("checkout_mode", "single");
    } catch {}
    navigate(`/checkout?mode=single&productId=${encodeURIComponent(item.productId)}&size=${encodeURIComponent(item.size)}`);
  };

  // Buy complete cart (sends all cart products to checkout)
  const handleBuyAll = () => {
    if (cartItems.length === 0) return;
    try {
      localStorage.setItem("checkout_items", JSON.stringify(cartItems));
      localStorage.setItem("checkout_mode", "cart");
    } catch {}
    navigate("/checkout?mode=cart");
  };

  // Share Cart: creates a shareable link and copies to clipboard
  const handleShareCart = () => {
    if (cartItems.length === 0) {
      toast("Add products to your cart before sharing!");
      return;
    }

    try {
      const shareData = cartItems.map((item) => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
        product: item.product,
      }));

      const base64Code = btoa(unescape(encodeURIComponent(JSON.stringify(shareData))));
      const shareUrl = `${window.location.origin}/cart?share=${base64Code}`;

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      toast.success("Cart link copied");
    } catch (err) {
      console.error("Failed to copy cart link:", err);
      toast.error("Could not copy cart link. Please try again.");
    }
  };

  // Add suggested product to cart
  const handleAddSuggestedToCart = (prod) => {
    const cleanPrice = typeof prod.price === "string"
      ? parseFloat(prod.price.replace(/[^\d.]/g, "")) || 1499
      : Number(prod.price || prod.salePrice || prod.basePrice || 1499);

    const cleanMrp = typeof prod.mrp === "string"
      ? parseFloat(prod.mrp.replace(/[^\d.]/g, "")) || Math.round(cleanPrice * 1.6)
      : Number(prod.mrp || prod.basePrice || Math.round(cleanPrice * 1.6));

    const primaryImg = (Array.isArray(prod.images) && prod.images.length > 0)
      ? (typeof prod.images[0] === "string" ? prod.images[0] : prod.images[0]?.url)
      : (prod.image || "/products/crimson_tshirt.jpg");

    dispatch(
      addToCart({
        productId: prod._id || prod.id || prod.slug,
        size: "M",
        quantity: 1,
        product: {
          id: prod._id || prod.id || prod.slug,
          name: prod.title || prod.name || "INFINITO",
          title: prod.name || prod.title || "INFINITO",
          price: cleanPrice,
          mrp: cleanMrp,
          image: primaryImg,
          description: prod.description || prod.shortDescription || "",
          rating: prod.rating || 4.5,
        },
      })
    );
    toast.success(`Added ${prod.name || prod.title || "item"} to cart!`);
  };

  // ─── 4. BILL / INVOICE CALCULATIONS (EXACT 18% TAX AS IN SS1) ────────────
  // Row total = price * quantity * 1.18
  const grandTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.product?.price || 0);
      const qty = Number(item.quantity || 1);
      const rowTotal = price * qty * 1.18;
      return sum + rowTotal;
    }, 0);
  }, [cartItems]);

  const isEmpty = cartItems.length === 0;

  return (
    <div className="bg-white min-h-screen text-black font-sans pb-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 pt-8">
        
        {/* ─── HEADER: MY CART + SHARE CART ─── */}
        <div className="flex items-center justify-between pb-6 border-b border-transparent">
          <h1 className="text-3xl md:text-4xl font-black text-black tracking-wide uppercase font-dmsans">
            MY CART
          </h1>

          <button
            onClick={handleShareCart}
            className="flex items-center gap-2 px-4 py-2 border border-black/80 hover:bg-black hover:text-white transition text-xs md:text-sm font-semibold tracking-wide cursor-pointer shadow-sm"
            title="Share this cart with a friend"
          >
            <span>Share Cart</span>
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* ─── CART ITEMS SECTION ─── */}
        {isEmpty ? (
          <div className="my-12 py-16 px-4 border border-dashed border-gray-300 rounded-none text-center bg-gray-50 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-100 text-[#DD1215] flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 text-sm max-w-md mb-6">
              Looks like you haven't added anything yet. Explore our latest official merch and streetwear below!
            </p>
            <button
              onClick={() => { window.location.href = "https://shop.infinitohq.com/"; }}
              className="px-8 py-3 bg-[#DD1215] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest transition cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            {cartItems.map((item, index) => {
              const prod = item.product || {};
              const price = Number(prod.price || 1299);
              const mrp = Number(prod.mrp || Math.round(price * 1.6));
              const title = prod.name || prod.title || "INFINITO";
              const description =
                prod.description ||
                "The Special Edition Crimson Red T-Shirt is designed to capture the energy, passion, and spirit of INFINITO. Featuring a deep crimson red color with a clean, statement-driven design, this piece is made to stand out while keeping things effortlessly wearable.";
              const rating = prod.rating || 4.5;
              const selectedSize = item.size || "M";

              return (
                <div
                  key={`${item.productId}-${item.size}-${index}`}
                  className="border border-gray-200 bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 md:gap-8 items-start"
                >
                  {/* Left Column: Product Image */}
                  <div className="w-full md:w-[260px] h-[260px] bg-[#0a0a0a] flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                    <SafeImage
                      src={prod.image}
                      alt={title}
                      className="w-full h-full object-cover"
                      fallback={"/products/crimson_tshirt.jpg"}
                    />
                  </div>

                  {/* Right Column: Details & Actions */}
                  <div className="flex-1 flex flex-col justify-between w-full h-full min-h-[260px]">
                    <div>
                      {/* Title & Star Rating */}
                      <div className="flex items-start justify-between gap-4">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-black uppercase tracking-tight font-dmsans">
                          {title}
                        </h2>
                        <span className="bg-[#DD1215] text-white text-xs font-bold px-2.5 py-1 flex items-center gap-1 shadow-sm">
                          ★ {rating}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                        {description}
                      </p>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-3 mt-4">
                        <span className="text-2xl md:text-3xl font-black text-black">
                          ₹{price}
                        </span>
                        <span className="text-sm md:text-base text-gray-500 line-through font-normal">
                          MRP ₹{mrp}
                        </span>
                      </div>

                      {/* Size Selector */}
                      <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                        <span className="text-gray-900">Select Size :</span>
                        <div className="inline-flex gap-1.5 ml-1">
                          {["XS", "S", "M", "L", "XL", "XXL"].map((sz) => (
                            <button
                              key={sz}
                              onClick={() => {
                                dispatch(
                                  updateSize({
                                    productId: item.productId,
                                    oldSize: item.size,
                                    newSize: sz,
                                  })
                                );
                              }}
                              className={`px-2.5 py-1 text-xs font-bold border transition cursor-pointer ${
                                selectedSize === sz
                                  ? "bg-black text-white border-black"
                                  : "bg-white text-gray-700 border-gray-300 hover:border-black"
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Remove & Buy Now */}
                    <div className="flex gap-4 mt-6 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleRemoveItem(item)}
                        className="flex-1 py-3 border border-[#DD1215] text-[#DD1215] hover:bg-red-50 font-bold uppercase text-xs md:text-sm tracking-wider transition cursor-pointer text-center"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => handleBuySingle(item)}
                        className="flex-1 py-3 bg-[#DD1215] hover:bg-red-700 text-white font-bold uppercase text-xs md:text-sm tracking-wider transition cursor-pointer text-center shadow-md"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ─── BILL / INVOICE TABLE (EXACT COLUMNS FROM SS1) ─── */}
            <div className="mt-10 border border-gray-300 overflow-hidden bg-white shadow-sm">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-50/50">
                    <th className="py-3 px-4 font-bold text-gray-800 w-2/5">Item</th>
                    <th className="py-3 px-4 font-bold text-gray-800 text-center">Qty</th>
                    <th className="py-3 px-4 font-bold text-gray-800 text-right">Price</th>
                    <th className="py-3 px-4 font-bold text-gray-800 text-right">Tax</th>
                    <th className="py-3 px-4 font-bold text-gray-800 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item, index) => {
                    const price = Number(item.product?.price || 0);
                    const qty = Number(item.quantity || 1);
                    const rowTotal = price * qty * 1.18;
                    const itemName = item.product?.title || item.product?.name || "INFINITO Premium Tshirt";

                    return (
                      <tr
                        key={`bill-${item.productId}-${item.size}-${index}`}
                        className="border-b border-gray-200 hover:bg-gray-50/50"
                      >
                        <td className="py-3.5 px-4 font-bold text-black">
                          {itemName} {item.size ? `(${item.size})` : ""}
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium text-gray-800">
                          {qty}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-gray-800">
                          {price}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-gray-800">
                          18%
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                          {rowTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                  {/* TOTAL ROW */}
                  <tr className="border-t-2 border-gray-300 bg-white">
                    <td
                      colSpan={4}
                      className="py-4 px-4 font-black text-sm md:text-base text-black uppercase tracking-wider"
                    >
                      TOTAL
                    </td>
                    <td className="py-4 px-4 text-right font-black text-base md:text-lg text-black">
                      ₹{grandTotal.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ─── REMOVE ALL & BUY BUTTONS (MATCHING SS1) ─── */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleRemoveAll}
                className="w-1/2 py-3.5 border border-[#DD1215] text-[#DD1215] hover:bg-red-50 font-bold uppercase text-xs md:text-sm tracking-wider transition cursor-pointer text-center"
              >
                Remove all
              </button>
              <button
                onClick={handleBuyAll}
                className="w-1/2 py-3.5 bg-[#DD1215] hover:bg-red-700 text-white font-bold uppercase text-xs md:text-sm tracking-wider transition cursor-pointer text-center shadow-md"
              >
                Buy
              </button>
            </div>
          </div>
        )}

        {/* ─── SUGGESTED PRODUCTS SECTION ─── */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-wide uppercase font-dmsans mb-6">
            Suggested
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {filteredSuggestions.slice(0, visibleSuggestedCount).map((prod) => {
              const currentPrice = typeof prod.price === "string"
                ? parseFloat(prod.price.replace(/[^\d.]/g, "")) || 1499
                : Number(prod.price || prod.salePrice || prod.basePrice || 1499);
              const title = prod.title || prod.name || "INFINITO";
              const subtitle = prod.name || prod.title || "Special Edition Merch";

              const primaryImg = (Array.isArray(prod.images) && prod.images.length > 0)
                ? (typeof prod.images[0] === "string" ? prod.images[0] : prod.images[0]?.url)
                : (prod.image || "/products/crimson_tshirt.jpg");

              return (
                <div
                  key={prod.id || prod._id || prod.slug}
                  onClick={() => navigate(`/product/${prod.slug || prod.id || prod._id}`)}
                  className="border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                >
                  {/* Image Container with Floating Cart Icon */}
                  <div className="relative w-full aspect-square bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
                    <SafeImage
                      src={primaryImg}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      fallback={"/products/crimson_tshirt.jpg"}
                    />

                    {/* Floating Add to Cart Button in Top-Right Corner */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSuggestedToCart(prod);
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 bg-black/75 hover:bg-[#DD1215] text-white flex items-center justify-center transition shadow-md cursor-pointer"
                      title="Add to cart"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 bg-white flex flex-col justify-between flex-grow">
                    <div>
                      <h3 className="font-extrabold text-xs md:text-sm text-black uppercase tracking-wide font-dmsans">
                        {title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-1 mt-1 font-medium">
                        {subtitle}
                      </p>
                    </div>
                    <p className="font-bold text-sm text-black mt-3">
                      Rs.{currentPrice}/-
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View More Button */}
          {filteredSuggestions.length > visibleSuggestedCount && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setVisibleSuggestedCount((prev) => prev + 4)}
                className="px-8 py-3 bg-[#DD1215] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer rounded-none"
              >
                View More
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Cart;
