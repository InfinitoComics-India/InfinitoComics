import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { fetchComics } from "../../services/ComicService.js";

/* ── shimmer placeholders ───────────────────────────────────── */
const HeroShimmer = () => (
  <div className="w-full h-[340px] md:h-[420px] bg-gray-800 animate-pulse" />
);

const CardShimmer = () => (
  <div className="flex-shrink-0 w-[132px] md:w-[155px] animate-pulse">
    <div className="w-full h-[175px] md:h-[205px] bg-gray-200" />
    <div className="h-3 bg-gray-200 mt-2 w-4/5 rounded" />
    <div className="h-3 bg-gray-200 mt-1 w-3/5 rounded" />
  </div>
);

/* ── hero spotlight ─────────────────────────────────────────── */
const HeroSpotlight = ({ comic, isLoading }) => {
  const navigate = useNavigate();
  if (isLoading) return <HeroShimmer />;
  if (!comic) return null;

  return (
    <div
      className="relative w-full h-[340px] md:h-[420px] overflow-hidden"
      style={{ background: "#0a0a0a" }}
    >
      {/* bg cover image */}
      <img
        src={comic.coverImg || "https://via.placeholder.com/1200x420"}
        alt={comic.title}
        className="absolute inset-0 w-full h-full object-cover object-top opacity-40"
      />
      {/* gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

      {/* text content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-xl">
        <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
          Comic Spotlight
        </p>
        <h1
          className="text-4xl md:text-5xl font-black uppercase leading-none mb-4"
          style={{ color: "#DD1215", fontFamily: "Impact, Arial Black, sans-serif", letterSpacing: "0.04em" }}
        >
          {comic.title}
        </h1>
        <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3 max-w-sm">
          {comic.description || "Experience the ultimate comic adventure — action, drama, and jaw-dropping art await."}
        </p>
        <button
          onClick={() => navigate(`/comicChap/${comic._id}/chapters`)}
          className="self-start border border-white text-white text-xs font-bold tracking-widest px-5 py-2 hover:bg-white hover:text-black transition-all uppercase"
        >
          Read Now &rsaquo;
        </button>
      </div>

      {/* right: cover art */}
      <div className="absolute right-0 top-0 h-full w-1/2 hidden md:flex items-end justify-end">
        <img
          src={comic.coverImg || "https://via.placeholder.com/300x420"}
          alt={comic.title}
          className="h-full object-cover object-center"
          style={{ maxWidth: "340px" }}
        />
      </div>
    </div>
  );
};

