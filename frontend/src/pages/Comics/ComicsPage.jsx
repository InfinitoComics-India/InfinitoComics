import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { fetchComics } from "../../services/ComicService.js";

import spotImg1 from "../../../assets/Images/spotlight/image.png";
import spotImg2 from "../../../assets/Images/spotlight/image (2).png";
import spotImg3 from "../../../assets/Images/spotlight/image (3).png";
import heroBg from "../../../assets/Images/character spotlight.png";

/* ─── Demo data ─── */
const DEMO_COMICS = [
  {
    _id: "demo1", title: "Until Death", authors: ["Stan Lee"], releasedYear: 2025,
    description: "A moody Mumbai street surfer with custom weapons, fog-cutting visor, and a speed-boosting ride—meet the rogue who upgrades on the fly and never plays by the rules.",
    coverImg: spotImg1, bannerImg: heroBg, tag: "NEW RELEASE", isDemo: true,
  },
  {
    _id: "demo2", title: "Superman: The Knight of Steel #107", authors: ["Jerry Siegel", "Joe Shuster"], releasedYear: 2025,
    description: "When a mysterious rift hurls Superman into a medieval realm, the Man of Steel must trade his cape for a sword to battle dragons, dark magic, and destiny itself.",
    coverImg: spotImg1, bannerImg: heroBg, isDemo: true,
  },
  {
    _id: "demo3", title: "Dead Shot", authors: ["Stan Lee"], releasedYear: 2025,
    description: "Precision, power, and no second chances.", coverImg: spotImg2, bannerImg: heroBg, isDemo: true,
  },
  {
    _id: "demo4", title: "Quice Ninja", authors: ["Universe/ Artist"], releasedYear: 2025,
    description: "Silent, swift, and absolutely deadly.", coverImg: spotImg3, bannerImg: heroBg, isDemo: true,
  },
  {
    _id: "demo5", title: "Shadow", authors: ["Stan Lee"], releasedYear: 2025,
    description: "He walks between light and darkness.", coverImg: spotImg1, bannerImg: heroBg, isDemo: true,
  },
  {
    _id: "demo6", title: "Wolverine (2025) #6", authors: ["Stan Lee"], releasedYear: 2025,
    description: "The claws are back.", coverImg: spotImg2, bannerImg: heroBg, isDemo: true,
  },
];

