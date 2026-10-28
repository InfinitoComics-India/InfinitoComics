// Service for managing Customer Wishlist across Frontend and Shop
export const WISHLIST_KEY = "shop_wishlist";

export const normalizeWishlistItem = (product) => {
  if (!product) return null;
  const id = String(product._id || product.id || product.productId || "");
  if (!id) return null;

  const title = product.title || product.name || product.cardTitle || "Official Merchandise";
  const image =
    product.image ||
    product.imageUrl ||
    product.thumbnail ||
    (Array.isArray(product.images) && (product.images[0]?.url || (typeof product.images[0] === "string" ? product.images[0] : null))) ||
    "";
  const price = Number(product.price || product.salePrice || product.unitPrice || 0);
  const mrp = Number(product.mrp || product.originalPrice || Math.round(price * 1.35)) || price;
  const slug = product.slug || id;
  const sizes =  Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : (product.size ? [product.size] : ["S", "M", "L", "XL"]);
  const category =
    product.categoryName ||
    (typeof product.category === "object" ? product.category?.name : product.category) ||
    "Apparel";

  return {
    ...product,
    id,
    _id: id,
    title,
    name: title,
    image,
    price,
    mrp,
    slug,
    sizes,
    colors: Array.isArray(product.colors) && product.colors.length > 0
      ? product.colors
      : ["Black", "Crimson Red", "White", "Navy"],
    color: product.color || product.variant?.color || "Black",
    category,
    inStock: product.inStock !== false,
  };
};

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

export const getWishlistCount = () => {
  return getWishlist().length;
};

export const isInWishlist = (productId) => {
  if (!productId) return false;
  const list = getWishlist();
  const idStr = String(productId);
  return list.some((item) => String(item.id || item._id) === idStr);
};

export const addToWishlist = (product) => {
  if (!product) return getWishlist();
  const normalized = normalizeWishlistItem(product);
  if (!normalized || !normalized.id) return getWishlist();

  const list = getWishlist();
  const pid = String(normalized.id);
  if (!list.some((item) => String(item.id || item._id) === pid)) {
    const updated = [normalized, ...list];
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("wishlist_updated", { detail: updated }));
    } catch { }
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
  } catch { }
  return updated;
};

export const toggleWishlist = (product) => {
  if (!product) return false;
  const pid = String(product.id || product._id || product.productId || "");
  const exists = isInWishlist(pid);
  if (exists) {
    removeFromWishlist(pid);
    return false;
  } else {
    addToWishlist(product);
    return true;
  }
};

export const clearWishlist = () => {
  try {
    localStorage.removeItem(WISHLIST_KEY);
    window.dispatchEvent(new CustomEvent("wishlist_updated", { detail: [] }));
  } catch { }
  return [];
};
