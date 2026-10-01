import { createSlice } from "@reduxjs/toolkit";

const CART_KEY = "shop_cart";

const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {}
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: loadCart(),
  },
  reducers: {
    addToCart: (state, action) => {
      const { productId, size, quantity = 1, product } = action.payload;
      const existing = state.items.find(
        (i) => i.productId === productId && i.size === size
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ productId, size, quantity, product });
      }
      saveCart(state.items);
    },
    updateQuantity: (state, action) => {
      const { productId, size, quantity } = action.payload;
      const item = state.items.find(
        (i) => i.productId === productId && i.size === size
      );
      if (item) {
        item.quantity = Math.max(1, quantity);
        saveCart(state.items);
      }
    },
    removeFromCart: (state, action) => {
      const { productId, size } = action.payload;
      state.items = state.items.filter(
        (i) => !(i.productId === productId && i.size === size)
      );
      saveCart(state.items);
    },
    setCart: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : [];
      saveCart(state.items);
    },
    updateSize: (state, action) => {
      const { productId, oldSize, newSize } = action.payload;
      const item = state.items.find(
        (i) => i.productId === productId && i.size === oldSize
      );
      if (item) {
        const existing = state.items.find(
          (i) => i.productId === productId && i.size === newSize && i !== item
        );
        if (existing) {
          existing.quantity += item.quantity;
          state.items = state.items.filter((i) => i !== item);
        } else {
          item.size = newSize;
        }
        saveCart(state.items);
      }
    },
    clearCart: (state) => {
      state.items = [];
      saveCart(state.items);
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setCart,
  updateSize,
} = cartSlice.actions;

export default cartSlice.reducer;
