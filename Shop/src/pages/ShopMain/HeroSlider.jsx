import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Once you export the hero product photos from Figma, drop them in
// Shop/src/assets/hero/ as slide1.png / slide2.png / slide3.png and
// swap the placeholder gradients below for <img src={slideX} />.
//
// import slide1 from "../../assets/hero/slide1.png";
// import slide2 from "../../assets/hero/slide2.png";
// import slide3 from "../../assets/hero/slide3.png";

const slides = [
  {
    id: 1,
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
  {
    id: 2,
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
    id: 3,
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

  // Placeholder background until real hero product photos are dropped in.
  // Dark variant → black with a red radial glow (matches the tee/hoodie slide).
  // Light variant → white with a soft red disc (matches the jacket slide).
  const bg = isDark
    ? "bg-[radial-gradient(circle_at_65%_50%,#3a0a0a_0%,#000_45%)]"
    : "bg-[radial-gradient(circle_at_35%_50%,#fde4e4_0%,#fff_55%)]";

  const textColor = isDark ? "text-white" : "text-black";

  return (
    <div className={`w-full flex-shrink-0 ${bg} ${textColor} relative`}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 min-h-[520px] md:min-h-[600px] flex items-center">
        <div
          className={`w-full md:w-1/2 py-16 md:py-20 ${
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

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.9] tracking-wider font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif]">
            {slide.heading}
          </h1>

          <p className={`mt-6 text-sm md:text-base max-w-md font-dmsans ${isRight ? "md:ml-auto" : ""} ${isDark ? "text-white/80" : "text-black/70"}`}>
            {slide.subtext}
          </p>

          <div className={`mt-8 flex ${isRight ? "md:justify-end" : ""}`}>
            <button className="px-8 py-3 bg-[#DD1215] hover:bg-red-700 text-white text-sm font-bold uppercase tracking-widest transition-colors font-dmsans">
              {slide.cta}
            </button>
          </div>
        </div>

        {/* Placeholder product visual on the opposite side */}
        <div
          className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-1/2 h-[80%] ${
            isRight ? "left-0" : "right-0"
          } pointer-events-none`}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center opacity-30">
              <div className={`w-40 h-40 mx-auto rounded-full border-4 ${isDark ? "border-red-500" : "border-red-500"}`} />
              <p className={`mt-4 text-xs uppercase tracking-widest ${isDark ? "text-white/40" : "text-black/40"}`}>
                Hero product image
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
