import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlayCircle, ChevronLeft, ChevronRight, Search, ChevronDown } from "lucide-react";
import JoinUltimate from "../Home/JoinUltimate";
import { fetchComics } from "../../services/ComicService.js";
import { getAll as fetchCharacters } from "../../services/CharacterServices.js";
import { getAllTimeline } from "../../services/timelineService.js";

// Image Assets
import rivalImg from "../../../assets/Images/rival.png";
import bgtop from "../../../assets/Images/spotlighttopbg.png";
import bgbottom from "../../../assets/Images/spotlightbottombg.png";
import quickVision from "../../../assets/Images/quick-vision.png";

import trailer1 from "../../../assets/Images/Ultimate/trailer1.png";
import trailer2 from "../../../assets/Images/Ultimate/trailer2.png";
import trailer3 from "../../../assets/Images/Ultimate/trailer3.png";
import trailer4 from "../../../assets/Images/Ultimate/trailer4.png";

import upcomingEvent from "../../../assets/Images/upcomingEvent.png";

// Remove static timeline data - will fetch from API dynamically

// Hero section - single video
const heroVideo = {
  id: 1,
  title: "MULTIVERSE UNLEASHED | INFINITO SAGA",
  description:
    "An ancient force awakens across dimensions. Heroes will rise, worlds will collide, and the Infinito Universe will never be the same.",
  youtubeId: "27VGbZNOSjo",
};

// Second video section data
const secondVideo = {
  id: 2,
  title: "INFINITO COMICS - A NEW SAGA",
  description:
    "Step into India's premier original character universe. Experience breathtaking animation, rich lore, and epic superhero action.",
  youtubeId: "jImhvA9uNVU",
};

