import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ShieldCheck, ShoppingBag, CreditCard, Truck } from "lucide-react";
import { toast } from "react-toastify";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [checkoutMode, setCheckoutMode] = useState("cart"); // 'single' or 'cart'

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod"); // 'cod', 'upi', 'card'

  useEffect(() => {
    try {
      const mode = localStorage.getItem("checkout_mode") || "cart";
      setCheckoutMode(mode);

      const saved = localStorage.getItem("checkout_items");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCheckoutItems(parsed);
          return;
        }
      }

      // Fallback to cart if nothing stored in checkout_items
      const cartRaw = localStorage.getItem("shop_cart");
      if (cartRaw) {
        const parsedCart = JSON.parse(cartRaw);
        setCheckoutItems(parsedCart);
      }
    } catch (e) {
      console.error("Failed to load checkout items:", e);
    }
  }, []);

  const grandTotal = useMemo(() => {
    return checkoutItems.reduce((sum, item) => {
      const price = Number(item.product?.price || 0);
      const qty = Number(item.quantity || 1);
      return sum + price * qty * 1.18;
    }, 0);
  }, [checkoutItems]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.address || !formData.phone) {
      toast.error("Please fill in the required delivery fields.");
      return;
    }

    toast.success("Order Placed Successfully! (Waiting for SS2 to SS6 full design flow)");
  };

  return (
    <div className="bg-white min-h-screen text-black font-sans pb-24">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 pt-8">
        
        {/* Navigation Breadcrumb / Back button */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-200">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-black transition uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </button>
          <div className="text-xs uppercase font-bold text-gray-400 tracking-widest">
            {checkoutMode === "single" ? "Direct Checkout (1 Product)" : "Complete Cart Checkout"}
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-black tracking-wide uppercase font-dmsans mt-6 mb-8">
          CHECKOUT
        </h1>

        {checkoutItems.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-gray-300 rounded-none bg-gray-50">
            <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-800">No items selected for checkout</h2>
            <button
              onClick={() => navigate("/cart")}
              className="mt-6 px-6 py-2.5 bg-[#DD1215] text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition cursor-pointer"
            >
              Return to Cart
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Delivery & Contact Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                <div className="border border-gray-200 p-6 bg-white shadow-sm">
                  <h2 className="text-lg font-black uppercase tracking-wider text-black mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#DD1215]" />
                    Delivery Information
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        className="w-full border border-gray-300 px-3.5 py-2.5 text-sm focus:border-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        className="w-full border border-gray-300 px-3.5 py-2.5 text-sm focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="w-full border border-gray-300 px-3.5 py-2.5 text-sm focus:border-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 9876543210"
                        className="w-full border border-gray-300 px-3.5 py-2.5 text-sm focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <textarea
                      name="address"
                      required
                      rows={2}
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Apartment, suite, unit, building, floor, street"
                      className="w-full border border-gray-300 px-3.5 py-2 text-sm focus:border-black focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Mumbai"
                        className="w-full border border-gray-300 px-3.5 py-2.5 text-sm focus:border-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Maharashtra"
                        className="w-full border border-gray-300 px-3.5 py-2.5 text-sm focus:border-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        required
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="400001"
                        className="w-full border border-gray-300 px-3.5 py-2.5 text-sm focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Option */}
                <div className="border border-gray-200 p-6 bg-white shadow-sm">
                  <h2 className="text-lg font-black uppercase tracking-wider text-black mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#DD1215]" />
                    Payment Method
                  </h2>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3.5 border border-gray-200 cursor-pointer hover:bg-gray-50 transition">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="accent-[#DD1215]"
                      />
                      <span className="font-bold text-sm">Cash on Delivery (COD)</span>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 border border-gray-200 cursor-pointer hover:bg-gray-50 transition">
                      <input
                        type="radio"
                        name="payment"
                        value="upi"
                        checked={paymentMethod === "upi"}
                        onChange={() => setPaymentMethod("upi")}
                        className="accent-[#DD1215]"
                      />
                      <span className="font-bold text-sm">UPI / QR Code</span>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 border border-gray-200 cursor-pointer hover:bg-gray-50 transition">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                        className="accent-[#DD1215]"
                      />
                      <span className="font-bold text-sm">Credit / Debit Card (Razorpay)</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#DD1215] hover:bg-red-700 text-white font-black uppercase text-sm tracking-widest transition cursor-pointer shadow-lg"
                >
                  Place Order • ₹{grandTotal.toFixed(2)}
                </button>
              </form>
            </div>

            {/* Order Summary (Items & Total) */}
            <div className="lg:col-span-5">
              <div className="border border-gray-300 p-6 bg-gray-50/50 sticky top-28 shadow-sm">
                <h2 className="text-lg font-black uppercase tracking-wider text-black pb-4 border-b border-gray-200">
                  Order Summary ({checkoutItems.length} {checkoutItems.length === 1 ? "Item" : "Items"})
                </h2>

                <div className="divide-y divide-gray-200 my-4 max-h-[360px] overflow-y-auto">
                  {checkoutItems.map((item, idx) => {
                    const price = Number(item.product?.price || 0);
                    const qty = Number(item.quantity || 1);
                    const lineTotal = price * qty * 1.18;

                    return (
                      <div key={idx} className="py-3 flex gap-3 items-center">
                        <div className="w-14 h-14 bg-black flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {item.product?.image ? (
                            <img
                              src={item.product.image}
                              alt={item.product.title || item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-white">Img</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-black uppercase truncate">
                            {item.product?.title || item.product?.name || "INFINITO Product"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Size: {item.size || "M"} • Qty: {qty}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-black">
                            ₹{lineTotal.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-gray-400">incl. 18% tax</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t-2 border-gray-300 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (GST 18%)</span>
                    <span className="font-semibold text-black">Included</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-bold text-green-700 uppercase text-xs">FREE</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-black text-lg text-black">
                    <span>TOTAL</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 bg-white p-3 border border-gray-200">
                  <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>100% Secure Checkout &amp; Verified Official INFINITO Merch</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Checkout;
