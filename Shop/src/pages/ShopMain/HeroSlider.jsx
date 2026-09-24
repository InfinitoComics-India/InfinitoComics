import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import slide1 from "../../assets/hero/slide1.svg";
// Slides 2 and 3 fall back to slide1 until you export the other variants.
// Save additional exports as slide2.png / slide3.png in the same folder.

const slides = [
  {
    // Slide 1 uses the artwork as-is — heading, subtext and Shop Now
    // button are all baked into the SVG, so we don't render an overlay.
    id: 1,
    image: slide1,
    hideText: true,
    variant: "dark",
    align: "left",
  },
  {
    // No image yet — text-only over a light red-tinted background.
    id: 2,
    image: null,
    variant: "light",
    eyebrow: "INFINITO",
    heading: (
      <>
        MONTHLY DROP
        <br />
        INCOMING
      </>
    ),
    subtext: "Only 500 pieces. Book the exclusive INFINITO merchandise right now.",
    cta: "Shop Now",
    align: "right",
  },
  {
    // No image yet — text-only over the dark red radial background.
    id: 3,
    image: null,
    variant: "dark",
    eyebrow: null,
    heading: (
      <>
        <span className="text-[#DD1215]">BECOME</span>
        <br />
        ONE OF US
        <br />
        <span className="text-[#DD1215]">BECOME</span>
        <br />
        INFINITO
      </>
    ),
    subtext: "Only 500 pieces. Book the exclusive INFINITO merchandise right now.",
    cta: "Shop Now",
    align: "left",
  },
];

const HeroSlider = () => {
  const [active, setActive] = useState(0);

  const goTo = useCallback((i) => setActive((i + slides.length) % slides.length), []);
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  // Auto-advance every 6s
  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

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
        // the same vertical space and stay out of the way.
        <div className="min-h-[420px] md:min-h-[560px]" />
      ) : (
        <div className="relative max-w-[1200px] mx-auto px-4 md:px-12 min-h-[420px] md:min-h-[560px] flex items-center">
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