// Video cards with actual YouTube thumbnails
const videoCardsData = [
  { 
    id: 1, 
    title: "MULTIVERSE UNLEASHED", 
    youtubeId: "27VGbZNOSjo",
    thumbnail: `https://img.youtube.com/vi/27VGbZNOSjo/maxresdefault.jpg`
  },
  { 
    id: 2, 
    title: "INFINITO COMICS", 
    youtubeId: "jImhvA9uNVU",
    thumbnail: `https://img.youtube.com/vi/jImhvA9uNVU/maxresdefault.jpg`
  },
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
  const navigate = useNavigate();
  const [selectedVideoModal, setSelectedVideoModal] = useState(null);
  const [recIndex, setRecIndex] = useState(0);
  const [franchiseIndex, setFranchiseIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePage, setActivePage] = useState(1);
  
  // Filter states
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [selectedPower, setSelectedPower] = useState("");
  const [sortOrder, setSortOrder] = useState("a-z"); // "a-z" or "z-a"
  const [openFilter, setOpenFilter] = useState(null); // Track which filter accordion is open
  
  // Characters data state
  const [characters, setCharacters] = useState([]);
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(true);

  // Timeline data state
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(true);

  // Ref for character slider
  const characterSliderRef = React.useRef(null);

  // Fetch characters on component mount
  useEffect(() => {
    fetchCharacters()
      .then((data) => {
        const chars = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setCharacters(chars);
        setFilteredCharacters(chars);
      })
      .catch((error) => {
        console.error("Error fetching characters:", error);
        setCharacters([]);
        setFilteredCharacters([]);
      })
      .finally(() => setIsLoadingCharacters(false));
  }, []);

  // Fetch timeline events on component mount
  useEffect(() => {
    getAllTimeline()
      .then((data) => {
        const events = Array.isArray(data) ? data : [];
        // Filter for animation-related events if needed, or show all
        const animationEvents = events.filter(event => 
          event.category && event.category.toLowerCase().includes('animation')
        );
        // If no animation-specific events, show all events
        setTimelineEvents(animationEvents.length > 0 ? animationEvents : events);
      })
      .catch((error) => {
        console.error("Error fetching timeline:", error);
        setTimelineEvents([]);
      })
      .finally(() => setIsLoadingTimeline(false));
  }, []);

  // Filter characters based on search query and filters
  useEffect(() => {
    let result = [...characters];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((character) => {
        const knownAs = (character.knownAs || "").toLowerCase();
        const originalName = (character.originalName || "").toLowerCase();
        const placeOfOrigin = (character.placeOfOrigin || "").toLowerCase();
        const species = (character.species || "").toLowerCase();
        const powers = Array.isArray(character.powers)
          ? character.powers.join(" ").toLowerCase()
          : "";
        return (
          knownAs.includes(query) ||
          originalName.includes(query) ||
          placeOfOrigin.includes(query) ||
          species.includes(query) ||
          powers.includes(query)
        );
      });
    }
    
    // Apply gender filter
    if (selectedGender) {
      result = result.filter(char => 
        (char.gender || "").toLowerCase() === selectedGender.toLowerCase()
      );
    }
    
    // Apply species filter
    if (selectedSpecies) {
      result = result.filter(char => 
        (char.species || "").toLowerCase() === selectedSpecies.toLowerCase()
      );
    }
    
    // Apply place of origin filter
    if (selectedOrigin) {
      result = result.filter(char => 
        (char.placeOfOrigin || "").toLowerCase() === selectedOrigin.toLowerCase()
      );
    }
    
    // Apply power filter
    if (selectedPower) {
      result = result.filter(char => 
        Array.isArray(char.powers) && 
        char.powers.some(power => power.toLowerCase().includes(selectedPower.toLowerCase()))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const nameA = (a.knownAs || a.originalName || "").toLowerCase();
      const nameB = (b.knownAs || b.originalName || "").toLowerCase();
      if (sortOrder === "a-z") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    
    setFilteredCharacters(result);
    setActivePage(1); // Reset to first page when filters change
  }, [searchQuery, characters, selectedGender, selectedSpecies, selectedOrigin, selectedPower, sortOrder]);

  // Pagination
  const charactersPerPage = 8;
  const totalPages = Math.ceil(filteredCharacters.length / charactersPerPage);
  const startIndex = (activePage - 1) * charactersPerPage;
  const paginatedCharacters = filteredCharacters.slice(startIndex, startIndex + charactersPerPage);

  // Extract unique filter options from all characters
  const uniqueGenders = [...new Set(characters.map(c => c.gender).filter(Boolean))];
  const uniqueSpecies = [...new Set(characters.map(c => c.species).filter(Boolean))];
  const uniqueOrigins = [...new Set(characters.map(c => c.placeOfOrigin).filter(Boolean))];
  const uniquePowers = [...new Set(
    characters.flatMap(c => Array.isArray(c.powers) ? c.powers : []).filter(Boolean)
  )];

  // Toggle filter accordion
  const toggleFilter = (filterName) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedGender("");
    setSelectedSpecies("");
    setSelectedOrigin("");
    setSelectedPower("");
    setSearchQuery("");
    setSortOrder("a-z");
  };

  // Check if any filters are active
  const hasActiveFilters = selectedGender || selectedSpecies || selectedOrigin || selectedPower || searchQuery;

  // Character slider scroll function
  const scrollCharacters = (direction) => {
    if (characterSliderRef.current) {
      const scrollAmount = 200; // Adjust scroll distance
      characterSliderRef.current.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-[#E50914] selection:text-white">
      {/* ─── SECTION 1: HERO BANNER ──────────────────────────────────────── */}
      <section className="relative w-full h-screen bg-black flex items-end justify-start overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          {/* Background YouTube Autoplay Video - Clear and Full Opacity */}
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${heroVideo.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${heroVideo.youtubeId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1&vq=hd1080`}
            title={heroVideo.title}
            className="w-full h-full object-cover scale-125 pointer-events-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
          {/* Light gradient for text readability only */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Slide Info Overlay */}
        <div className="relative z-30 max-w-6xl w-full mx-auto px-4 sm:px-8 md:px-12 pb-10 sm:pb-14 space-y-4">
          <div className="max-w-md space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] text-white drop-shadow-md leading-none transition-all duration-500">
              {heroVideo.title}
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-300 leading-relaxed font-dmsans max-w-xs drop-shadow transition-all duration-500">
              {heroVideo.description}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedVideoModal(heroVideo.youtubeId)}
                className="px-5 py-2 bg-[#E50914] text-white text-[11px] sm:text-xs font-bold tracking-widest uppercase hover:bg-red-700 transition-all duration-300 shadow-md"
              >
                PLAY VIDEO
              </button>
              <a
                href={`https://www.youtube.com/watch?v=${heroVideo.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-black/60 border border-white/70 text-white text-[11px] sm:text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300"
              >
                WATCH ON YOUTUBE
              </a>
            </div>
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
          </div>

          {/* Simple grid - no slider needed for 2 videos */}
          <div className={`grid ${videoCardsData.length <= 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-4'} gap-4 sm:gap-6 w-full`}>
            {videoCardsData.map((video) => (
              <div 
                key={video.id} 
                className="group cursor-pointer space-y-2.5"
              >
                <div className="relative w-full aspect-video bg-gray-100 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setSelectedVideoModal(video.youtubeId)}
                      className="w-12 h-12 sm:w-14 sm:h-14 bg-[#E50914] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg"
                    >
                      <PlayCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[1.5]" />
                    </button>
                  </div>

                  {/* Small "Open on YouTube" button */}
                  <a
                    href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-2 right-2 bg-black/80 hover:bg-[#E50914] text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 uppercase tracking-wider transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    YT
                  </a>
                </div>

                <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black group-hover:text-[#E50914] transition-colors font-dmsans">
                  {video.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: SECOND FULL-SCREEN VIDEO BANNER (REPLACES SPOTLIGHT) ─────────── */}
      <section className="relative w-full h-screen bg-black flex items-end justify-start overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          {/* Background YouTube Autoplay Video - Clear and Full Opacity */}
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${secondVideo.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${secondVideo.youtubeId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1&vq=hd1080`}
            title={secondVideo.title}
            className="w-full h-full object-cover scale-125 pointer-events-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
          {/* Light gradient for text readability only */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Video Info Overlay */}
        <div className="relative z-30 max-w-6xl w-full mx-auto px-4 sm:px-8 md:px-12 pb-10 sm:pb-14 space-y-4">
          <div className="max-w-md space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] text-white drop-shadow-md leading-none transition-all duration-500">
              {secondVideo.title}
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-300 leading-relaxed font-dmsans max-w-xs drop-shadow transition-all duration-500">
              {secondVideo.description}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedVideoModal(secondVideo.youtubeId)}
                className="px-5 py-2 bg-[#E50914] text-white text-[11px] sm:text-xs font-bold tracking-widest uppercase hover:bg-red-700 transition-all duration-300 shadow-md"
              >
                PLAY VIDEO
              </button>
              <a
                href={`https://www.youtube.com/watch?v=${secondVideo.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-black/60 border border-white/70 text-white text-[11px] sm:text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300"
              >
                WATCH ON YOUTUBE
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: EXPLORE OUR CREATIONS (GENRE 1, GENRE 2, GENRE 3) ──── */}
      {/* <section className="w-full bg-white text-black py-12 sm:py-16 px-4 sm:px-8 md:px-12">
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
      </section> */}

      {/* ─── SECTION 5: OUR FRANCHISES (WHITE BG) ──────────────────────────── */}
      <section className="w-full bg-white text-black py-12 sm:py-16 px-4 sm:px-8 md:px-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-wider font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] text-black">
              OUR FRANCHISES
            </h2>
          </div>

          <div className="relative flex items-center gap-2 sm:gap-4">
            {/* Left Arrow - show if there are characters */}
            {!isLoadingCharacters && characters.length > 5 && (
              <button
                onClick={() => scrollCharacters(-1)}
                className="hidden sm:flex p-2.5 border border-gray-300 text-black hover:border-black hover:bg-gray-50 transition-all flex-shrink-0"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Character Cards Container */}
            <div className="w-full overflow-hidden">
              <div 
                ref={characterSliderRef}
                className="flex overflow-x-auto gap-4 sm:gap-5 no-scrollbar scroll-smooth pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {isLoadingCharacters ? (
                  // Loading shimmer
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="flex-shrink-0 animate-pulse" style={{ width: '155px' }}>
                      <div className="w-full aspect-[3/4] bg-gray-200" />
                      <div className="h-3 bg-gray-200 rounded mt-2 w-4/5" />
                    </div>
                  ))
                ) : characters.length === 0 ? (
                  // No characters
                  <div className="w-full text-center py-8">
                    <p className="text-gray-500 text-sm">No characters available</p>
                  </div>
                ) : (
                  // Display all characters with horizontal scroll
                  characters.map((character) => (
                    <div 
                      key={character._id} 
                      onClick={() => navigate(`/characters/${character._id}`)}
                      className="flex-shrink-0 group cursor-pointer space-y-2"
                      style={{ width: '155px' }}
                    >
                      <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
                        <img
                          src={character.images?.[0] || character.coverImg || "https://via.placeholder.com/300x400"}
                          alt={character.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      <p className="text-xs font-bold text-gray-900 group-hover:text-[#E50914] transition-colors font-dmsans line-clamp-1">
                        {character.name}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Arrow - show if there are characters */}
            {!isLoadingCharacters && characters.length > 5 && (
              <button
                onClick={() => scrollCharacters(1)}
                className="hidden sm:flex p-2.5 border border-gray-300 text-black hover:border-black hover:bg-gray-50 transition-all flex-shrink-0"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Pagination dots removed - using continuous scroll now */}
        </div>
      </section>

      {/* ─── SECTION 6: RELEASE TIMELINE (DARK BG WITH RED CAMERA GRAPHIC) ─── */}
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
                RELEASE TIMELINE ({timelineEvents.length})
              </h2>
            </div>

            {/* Dynamic Timeline Event Cards */}
            {isLoadingTimeline ? (
              // Loading shimmer
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="w-full aspect-[16/9] bg-gray-200" />
                    <div className="h-3 bg-gray-200 rounded w-4/5" />
                    <div className="h-2 bg-gray-200 rounded w-3/5" />
                  </div>
                ))}
              </div>
            ) : timelineEvents.length === 0 ? (
              // No events
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No upcoming releases at this time.</p>
              </div>
            ) : (
              // Display timeline events
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {timelineEvents.slice(0, 4).map((event) => {
                  // Parse event date
                  const eventDate = new Date(event.eventDate);
                  const year = eventDate.getFullYear();
                  const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
                  const day = eventDate.getDate();
                  
                  // Calculate days until release
                  const today = new Date();
                  const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
                  const isPast = daysUntil < 0;
                  const isComingSoon = daysUntil > 0 && daysUntil <= 90;

                  return (
                    <div key={event._id} className="group cursor-pointer space-y-2">
                      <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
                        <img
                          src={event.imageUrl || upcomingEvent}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Status Badge */}
                        {isComingSoon && !isPast && (
                          <div className="absolute top-2 left-2 bg-[#E50914] text-white text-[8px] font-bold px-2 py-1 uppercase tracking-wider">
                            Coming Soon
                          </div>
                        )}
                        
                        {isPast && (
                          <div className="absolute top-2 left-2 bg-gray-700 text-white text-[8px] font-bold px-2 py-1 uppercase tracking-wider">
                            Released
                          </div>
                        )}

                        {/* Category Badge */}
                        {event.category && (
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-[8px] font-bold px-2 py-1 uppercase tracking-wider">
                            {event.category}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-black group-hover:text-[#E50914] transition-colors font-dmsans line-clamp-2">
                          {event.title}
                        </p>
                        
                        {/* Date Display */}
                        <p className="text-[10px] sm:text-xs text-gray-500 font-dmsans">
                          {month} {day}, {year}
                        </p>
                        
                        {/* Countdown or Status */}
                        {!isPast && daysUntil > 0 && (
                          <p className="text-[9px] text-[#E50914] font-bold">
                            In {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── SECTION 8: BROWSE CHARACTERS (WHITE BG FILTER GRID) ──────────── */}
      <section className="w-full bg-white text-black py-12 sm:py-16 px-4 sm:px-8 md:px-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Title Row + Sort Dropdown */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-wider font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] text-black">
              BROWSE CHARACTERS ({filteredCharacters.length})
            </h2>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="flex items-center border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 hover:border-black cursor-pointer bg-white appearance-none pr-8"
              >
                <option value="a-z">A to Z</option>
                <option value="z-a">Z to A</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Two-Column Grid: Filter Sidebar + Character Cards Grid */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Left Filter Sidebar */}
            <div className="w-full md:w-64 space-y-4 flex-shrink-0">
              {/* Search Bar Input */}
              <div className="flex items-center border border-gray-300 bg-white">
                <input
                  type="text"
                  placeholder="Search characters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none font-dmsans"
                />
                <button className="bg-[#E50914] text-white p-2.5 hover:bg-red-700 transition">
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="w-full py-2 text-xs font-bold text-[#E50914] border border-[#E50914] hover:bg-[#E50914] hover:text-white transition-colors"
                >
                  CLEAR ALL FILTERS
                </button>
              )}

              {/* Accordion Filter Options */}
              <div className="border border-gray-200 divide-y divide-gray-200 bg-white">
                {/* Gender Filter */}
                <div className="overflow-hidden">
                  <div
                    onClick={() => toggleFilter("GENDER")}
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-800 font-dmsans">
                      GENDER {selectedGender && `(${selectedGender})`}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openFilter === "GENDER" ? "rotate-180" : ""}`} />
                  </div>
                  {openFilter === "GENDER" && (
                    <div className="px-3 pb-3 space-y-2">
                      {uniqueGenders.length > 0 ? (
                        uniqueGenders.map(gender => (
                          <label key={gender} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="gender"
                              checked={selectedGender === gender}
                              onChange={() => setSelectedGender(selectedGender === gender ? "" : gender)}
                              className="w-3 h-3 text-[#E50914] focus:ring-[#E50914]"
                            />
                            <span className="text-xs text-gray-700">{gender}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">No options available</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Species Filter */}
                <div className="overflow-hidden">
                  <div
                    onClick={() => toggleFilter("SPECIES")}
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-800 font-dmsans">
                      SPECIES {selectedSpecies && `(${selectedSpecies})`}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openFilter === "SPECIES" ? "rotate-180" : ""}`} />
                  </div>
                  {openFilter === "SPECIES" && (
                    <div className="px-3 pb-3 space-y-2">
                      {uniqueSpecies.length > 0 ? (
                        uniqueSpecies.map(species => (
                          <label key={species} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="species"
                              checked={selectedSpecies === species}
                              onChange={() => setSelectedSpecies(selectedSpecies === species ? "" : species)}
                              className="w-3 h-3 text-[#E50914] focus:ring-[#E50914]"
                            />
                            <span className="text-xs text-gray-700">{species}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">No options available</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Place of Origin Filter */}
                <div className="overflow-hidden">
                  <div
                    onClick={() => toggleFilter("PLACE OF ORIGIN")}
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-800 font-dmsans">
                      PLACE OF ORIGIN {selectedOrigin && `(${selectedOrigin})`}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openFilter === "PLACE OF ORIGIN" ? "rotate-180" : ""}`} />
                  </div>
                  {openFilter === "PLACE OF ORIGIN" && (
                    <div className="px-3 pb-3 space-y-2 max-h-48 overflow-y-auto">
                      {uniqueOrigins.length > 0 ? (
                        uniqueOrigins.map(origin => (
                          <label key={origin} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="origin"
                              checked={selectedOrigin === origin}
                              onChange={() => setSelectedOrigin(selectedOrigin === origin ? "" : origin)}
                              className="w-3 h-3 text-[#E50914] focus:ring-[#E50914]"
                            />
                            <span className="text-xs text-gray-700">{origin}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">No options available</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Powers Filter */}
                <div className="overflow-hidden">
                  <div
                    onClick={() => toggleFilter("POWERS")}
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-800 font-dmsans">
                      POWERS {selectedPower && `(${selectedPower})`}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openFilter === "POWERS" ? "rotate-180" : ""}`} />
                  </div>
                  {openFilter === "POWERS" && (
                    <div className="px-3 pb-3 space-y-2 max-h-48 overflow-y-auto">
                      {uniquePowers.length > 0 ? (
                        uniquePowers.map(power => (
                          <label key={power} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="power"
                              checked={selectedPower === power}
                              onChange={() => setSelectedPower(selectedPower === power ? "" : power)}
                              className="w-3 h-3 text-[#E50914] focus:ring-[#E50914]"
                            />
                            <span className="text-xs text-gray-700">{power}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">No options available</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Cards Grid */}
            <div className="flex-1 w-full space-y-8">
              {isLoadingCharacters ? (
                // Loading shimmer
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="w-full aspect-[3/4] bg-gray-200" />
                      <div className="h-3 bg-gray-200 rounded w-4/5" />
                      <div className="h-2 bg-gray-200 rounded w-3/5" />
                    </div>
                  ))}
                </div>
              ) : filteredCharacters.length === 0 ? (
                // No results
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">No characters found matching your search.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                    {paginatedCharacters.map((character) => (
                      <div 
                        key={character._id} 
                        onClick={() => navigate("/characters/biography", { state: character._id })}
                        className="group cursor-pointer space-y-1.5"
                      >
                        <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
                          <img
                            src={character.mainImageUrl || character.mainLandscapeImageUrl || "https://via.placeholder.com/300x400"}
                            alt={character.knownAs || character.originalName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <p className="text-xs font-bold text-gray-900 group-hover:text-[#E50914] transition-colors font-dmsans line-clamp-2">
                          {character.knownAs || character.originalName}
                        </p>
                        <p className="text-[11px] text-gray-500 font-dmsans truncate">
                          {character.placeOfOrigin || character.species || ""}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Row */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => setActivePage(prev => Math.max(1, prev - 1))}
                          disabled={activePage === 1}
                          className="p-2 border border-gray-300 text-gray-600 hover:border-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        {/* Page numbers */}
                        {[...Array(Math.min(totalPages, 3))].map((_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setActivePage(pageNum)}
                              className={`px-3 py-1 text-xs font-bold ${
                                activePage === pageNum
                                  ? "bg-[#E50914] text-white"
                                  : "border border-gray-300 text-gray-700 hover:border-black"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        {totalPages > 3 && (
                          <>
                            <span className="px-2 text-xs text-gray-400">...</span>
                            <button
                              onClick={() => setActivePage(totalPages)}
                              className={`px-3 py-1 text-xs font-bold ${
                                activePage === totalPages
                                  ? "bg-[#E50914] text-white"
                                  : "border border-gray-300 text-gray-700 hover:border-black"
                              }`}
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                        
                        <button 
                          onClick={() => setActivePage(prev => Math.min(totalPages, prev + 1))}
                          disabled={activePage === totalPages}
                          className="p-2 border border-gray-300 text-gray-600 hover:border-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
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
