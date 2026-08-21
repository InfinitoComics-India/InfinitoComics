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
  const scroll = (dir) => sliderRef.current?.scrollBy({ left: dir * 180, behavior: "smooth" });
  if (!isLoading && comics.length === 0) return null;
  return (
    <div className="w-full max-w-[1200px] mx-auto px-12 mt-10 mb-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[0.75rem] font-black tracking-[0.18em] uppercase text-gray-900">{title} &rsaquo;</h2>
        <button className="text-red-600 text-[0.62rem] font-bold tracking-widest hover:underline uppercase">View More &rsaquo;</button>
      </div>
      <div className="relative">
        <button onClick={() => scroll(-1)} className="absolute -left-6 top-[45%] -translate-y-1/2 z-10 bg-white border border-gray-300 shadow p-1.5 hover:bg-gray-100"><ChevronLeft size={16} /></button>
        <div ref={sliderRef} className="flex overflow-x-auto gap-3 no-scrollbar scroll-smooth pb-1">
          {isLoading ? [...Array(5)].map((_, i) => <CardShimmer key={i} />) : comics.map((comic) => (
            <div key={comic._id} onClick={() => navigate(`/comicChap/${comic._id}/chapters`)} className="flex-shrink-0 cursor-pointer group" style={{ width: "155px" }}>
              <div className="relative overflow-hidden">
                <img src={comic.coverImg} alt={comic.title} className="w-[155px] h-[200px] object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute bottom-0 left-0 right-0 px-2 py-2" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 70%, transparent)" }}>
                  <p className="text-white text-[0.58rem] font-black uppercase tracking-wide leading-tight line-clamp-1">{comic.title}</p>
                </div>
              </div>
              <p className="text-[0.7rem] font-semibold text-gray-800 mt-1.5 leading-snug line-clamp-2">{comic.title}{comic.releasedYear ? ` (${comic.releasedYear})` : ""}</p>
              <p className="text-[0.62rem] text-gray-400 truncate">{Array.isArray(comic.authors) ? comic.authors.join(", ") : comic.authors || ""}</p>
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
  const scroll = (dir) => sliderRef.current?.scrollBy({ left: dir * 180, behavior: "smooth" });
  if (!isLoading && characters.length === 0) return null;
  return (
    <div className="w-full max-w-[1200px] mx-auto px-12 mt-10 mb-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[0.75rem] font-black tracking-[0.18em] uppercase text-gray-900">Learn more about the Characters &rsaquo;</h2>
        <button onClick={() => navigate("/characters")} className="text-red-600 text-[0.62rem] font-bold tracking-widest hover:underline uppercase">View More &rsaquo;</button>
      </div>
      <div className="relative">
        <button onClick={() => scroll(-1)} className="absolute -left-6 top-[45%] -translate-y-1/2 z-10 bg-white border border-gray-300 shadow p-1.5 hover:bg-gray-100"><ChevronLeft size={16} /></button>
        <div ref={sliderRef} className="flex overflow-x-auto gap-4 no-scrollbar scroll-smooth pb-1">
          {isLoading ? [...Array(5)].map((_, i) => <CardShimmer key={i} />) : characters.map((char) => (
            <div key={char._id} onClick={() => navigate(`/characters/${char._id}`)} className="flex-shrink-0 cursor-pointer group text-center" style={{ width: "140px" }}>
              <img
                src={char.images?.[0] || char.coverImg || "https://via.placeholder.com/140x180"}
                alt={char.name}
                className="w-[140px] h-[180px] object-cover object-top group-hover:scale-105 transition-transform duration-300"
              />
              <p className="text-[0.68rem] font-bold uppercase tracking-wide mt-1.5 text-gray-800 truncate">{char.name}</p>
            </div>
          ))}
        </div>
        <button onClick={() => scroll(1)} className="absolute -right-6 top-[45%] -translate-y-1/2 z-10 bg-white border border-gray-300 shadow p-1.5 hover:bg-gray-100"><ChevronRight size={16} /></button>
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
      <CharactersRow characters={characters} isLoading={charsLoading} />
      <GenresRow comics={reversed} isLoading={isLoading} />
    </div>
  );
};

export default ComicsPage;
