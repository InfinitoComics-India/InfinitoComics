import { useEffect } from "react";

/**
 * Bounces the user to the Shop subdomain. In production this is
 * `/shop/` on the same host; in development it points at Vite's dev server.
 */
const SHOP_BASE_URL =
  import.meta.env.VITE_SHOP_BASE_URL || `${window.location.origin}/shop/`;

const ShopRedirect = () => {
  useEffect(() => {
    window.location.replace(SHOP_BASE_URL);
  }, []);

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center text-gray-500">
      Redirecting to shop...
    </div>
  );
};

export default ShopRedirect;
