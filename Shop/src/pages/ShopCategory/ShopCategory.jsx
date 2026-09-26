import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  fetchCategories,
  fetchProductsByCategory,
} from "../../services/productService";

// Sidebar filter definitions. Sort options and generic filter categories are
// kept static because they don't depend on backend data — the actual product
// list, category name, and filter results all come from the API.
const filterSections = [
  { key: "shopFor", label: "Shop For", options: ["Men", "Women", "Unisex"] },
  { key: "price", label: "Price", options: ["Under ₹500", "₹500 - ₹1000", "₹1000 - ₹2000", "Above ₹2000"] },
  { key: "discounts", label: "Discounts", options: ["10% and above", "25% and above", "50% and above"] },
  { key: "sizes", label: "Sizes", options: ["XS", "S", "M", "L", "XL", "XXL"] },
  { key: "reviews", label: "Reviews", options: ["4★ and above", "3★ and above"] },
];

const PAGE_SIZE = 12;

// Product card image with a graceful fallback when the URL fails (broken
// upload, wrong MIME, missing file on Render).
const ProductImage = ({ src, alt, className }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) {
    return (
      <div className={`${className || ""} flex items-center justify-center text-gray-400 text-sm`}>
        Product Image
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
};

const ShopCategory = () => {
  const navigate = useNavigate();
  const { categoryName } = useParams();

  const [products, setProducts] = useState([]);
  const [categoryLabel, setCategoryLabel] = useState("");
  const [loading, setLoading] = useState(true);

  const [openSections, setOpenSections] = useState({
    shopFor: false,
    price: false,
    discounts: false,
    sizes: false,
    reviews: false,
  });
  const [selected, setSelected] = useState({});
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState("Recommended");
  const [page, setPage] = useState(1);

  // Load products for this category + resolve the category display name.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setPage(1);
      const [prods, cats] = await Promise.all([
        fetchProductsByCategory(categoryName),
        fetchCategories(),
      ]);
      if (cancelled) return;
      setProducts(Array.isArray(prods) ? prods : []);
      const match = Array.isArray(cats)
        ? cats.find((c) => c.slug === categoryName)
        : null;
      setCategoryLabel(match?.name || categoryName || "All Products");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryName]);

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleOption = (section, option) => {
    setSelected((prev) => {
      const current = prev[section] || [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [section]: next };
    });
    setPage(1);
  };

  // Apply price-range filter client-side, plus any sort choice.
  const visibleProducts = useMemo(() => {
    let list = [...products];

    const priceRanges = selected.price || [];
    if (priceRanges.length > 0) {
      list = list.filter((p) => {
        const price = Number(p.price) || 0;
        return priceRanges.some((label) => {
          if (label === "Under ₹500") return price < 500;
          if (label === "₹500 - ₹1000") return price >= 500 && price <= 1000;
          if (label === "₹1000 - ₹2000") return price > 1000 && price <= 2000;
          if (label === "Above ₹2000") return price > 2000;
          return true;
        });
      });
    }

    switch (sortBy) {
      case "Price (Low to High)":
        list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case "Price (High to Low)":
        list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      default:
        break;
    }

    return list;
  }, [products, selected, sortBy]);

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PAGE_SIZE));
  const pagedProducts = visibleProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="w-full bg-white text-black">
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-8">
        <div className="flex gap-6">
          {/* ── Filter sidebar ─────────────────────────────── */}
          <aside className="hidden md:block w-[280px] flex-shrink-0 bg-white border border-gray-200 rounded-md h-fit sticky top-32">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold">Filters</h3>
            </div>

            {filterSections.map((section) => (
              <div key={section.key} className="border-b border-gray-200">
                <button
                  onClick={() => toggleSection(section.key)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <span className="text-base font-semibold">{section.label}</span>
                  {openSections[section.key] ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {openSections[section.key] && (
                  <div className="px-5 pb-4 space-y-2">
                    {section.options.map((opt) => {
                      const isSelected = (selected[section.key] || []).includes(opt);
                      return (
                        <label
                          key={opt}
                          className="flex items-center gap-3 cursor-pointer text-sm text-gray-700 hover:text-black"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleOption(section.key, opt)}
                            className="w-4 h-4 accent-[#DD1215]"
                          />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </aside>

          {/* ── Main content ───────────────────────────────── */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl md:text-3xl font-bold">{categoryLabel}</h1>

              <div className="relative">
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-3 px-5 py-3 border border-gray-300 rounded-md hover:border-gray-400 transition text-sm"
                >
                  <span className="font-medium">Sort By</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showSort && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-2">
                    {[
                      "Recommended",
                      "Price (Low to High)",
                      "Price (High to Low)",
                    ].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSortBy(opt);
                          setShowSort(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-left"
                      >
                        <input
                          type="checkbox"
                          checked={sortBy === opt}
                          readOnly
                          className="w-4 h-4 accent-[#DD1215]"
                        />
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#DD1215]" />
                <p className="mt-4 text-gray-500">Loading products…</p>
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500">No products in this category yet.</p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-4 px-6 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  Browse all categories
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {pagedProducts.map((p) => (
                  <div
                    key={p._id || p.id}
                    onClick={() => navigate(`/product/${p.slug || p._id || p.id}`)}
                    className="cursor-pointer group border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition-shadow bg-white"
                  >
                    <div className="w-full h-[280px] bg-gray-100 flex items-center justify-center overflow-hidden">
                      <ProductImage
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-widest text-[#DD1215] font-bold">
                        {p.name}
                      </p>
                      <p className="text-sm text-gray-800 mt-1 line-clamp-1">{p.title}</p>
                      <p className="text-lg font-bold mt-2">Rs.{p.price}/-</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination — only show when there's more than a page of results */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  &lt;&lt; Prev
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium transition ${
                        page === n
                          ? "bg-black text-white"
                          : "border border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next &gt;&gt;
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ShopCategory;
