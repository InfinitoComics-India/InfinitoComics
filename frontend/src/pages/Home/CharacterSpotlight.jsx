import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import defaultImage from "../../../assets/Images/quick-vision.png";
import CharacterSpotlightShimmer from "../../shimmer/landingPageShimmer/CharacterSpotlightShimmer";
import { getAll } from "../../services/CharacterServices";

// Fallbacks with landscape imagery in case API is offline or returns fewer than 3
const FALLBACK_CHARACTERS = [
  {
    id: "fallback-1",
    name: "QUICK VISION",
    originalName: "Kabir Mehta",
    landscapeImage: defaultImage,
    description:
      "A moody Mumbai street surfer with custom weapons, fog-cutting vision, and a speed-boosting ride—meet the rogue who upgrades on the fly and never plays by the rules.",
    universe: "Neo-Mumbai",
  },
  {
    id: "fallback-2",
    name: "MYSTIC M",
    originalName: "Alok Sharma",
    landscapeImage:
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1600&auto=format&fit=crop",
    description:
      "A mysterious figure who walks the line between good and evil, always keeping everyone guessing with reality-bending arcana and mystical cards of destiny.",
    universe: "Earth-Prime",
  },
  {
    id: "fallback-3",
    name: "THE MASTERMIND",
    originalName: "Dr. K. Rao",
    landscapeImage:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop",
    description:
      "A genius strategist with a plan for every occasion, manipulating cosmic events from the shadows and staying one step ahead of the heroes.",
    universe: "MagmaVerse",
  },
  {
    id: "fallback-4",
    name: "THE WILD SHOT",
    originalName: "Vikram Roy",
    landscapeImage:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop",
    description:
      "A cybernetically enhanced sharpshooter equipped with high-impact plasma weaponry and unstoppable combat instincts.",
    universe: "MagmaVerse",
  },
  {
    id: "fallback-5",
    name: "WEATHER KING",
    originalName: "Rohan Deshmukh",
    landscapeImage:
      "https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?q=80&w=1600&auto=format&fit=crop",
    description:
      "Commands atmospheric pressure, thunder storms, and devastating lightning strikes across whole battlefields.",
    universe: "Prime Universe",
  },
];

// Map character prioritizing mainLandscapeImageUrl
const mapCharacter = (char) => ({
  id: char._id || char.id,
  name: (char.knownAs || char.originalName || "Featured Character").toUpperCase(),
  originalName: char.originalName || "",
  knownAs: char.knownAs || "",
  landscapeImage:
    char.mainLandscapeImageUrl ||
    char.landscapeImageUrl ||
    char.mainImageUrl ||
    char.origin?.image ||
    defaultImage,
  description:
    char.description ||
    char.about ||
    (Array.isArray(char.powers) && char.powers.length > 0
      ? `A formidable champion wielding ${char.powers.filter(Boolean).join(", ")}. Fighting for the future of the Infinito Universe.`
      : "A key hero shaping the destiny of the Infinito Comics universe across dimensions."),
  universe: char.universe || "Infinito Universe",
});

// Pick 3 random distinct characters from pool
const pickRandomThree = (arr) => {
  if (!arr || arr.length === 0) return [];
  if (arr.length <= 3) return [...arr];
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};

const SLIDE_DURATION = 5000; // 5 seconds per slide

