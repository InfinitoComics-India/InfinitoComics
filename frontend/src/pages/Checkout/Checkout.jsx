import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Edit2, X, Check, CreditCard, QrCode, Smartphone, Banknote, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import {
  getDeliveryAddress,
  saveDeliveryAddress,
  createOrder,
} from "../../services/orderService";
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

  const grandTotal = useMemo(() => {
    return checkoutItems.reduce((sum, item) => {
      const price = Number(item.product?.price || 0);
      const qty = Number(item.quantity || 1);
      return sum + price * qty * 1.18;
    }, 0);
  }, [checkoutItems]);

  const handleSaveAddress = (e) => {
    e.preventDefault();
    const updated = saveDeliveryAddress(addressForm);
    setAddress(updated);
    setIsEditingAddress(false);
    toast.success("Delivery address updated");
  };

  const handleProceedPayment = () => {
    if (checkoutItems.length === 0) {
      toast("No items to checkout");
      return;
    }
    setShowPaymentModal(true);
  };

  const handleCompletePayment = () => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      // 1. Create order record
      const order = createOrder({
        items: checkoutItems,
        address,
        paymentMethod: selectedPayment.toUpperCase(),
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

      // 3. Redirect to SS3 Congratulations page
      navigate(`/order-success/${order.id}`);
    }, 800);
  };

  return (
    <div className="bg-white min-h-screen text-black font-sans pb-24">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 pt-8">
        
        {/* ─── SECTION 1: DELIVER AT THIS ADDRESS (MATCHING SS2) ─── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-black text-black tracking-wide font-dmsans">
              Deliver At This Address
            </h1>
            <button
              onClick={() => {
                setAddressForm({
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
          <div className="border border-black p-5 md:p-6 bg-white min-h-[100px] flex items-center">
            <p className="text-base md:text-lg font-medium text-black leading-relaxed whitespace-pre-line">
              {address.formatted || `${address.line1}\n${address.city}, ${address.state}\n${address.pincode}, ${address.country}`}
            </p>
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
                  })
                )}
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

            <form onSubmit={handleSaveAddress} className="space-y-4">
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
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
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
                onClick={() => setSelectedPayment("upi")}
                className={`flex items-center justify-between p-3.5 border cursor-pointer transition ${
                  selectedPayment === "upi" ? "border-[#DD1215] bg-red-50/50" : "border-gray-200 hover:bg-gray-50"
                }`}
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
                  onChange={() => setSelectedPayment("upi")}
                  className="accent-[#DD1215]"
                />
              </label>

              {/* Option 2: Card */}
              <label
                onClick={() => setSelectedPayment("card")}
                className={`flex items-center justify-between p-3.5 border cursor-pointer transition ${
                  selectedPayment === "card" ? "border-[#DD1215] bg-red-50/50" : "border-gray-200 hover:bg-gray-50"
                }`}
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
                  onChange={() => setSelectedPayment("card")}
                  className="accent-[#DD1215]"
                />
              </label>

              {/* Option 3: NetBanking */}
              <label
                onClick={() => setSelectedPayment("netbanking")}
                className={`flex items-center justify-between p-3.5 border cursor-pointer transition ${
                  selectedPayment === "netbanking" ? "border-[#DD1215] bg-red-50/50" : "border-gray-200 hover:bg-gray-50"
                }`}
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
                  onChange={() => setSelectedPayment("netbanking")}
                  className="accent-[#DD1215]"
                />
              </label>

              {/* Option 4: COD */}
              <label
                onClick={() => setSelectedPayment("cod")}
                className={`flex items-center justify-between p-3.5 border cursor-pointer transition ${
                  selectedPayment === "cod" ? "border-[#DD1215] bg-red-50/50" : "border-gray-200 hover:bg-gray-50"
                }`}
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
                  onChange={() => setSelectedPayment("cod")}
                  className="accent-[#DD1215]"
                />
              </label>
            </div>

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
