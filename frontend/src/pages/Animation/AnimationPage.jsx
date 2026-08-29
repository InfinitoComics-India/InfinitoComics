import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlayCircle, ChevronLeft, ChevronRight, Search, Plus, ChevronDown } from "lucide-react";
import JoinUltimate from "../Home/JoinUltimate";

// Image Assets
import s1 from "../../../assets/Images/s1.jpg";
import s2 from "../../../assets/Images/s2.png";
import rivalImg from "../../../assets/Images/rival.png";
import bgtop from "../../../assets/Images/spotlighttopbg.png";
import bgbottom from "../../../assets/Images/spotlightbottombg.png";
import quickVision from "../../../assets/Images/quick-vision.png";

import trailer1 from "../../../assets/Images/Ultimate/trailer1.png";
import trailer2 from "../../../assets/Images/Ultimate/trailer2.png";
import trailer3 from "../../../assets/Images/Ultimate/trailer3.png";
import trailer4 from "../../../assets/Images/Ultimate/trailer4.png";

// Character Poster Images from public directory
const rizalPoster = "/rizal.png";
const poisonPoster = "/poison.png";
const kalariPoster = "/kalari.png";
const battleBeastPoster = "/battle-beast.png";

const heroSlides = [
  {
    id: 1,
    title: "INFINITO COMICS - A NEW SAGA",
    description:
      "Step into India's premier original character universe. Experience breathtaking animation, rich lore, and epic superhero action.",
    youtubeId: "jImhvA9uNVU",
    bgImage: s1,
  },
  {
    id: 2,
    title: "MULTIVERSE UNLEASHED | INFINITO SAGA",
    description:
      "An ancient force awakens across dimensions. Heroes will rise, worlds will collide, and the Infinito Universe will never be the same.",
    youtubeId: "27VGbZNOSjo",
    bgImage: s2,
  },
];

const videoCardsData = [
  { id: 1, title: "Watch Trailer", img: trailer1, youtubeId: "jImhvA9uNVU" },
  { id: 2, title: "Watch Trailer", img: trailer2, youtubeId: "27VGbZNOSjo" },
  { id: 3, title: "Watch Trailer", img: trailer3, youtubeId: "jImhvA9uNVU" },
  { id: 4, title: "Watch Trailer", img: trailer4, youtubeId: "27VGbZNOSjo" },
];

import upcomingEvent from "../../../assets/Images/upcomingEvent.png";

const timelineCardsData = [
  { id: 1, title: "RELEASE TIMELINE", year: "2022", img: upcomingEvent },
  { id: 2, title: "RELEASE TIMELINE", year: "2025", img: upcomingEvent },
  { id: 3, title: "RELEASE TIMELINE", year: "2025", img: upcomingEvent },
  { id: 4, title: "RELEASE TIMELINE", year: "2025", img: upcomingEvent },
];

const franchiseCardsData = [
  { id: 1, title: "Wolverine (2025) #6", img: rizalPoster },
  { id: 2, title: "Wolverine (2025) #6", img: rizalPoster },
  { id: 3, title: "Wolverine (2025) #6", img: poisonPoster },
  { id: 4, title: "Wolverine (2025) #6", img: poisonPoster },
  { id: 5, title: "Wolverine (2025) #6", img: kalariPoster },
];

const browseComicsData = [
  { id: 1, title: "Wolverine (2025) #6", author: "Stan Lee", img: poisonPoster },
  { id: 2, title: "Wolverine (2025) #6", author: "Stan Lee", img: rizalPoster },
  { id: 3, title: "Wolverine (2025) #6", author: "Stan Lee", img: poisonPoster },
  { id: 4, title: "Wolverine (2025) #6", author: "Stan Lee", img: rizalPoster },
  { id: 5, title: "Wolverine (2025) #6", author: "Stan Lee", img: poisonPoster },
  { id: 6, title: "Wolverine (2025) #6", author: "Stan Lee", img: rizalPoster },
  { id: 7, title: "Wolverine (2025) #6", author: "Stan Lee", img: poisonPoster },
  { id: 8, title: "Wolverine (2025) #6", author: "Stan Lee", img: rizalPoster },
];