const CharacterSpotlight = () => {
  const [loading, setLoading] = useState(true);
  const [allCharacters, setAllCharacters] = useState([]);
  const [spotlightCharacters, setSpotlightCharacters] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  // Fetch characters on mount and pick 3 random characters
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const res = await getAll();
        const rawList = Array.isArray(res?.data) ? res.data : [];
        const formatted = rawList.map(mapCharacter);
        const pool =
          formatted.length >= 3
            ? formatted
            : [...formatted, ...FALLBACK_CHARACTERS];
        setAllCharacters(pool);
        const trio = pickRandomThree(pool);
        setSpotlightCharacters(trio);
        setCurrentIndex(0);
      } catch (err) {
        console.error("Error fetching characters for CharacterSpotlight:", err);
        setAllCharacters(FALLBACK_CHARACTERS);
        const trio = pickRandomThree(FALLBACK_CHARACTERS);
        setSpotlightCharacters(trio);
        setCurrentIndex(0);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchCharacters();
  }, []);

  // Auto-advance slider every 5 seconds (paused on hover)
  // Automatically rotates through the 3 characters and seamlessly shuffles new ones on loop
  useEffect(() => {
    if (spotlightCharacters.length < 2 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        // When completing a full 3-slide rotation, automatically shuffle 3 new characters from the pool
        if (prev === spotlightCharacters.length - 1 && allCharacters.length > 3) {
          const trio = pickRandomThree(allCharacters);
          setSpotlightCharacters(trio);
          return 0;
        }
        return (prev + 1) % spotlightCharacters.length;
      });
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [spotlightCharacters.length, isPaused, allCharacters]);

  const prevSlide = () => {
    if (spotlightCharacters.length === 0) return;
    setCurrentIndex(
      (prev) => (prev - 1 + spotlightCharacters.length) % spotlightCharacters.length
    );
  };

  const nextSlide = () => {
    if (spotlightCharacters.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % spotlightCharacters.length);
  };

  if (loading) return <CharacterSpotlightShimmer />;

  const current = spotlightCharacters[currentIndex] || FALLBACK_CHARACTERS[0];

  return (
    <div
      className="relative w-full min-h-[480px] sm:min-h-[550px] md:min-h-[620px] bg-black text-white overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Background Slides (using character's mainLandscapeImageUrl) ── */}
      {spotlightCharacters.map((char, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={char.id || index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
            }`}
          >
            <img
              src={char.landscapeImage}
              alt={char.name}
              className={`w-full h-full object-cover object-center transform transition-transform duration-1000 ${
                isActive ? "scale-100" : "scale-105"
              }`}
            />
          </div>
        );
      })}

      {/* ── Gradient Overlays for readability ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 md:via-black/55 to-black/30 md:to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 z-10 pointer-events-none" />

      {/* ── Top Bar: Tag ── */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-10 md:px-16 pt-6 sm:pt-8 md:pt-10 flex items-center justify-between">
        <p className="uppercase text-xs sm:text-sm font-bold tracking-widest text-red-500">
          Character Spotlight
        </p>
      </div>

      {/* ── Main Content Container ── */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-10 md:px-16 py-8 sm:py-12 md:py-20 flex flex-col justify-center min-h-[340px] sm:min-h-[400px]">
        <div className="max-w-xl text-left transition-all duration-500 pr-8 sm:pr-0">
          {/* Universe Badge */}
          {current.universe && (
            <span className="inline-block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-2 sm:px-2.5 py-0.5 bg-red-600/30 border border-red-500/40 text-red-400 rounded mb-2 sm:mb-3">
              {current.universe}
            </span>
          )}

          {/* Character Name */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-wider sm:tracking-widest text-purple-400 mb-2 sm:mb-4 drop-shadow-md leading-tight">
            {current.name}
          </h1>

          {/* Short Description */}
          <p className="text-white/90 text-xs sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed line-clamp-3 sm:line-clamp-4 max-w-lg font-normal">
            {current.description}
          </p>

          {/* CTA Button */}
          <button
            onClick={() =>
              navigate("/characters/biography", { state: current.id })
            }
            className="border border-white text-white px-5 sm:px-7 py-2 sm:py-2.5 text-xs sm:text-sm uppercase tracking-widest font-semibold hover:bg-white hover:text-black transition-all cursor-pointer shadow-lg inline-flex items-center gap-2"
          >
            Know More ›
          </button>
        </div>
      </div>

      {/* ── Left / Right Slider Arrow Buttons ── */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 z-30 p-1.5 sm:p-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white/90 hover:text-white border border-white/20 transition cursor-pointer backdrop-blur-xs shadow-md"
        aria-label="Previous character slide"
      >
        <ChevronLeft size={18} className="sm:hidden" />
        <ChevronLeft size={24} className="hidden sm:block" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 z-30 p-1.5 sm:p-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white/90 hover:text-white border border-white/20 transition cursor-pointer backdrop-blur-xs shadow-md"
        aria-label="Next character slide"
      >
        <ChevronRight size={18} className="sm:hidden" />
        <ChevronRight size={24} className="hidden sm:block" />
      </button>

      {/* ── Bottom Slider Navigation: Indicators & Slide Counter ── */}
      <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 z-30 flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-10 md:px-16">
        {/* 3 Slider Indicators */}
        <div className="flex items-center gap-2 sm:gap-3">
          {spotlightCharacters.map((char, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={char.id || index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 h-1.5 sm:h-2 rounded-full cursor-pointer ${
                  isActive
                    ? "w-7 sm:w-12 bg-red-600"
                    : "w-2 sm:w-3.5 bg-white/40 hover:bg-white/70"
                }`}
                title={char.name}
                aria-label={`Slide ${index + 1}: ${char.name}`}
              />
            );
          })}
        </div>

        {/* Slide Counter: e.g. 01 / 03 */}
        <div className="text-xs sm:text-sm font-mono tracking-widest text-white/70">
          <span className="text-white font-bold">0{currentIndex + 1}</span> / 0{spotlightCharacters.length}
        </div>
      </div>
    </div>
  );
};

export default CharacterSpotlight;
