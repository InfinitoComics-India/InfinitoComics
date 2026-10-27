import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  Edit2, X, Check, CreditCard, QrCode, Smartphone, Banknote, ShieldCheck,
  Tag, Sparkles, ChevronDown, ChevronUp, Ticket, Percent, Gift, CheckCircle2 
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getDeliveryAddress,
  saveDeliveryAddress,
  createOrder,
  getLoggedInUserName,
} from "../../services/orderService";
import { getAvailableCoupons, validateCoupon } from "../../services/couponService";
import { removeFromCart, clearCart } from "../../redux/cartSlice";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [checkoutMode, setCheckoutMode] = useState("cart"); // 'single' or 'cart'
  const [address, setAddress] = useState(getDeliveryAddress());

  // Edit address state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: (address.name && address.name.toLowerCase() !== 'aarav sharma') ? address.name : getLoggedInUserName(),
    phone: address.phone ? String(address.phone).replace(/\D/g, '').slice(-10) : "9876543210",
    line1: address.line1 || "",
    city: address.city || "",
    state: address.state || "",
    pincode: address.pincode || "",
    country: address.country || "India",
  });

  // Payment view state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Coupon & Discount state
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showCouponList, setShowCouponList] = useState(false);

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

      // Fallback to active cart
      const cartRaw = localStorage.getItem("shop_cart");
      if (cartRaw) {
        const parsedCart = JSON.parse(cartRaw);
        setCheckoutItems(parsedCart);
      }
    } catch (e) {
      console.error("Failed to load checkout items:", e);
    }
  }, []);

  // Subtotal without tax
  const subtotal = useMemo(() => {
    return checkoutItems.reduce((sum, item) => {
      const price = Number(item.product?.price || item.unitPrice || 0);
      const qty = Number(item.quantity || 1);
      return sum + price * qty;
    }, 0);
  }, [checkoutItems]);

  const authUser = useSelector((state) => state.user?.user) || (() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const isUltimateMember = useMemo(() => {
    return Boolean(
      authUser?.hasInfinitoUltimate ||
      authUser?.isUltimateMember ||
      authUser?.membershipType === "ULTIMATE" ||
      authUser?.plan === "ULTIMATE" ||
      localStorage.getItem("is_ultimate_member") === "true"
    );
  }, [authUser]);

  // GST (18%)
  const taxAmount = useMemo(() => {
    return Number((subtotal * 0.18).toFixed(2));
  }, [subtotal]);

  // Coupon discount amount
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "Percentage") {
      return Number(((subtotal * appliedCoupon.value) / 100).toFixed(2));
    }
    return Number(Math.min(appliedCoupon.value, subtotal).toFixed(2));
  }, [appliedCoupon, subtotal]);

  // Infinito Ultimate Member Automatic Discount (10% on subtotal)
  const ultimateDiscountAmount = useMemo(() => {
    if (!isUltimateMember) return 0;
    return Number((subtotal * 0.10).toFixed(2));
  }, [isUltimateMember, subtotal]);

  // Total discounts combined
  const totalDiscountAmount = useMemo(() => {
    return Number((discountAmount + ultimateDiscountAmount).toFixed(2));
  }, [discountAmount, ultimateDiscountAmount]);

  // Grand Total to pay
  const grandTotal = useMemo(() => {
    return Math.max(0, Number((subtotal + taxAmount - totalDiscountAmount).toFixed(2)));
  }, [subtotal, taxAmount, totalDiscountAmount]);

  const availableCoupons = useMemo(() => getAvailableCoupons(), []);

  // Handle applying coupon
  const handleApplyCoupon = (codeToApply) => {
    const targetCode = String(codeToApply || couponCodeInput).trim().toUpperCase();
    if (!targetCode) {
      toast.error("Please enter a coupon code");
      return;
    }

    const res = validateCoupon(targetCode, subtotal);
    if (!res.valid) {
      toast.error(res.message);
      return;
    }

    setAppliedCoupon({
      ...res.coupon,
      discountAmount: res.discountAmount,
    });
    setCouponCodeInput(res.coupon.code);
    toast.success(res.message);
  };

  // Handle removing applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    toast("Coupon removed");
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    const cleanPhone = String(addressForm.phone || "").replace(/\D/g, "").slice(-10);
    const cleanPin = String(addressForm.pincode || "").replace(/\D/g, "").slice(0, 6);

    if (!addressForm.name || !addressForm.name.trim()) {
      toast.error("Please enter recipient name");
      return;
    }
    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return;
    }
    if (!addressForm.line1 || !addressForm.line1.trim()) {
      toast.error("Please enter street address / house number");
      return;
    }
    if (!addressForm.city || !addressForm.city.trim()) {
      toast.error("Please enter city");
      return;
    }
    if (!addressForm.state || !addressForm.state.trim()) {
      toast.error("Please enter state");
      return;
    }
    if (cleanPin.length !== 6) {
      toast.error("Please enter a valid 6-digit Indian PIN code");
      return;
    }

    const updated = saveDeliveryAddress({
      ...addressForm,
      name: addressForm.name.trim(),
      phone: cleanPhone,
      pincode: cleanPin,
    });
    setAddress(updated);
    setIsEditingAddress(false);
    toast.success("Delivery address updated successfully");
  };

  const handleProceedPayment = () => {
    if (checkoutItems.length === 0) {
      toast("No items to checkout");
      return;
    }
    setShowPaymentModal(true);
  };

  const handleSelectPaymentAndProceed = (mode) => {
    const chosenMode = mode || selectedPayment || "COD";
    setSelectedPayment(chosenMode);
    setIsProcessingPayment(true);

    setTimeout(() => {
      try {
        // 1. Create order record
        const order = createOrder({
          items: checkoutItems,
          address,
          paymentMethod: chosenMode.toUpperCase(),
          coupon: appliedCoupon,
          discount: totalDiscountAmount,
          isUltimateMember,
          ultimateDiscount: ultimateDiscountAmount,
        });

        // 2. Remove purchased items from cart
        if (checkoutMode === "cart") {
          dispatch(clearCart());
        } else {
          checkoutItems.forEach((it) => {
            dispatch(removeFromCart({ productId: it.productId, size: it.size }));
          });
        }

        setIsProcessingPayment(false);
        setShowPaymentModal(false);

        // 3. Automatically redirect to order complete page
        const orderIdToUse = order?.id || order?.orderId || "success";
        navigate(`/order-success/${encodeURIComponent(orderIdToUse)}`);
      } catch (err) {
        console.error("Error creating order:", err);
        setIsProcessingPayment(false);
        setShowPaymentModal(false);
        navigate("/order-success");
      }
    }, 600);
  };

  const handleCompletePayment = () => {
    handleSelectPaymentAndProceed(selectedPayment || "COD");
  };

  return (
    <div className="bg-white min-h-screen text-black font-sans pb-24">
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 pt-8">
        
        {/* Infinito Ultimate Automatic VIP Member Perk Banner */}
        {isUltimateMember && (
          <div className="mb-8 p-4 bg-gradient-to-r from-amber-500/15 via-red-500/10 to-transparent border-2 border-amber-500/40 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👑</span>
              <div>
                <p className="font-black text-xs sm:text-sm uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  Infinito Ultimate Member Privilege Active
                  <span className="px-2 py-0.5 bg-amber-500 text-black font-extrabold text-[10px] rounded">
                    VIP SUBSCRIBER
                  </span>
                </p>
                <p className="text-xs text-gray-700 mt-0.5">
                  10% Automatic Subscriber Discount + Free Priority Express Shipping have been applied to your checkout.
                </p>
              </div>
            </div>
            <span className="font-mono font-black text-amber-800 text-xs sm:text-sm bg-white/80 border border-amber-300 px-3 py-1 rounded">
              -₹{ultimateDiscountAmount.toFixed(2)} OFF
            </span>
          </div>
        )}

        {/* ─── SECTION 1: DELIVER AT THIS ADDRESS (MATCHING SS2) ─── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-black text-black tracking-wide font-dmsans">
              Deliver At This Address
            </h1>
            <button
              onClick={() => {
                setAddressForm({
                  name: (address.name && address.name.toLowerCase() !== 'aarav sharma') ? address.name : getLoggedInUserName(),
                  phone: address.phone ? String(address.phone).replace(/\D/g, '').slice(-10) : "9876543210",
                  line1: address.line1 || "",
                  city: address.city || "",
                  state: address.state || "",
                  pincode: address.pincode || "",
                  country: address.country || "India",
                });
                setIsEditingAddress(true);
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 border border-black hover:bg-black hover:text-white transition text-xs md:text-sm font-bold tracking-wide cursor-pointer shadow-sm"
            >
              <span>Edit</span>
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Address Display Box */}
          <div className="border border-black p-5 md:p-6 bg-white min-h-[100px] flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-base md:text-lg font-bold text-black font-dmsans">
                  {(address.name && address.name.toLowerCase() !== 'aarav sharma') ? address.name : getLoggedInUserName()}
                </span>
                {address.phone && (
                  <span className="text-xs md:text-sm font-semibold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded">
                    📞 {address.phone}
                  </span>
                )}
              </div>
              <p className="text-sm md:text-base font-medium text-gray-800 leading-relaxed whitespace-pre-line">
                {address.formatted || `${address.line1}\n${address.city}, ${address.state}\n${address.pincode}, ${address.country}`}
              </p>
            </div>
          </div>
        </div>

        {/* ─── SECTION 2: INVOICE (MATCHING SS2) ─── */}
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-wide font-dmsans mb-4">
            Invoice
          </h2>

          <div className="border border-gray-300 overflow-hidden bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-gray-300 bg-white">
                  <th className="py-3 px-4 font-bold text-gray-800 w-2/5">Item</th>
                  <th className="py-3 px-4 font-bold text-gray-800 text-center">Qty</th>
                  <th className="py-3 px-4 font-bold text-gray-800 text-right">Price</th>
                  <th className="py-3 px-4 font-bold text-gray-800 text-right">Tax</th>
                  <th className="py-3 px-4 font-bold text-gray-800 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {checkoutItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No items selected
                    </td>
                  </tr>
                ) : (
                  checkoutItems.map((item, index) => {
                    const price = Number(item.product?.price || 0);
                    const qty = Number(item.quantity || 1);
                    const rowTotal = price * qty * 1.18;
                    const itemName = item.product?.title || item.product?.name || "INFINITO Premium Tshirt";

                    return (
                      <tr
                        key={`checkout-bill-${item.productId}-${item.size}-${index}`}
                        className="border-b border-gray-200 hover:bg-gray-50/50"
                      >
                        <td className="py-3.5 px-4 font-bold text-black">
                          <div>{itemName} {item.size ? `(${item.size})` : ""}</div>
                          {(item.selectedCharacter || item.product?.selectedCharacter) && (
                            <div className="text-[11px] font-bold text-[#DD1215] mt-0.5">
                              ★ Comic Choice: {item.selectedCharacter || item.product?.selectedCharacter}
                            </div>
                          )}
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
                  })
                )}
                {/* SUB-TOTAL ROW */}
                <tr className="border-t border-gray-200 bg-gray-50/50">
                  <td colSpan={4} className="py-2.5 px-4 font-semibold text-xs md:text-sm text-gray-700 uppercase">
                    Subtotal (Excl. Tax)
                  </td>
                  <td className="py-2.5 px-4 text-right font-semibold text-xs md:text-sm text-gray-800">
                    ₹{subtotal.toFixed(2)}
                  </td>
                </tr>

                {/* GST (18%) ROW */}
                <tr className="border-t border-gray-100 bg-gray-50/50">
                  <td colSpan={4} className="py-2 px-4 font-semibold text-xs md:text-sm text-gray-700 uppercase">
                    GST (18%)
                  </td>
                  <td className="py-2 px-4 text-right font-semibold text-xs md:text-sm text-gray-800">
                    ₹{taxAmount.toFixed(2)}
                  </td>
                </tr>

                {/* DISCOUNT ROW IF APPLIED */}
                {appliedCoupon && (
                  <tr className="border-t border-emerald-200 bg-emerald-50/60">
                    <td colSpan={4} className="py-2.5 px-4 font-bold text-xs md:text-sm text-emerald-800">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Discount ({appliedCoupon.code})</span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono">
                          {appliedCoupon.type === "Percentage" ? `${appliedCoupon.value}% OFF` : `₹${appliedCoupon.value} OFF`}
                        </span>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="ml-2 text-xs text-red-600 hover:underline cursor-pointer font-medium"
                        >
                          [Remove]
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-black text-sm md:text-base text-emerald-700">
                      -₹{discountAmount.toFixed(2)}
                    </td>
                  </tr>
                )}

                {/* INFINITO ULTIMATE MEMBER DISCOUNT ROW */}
                {isUltimateMember && ultimateDiscountAmount > 0 && (
                  <tr className="border-t border-amber-200 bg-amber-50/70">
                    <td colSpan={4} className="py-2.5 px-4 font-bold text-xs md:text-sm text-amber-900">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>👑 Infinito Ultimate VIP Member Discount (10% Auto-Applied)</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-black text-sm md:text-base text-amber-800">
                      -₹{ultimateDiscountAmount.toFixed(2)}
                    </td>
                  </tr>
                )}

                {/* FINAL TOTAL ROW */}
                <tr className="border-t-2 border-black bg-white">
                  <td
                    colSpan={4}
                    className="py-4 px-4 font-black text-sm md:text-base text-black uppercase tracking-wider"
                  >
                    TOTAL PAYABLE
                  </td>
                  <td className="py-4 px-4 text-right font-black text-base md:text-lg text-black">
                    ₹{grandTotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ─── COUPON APPLICATION SECTION ─── */}
          <div className="mt-6 border border-gray-300 bg-white p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#DD1215]" />
                <h3 className="font-black uppercase tracking-wider text-sm md:text-base text-black">
                  Apply Coupon / Promo Code
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCouponList(!showCouponList)}
                className="flex items-center gap-1 text-xs md:text-sm font-bold text-[#DD1215] hover:underline cursor-pointer"
              >
                <span>{showCouponList ? "Hide Available Coupons" : `View Available Offers (${availableCoupons.length})`}</span>
                {showCouponList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Input & Apply Button */}
            <div className="flex gap-2.5 max-w-md">
              <input
                type="text"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                placeholder="ENTER COUPON CODE"
                className="flex-1 border border-gray-300 px-3.5 py-2.5 text-sm font-mono uppercase tracking-wider focus:border-black focus:outline-none"
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  className="px-6 py-2.5 bg-black hover:bg-[#DD1215] text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
                >
                  Apply
                </button>
              )}
            </div>

            {/* Applied Coupon Banner */}
            {appliedCoupon && (
              <div className="mt-3 bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-sm flex items-center justify-between text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>"{appliedCoupon.code}"</strong> applied! You are saving <strong>₹{discountAmount.toFixed(2)}</strong> on this order.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs text-red-600 hover:underline font-bold ml-3 cursor-pointer shrink-0"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Available Coupons Dropdown / List */}
            {showCouponList && (
              <div className="mt-5 pt-4 border-t border-gray-200">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Available Coupons for Your Cart</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableCoupons.map((coupon) => {
                    const isEligible = subtotal >= (coupon.minPurchase || 0);
                    const isCurrent = appliedCoupon?.code === coupon.code;
                    const shortfall = (coupon.minPurchase || 0) - subtotal;

                    return (
                      <div
                        key={coupon.code}
                        className={`p-3.5 border rounded-sm transition ${
                          isCurrent
                            ? "border-emerald-500 bg-emerald-50/40 shadow-xs"
                            : isEligible
                            ? "border-gray-300 bg-white hover:border-black"
                            : "border-gray-200 bg-gray-50/60 opacity-80"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs md:text-sm border border-dashed border-gray-700 px-2 py-0.5 bg-gray-50 tracking-wider">
                              {coupon.code}
                            </span>
                            {coupon.badge && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-red-100 text-[#DD1215] rounded">
                                {coupon.badge}
                              </span>
                            )}
                          </div>
                          {isCurrent ? (
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Applied
                            </span>
                          ) : isEligible ? (
                            <button
                              type="button"
                              onClick={() => handleApplyCoupon(coupon.code)}
                              className="px-3 py-1 bg-black hover:bg-[#DD1215] text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                            >
                              Apply
                            </button>
                          ) : (
                            <span className="text-[11px] font-semibold text-amber-700">
                              Add ₹{shortfall.toFixed(0)} more
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-black mt-1">{coupon.title}</p>
                        <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{coupon.description}</p>
                        {coupon.minPurchase > 0 && (
                          <p className="text-[10px] text-gray-500 mt-1.5">
                            Min order value: ₹{coupon.minPurchase}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── SECTION 3: ACTION BUTTONS (CANCEL / PROCEED PAYMENT - SS2) ─── */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate("/cart")}
            className="w-1/2 py-3.5 border border-[#DD1215] text-[#DD1215] hover:bg-red-50 font-bold uppercase text-xs md:text-sm tracking-wider transition cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            onClick={handleProceedPayment}
            className="w-1/2 py-3.5 bg-[#DD1215] hover:bg-red-700 text-white font-bold uppercase text-xs md:text-sm tracking-wider transition cursor-pointer text-center shadow-md"
          >
            Proceed Payment
          </button>
        </div>

      </div>

      {/* ─── MODAL 1: EDIT ADDRESS ─── */}
      {isEditingAddress && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
              <h3 className="text-lg font-black uppercase tracking-wider text-black">
                Edit Delivery Address
              </h3>
              <button
                onClick={() => setIsEditingAddress(false)}
                className="text-gray-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    placeholder="e.g. Full Name"
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Mobile Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="9876543210"
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Street / Area / House No. *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.line1}
                  onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                  placeholder="Sector 18, House No. 42, Green Park Extension"
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="Chandigarh"
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    placeholder="Punjab"
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    PIN Code (6 digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    placeholder="160018"
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    placeholder="India"
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(false)}
                  className="w-1/2 py-2.5 border border-gray-300 text-gray-700 font-bold uppercase text-xs hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-[#DD1215] text-white font-bold uppercase text-xs hover:bg-red-700 transition cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: PAYMENT PAGE / PAYMENT MODAL ─── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
              <div>
                <h3 className="text-lg font-black uppercase tracking-wider text-black">
                  Select Payment Method
                </h3>
                <p className="text-xs text-gray-500">Amount: ₹{grandTotal.toFixed(2)}</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {/* Option 1: UPI */}
              <label
                onClick={() => !isProcessingPayment && handleSelectPaymentAndProceed("upi")}
                className={`flex items-center justify-between p-3.5 border cursor-pointer transition ${
                  selectedPayment === "upi" ? "border-[#DD1215] bg-red-50/50" : "border-gray-200 hover:bg-gray-50"
                } ${isProcessingPayment ? "opacity-75 pointer-events-none" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <QrCode className="w-5 h-5 text-[#DD1215]" />
                  <div>
                    <p className="text-sm font-bold text-black">UPI / QR Code</p>
                    <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="pay_mode"
                  checked={selectedPayment === "upi"}
                  onChange={() => !isProcessingPayment && handleSelectPaymentAndProceed("upi")}
                  className="accent-[#DD1215]"
                />
              </label>

              {/* Option 2: Card */}
              <label
                onClick={() => !isProcessingPayment && handleSelectPaymentAndProceed("card")}
                className={`flex items-center justify-between p-3.5 border cursor-pointer transition ${
                  selectedPayment === "card" ? "border-[#DD1215] bg-red-50/50" : "border-gray-200 hover:bg-gray-50"
                } ${isProcessingPayment ? "opacity-75 pointer-events-none" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-[#DD1215]" />
                  <div>
                    <p className="text-sm font-bold text-black">Credit / Debit Card</p>
                    <p className="text-xs text-gray-500">Visa, MasterCard, RuPay</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="pay_mode"
                  checked={selectedPayment === "card"}
                  onChange={() => !isProcessingPayment && handleSelectPaymentAndProceed("card")}
                  className="accent-[#DD1215]"
                />
              </label>

              {/* Option 3: NetBanking */}
              <label
                onClick={() => !isProcessingPayment && handleSelectPaymentAndProceed("netbanking")}
                className={`flex items-center justify-between p-3.5 border cursor-pointer transition ${
                  selectedPayment === "netbanking" ? "border-[#DD1215] bg-red-50/50" : "border-gray-200 hover:bg-gray-50"
                } ${isProcessingPayment ? "opacity-75 pointer-events-none" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-[#DD1215]" />
                  <div>
                    <p className="text-sm font-bold text-black">Net Banking</p>
                    <p className="text-xs text-gray-500">HDFC, SBI, ICICI, Axis</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="pay_mode"
                  checked={selectedPayment === "netbanking"}
                  onChange={() => !isProcessingPayment && handleSelectPaymentAndProceed("netbanking")}
                  className="accent-[#DD1215]"
                />
              </label>

              {/* Option 4: COD */}
              <label
                onClick={() => !isProcessingPayment && handleSelectPaymentAndProceed("cod")}
                className={`flex items-center justify-between p-3.5 border cursor-pointer transition ${
                  selectedPayment === "cod" ? "border-[#DD1215] bg-red-50/50" : "border-gray-200 hover:bg-gray-50"
                } ${isProcessingPayment ? "opacity-75 pointer-events-none" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Banknote className="w-5 h-5 text-[#DD1215]" />
                  <div>
                    <p className="text-sm font-bold text-black">Cash on Delivery (COD)</p>
                    <p className="text-xs text-gray-500">Pay when order arrives</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="pay_mode"
                  checked={selectedPayment === "cod"}
                  onChange={() => !isProcessingPayment && handleSelectPaymentAndProceed("cod")}
                  className="accent-[#DD1215]"
                />
              </label>
            </div>

            {appliedCoupon && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded p-2.5 flex items-center justify-between text-xs text-emerald-800">
                <span className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Coupon "{appliedCoupon.code}" applied</span>
                </span>
                <span className="font-bold text-emerald-700">-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <button
              onClick={handleCompletePayment}
              disabled={isProcessingPayment}
              className="w-full py-4 bg-[#DD1215] hover:bg-red-700 text-white font-black uppercase text-sm tracking-wider transition cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              {isProcessingPayment ? (
                <span>Processing Payment...</span>
              ) : (
                <span>Pay ₹{grandTotal.toFixed(2)}</span>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>256-Bit SSL Encrypted &amp; Secure Payment</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;
