import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const defaultSlides = [
  {
    id: "slide-1",
    title: "Monthly Drop Incoming",
    image: "/banners/hero_monthly_drop.png",
    hideText: false,
    heading: "MONTHLY DROP INCOMING",
    highlightText: "MONTHLY DROP",
    subtext: "Only 500 pieces. Book the exclusive INFINITO merchandise right now.",
    cta: "Shop Now",
    ctaLink: "https://shop.infinitohq.com/",
    variant: "light",
    align: "left",
  },
  {
    id: "slide-2",
    title: "Become Infinito",
    image: "/banners/hero_become_infinito.png",
    hideText: false,
    heading: "BECOME ONE OF US BECOME INFINITO",
    highlightText: "ONE OF US",
    subtext: "Only 500 pieces. Book the exclusive INFINITO merchandise right now.",
    cta: "Shop Now",
    ctaLink: "https://shop.infinitohq.com/",
    variant: "dark",
    align: "left",
  },
];

const loadSlidesFromStorage = () => {
  try {
    const raw = localStorage.getItem("infinito_shop_banners");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.heroSlider) && parsed.heroSlider.length > 0) {
        const enabled = parsed.heroSlider.filter((s) => s.isActive !== false);
        if (enabled.length > 0) {
          return enabled.map((s, idx) => ({
            id: s.id || `slide-${idx + 1}`,
            title: s.title,
            image: s.imageUrl || s.image || (idx === 0 ? "/banners/hero_monthly_drop.png" : "/banners/hero_become_infinito.png"),
            heading: s.headline || s.title || (idx === 0 ? "MONTHLY DROP INCOMING" : "BECOME ONE OF US BECOME INFINITO"),
            highlightText: s.highlightText || (idx === 0 ? "MONTHLY DROP" : "ONE OF US"),
            subtext: s.subheading || s.subtext || "Only 500 pieces. Book the exclusive INFINITO merchandise right now.",
            cta: s.buttonText || s.cta || "Shop Now",
            ctaLink: s.buttonLink || s.ctaLink || "https://shop.infinitohq.com/",
            hideText: false,
            variant: s.variant || (idx === 0 ? "light" : "dark"),
            align: s.alignment || s.align || "left",
          }));
        }
      }
    }
  } catch {}
  return defaultSlides;
};

const HeroSlider = () => {
  const [slides, setSlides] = useState(loadSlidesFromStorage);
  const [active, setActive] = useState(0);

  const goTo = (i) => {
    if (!slides || slides.length === 0) return;
    setActive((i + slides.length) % slides.length);
  };
  const next = () => {
    if (!slides || slides.length === 0) return;
    setActive((prev) => (prev + 1) % slides.length);
  };
  const prev = () => {
    if (!slides || slides.length === 0) return;
    setActive((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Automated sliding every 4 seconds
  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Live synchronization across Admin tab and Shop tab
  useEffect(() => {
    const reload = () => setSlides(loadSlidesFromStorage());
    let bc;
    try {
      bc = new BroadcastChannel("infinito_banners_channel");
      bc.onmessage = (e) => {
        if (e.data?.type === "banners_updated") reload();
      };
    } catch {}
    window.addEventListener("storage", reload);
    return () => {
      if (bc) bc.close();
      window.removeEventListener("storage", reload);
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {slides.map((slide) => (
          <Slide key={slide.id} slide={slide} />
        ))}
      </div>

      {/* Arrow controls */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur border border-white/30 flex items-center justify-center text-white transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur border border-white/30 flex items-center justify-center text-white transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all rounded-full ${
              active === i
                ? "w-3.5 h-3.5 bg-white"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

const Slide = ({ slide }) => {
  const isRight = slide.align === "right";

  return (
    <div className="w-full flex-shrink-0 text-white relative bg-black">
      {slide.image && (
        <img
          src={slide.image}
          alt={slide.title || "Hero Slide"}
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none scale-[1.08] min-w-full min-h-full"
        />
      )}

      {/* Contrast gradient scrim ensuring text and button pop and masking background */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isRight
            ? "bg-gradient-to-l from-black/95 via-black/60 to-transparent"
            : "bg-gradient-to-r from-black/95 via-black/60 to-transparent"
        }`}
      />

      {/* Content overlaid on banner matching Live Carousel Preview aesthetic exactly */}
      <div className="relative max-w-[1200px] mx-auto px-6 sm:px-8 md:px-12 w-full aspect-[1024/380] min-h-[340px] sm:min-h-[420px] md:min-h-[500px] flex items-center">
        <div
          className={`w-full md:w-3/5 py-10 md:py-16 space-y-2 md:space-y-3 ${
            isRight ? "md:ml-auto md:text-right" : "md:mr-auto md:text-left"
          }`}
        >
          {/* Badge / Tag */}
          <div className={`flex items-center gap-2 ${isRight ? "justify-end" : "justify-start"}`}>
            <span className="inline-block bg-black/75 text-[#DD1215] text-[10px] md:text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded backdrop-blur-sm border border-red-900/40">
              {slide.highlightText || slide.eyebrow || "ONE OF US"} • ACTIVE
            </span>
          </div>

          {/* Bold Headline matching Live Carousel Preview */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold uppercase leading-[1.05] tracking-tight text-white drop-shadow-md font-sans">
            {(() => {
              const heading = slide.heading || slide.title || "INFINITO";
              const hl = slide.highlightText;
              if (!hl || !heading.toLowerCase().includes(hl.toLowerCase())) return heading;
              const parts = heading.split(new RegExp(`(${hl})`, 'gi'));
              return parts.map((part, i) =>
                part.toLowerCase() === hl.toLowerCase() ? (
                  <span key={i} className="text-[#DD1215] drop-shadow">{part}</span>
                ) : (
                  part
                )
              );
            })()}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base font-semibold tracking-wide text-gray-200 uppercase drop-shadow max-w-lg">
            {slide.subtext || "Only 500 pieces. Book the exclusive INFINITO merchandise right now."}
          </p>

          {/* Red CTA Button */}
          <div className={`pt-2 flex ${isRight ? "justify-end" : "justify-start"}`}>
            <button
              type="button"
              onClick={() => {
                const link = slide.ctaLink || "https://shop.infinitohq.com/";
                if (link.startsWith("http")) window.location.href = link;
                else window.location.pathname = link;
              }}
              className="px-5 sm:px-6 py-2 sm:py-2.5 bg-[#DD1215] hover:bg-red-700 text-white text-xs md:text-sm font-bold uppercase tracking-wider rounded transition-colors shadow-md cursor-pointer"
            >
              {slide.cta || "Shop Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
