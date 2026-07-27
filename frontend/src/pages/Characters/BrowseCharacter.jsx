import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAll } from "../../services/CharacterServices";

const AtoZOptions = ["A to Z", "Z to A"];
const PAGE_SIZE = 12;

function getPaginatedData(data, page, pageSize) {
  const start = (page - 1) * pageSize;
  return data.slice(start, start + pageSize);
}

export default function CharacterBrowser() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [atoz, setAtoz] = useState(AtoZOptions[0]);
  const [characters, setCharacters] = useState([]); // renamed to plural for clarity
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const resData = await getAll();
        const charArray = Array.isArray(resData.data) ? resData.data : [];
        const formatted = charArray.map((char) => ({
          id: char._id,
          name: char.originalName || "Unknown",
          image: char.mainImageUrl || "",
        }));
        setCharacters(formatted);
      } catch (err) {
        console.error("Error fetching characters:", err);
      } finally {
        setTimeout(() => setLoading(false), 2400);
      }
    };
    fetchCharacters();
  }, []);

  // Filter and sort dynamically from state
  let filtered = characters.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  filtered = filtered.sort((a, b) =>
    atoz === "A to Z"
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name)
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = getPaginatedData(filtered, page, PAGE_SIZE);

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
  }, [search, atoz]);

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold tracking-widest mb-2 md:mb-0">
          BROWSE ALL CHARACTERS{" "}
          <span className="font-normal">({characters.length})</span>
        </h2>

        {/* AtoZ filter */}
        <div className="flex items-center">
          <select
            value={atoz}
            onChange={(e) => setAtoz(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-xs font-semibold tracking-widest focus:outline-none"
          >
            {AtoZOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center border border-gray-300 rounded mb-6 max-w-md">
        <input
          type="text"
          placeholder="What are you looking for?"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 text-sm focus:outline-none"
        />
        <button className="px-3 py-2">
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11L15 15" />
          </svg>
        </button>
      </div>

      {/* Characters grid */}
      <div className="w-full">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-lg font-bold text-gray-400">
            Loading...
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-lg font-bold text-gray-400">
            Oops, no character found
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {paginated.map((char) => (
                <div
                  key={char.id}
                  className="flex flex-col cursor-pointer"
                  onClick={() =>
                    navigate("/characters/biography", { state: char.id })
                  }
                >
                  <div className="relative w-full aspect-[3/4] rounded-t flex items-end justify-center">
                    <img
                      src={char.image}
                      alt={char.name}
                      className="h-40 sm:h-48 md:h-56 object-contain mx-auto"
                      draggable="false"
                    />
                  </div>
                  <div className="bg-black text-white text-xs md:text-sm font-medium tracking-widest text-center py-2 rounded-b">
                    {char.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center mt-8 space-x-1">
              <button
                className="border border-gray-400 rounded w-8 h-8 flex items-center justify-center text-lg"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                &lt;
              </button>
              {getPagination().map((p, i) =>
                p === "..." ? (
                  <span
                    key={i}
                    className="w-8 h-8 flex items-center justify-center text-lg"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={i}
                    className={`border border-gray-400 rounded w-8 h-8 flex items-center justify-center text-lg ${
                      page === p
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-white"
                    }`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                className="border border-gray-400 rounded w-8 h-8 flex items-center justify-center text-lg"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                &gt;
              </button>
              <a
                href="#"
                className="ml-6 text-xs font-semibold tracking-widest underline hover:text-red-500"
              >
                SEE ALL &gt;
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