/* ── today's spotlight section ──────────────────────────────── */
const TodaysSpotlight = ({ comics, isLoading }) => {
  const navigate = useNavigate();
  const [featured, ...rest] = comics;

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 md:px-8 mt-10">
        <div className="h-5 w-48 bg-gray-200 animate-pulse rounded mb-6" />
        <div className="flex gap-4">
          <div className="flex gap-3 flex-1 animate-pulse">
            <div className="w-[130px] h-[160px] bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-[90px] h-[120px] bg-gray-200 animate-pulse" />
            <div className="w-[90px] h-[120px] bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!featured) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 mt-10 mb-2">
      <h2 className="text-xs font-black tracking-[0.25em] uppercase text-gray-800 mb-5 border-b border-gray-200 pb-2">
        Today's Spotlight
      </h2>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* featured card */}
        <div
          className="flex gap-4 flex-1 cursor-pointer group"
          onClick={() => navigate(`/comicChap/${featured._id}/chapters`)}
        >
          <div className="relative flex-shrink-0 w-[130px]">
            <img
              src={featured.coverImg || "https://via.placeholder.com/130x165"}
              alt={featured.title}
              className="w-[130px] h-[165px] object-cover shadow-md"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black text-white text-[0.6rem] font-bold tracking-widest text-center py-1 uppercase">
              New Release
            </div>
          </div>
          <div className="flex flex-col justify-between py-1 flex-1">
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-snug group-hover:text-red-600 transition-colors">
                {featured.title}
              </h3>
              <p className="text-[0.7rem] font-bold tracking-widest text-gray-400 uppercase mt-1">
                {Array.isArray(featured.authors) ? featured.authors.join(" and ") : featured.authors}
                {featured.releasedYear && (
                  <span className="ml-2 text-gray-400">{featured.releasedYear}</span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-4">
                {featured.description || "An epic adventure awaits in this stunning comic series."}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="border border-gray-400 p-1.5 hover:border-black transition"
                title="Save"
              >
                <Bookmark size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/comicChap/${featured._id}/chapters`); }}
                className="bg-red-600 text-white text-[0.7rem] font-bold tracking-widest px-4 py-1.5 hover:bg-red-700 transition uppercase"
              >
                Read Now &rsaquo;
              </button>
            </div>
          </div>
        </div>

        {/* side cards */}
        {rest.slice(0, 2).length > 0 && (
          <div className="flex gap-2 flex-shrink-0">
            {rest.slice(0, 2).map((comic) => (
              <div
                key={comic._id}
                onClick={() => navigate(`/comicChap/${comic._id}/chapters`)}
                className="cursor-pointer group"
              >
                <img
                  src={comic.coverImg || "https://via.placeholder.com/100x130"}
                  alt={comic.title}
                  className="w-[100px] h-[130px] md:w-[120px] md:h-[155px] object-cover shadow group-hover:opacity-80 transition"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── fan favourites slider ───────────────────────────────────── */
const FanFavourites = ({ comics, isLoading }) => {
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  const scroll = (dir) => {
    sliderRef.current?.scrollBy({ left: dir * 170, behavior: "smooth" });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 mt-10 mb-16">
      <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
        <h2 className="text-xs font-black tracking-[0.25em] uppercase text-gray-800">
          Fan Favourites
        </h2>
        <button className="text-red-600 text-[0.7rem] font-bold tracking-widest hover:underline uppercase">
          View More &rsaquo;
        </button>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 shadow p-1 hover:bg-gray-50"
        >
          <ChevronLeft size={18} />
        </button>

        <div
          ref={sliderRef}
          className="flex overflow-x-auto gap-4 no-scrollbar scroll-smooth pb-2"
        >
          {isLoading
            ? [...Array(5)].map((_, i) => <CardShimmer key={i} />)
            : comics.map((comic, i) => (
                <div
                  key={comic._id}
                  onClick={() => navigate(`/comicChap/${comic._id}/chapters`)}
                  className="flex-shrink-0 cursor-pointer group"
                  style={{ width: "132px" }}
                >
                  <div className="relative">
                    {i >= 2 && (
                      <div className="absolute top-2 left-2 z-10 bg-green-600 text-white text-[0.55rem] px-1.5 py-0.5 font-bold tracking-wider uppercase">
                        Upcoming
                      </div>
                    )}
                    <img
                      src={comic.coverImg || "https://via.placeholder.com/132x175"}
                      alt={comic.title}
                      className={`w-[132px] h-[175px] object-cover shadow-sm group-hover:opacity-80 transition ${i >= 2 ? "grayscale opacity-75" : ""}`}
                    />
                  </div>
                  <h3 className="text-xs font-semibold mt-2 tracking-wide text-gray-800 line-clamp-2 leading-snug">
                    {comic.title}{comic.releasedYear ? ` (${comic.releasedYear})` : ""}
                  </h3>
                  <p className="text-[0.68rem] text-gray-400 mt-0.5 tracking-wide truncate">
                    {Array.isArray(comic.authors) ? comic.authors.join(", ") : comic.authors || "Unknown"}
                  </p>
                </div>
              ))}
        </div>

        <button
          onClick={() => scroll(1)}
          className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 shadow p-1 hover:bg-gray-50"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

/* ── main page ───────────────────────────────────────────────── */
const ComicsPage = () => {
  const [comics, setComics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchComics();
        setComics(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching comics:", err);
        setComics([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const reversed = [...comics].reverse();
  const heroComic = reversed[0] || null;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <HeroSpotlight comic={heroComic} isLoading={isLoading} />

      {/* torn edge effect */}
      <div style={{ height: "28px", background: "#fff", marginTop: "-14px", borderRadius: "0 0 50% 50% / 0 0 100% 100%", position: "relative", zIndex: 2 }} />

      {/* Today's Spotlight */}
      <TodaysSpotlight comics={reversed} isLoading={isLoading} />

      {/* Fan Favourites */}
      <FanFavourites comics={reversed} isLoading={isLoading} />
    </div>
  );
};

export default ComicsPage;
