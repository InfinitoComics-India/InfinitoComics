// Service for managing Customer Wishlist across Frontend and Shop
export const WISHLIST_KEY = "shop_wishlist";

export const getWishlist = () => {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse wishlist from storage:", e);
    return [];
  }
};

export const isInWishlist = (productId) => {
  if (!productId) return false;
  const list = getWishlist();
  const idStr = String(productId);
  return list.some((item) => String(item.id || item._id) === idStr);
};

export const addToWishlist = (product) => {
  if (!product) return getWishlist();
  const list = getWishlist();
  const pid = String(product.id || product._id);
  if (!list.some((item) => String(item.id || item._id) === pid)) {
    const updated = [product, ...list];
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("wishlist_updated", { detail: updated }));
    } catch {}
    return updated;
  }
  return list;
};

export const removeFromWishlist = (productId) => {
  if (!productId) return getWishlist();
  const list = getWishlist();
  const idStr = String(productId);
  const updated = list.filter((item) => String(item.id || item._id) !== idStr);
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("wishlist_updated", { detail: updated }));
  } catch {}
  return updated;
};

export const toggleWishlist = (product) => {
  if (!product) return false;
  const pid = String(product.id || product._id);
  const exists = isInWishlist(pid);
  if (exists) {
    removeFromWishlist(pid);
    return false;
  } else {
    addToWishlist(product);
    return true;
  }
};
