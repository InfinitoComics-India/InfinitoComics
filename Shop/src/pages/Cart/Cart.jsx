import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Trash2, Minus, Plus } from "lucide-react";
import { updateQuantity, removeFromCart, clearCart } from "../../redux/cartSlice";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);

  const subtotal = items.reduce(
    (sum, i) => sum + (i.product?.price || 0) * i.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">
          Browse the shop and add something you love.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 bg-[#DD1215] hover:bg-red-700 text-white font-semibold uppercase tracking-wide transition"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="flex gap-4 border border-gray-200 rounded-md p-4"
            >
              <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                {item.product?.image ? (
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <span className="text-xs text-gray-400">Image</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-widest text-[#DD1215] font-bold">
                  {item.product?.name}
                </p>
                <p className="text-sm font-semibold mt-1">
                  {item.product?.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">Size: {item.size}</p>
                <p className="text-lg font-bold mt-2">
                  ₹{item.product?.price * item.quantity}
                </p>
              </div>

              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() =>
                    dispatch(
                      removeFromCart({
                        productId: item.productId,
                        size: item.size,
                      })
                    )
                  }
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 border border-gray-300 rounded">
                  <button
                    onClick={() =>
                      dispatch(
                        updateQuantity({
                          productId: item.productId,
                          size: item.size,
                          quantity: item.quantity - 1,
                        })
                      )
                    }
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() =>
                      dispatch(
                        updateQuantity({
                          productId: item.productId,
                          size: item.size,
                          quantity: item.quantity + 1,
                        })
                      )
                    }
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => dispatch(clearCart())}
            className="text-sm text-gray-500 hover:text-red-500 transition mt-4"
          >
            Clear cart
          </button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="border border-gray-200 rounded-md p-6 sticky top-32">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>
            </div>

            <button className="w-full mt-6 py-3 bg-[#DD1215] hover:bg-red-700 text-white font-bold uppercase tracking-wide transition">
              Checkout
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full mt-3 py-3 border border-gray-300 hover:border-gray-400 font-semibold text-sm uppercase tracking-wide transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
