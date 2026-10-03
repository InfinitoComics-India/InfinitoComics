import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchComics } from "../../services/ComicService.js";
import { getAll as fetchCharacters } from "../../services/CharacterServices.js";
import heroImg from "../../../assets/Images/quick-vision.png";

/* ─── Shimmer ─────────────────────────────────────────────── */
const CardShimmer = () => (
  <div className="flex-shrink-0 animate-pulse" style={{ width: "155px" }}>
    <div className="w-[155px] h-[200px] bg-gray-200" />
    <div className="h-3 bg-gray-200 mt-2 w-4/5 rounded" />
    <div className="h-3 bg-gray-200 mt-1 w-3/5 rounded" />
  </div>
);

/* ─── Hero Banner — matches Character Spotlight style ────── */
const HeroBanner = () => {
  const navigate = useNavigate();
  return (
    <div className="relative bg-black" style={{ minHeight: "70vh" }}>
      {/* Background image */}
      <img
        src={heroImg}
        alt="Comic Spotlight"
        className="absolute inset-0 w-full h-full object-cover object-right md:object-center opacity-90 transition-all duration-500"
        style={{ zIndex: 0 }}
      />
      {/* Gradient overlay — left to right like character page */}
      <div
        className="absolute inset-0 z-10"
        style={{ background: "linear-gradient(to right, rgba(0,0,0,0.90) 35%, rgba(0,0,0,0.55) 60%, transparent 100%)" }}
      />
      {/* Content */}
      <div className="relative z-20 flex flex-col justify-center h-[60vh] md:h-[70vh] w-full max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="max-w-lg pt-16 md:pt-0">
          <p className="text-white text-xs tracking-[0.22em] uppercase mb-2">
            Comic Spotlight
          </p>
          <h1
            className="font-extrabold uppercase leading-none mb-4"
            style={{
              color: "#DD1215",
              fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
              fontFamily: "Impact, Arial Black, sans-serif",
              letterSpacing: "0.08em",
            }}
          >
            UNTIL DEATH
          </h1>
          <p className="text-white text-base md:text-lg mb-8 max-w-sm leading-relaxed">
            A moody Mumbai street surfer with custom weapons, fog-cutting vision,
            and a speed-boosting ride—meet the rogue who upgrades on the fly and
            never plays by the rules.
          </p>
          <button className="border border-white text-white px-6 py-2 text-xs tracking-widest hover:bg-white hover:text-black transition uppercase">
            Read Now &rsaquo;
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Torn edge ───────────────────────────────────────────── */
const TornEdge = () => (
  <div style={{ background: '#000', marginBottom: '-1px', lineHeight: 0 }}>
    <svg viewBox="0 0 1440 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '40px' }}>
      <path fill="white" d="M0,40 L0,28 C40,36 55,14 90,26 C115,34 130,10 165,22 C195,32 215,8 250,20 C278,30 295,6 330,18 C360,28 375,4 415,16 C445,26 465,2 500,14 C530,24 548,0 582,12 C612,22 632,38 668,26 C698,16 718,32 754,20 C784,10 802,26 838,14 C868,4 888,20 924,8 C954,18 972,34 1008,22 C1038,12 1058,28 1094,16 C1124,6 1142,22 1178,10 C1208,0 1228,16 1264,4 C1294,14 1314,30 1350,18 C1380,8 1400,24 1440,12 L1440,40 Z" />
    </svg>
  </div>
);

/* ─── Today's Spotlight ───────────────────────────────────── */
const TodaysSpotlight = ({ comics, isLoading }) => {
  const navigate = useNavigate();
  const featured = comics[0];
  const sideCards = comics.slice(1, 3);
  if (!isLoading && comics.length === 0) return null;
  return (
    <div className="w-full max-w-[1200px] mx-auto px-12 mt-10 mb-6">
      <h2 className="text-[0.68rem] font-black tracking-[0.22em] uppercase text-gray-900 mb-5">Today's Spotlight</h2>
      {isLoading ? (
        <div className="flex gap-4 animate-pulse">
          <div className="w-[138px] h-[174px] bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-5 items-start">
          <div className="flex gap-4 flex-1 cursor-pointer group" onClick={() => navigate(`/comicChap/${featured._id}/chapters`)}>
            <div className="relative flex-shrink-0">
              <img src={featured.coverImg} alt={featured.title} className="w-[138px] h-[174px] object-cover shadow-md" />
              <div className="absolute bottom-0 left-0 right-0 bg-black text-white text-[0.52rem] font-bold tracking-widest text-center py-1 uppercase">New Release</div>
            </div>
            <div className="flex flex-col justify-between py-1 flex-1">
              <div>
                <h3 className="text-[0.95rem] font-bold text-gray-900 leading-snug group-hover:text-red-600 transition-colors">{featured.title}</h3>
                <p className="text-[0.6rem] font-bold tracking-widest text-gray-400 uppercase mt-1">
                  {Array.isArray(featured.authors) ? featured.authors.join(" and ") : featured.authors}
                  {featured.releasedYear && <span className="ml-3 normal-case font-normal">{featured.releasedYear}</span>}
                </p>
                <p className="text-[0.72rem] text-gray-500 mt-2 leading-relaxed line-clamp-4">{featured.description}</p>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <button onClick={(e) => e.stopPropagation()} className="border border-gray-300 p-1.5 hover:border-black transition"><Bookmark size={13} /></button>
                <button onClick={(e) => { e.stopPropagation(); navigate(`/comicChap/${featured._id}/chapters`); }} className="bg-red-600 text-white text-[0.6rem] font-bold tracking-widest px-4 py-1.5 hover:bg-red-700 transition uppercase">Read Now &rsaquo;</button>
              </div>
            </div>
          </div>
          {sideCards.length > 0 && (
            <div className="flex gap-3 flex-shrink-0">
              {sideCards.map((comic) => (
                <div key={comic._id} onClick={() => navigate(`/comicChap/${comic._id}/chapters`)} className="cursor-pointer group">
                  <img src={comic.coverImg} alt={comic.title} className="w-[125px] h-[160px] object-cover shadow group-hover:opacity-80 transition" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Comic Row ───────────────────────────────────────────── */
const ComicRow = ({ title, comics, isLoading, navigate }) => {
  const sliderRef = useRef(null);
  const scroll = (dir) => sliderRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  if (!isLoading && comics.length === 0) return null;
  return (
    <div className="w-full max-w-[1200px] mx-auto px-12 mt-10 mb-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-black tracking-[0.18em] uppercase text-gray-900">{title} &rsaquo;</h2>
        <button className="text-red-600 text-[0.62rem] font-bold tracking-widest hover:underline uppercase">View More &rsaquo;</button>
      </div>
      <div className="relative">
        <button onClick={() => scroll(-1)} className="absolute -left-6 top-[45%] -translate-y-1/2 z-10 bg-white border border-gray-300 shadow p-1.5 hover:bg-gray-100"><ChevronLeft size={16} /></button>
        <div ref={sliderRef} className="flex overflow-x-auto gap-6 no-scrollbar scroll-smooth pb-2">
          {isLoading
            ? [...Array(5)].map((_, i) => (
                <div key={i} className="flex-shrink-0 animate-pulse" style={{ width: "220px" }}>
                  <div className="w-[220px] h-[280px] bg-gray-200" />
                  <div className="h-10 bg-gray-800 mt-2 w-full" />
                </div>
              ))
            : comics.map((comic) => (
                <div key={comic._id} onClick={() => navigate(`/comicChap/${comic._id}/chapters`)} className="flex-shrink-0 cursor-pointer group" style={{ width: "220px" }}>
                  <div className="w-[220px] h-[280px] overflow-hidden bg-gray-100">
                    <img src={comic.coverImg} alt={comic.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="bg-black text-white text-sm font-medium text-center py-3 px-2 truncate">
                    {comic.title}
                  </div>
                </div>
              ))}
        </div>
        <button onClick={() => scroll(1)} className="absolute -right-6 top-[45%] -translate-y-1/2 z-10 bg-white border border-gray-300 shadow p-1.5 hover:bg-gray-100"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
};

/* ─── Characters Row ──────────────────────────────────────── */
const CharactersRow = ({ characters, isLoading }) => {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const scroll = (dir) => sliderRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  if (!isLoading && characters.length === 0) return null;
  return (
    <div className="w-full max-w-[1200px] mx-auto px-12 mt-10 mb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-black tracking-[0.18em] uppercase text-gray-900">
          Featured Characters
        </h2>
        <button onClick={() => navigate("/characters")} className="text-red-600 text-[0.62rem] font-bold tracking-widest hover:underline uppercase">
          View More &rsaquo;
        </button>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          className="absolute -left-6 top-[45%] -translate-y-1/2 z-10 bg-white border border-gray-300 shadow p-1.5 hover:bg-gray-100"
        >
          <ChevronLeft size={16} />
        </button>

        <div ref={sliderRef} className="flex overflow-x-auto gap-6 no-scrollbar scroll-smooth pb-2">
          {isLoading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 animate-pulse" style={{ width: "220px" }}>
                  <div className="w-[220px] h-[280px] bg-gray-200" />
                  <div className="h-10 bg-gray-800 mt-2 w-full" />
                </div>
              ))
            : characters.map((char) => (
                <div
                  key={char._id}
                  onClick={() => navigate(`/characters/${char._id}`)}
                  className="flex-shrink-0 cursor-pointer group"
                  style={{ width: "220px" }}
                >
                  {/* Image */}
                  <div className="w-[220px] h-[280px] overflow-hidden bg-gray-100">
                    <img
                      src={char.images?.[0] || char.coverImg || "https://via.placeholder.com/220x280"}
                      alt={char.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {/* Name black bar */}
                  <div className="bg-black text-white text-sm font-medium text-center py-3 px-2 truncate">
                    {char.name}
                  </div>
                </div>
              ))}
        </div>

        <button
          onClick={() => scroll(1)}
          className="absolute -right-6 top-[45%] -translate-y-1/2 z-10 bg-white border border-gray-300 shadow p-1.5 hover:bg-gray-100"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

/* ─── Genres Row ──────────────────────────────────────────── */
const GENRES = ["Thriller", "Crime", "Fantasy", "Thriller", "Crime"];

const GenresRow = ({ comics, isLoading }) => {
  const sliderRef = useRef(null);
  const scroll = (dir) => sliderRef.current?.scrollBy({ left: dir * 180, behavior: "smooth" });
  if (!isLoading && comics.length === 0) return null;

  // Group comics by genre (use releasedYear as placeholder category for now)
  const genreComics = GENRES.map((genre, i) => ({ genre, comic: comics[i % comics.length] }));

  return (
    <div className="w-full max-w-[1200px] mx-auto px-12 mt-10 mb-16">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[0.75rem] font-black tracking-[0.18em] uppercase text-gray-900">Genres to Read &rsaquo;</h2>
        <button className="text-red-600 text-[0.62rem] font-bold tracking-widest hover:underline uppercase">View More &rsaquo;</button>
      </div>
      <div className="relative">
        <button onClick={() => scroll(-1)} className="absolute -left-6 top-[45%] -translate-y-1/2 z-10 bg-white border border-gray-300 shadow p-1.5 hover:bg-gray-100"><ChevronLeft size={16} /></button>
        <div ref={sliderRef} className="flex overflow-x-auto gap-3 no-scrollbar scroll-smooth pb-1">
          {isLoading ? [...Array(5)].map((_, i) => <CardShimmer key={i} />) : genreComics.map((item, i) => (
            <div key={i} className="flex-shrink-0 cursor-pointer group" style={{ width: "155px" }}>
              <div className="relative overflow-hidden">
                <img src={item.comic.coverImg} alt={item.genre} className="w-[155px] h-[200px] object-cover group-hover:scale-105 transition-transform duration-300 brightness-75" />
                <div className="absolute inset-0 flex items-end justify-center pb-3">
                  <p className="text-white text-[0.7rem] font-black uppercase tracking-widest">{item.genre}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => scroll(1)} className="absolute -right-6 top-[45%] -translate-y-1/2 z-10 bg-white border border-gray-300 shadow p-1.5 hover:bg-gray-100"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
};

/* ─── Browse Comics Section ───────────────────────────────── */
const FILTER_SECTIONS = ["Characters", "Series", "Type", "Imprints", "Date Ranges"];
const SORT_OPTIONS = ["A to Z", "Z to A", "Newest First", "Oldest First"];
const PAGE_SIZE = 12;

const BrowseComics = ({ comics, isLoading, navigate }) => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("A to Z");
  const [sortOpen, setSortOpen] = useState(false);
  const [openFilters, setOpenFilters] = useState({});
  const [page, setPage] = useState(1);

  const toggleFilter = (name) =>
    setOpenFilters((prev) => ({ ...prev, [name]: !prev[name] }));

  // Filter + sort
  const filtered = comics
    .filter((c) =>
      (c.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(c.authors) ? c.authors.join(" ") : c.authors || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "A to Z") return (a.title || "").localeCompare(b.title || "");
      if (sort === "Z to A") return (b.title || "").localeCompare(a.title || "");
      if (sort === "Newest First") return (b.releasedYear || 0) - (a.releasedYear || 0);
      if (sort === "Oldest First") return (a.releasedYear || 0) - (b.releasedYear || 0);
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when search/sort changes
  useEffect(() => { setPage(1); }, [search, sort]);

  // Pagination helper — show: 1 2 3 … 8
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, "…", totalPages];
    if (page >= totalPages - 2) return [1, "…", totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", page - 1, page, page + 1, "…", totalPages];
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-12 mt-4 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black tracking-[0.14em] uppercase text-gray-900">
          Browse Comics ({isLoading ? "…" : filtered.length})
        </h2>
        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen((v) => !v)}
            className="flex items-center gap-2 border border-gray-300 px-4 py-2 text-xs font-semibold tracking-widest uppercase hover:border-black transition min-w-[120px] justify-between"
          >
            <span>{sort}</span>
            <ChevronRight size={13} className={`transition-transform ${sortOpen ? "rotate-90" : ""}`} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-md z-20 min-w-[160px]">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setSort(opt); setSortOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-xs tracking-widest uppercase hover:bg-gray-50 ${sort === opt ? "font-bold text-red-600" : "text-gray-700"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-8">
        {/* ── Left Sidebar ── */}
        <div className="w-[220px] flex-shrink-0">
          {/* Search bar */}
          <div className="flex items-center border border-gray-300 mb-4 overflow-hidden">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 text-xs outline-none placeholder-gray-400"
            />
            <button className="bg-red-600 px-3 py-2 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="text-white" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="22" y2="22" />
              </svg>
            </button>
          </div>

          {/* Filter accordions */}
          {FILTER_SECTIONS.map((name) => (
            <div key={name} className="border border-gray-300 mb-[-1px]">
              <button
                onClick={() => toggleFilter(name)}
                className="w-full flex items-center justify-between px-4 py-3 text-[0.65rem] font-black tracking-[0.18em] uppercase text-gray-800 hover:bg-gray-50"
              >
                <span>{name}</span>
                <span className="text-lg leading-none text-gray-500">{openFilters[name] ? "−" : "+"}</span>
              </button>
              {openFilters[name] && (
                <div className="px-4 pb-3 text-[0.65rem] text-gray-500 tracking-wide">
                  No filters available yet.
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Comic Grid ── */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-4 gap-6">
              {[...Array(PAGE_SIZE)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-full aspect-[3/4] bg-gray-200" />
                  <div className="h-3 bg-gray-200 mt-2 rounded w-4/5" />
                  <div className="h-3 bg-gray-200 mt-1 rounded w-3/5" />
                </div>
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
              No comics found.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-6">
              {paginated.map((comic) => (
                <div
                  key={comic._id}
                  onClick={() => navigate(`/comicChap/${comic._id}/chapters`)}
                  className="cursor-pointer group"
                >
                  <div className="w-full aspect-[3/4] overflow-hidden bg-gray-100">
                    <img
                      src={comic.coverImg || "https://via.placeholder.com/300x400?text=Cover"}
                      alt={comic.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-[0.78rem] font-semibold mt-2 text-gray-900 leading-snug truncate group-hover:text-red-600 transition-colors">
                    {comic.title} {comic.releasedYear && `(${comic.releasedYear})`}
                  </h3>
                  <p className="text-[0.7rem] text-gray-400 mt-0.5 truncate">
                    {Array.isArray(comic.authors) ? comic.authors.join(", ") : comic.authors || "Unknown"}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {!isLoading && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between mt-10">
              <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>

                {getPageNumbers().map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center text-xs font-bold border transition ${
                        page === p
                          ? "bg-red-600 text-white border-red-600"
                          : "border-gray-300 text-gray-700 hover:border-black"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <button className="text-red-600 text-[0.62rem] font-bold tracking-widest hover:underline uppercase">
                View All &rsaquo;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Page ────────────────────────────────────────────────── */
const ComicsPage = () => {
  const navigate = useNavigate();
  const [comics, setComics] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [charsLoading, setCharsLoading] = useState(true);

  useEffect(() => {
    fetchComics()
      .then((data) => setComics(Array.isArray(data) ? data : []))
      .catch(() => setComics([]))
      .finally(() => setIsLoading(false));

    fetchCharacters()
      .then((data) => setCharacters(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []))
      .catch(() => setCharacters([]))
      .finally(() => setCharsLoading(false));
  }, []);

  const reversed = [...comics].reverse();

  return (
    <div className="bg-white">
      <HeroBanner />
      <TornEdge />
      <TodaysSpotlight comics={reversed} isLoading={isLoading} />
      <ComicRow title="Fan Favourites" comics={reversed} isLoading={isLoading} navigate={navigate} />
      <ComicRow title="New Releases" comics={reversed} isLoading={isLoading} navigate={navigate} />
      <div className="mb-16">
        <GenresRow comics={reversed} isLoading={isLoading} />
      </div>
      <BrowseComics comics={reversed} isLoading={isLoading} navigate={navigate} />
    </div>
  );
};

export default ComicsPage;