// Helper Component for a Video Row Section
const VideoRowSection = ({ genreTitle, onPlayVideo }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-3 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-black font-dmsans">
          {genreTitle}
        </h3>
        <Link
          to="/animation"
          className="text-[#E50914] text-xs font-bold uppercase tracking-wider hover:underline"
        >
          VIEW ALL &gt;
        </Link>
      </div>

      <div className="relative flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
          className="hidden sm:flex p-2.5 border border-gray-300 text-black hover:border-black hover:bg-gray-50 transition-all flex-shrink-0"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full">
          {videoCardsData.map((video) => (
            <div
              key={video.id}
              onClick={() => onPlayVideo && onPlayVideo(video.youtubeId)}
              className="group cursor-pointer space-y-2"
            >
              <div className="relative w-full aspect-video bg-gray-100 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
                <img
                  src={video.img}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle className="w-10 h-10 sm:w-11 sm:h-11 text-white stroke-[1.5] group-hover:scale-110 transition-transform duration-300 drop-shadow-md" />
                </div>
              </div>

              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black group-hover:text-[#E50914] transition-colors font-dmsans">
                {video.title}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setActiveIndex((prev) => Math.min(3, prev + 1))}
          className="hidden sm:flex p-2.5 border border-gray-300 text-black hover:border-black hover:bg-gray-50 transition-all flex-shrink-0"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-1.5 justify-center pt-2">
        {videoCardsData.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 transition-all duration-300 ${
              idx === activeIndex ? "w-6 bg-[#E50914]" : "w-4 bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const AnimationPage = () => {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [selectedVideoModal, setSelectedVideoModal] = useState(null);
  const [recIndex, setRecIndex] = useState(0);
  const [franchiseIndex, setFranchiseIndex] = useState(0);
  const [btsIndex, setBtsIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePage, setActivePage] = useState(1);

  // Auto-play hero slider every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const activeHero = heroSlides[currentHeroIndex];

  return (
    <div className="w-full min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-[#E50914] selection:text-white">
      {/* ─── SECTION 1: HERO BANNER ──────────────────────────────────────── */}
      <section className="relative w-full h-[75vh] min-h-[500px] max-h-[750px] bg-black flex items-end justify-start overflow-hidden">
        {heroSlides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              idx === currentHeroIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
            style={{ backgroundImage: `url(${slide.bgImage})` }}
          >
            {/* Background YouTube Autoplay Video */}
            {idx === currentHeroIndex && (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${slide.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${slide.youtubeId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1`}
                title={slide.title}
                className="w-full h-full object-cover scale-125 pointer-events-none opacity-80"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
          </div>
        ))}


        {/* Slide Info Overlay */}
        <div className="relative z-30 max-w-6xl w-full mx-auto px-4 sm:px-8 md:px-12 pb-10 sm:pb-14 space-y-4">
          <div className="max-w-md space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] text-white drop-shadow-md leading-none transition-all duration-500">
              {activeHero.title}
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-300 leading-relaxed font-dmsans max-w-xs drop-shadow transition-all duration-500">
              {activeHero.description}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedVideoModal(activeHero.youtubeId)}
                className="px-5 py-2 bg-[#E50914] text-white text-[11px] sm:text-xs font-bold tracking-widest uppercase hover:bg-red-700 transition-all duration-300 shadow-md"
              >
                PLAY VIDEO
              </button>
              <a
                href={`https://www.youtube.com/watch?v=${activeHero.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-black/60 border border-white/70 text-white text-[11px] sm:text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300"
              >
                WATCH ON YOUTUBE
              </a>
            </div>
          </div>

          <div className="flex gap-1.5 justify-center pt-8">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentHeroIndex(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-[3px] transition-all duration-300 ${
                  idx === currentHeroIndex
                    ? "w-6 bg-[#E50914]"
                    : "w-4 bg-white/70 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: POPULAR NOW / RECOMMENDED FOR YOU (WHITE BG) ───────── */}
      <section className="w-full bg-white text-black py-12 sm:py-16 px-4 sm:px-8 md:px-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-wider font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] text-black">
              POPULAR NOW / RECOMMENDED FOR YOU
            </h2>

            <Link
              to="/animation"
              className="text-[#E50914] text-xs sm:text-sm font-bold uppercase tracking-wider hover:underline flex items-center gap-1"
            >
              VIEW MORE &gt;
            </Link>
          </div>

          <div className="relative flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setRecIndex((prev) => Math.max(0, prev - 1))}
              className="hidden sm:flex p-2.5 border border-gray-300 text-black hover:border-black hover:bg-gray-50 transition-all flex-shrink-0"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full">
              {videoCardsData.map((video) => (
                <div key={video.id} className="group cursor-pointer space-y-2.5">
                  <div className="relative w-full aspect-video bg-gray-100 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
                    <img
                      src={video.img}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[1.5] group-hover:scale-110 transition-transform duration-300 drop-shadow-md" />
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black group-hover:text-[#E50914] transition-colors font-dmsans">
                    {video.title}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setRecIndex((prev) => Math.min(3, prev + 1))}
              className="hidden sm:flex p-2.5 border border-gray-300 text-black hover:border-black hover:bg-gray-50 transition-all flex-shrink-0"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-1.5 justify-center pt-2">
            {videoCardsData.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 transition-all duration-300 ${
                  idx === recIndex ? "w-6 bg-[#E50914]" : "w-4 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: SPOTLIGHT (DARK BG WITH TORN PAPER EDGES) ─────────── */}
      <section className="relative w-full bg-white text-white">
        <div
          className="w-full pt-16 sm:pt-20 md:pt-24 -mb-1 relative z-10 pointer-events-none bg-cover bg-center"
          style={{ backgroundImage: `url(${bgtop})` }}
        />

        <div className="w-full bg-[#171717] py-10 sm:py-16 px-4 sm:px-8 md:px-12 relative z-0">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 md:gap-14">
            <div className="w-full md:w-1/2 space-y-4">
              <h2 className="text-white text-4xl sm:text-6xl md:text-7xl font-black tracking-wider uppercase font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] leading-none">
                SPOTLIGHT
              </h2>

              <div className="w-40 sm:w-48 h-[2px] bg-white my-4" />

              <h3 className="text-white text-lg sm:text-xl md:text-2xl font-black tracking-wider uppercase">
                RYAN GOSLING
              </h3>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-dmsans max-w-md">
                First off, damn, ryan gosling. He looks so bad in that suit. Haha lol <br />
                Also I dont know what to write here. So sorry. T_T. Byeeeee <br />
                Also, I know, that you know, that I know, that you know, that I know, that you know, that I know!
              </p>

              <div className="pt-4">
                <button className="px-6 py-2.5 border border-white text-white text-xs sm:text-sm font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300">
                  PLAY NOW &gt;
                </button>
              </div>
            </div>

            <div className="relative w-full md:w-1/2 aspect-video bg-black rounded-sm overflow-hidden shadow-2xl group">
              <img
                src={rivalImg}
                alt="Spotlight Featured Video"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

              <div className="absolute inset-0 flex items-center justify-center">
                <button className="p-3 text-white/90 hover:text-white hover:scale-110 transition-all duration-300">
                  <PlayCircle className="w-16 h-16 sm:w-20 sm:h-20 stroke-[1.25] drop-shadow-lg" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className="w-full pb-16 sm:pb-20 md:pb-24 -mt-1 relative z-10 pointer-events-none bg-cover bg-center"
          style={{ backgroundImage: `url(${bgbottom})` }}
        />
      </section>

      {/* ─── SECTION 4: EXPLORE OUR CREATIONS (GENRE 1, GENRE 2, GENRE 3) ──── */}
      <section className="w-full bg-white text-black py-12 sm:py-16 px-4 sm:px-8 md:px-12">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-wider font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] text-black">
              EXPLORE OUR CREATIONS
            </h2>

            <Link
              to="/animation"
              className="text-[#E50914] text-xs sm:text-sm font-bold uppercase tracking-wider hover:underline"
            >
              VIEW MORE &gt;
            </Link>
          </div>

          <VideoRowSection genreTitle="Genre 1" />
          <VideoRowSection genreTitle="Genre 2" />
          <VideoRowSection genreTitle="Genre 3" />
        </div>
      </section>

      {/* ─── SECTION 5: RELEASE TIMELINE (DARK BG WITH RED CAMERA GRAPHIC) ─── */}
      <section className="relative w-full bg-[#171717] text-white py-10 sm:py-14 px-4 sm:px-8 md:px-12 overflow-hidden">
        {/* Top Dash Indicators */}
        <div className="flex gap-1.5 justify-center pb-8">
          {[0, 1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className={`h-[3px] transition-all duration-300 ${
                idx === 1 ? "w-5 bg-[#E50914]" : "w-4 bg-white/40"
              }`}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-start relative">
          {/* Left Red Movie Camera / Projector Graphic */}
          <div className="relative flex-shrink-0 z-20 flex items-center -mr-2 md:-mr-6 hidden sm:flex">
            <svg
              viewBox="0 0 260 320"
              className="w-48 sm:w-60 md:w-72 h-auto text-[#C8232B] fill-current drop-shadow-xl"
            >
              {/* Camera Film Reel Top Circle */}
              <circle cx="100" cy="100" r="90" fill="#C8232B" />
              {/* Reel Holes */}
              <circle cx="50" cy="70" r="18" fill="#171717" />
              <circle cx="115" cy="50" r="18" fill="#171717" />
              <circle cx="145" cy="115" r="18" fill="#171717" />
              <circle cx="80" cy="140" r="18" fill="#171717" />

              {/* Lens Funnel pointing into white box */}
              <polygon points="140,140 260,90 260,250 140,200" fill="#C8232B" />

              {/* Camera Main Body */}
              <rect x="0" y="170" width="140" height="150" fill="#C8232B" />
            </svg>
          </div>

          {/* White Card Container */}
          <div className="bg-white text-black p-6 sm:p-8 md:p-10 w-full rounded-none shadow-2xl relative z-10 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] text-black">
                RELEASE TIMELINE
              </h2>

              <Link
                to="/animation"
                className="text-[#E50914] text-xs font-bold uppercase tracking-wider hover:underline"
              >
                VIEW ALL &gt;
              </Link>
            </div>

            {/* 4 Timeline Video Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {timelineCardsData.map((card) => (
                <div key={card.id} className="group cursor-pointer space-y-1.5">
                  <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
                    <img
                      src={card.img}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div>
                    <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-black group-hover:text-[#E50914] transition-colors font-dmsans">
                      {card.title}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 font-dmsans">
                      {card.year}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: OUR FRANCHISES (WHITE BG) ──────────────────────────── */}
      <section className="w-full bg-white text-black py-12 sm:py-16 px-4 sm:px-8 md:px-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-wider font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] text-black">
              OUR FRANCHISES
            </h2>

            <Link
              to="/animation"
              className="text-[#E50914] text-xs sm:text-sm font-bold uppercase tracking-wider hover:underline"
            >
              VIEW ALL &gt;
            </Link>
          </div>

          <div className="relative flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setFranchiseIndex((prev) => Math.max(0, prev - 1))}
              className="hidden sm:flex p-2.5 border border-gray-300 text-black hover:border-black hover:bg-gray-50 transition-all flex-shrink-0"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* 5 Vertical Franchise Poster Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-5 w-full">
              {franchiseCardsData.map((card) => (
                <div key={card.id} className="group cursor-pointer space-y-2">
                  <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
                    <img
                      src={card.img}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <p className="text-xs font-bold text-gray-900 group-hover:text-[#E50914] transition-colors font-dmsans">
                    {card.title}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setFranchiseIndex((prev) => Math.min(4, prev + 1))}
              className="hidden sm:flex p-2.5 border border-gray-300 text-black hover:border-black hover:bg-gray-50 transition-all flex-shrink-0"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-1.5 justify-center pt-2">
            {franchiseCardsData.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 transition-all duration-300 ${
                  idx === franchiseIndex ? "w-6 bg-[#E50914]" : "w-4 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: GET BEHIND THE SCENES (WHITE BG) ───────────────────── */}
      <section className="w-full bg-white text-black pb-12 sm:pb-16 px-4 sm:px-8 md:px-12 border-t border-gray-100 pt-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-wide text-black font-dmsans">
              Get Behind the Scenes
            </h2>

            <Link
              to="/animation"
              className="text-[#E50914] text-xs sm:text-sm font-bold uppercase tracking-wider hover:underline"
            >
              VIEW ALL &gt;
            </Link>
          </div>

          <div className="relative flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setBtsIndex((prev) => Math.max(0, prev - 1))}
              className="hidden sm:flex p-2.5 border border-gray-300 text-black hover:border-black hover:bg-gray-50 transition-all flex-shrink-0"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full">
              {videoCardsData.map((video) => (
                <div key={video.id} className="group cursor-pointer space-y-2.5">
                  <div className="relative w-full aspect-video bg-gray-100 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
                    <img
                      src={video.img}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[1.5] group-hover:scale-110 transition-transform duration-300 drop-shadow-md" />
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black group-hover:text-[#E50914] transition-colors font-dmsans">
                    {video.title}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setBtsIndex((prev) => Math.min(3, prev + 1))}
              className="hidden sm:flex p-2.5 border border-gray-300 text-black hover:border-black hover:bg-gray-50 transition-all flex-shrink-0"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-1.5 justify-center pt-2">
            {videoCardsData.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 transition-all duration-300 ${
                  idx === btsIndex ? "w-6 bg-[#E50914]" : "w-4 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 8: BROWSE COMICS [128] (WHITE BG FILTER GRID) ─────────── */}
      <section className="w-full bg-white text-black py-12 sm:py-16 px-4 sm:px-8 md:px-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Title Row + Sort Dropdown */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-wider font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] text-black">
              BROWSE COMICS (128)
            </h2>

            {/* A to Z Sort Dropdown Box */}
            <div className="flex items-center border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 hover:border-black cursor-pointer bg-white space-x-2">
              <span>A to Z</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>

          {/* Two-Column Grid: Filter Sidebar + Comics Cards Grid */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Left Filter Sidebar */}
            <div className="w-full md:w-64 space-y-4 flex-shrink-0">
              {/* Search Bar Input */}
              <div className="flex items-center border border-gray-300 bg-white">
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none font-dmsans"
                />
                <button className="bg-[#E50914] text-white p-2.5 hover:bg-red-700 transition">
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Accordion Filter Options */}
              <div className="border border-gray-200 divide-y divide-gray-200 bg-white">
                {["CHARACTERS", "SERIES", "TYPE", "IMPRINTS", "DATE RANGES"].map((filter) => (
                  <div
                    key={filter}
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-800 font-dmsans">
                      {filter}
                    </span>
                    <Plus className="w-4 h-4 text-gray-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Cards Grid */}
            <div className="flex-1 w-full space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {browseComicsData.map((comic) => (
                  <div key={comic.id} className="group cursor-pointer space-y-1.5">
                    <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
                      <img
                        src={comic.img}
                        alt={comic.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <p className="text-xs font-bold text-gray-900 group-hover:text-[#E50914] transition-colors font-dmsans">
                      {comic.title}
                    </p>
                    <p className="text-[11px] text-gray-500 font-dmsans">
                      {comic.author}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pagination Row */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <button className="p-2 border border-gray-300 text-gray-600 hover:border-black transition">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-1 bg-[#E50914] text-white text-xs font-bold">
                    1
                  </button>
                  <button className="px-3 py-1 border border-gray-300 text-gray-700 text-xs font-bold hover:border-black">
                    2
                  </button>
                  <button className="px-3 py-1 border border-gray-300 text-gray-700 text-xs font-bold hover:border-black">
                    3
                  </button>
                  <span className="px-2 text-xs text-gray-400">...</span>
                  <button className="px-3 py-1 border border-gray-300 text-gray-700 text-xs font-bold hover:border-black">
                    8
                  </button>
                  <button className="p-2 border border-gray-300 text-gray-600 hover:border-black transition">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  to="/animation"
                  className="text-[#E50914] text-xs font-bold uppercase tracking-wider hover:underline"
                >
                  VIEW ALL &gt;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 9: JOIN THE ULTIMATE UNIVERSE ───────────────────────── */}
      <JoinUltimate />

      {/* ─── VIDEO MODAL POPUP ────────────────────────────────────────────── */}
      {selectedVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedVideoModal(null)}
              className="absolute top-3 right-3 text-white bg-black/70 hover:bg-[#E50914] w-9 h-9 flex items-center justify-center rounded-full z-20 transition-colors font-bold text-lg"
              aria-label="Close Modal"
            >
              ✕
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideoModal}?autoplay=1`}
              title="YouTube Video Player"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimationPage;