/* ═══════════════════════════════════════
   HERO BANNER — full image + text overlay
═══════════════════════════════════════ */
const HeroBanner = ({ comic, onReadNow }) => {
  if (!comic) return null;
  return (
    <div style={{ position: "relative", width: "100%", background: "#0a0a0a", lineHeight: 0 }}>
      {/* Background image */}
      <img
        src={comic.bannerImg || heroBg}
        alt={comic.title}
        style={{ display: "block", width: "100%", height: "clamp(280px, 50vw, 560px)", objectFit: "cover", objectPosition: "center top" }}
      />

      {/* Dark gradient overlay — left side */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.5) 45%, transparent 70%)",
      }} />

      {/* Text content */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0,
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "2rem clamp(1rem, 5vw, 4rem)",
        maxWidth: "clamp(280px, 45%, 520px)",
        lineHeight: 1,
      }}>
        <p style={{ color: "#fff", fontSize: "clamp(0.6rem, 1.2vw, 0.72rem)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.7rem" }}>
          COMIC SPOTLIGHT
        </p>
        <h1 style={{ color: "#DD1215", fontSize: "clamp(1.6rem, 4vw, 3.2rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 1.05, marginBottom: "0.8rem", letterSpacing: "0.02em" }}>
          {comic.title}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "clamp(0.72rem, 1.2vw, 0.82rem)", lineHeight: 1.65, marginBottom: "1.4rem", maxWidth: "320px" }}>
          {comic.description}
        </p>
        <div>
          <button
            onClick={() => onReadNow(comic._id, comic.isDemo)}
            style={{
              background: "transparent", color: "#fff", border: "1px solid #fff",
              fontSize: "clamp(0.55rem, 1vw, 0.65rem)", fontWeight: 800, letterSpacing: "0.18em",
              textTransform: "uppercase", padding: "0.55rem 1.4rem", cursor: "pointer",
              transition: "background 0.2s, color 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}
          >
            READ NOW &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   TORN PAPER EDGE
═══════════════════════════════════════ */
const TornEdge = () => (
  <div style={{ background: "#0a0a0a", lineHeight: 0 }}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 54" preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height: "54px" }}>
      <path fill="#ffffff" d="M0,54 L0,42 C24,24 48,50 72,36 C96,22 120,46 144,34 C168,20 192,44 216,30 C240,16 264,42 288,28 C312,14 336,40 360,26 C384,12 408,38 432,24 C456,10 480,36 504,22 C528,8 552,34 576,20 C600,6 624,32 648,18 C672,4 696,30 720,16 C744,2 768,28 792,14 C816,0 840,26 864,12 C888,0 912,24 936,12 C960,0 984,22 1008,10 C1032,0 1056,20 1080,10 C1104,0 1128,18 1152,8 C1176,0 1200,16 1224,8 C1248,0 1272,14 1296,6 C1320,0 1344,12 1368,4 C1392,0 1416,10 1440,2 L1440,54 Z" />
    </svg>
  </div>
);

/* ═══════════════════════════════════════
   TODAY'S SPOTLIGHT
═══════════════════════════════════════ */
const TodaysSpotlight = ({ comics, onReadNow }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  if (!comics.length) return null;
  const featured = comics[activeIdx];
  const total = comics.slice(0, 4).length;

  return (
    <div style={{ background: "#fff", padding: "clamp(1.2rem,3vw,2.5rem) clamp(1rem,4vw,3rem) clamp(1rem,2.5vw,2rem)" }}>
      <h2 style={{ fontSize: "clamp(0.7rem,1.5vw,0.9rem)", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1.4rem", color: "#111" }}>
        TODAY'S SPOTLIGHT
      </h2>

      <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* LEFT: featured */}
        <div style={{ display: "flex", gap: "1.2rem", flex: 1, minWidth: "240px" }}>
          {/* Cover */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img
              src={featured.coverImg}
              alt={featured.title}
              style={{ width: "clamp(100px,12vw,130px)", height: "clamp(140px,17vw,185px)", objectFit: "cover", display: "block", boxShadow: "0 2px 12px rgba(0,0,0,0.18)" }}
            />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#000", color: "#fff", textAlign: "center", fontSize: "0.5rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", padding: "4px 0" }}>
              NEW RELEASE
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: "clamp(1rem,2vw,1.35rem)", fontWeight: 800, color: "#000", lineHeight: 1.2, marginBottom: "0.3rem" }}>
                {featured.title}
              </h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "0.6rem", flexWrap: "wrap" }}>
                <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {Array.isArray(featured.authors) ? featured.authors.join(" AND ") : featured.authors}
                </p>
                {featured.releasedYear && <span style={{ fontSize: "0.68rem", color: "#bbb" }}>{featured.releasedYear}</span>}
              </div>
              <p style={{ fontSize: "0.8rem", color: "#555", lineHeight: 1.6, maxWidth: "360px" }}>
                {featured.description}
              </p>
            </div>

            {/* Buttons row with pagination dots */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "1.2rem", flexWrap: "wrap" }}>
              <button style={{ border: "1px solid #222", background: "transparent", padding: "0.42rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <Bookmark size={14} />
              </button>

              {/* Pagination dots */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px", border: "1px solid #ddd", padding: "0.3rem 0.6rem" }}>
                <button onClick={() => setActiveIdx(i => Math.max(0, i - 1))} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 2px", color: "#444", fontSize: "0.7rem" }}>‹</button>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#333", minWidth: "28px", textAlign: "center" }}>
                  {activeIdx + 1}/{total}
                </span>
                <button onClick={() => setActiveIdx(i => Math.min(total - 1, i + 1))} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 2px", color: "#444", fontSize: "0.7rem" }}>›</button>
              </div>

              <button
                onClick={() => onReadNow(featured._id, featured.isDemo)}
                style={{ background: "#e53935", color: "#fff", border: "none", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", padding: "0.5rem 1.4rem", cursor: "pointer" }}
              >
                READ NOW &gt;
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: thumbnail grid */}
        <div style={{ display: "flex", gap: "0.6rem", flexShrink: 0, flexWrap: "wrap" }}>
          {comics.slice(0, 4).map((comic, i) => (
            <button key={comic._id} onClick={() => setActiveIdx(i)} style={{
              padding: 0, border: i === activeIdx ? "2px solid #e53935" : "2px solid transparent",
              background: "none", cursor: "pointer", opacity: i === activeIdx ? 1 : 0.65, transition: "opacity 0.2s",
            }}>
              <img src={comic.coverImg} alt={comic.title} style={{ width: "clamp(70px,8vw,110px)", height: "clamp(98px,11vw,155px)", objectFit: "cover", display: "block" }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   COMIC CARD
═══════════════════════════════════════ */
const ComicCard = ({ comic, onClick, upcoming }) => (
  <div onClick={!upcoming ? onClick : undefined} style={{ flexShrink: 0, width: "clamp(120px,12vw,155px)", cursor: upcoming ? "default" : "pointer" }}>
    <div style={{ position: "relative", overflow: "hidden" }}>
      {upcoming && (
        <span style={{ position: "absolute", top: "6px", left: "6px", zIndex: 10, background: "#16a34a", color: "#fff", fontSize: "0.5rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", padding: "2px 6px" }}>
          UPCOMING
        </span>
      )}
      <img
        src={comic.coverImg || "https://placehold.co/155x215/111/ccc?text=Cover"}
        alt={comic.title}
        style={{ width: "100%", height: "clamp(168px,17vw,215px)", objectFit: "cover", display: "block", boxShadow: "0 2px 10px rgba(0,0,0,0.15)", filter: upcoming ? "grayscale(100%)" : "none", opacity: upcoming ? 0.6 : 1, transition: "transform 0.25s" }}
        onMouseEnter={e => { if (!upcoming) e.currentTarget.style.transform = "scale(1.04)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
      />
    </div>
    <p style={{ marginTop: "0.5rem", fontSize: "0.72rem", fontWeight: 600, color: upcoming ? "#aaa" : "#222", letterSpacing: "0.03em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
      {comic.title}{comic.releasedYear ? ` (${comic.releasedYear})` : ""}
    </p>
    <p style={{ fontSize: "0.68rem", color: "#999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
      {Array.isArray(comic.authors) ? comic.authors.join(", ") : comic.authors || ""}
    </p>
  </div>
);

/* ═══════════════════════════════════════
   HORIZONTAL SLIDER
═══════════════════════════════════════ */
const ComicSlider = ({ comics, onCardClick, upcomingFrom = Infinity }) => {
  const ref = useRef(null);
  const scroll = dir => ref.current?.scrollBy({ left: dir * 370, behavior: "smooth" });

  return (
    <div style={{ position: "relative", padding: "0 2rem" }}>
      <button onClick={() => scroll(-1)} aria-label="scroll left" style={{ position: "absolute", left: 0, top: "40%", transform: "translateY(-50%)", zIndex: 10, background: "#fff", border: "1px solid #ccc", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
        <ChevronLeft size={16} />
      </button>

      <div ref={ref} style={{ display: "flex", gap: "clamp(0.6rem,1.5vw,1.1rem)", overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: "0.5rem", scrollBehavior: "smooth" }}>
        {comics.map((comic, i) => (
          <ComicCard key={comic._id} comic={comic} onClick={() => onCardClick(comic._id, comic.isDemo)} upcoming={i >= upcomingFrom} />
        ))}
      </div>

      <button onClick={() => scroll(1)} aria-label="scroll right" style={{ position: "absolute", right: 0, top: "40%", transform: "translateY(-50%)", zIndex: 10, background: "#fff", border: "1px solid #ccc", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════
   SECTION HEADER
═══════════════════════════════════════ */
const SectionHeader = ({ title, onViewMore }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
    <h2 style={{ fontSize: "clamp(0.7rem,1.5vw,0.88rem)", fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "#111" }}>
      {title} &gt;
    </h2>
    <button onClick={onViewMore} style={{ background: "none", border: "none", color: "#e53935", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>
      VIEW MORE &gt;
    </button>
  </div>
);

/* ═══════════════════════════════════════
   SHIMMER
═══════════════════════════════════════ */
const Shimmer = () => (
  <div>
    <div style={{ background: "#1a1a1a", height: "clamp(280px,45vw,500px)", animation: "pulse 1.5s infinite" }} />
    <div style={{ background: "#fff", padding: "2rem 3rem" }}>
      <div style={{ background: "#eee", height: "14px", width: "160px", marginBottom: "1.5rem", borderRadius: "3px" }} />
      <div style={{ display: "flex", gap: "1.2rem" }}>
        <div style={{ background: "#eee", width: "130px", height: "185px", flexShrink: 0, borderRadius: "3px" }} />
        <div style={{ flex: 1 }}>
          {[80, 50, 100, 90, 60].map((w, i) => (
            <div key={i} style={{ background: "#eee", height: "12px", width: `${w}%`, marginBottom: "10px", borderRadius: "3px" }} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════ */
const ComicsPage = () => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    fetchComics()
      .then(data => setComics(Array.isArray(data) && data.length > 0 ? data : DEMO_COMICS))
      .catch(() => setComics(DEMO_COMICS))
      .finally(() => setLoading(false));
  }, []);

  const handleNavigate = (id, isDemo) => {
    if (isDemo) return;
    navigate(`/comicChap/${id}/chapters`);
  };

  if (loading) return <Shimmer />;

  const sorted = [...comics].reverse();
  const hero = sorted[0];
  const spotlightList = sorted.slice(0, 4);
  const SECTION_PAD = "clamp(1.2rem,3vw,2.2rem) clamp(1rem,4vw,3rem)";

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>

      {/* Hero */}
      <HeroBanner comic={hero} onReadNow={handleNavigate} />

      {/* Torn edge */}
      <TornEdge />

      {/* Today's Spotlight */}
      <TodaysSpotlight comics={spotlightList} onReadNow={handleNavigate} />

      {/* Divider */}
      <div style={{ borderTop: "1px solid #efefef", margin: "0 clamp(1rem,4vw,3rem)" }} />

      {/* Fan Favourites */}
      <div style={{ background: "#fff", padding: SECTION_PAD }}>
        <SectionHeader title="FAN FAVOURITES" />
        <ComicSlider comics={sorted} onCardClick={handleNavigate} upcomingFrom={2} />
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #efefef", margin: "0 clamp(1rem,4vw,3rem)" }} />

      {/* New Releases */}
      <div style={{ background: "#fff", padding: SECTION_PAD }}>
        <SectionHeader title="NEW RELEASES" />
        <ComicSlider comics={sorted} onCardClick={handleNavigate} />
      </div>

      <div style={{ height: "3rem" }} />
    </div>
  );
};

export default ComicsPage;
