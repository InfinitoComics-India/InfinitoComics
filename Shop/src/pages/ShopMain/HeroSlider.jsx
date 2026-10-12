import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const defaultSlides = [
  {
    id: "slide-1",
    title: "Monthly Drop Incoming",
    image: "/banners/hero_monthly_drop.png",
    hideText: true,
    heading: "MONTHLY DROP INCOMING",
    subtext: "Only 500 pieces. Book the exclusive INFINITO merchandise right now.",
    cta: "Shop Now",
    ctaLink: "https://shop.infinitohq.com/",
    variant: "light",
    align: "right",
  },
  {
    id: "slide-2",
    title: "Become Infinito",
    image: "/banners/hero_become_infinito.png",
    hideText: true,
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
            heading: s.headline,
            highlightText: s.highlightText,
            subtext: s.subheading,
            cta: s.buttonText || "Shop Now",
            ctaLink: s.buttonLink || "https://shop.infinitohq.com/",
            hideText: s.displayMode === "banner_image" || s.hideText === true,
            variant: s.variant || (idx === 0 ? "light" : "dark"),
            align: s.alignment || s.align || (idx === 0 ? "right" : "left"),
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

  const goTo = useCallback((i) => setActive((i + slides.length) % slides.length), []);
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  // Auto-advance every 6s
  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

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
  const isDark = slide.variant === "dark";
  const isRight = slide.align === "right";

  const textColor = isDark ? "text-white" : "text-black";

  // Fallback background when no artwork has been supplied yet — matches
  // the light / dark variants so text still reads well.
  const fallbackBg = isDark
    ? "bg-[radial-gradient(circle_at_65%_50%,#3a0a0a_0%,#000_45%)]"
    : "bg-[radial-gradient(circle_at_35%_50%,#fde4e4_0%,#fff_55%)]";

  return (
    <div
      className={`w-full flex-shrink-0 ${textColor} relative ${
        slide.image ? "bg-black" : fallbackBg
      }`}
    >
      {slide.image && (
        <>
          {/* Full-bleed hero artwork — already includes background, products
              and lighting so we just render it edge-to-edge. */}
          <img
            src={slide.image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Text-readability gradient only makes sense when there's an
              overlay to protect. Skip it when the artwork already has
              baked-in copy. */}
          {!slide.hideText && (
            <div
              className={`absolute inset-0 ${
                isRight
                  ? "bg-gradient-to-l from-white/60 via-white/10 to-transparent"
                  : "bg-gradient-to-r from-black/70 via-black/20 to-transparent"
              }`}
            />
          )}
        </>
      )}

      {slide.hideText ? (
        // Artwork already carries heading, subtext and CTA — reserve
        // the same vertical space and stay out of the way matching SS1 aspect ratio.
        <div className="w-full aspect-[1024/380] min-h-[340px] sm:min-h-[420px] md:min-h-[500px]" />
      ) : (
        <div className="relative max-w-[1200px] mx-auto px-4 md:px-12 w-full aspect-[1024/380] min-h-[340px] sm:min-h-[420px] md:min-h-[500px] flex items-center">
          <div
            className={`w-full md:w-1/2 py-14 md:py-20 ${
              isRight ? "md:ml-auto md:text-right" : "md:mr-auto md:text-left"
            }`}
          >
            {slide.eyebrow && (
              <div className={`inline-block mb-5 ${isRight ? "md:ml-auto" : ""}`}>
                <span className="inline-block bg-[#DD1215] text-white px-3 py-1 text-sm md:text-base font-black tracking-widest font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif]">
                  {slide.eyebrow}
                </span>
              </div>
            )}

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.9] tracking-wider font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] drop-shadow-lg">
              {slide.heading}
            </h1>

            <p
              className={`mt-6 text-sm md:text-base max-w-md font-dmsans ${
                isRight ? "md:ml-auto" : ""
              } ${isDark ? "text-white/85" : "text-black/75"}`}
            >
              {slide.subtext}
            </p>

            <div className={`mt-8 flex ${isRight ? "md:justify-end" : ""}`}>
              <button className="px-8 py-3 bg-[#DD1215] hover:bg-red-700 text-white text-sm font-bold uppercase tracking-widest transition-colors font-dmsans">
                {slide.cta}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
