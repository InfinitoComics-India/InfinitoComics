import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, X, RotateCcw, SlidersHorizontal } from "lucide-react";
import { getAll } from "../../services/CharacterServices";

const AtoZOptions = ["A to Z", "Z to A"];
const DEFAULT_PAGE_SIZE = 12;

export default function CharacterBrowser() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [atoz, setAtoz] = useState(AtoZOptions[0]);
  const [characters, setCharacters] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  // Accordion open/close state
  const [openSections, setOpenSections] = useState({
    gender: true,
    species: false,
    placeOfOrigin: false,
    powers: false,
  });

  // Filter selection state
  const [selectedFilters, setSelectedFilters] = useState({
    gender: [],
    species: [],
    placeOfOrigin: [],
    powers: [],
  });

  // Mobile sidebar visibility
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const resData = await getAll();
        const charArray = Array.isArray(resData.data) ? resData.data : [];
        const formatted = charArray.map((char) => ({
          id: char._id,
          name: char.knownAs || char.originalName || "Unknown",
          originalName: char.originalName || "",
          knownAs: char.knownAs || "",
          image: char.mainImageUrl || "",
          placeOfOrigin: char.placeOfOrigin || "Unknown",
          gender: char.gender || "Unknown",
          species: char.species || "Unknown",
          powers: Array.isArray(char.powers)
            ? char.powers.filter(Boolean)
            : char.powers
            ? [char.powers]
            : [],
        }));
        setCharacters(formatted);
      } catch (err) {
        console.error("Error fetching characters:", err);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchCharacters();
  }, []);

  // Compute available filter options dynamically from character data
  const filterOptions = useMemo(() => {
    const genders = {};
    const species = {};
    const places = {};
    const powers = {};

    characters.forEach((char) => {
      // Gender
      if (char.gender && char.gender !== "Unknown") {
        genders[char.gender] = (genders[char.gender] || 0) + 1;
      }
      // Species
      if (char.species && char.species !== "Unknown") {
        species[char.species] = (species[char.species] || 0) + 1;
      }
      // Place of origin
      if (char.placeOfOrigin && char.placeOfOrigin !== "Unknown") {
        places[char.placeOfOrigin] = (places[char.placeOfOrigin] || 0) + 1;
      }
      // Powers
      if (Array.isArray(char.powers)) {
        char.powers.forEach((p) => {
          const trimmed = String(p).trim();
          if (trimmed) powers[trimmed] = (powers[trimmed] || 0) + 1;
        });
      }
    });

    return {
      gender: Object.entries(genders).sort((a, b) => a[0].localeCompare(b[0])),
      species: Object.entries(species).sort((a, b) => a[0].localeCompare(b[0])),
      placeOfOrigin: Object.entries(places).sort((a, b) => a[0].localeCompare(b[0])),
      powers: Object.entries(powers).sort((a, b) => a[0].localeCompare(b[0])),
    };
  }, [characters]);

  // Toggle filter item
  const toggleFilter = (category, value) => {
    setSelectedFilters((prev) => {
      const currentList = prev[category] || [];
      const updated = currentList.includes(value)
        ? currentList.filter((item) => item !== value)
        : [...currentList, value];
      return { ...prev, [category]: updated };
    });
    setPage(1);
  };

  // Toggle accordion open/close
  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFilters({
      gender: [],
      species: [],
      placeOfOrigin: [],
      powers: [],
    });
    setSearch("");
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedFilters.gender.length > 0 ||
    selectedFilters.species.length > 0 ||
    selectedFilters.placeOfOrigin.length > 0 ||
    selectedFilters.powers.length > 0;

  // Filter and sort dynamically
  const filtered = useMemo(() => {
    let result = characters.filter((c) => {
      // Search term
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesOriginal = c.originalName?.toLowerCase().includes(query);
        const matchesKnownAs = c.knownAs?.toLowerCase().includes(query);
        const matchesOrigin = c.placeOfOrigin?.toLowerCase().includes(query);
        if (!matchesName && !matchesOriginal && !matchesKnownAs && !matchesOrigin) {
          return false;
        }
      }

      // Gender filter
      if (selectedFilters.gender.length > 0) {
        if (!selectedFilters.gender.includes(c.gender)) return false;
      }

      // Species filter
      if (selectedFilters.species.length > 0) {
        if (!selectedFilters.species.includes(c.species)) return false;
      }

      // Place of Origin filter
      if (selectedFilters.placeOfOrigin.length > 0) {
        if (!selectedFilters.placeOfOrigin.includes(c.placeOfOrigin)) return false;
      }

      // Powers filter
      if (selectedFilters.powers.length > 0) {
        const hasMatchingPower = selectedFilters.powers.some((p) =>
          c.powers.includes(p)
        );
        if (!hasMatchingPower) return false;
      }

      return true;
    });

    // Sort A to Z or Z to A
    result.sort((a, b) =>
      atoz === "A to Z"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

    return result;
  }, [characters, search, selectedFilters, atoz]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  const getPagination = () => {
    let arr = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) arr.push(i);
    } else {
      arr = [1];
      if (page > 3) arr.push("...");
      if (page > 2) arr.push(page - 1);
      if (page !== 1 && page !== totalPages) arr.push(page);
      if (page < totalPages - 1) arr.push(page + 1);
      if (page < totalPages - 2) arr.push("...");
      arr.push(totalPages);
    }
    return arr;
  };

  useEffect(() => {
    setPage(1);
  }, [search, atoz, selectedFilters]);

  // Render accordion filter group
  const renderAccordion = (key, label, items) => {
    const isOpen = openSections[key];
    const selectedCount = selectedFilters[key]?.length || 0;

    return (
      <div className="border-b border-gray-200 last:border-b-0">
        <button
          type="button"
          onClick={() => toggleSection(key)}
          className="w-full py-3.5 px-3 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer select-none text-left"
        >
          <span className="text-xs font-bold tracking-wider text-gray-800 uppercase flex items-center gap-1.5">
            {label}
            {selectedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#DD1215] text-white text-[10px] flex items-center justify-center font-semibold">
                {selectedCount}
              </span>
            )}
          </span>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="px-3 pb-3 pt-1 space-y-1 max-h-48 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-[11px] text-gray-400 italic py-1">No options available</p>
            ) : (
              items.map(([val, count]) => {
                const checked = selectedFilters[key].includes(val);
                return (
                  <label
                    key={val}
                    className="flex items-center justify-between text-xs text-gray-700 py-1 px-1 rounded hover:bg-gray-100 cursor-pointer select-none transition"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFilter(key, val)}
                        className="rounded border-gray-300 text-[#DD1215] focus:ring-[#DD1215] w-3.5 h-3.5 cursor-pointer accent-[#DD1215]"
                      />
                      <span className="capitalize">{val}</span>
                    </div>
                    <span className="text-[11px] text-gray-400">({count})</span>
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full py-8 bg-white font-sans">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2">
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-wider text-black uppercase"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            BROWSE CHARACTERS ({characters.length})
          </h2>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden inline-flex items-center gap-1.5 border border-gray-300 rounded px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <SlidersHorizontal size={14} />
              <span>Filters {hasActiveFilters && "•"}</span>
            </button>

            {/* A to Z Sort */}
            <div className="flex items-center">
              <select
                value={atoz}
                onChange={(e) => setAtoz(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-xs font-semibold tracking-wider text-gray-800 bg-white focus:outline-none cursor-pointer"
              >
                {AtoZOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2-Column Content: Left Filter Sidebar + Right Character Grid */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* ── Left Sidebar Filter ── */}
          <aside
            className={`w-full md:w-64 lg:w-72 shrink-0 ${
              mobileFilterOpen ? "block" : "hidden md:block"
            }`}
          >
            {/* Search Bar with Red Icon Button */}
            <div className="flex items-stretch border border-gray-300 rounded overflow-hidden mb-6 focus-within:border-gray-500 transition">
              <input
                type="text"
                placeholder="Search characters..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-3 py-2 text-xs md:text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-white min-w-0"
              />
              <button
                type="button"
                className="bg-[#DD1215] hover:bg-red-700 text-white px-3.5 flex items-center justify-center transition cursor-pointer"
                aria-label="Search"
              >
                <Search size={15} />
              </button>
            </div>

            {/* Filter Accordions */}
            <div className="border border-gray-200 rounded overflow-hidden bg-white shadow-2xs">
              {renderAccordion("gender", "GENDER", filterOptions.gender)}
              {renderAccordion("species", "SPECIES", filterOptions.species)}
              {renderAccordion("placeOfOrigin", "PLACE OF ORIGIN", filterOptions.placeOfOrigin)}
              {renderAccordion("powers", "POWERS", filterOptions.powers)}
            </div>

            {/* Clear All Filters button if active */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-4 w-full py-2 px-3 border border-red-200 bg-red-50 hover:bg-red-100 text-[#DD1215] rounded text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Reset All Filters</span>
              </button>
            )}
          </aside>

          {/* ── Right Content Area: Characters Grid ── */}
          <main className="flex-1 min-w-0 w-full">
            {loading ? (
              <div className="flex items-center justify-center h-64 text-base font-semibold text-gray-400">
                Loading characters…
              </div>
            ) : paginated.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-500">
                <p className="text-base font-semibold mb-2">Oops, no character found</p>
                <p className="text-xs text-gray-400 mb-4">
                  Try adjusting your search query or clearing active filters.
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="px-4 py-1.5 bg-[#DD1215] text-white text-xs font-bold rounded hover:bg-red-700 transition cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Character Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginated.map((char) => (
                    <div
                      key={char.id}
                      onClick={() =>
                        navigate("/characters/biography", { state: char.id })
                      }
                      className="group cursor-pointer flex flex-col"
                    >
                      {/* White border image card container */}
                      <div className="border border-gray-200 rounded-lg p-3 bg-white flex items-center justify-center aspect-[3/4] overflow-hidden shadow-2xs group-hover:border-gray-300 group-hover:shadow-sm transition">
                        <img
                          src={char.image || "/images/placeholder.png"}
                          alt={char.name}
                          className="w-full h-full object-contain mx-auto transition-transform duration-300 group-hover:scale-105"
                          draggable="false"
                        />
                      </div>

                      {/* Character Details below image */}
                      <div className="mt-2.5 text-left">
                        <h3 className="text-sm md:text-base font-bold text-gray-900 leading-tight group-hover:text-[#DD1215] transition line-clamp-1">
                          {char.name}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium mt-0.5 capitalize">
                          {char.placeOfOrigin || "Unknown"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Pagination ── */}
                <div className="flex items-center justify-center mt-12 space-x-1.5">
                  {/* Previous page */}
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="border border-gray-300 rounded w-8 h-8 flex items-center justify-center text-sm font-semibold hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    aria-label="Previous page"
                  >
                    &lt;
                  </button>

                  {/* Page numbers */}
                  {getPagination().map((p, i) =>
                    p === "..." ? (
                      <span
                        key={i}
                        className="w-8 h-8 flex items-center justify-center text-sm text-gray-400"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`border rounded w-8 h-8 flex items-center justify-center text-xs md:text-sm font-bold transition cursor-pointer ${
                          page === p
                            ? "bg-[#DD1215] text-white border-[#DD1215]"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  {/* Next page */}
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="border border-gray-300 rounded w-8 h-8 flex items-center justify-center text-sm font-semibold hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    aria-label="Next page"
                  >
                    &gt;
                  </button>

                  {/* SEE ALL */}
                  <button
                    type="button"
                    onClick={() => {
                      setPageSize(filtered.length || DEFAULT_PAGE_SIZE);
                      setPage(1);
                    }}
                    className="ml-5 text-xs font-extrabold tracking-widest uppercase text-gray-900 hover:text-[#DD1215] transition cursor-pointer"
                  >
                    SEE ALL &gt;
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
