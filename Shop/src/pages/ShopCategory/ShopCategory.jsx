import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { categories, getProductsByCategory } from "../../services/productService";

const filterSections = [
  { key: "shopFor", label: "Shop For", options: ["Men", "Women", "Unisex"] },
  { key: "category", label: "Category", options: ["T-Shirts", "Hoodies", "Stickers", "Posters"] },
  { key: "price", label: "Price", options: ["Under ₹500", "₹500 - ₹1000", "₹1000 - ₹2000", "Above ₹2000"] },
  { key: "occasions", label: "Occasions", options: ["Casual", "Party", "Sports"] },
  { key: "discounts", label: "Discounts", options: ["10% and above", "25% and above", "50% and above"] },
  { key: "colours", label: "Colours", options: ["Black", "White", "Red", "Blue"] },
  { key: "sizes", label: "Sizes", options: ["XS", "S", "M", "L", "XL", "XXL"] },
  { key: "fits", label: "Fits", options: ["Regular", "Oversized", "Skinny", "Compressed"] },
  { key: "reviews", label: "Reviews", options: ["4★ and above", "3★ and above"] },
];

const ShopCategory = () => {
  const navigate = useNavigate();
  const { categoryName } = useParams();
  const products = useMemo(() => getProductsByCategory(categoryName), [categoryName]);
  const currentCategory =
    categories.find((c) => c.slug === categoryName)?.name || "All Products";

  const [openSections, setOpenSections] = useState({
    shopFor: false,
    category: false,
    price: false,
    occasions: false,
    discounts: false,
    colours: false,
    sizes: false,
    fits: true,
    reviews: false,
  });
  const [selected, setSelected] = useState({});
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState("Recommended");
  const [page, setPage] = useState(1);

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
  };

  return (
    <div className="w-full bg-white text-black">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        <div className="flex gap-6">
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

          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl md:text-3xl font-bold">{currentCategory}</h1>

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
                      "Price (Low to High)",
                      "Price (High to Low)",
                      "Customer Rating",
                      "Rating (High to Low)",
                      "Recommended",
                      "Popularity",
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

            {products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500">No products in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/product/${p.id}`)}
                    className="cursor-pointer group border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition-shadow bg-white"
                  >
                    <div className="w-full h-[280px] bg-gray-100 flex items-center justify-center overflow-hidden">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">Product Image</span>
                      )}
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

            <div className="flex items-center justify-between mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                &lt;&lt; Prev
              </button>

              <div className="flex items-center gap-2">
                <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md text-sm hover:border-gray-400">
                  -
                </button>
                {[1, 2].map((n) => (
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
                onClick={() => setPage((p) => p + 1)}
                className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium hover:border-gray-400 transition"
              >
                Next &gt;&gt;
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ShopCategory;
