import React, { useState, useEffect } from "react";

export default function PowersCarousel({ character }) {
  const [active, setActive] = useState(0);

  const powers = [
    character?.power1ImageUrl || "/images/placeholder.png",
    character?.power2ImageUrl || "/images/placeholder.png",
  ];

  // Auto-slide effect: transitions fully to the next image every 3 seconds
  useEffect(() => {
    if (powers.length <= 1) return;

    const intervalId = setInterval(() => {
      setActive((prevActive) => (prevActive + 1) % powers.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [active, powers.length]);

  return (
    <div className="relative w-full bg-[#181717] overflow-hidden py-4">
      <div className="relative w-full max-w-6xl mx-auto overflow-hidden">
        {/* Rectangular fixed frame */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "18 / 8" }}>
          {/* Sliding track showing one image at a time */}
          <div
            className="flex w-full h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {powers.map((src, i) => (
              <div key={i} className="w-full h-full shrink-0">
                <img
                  src={src}
                  alt={`Power ${i + 1}`}
                  className="w-full h-full object-fill" // fills the rectangle completely
                  draggable="false"
                />
              </div>
            ))}
          </div>

          {/* Buttons overlay */}
          <div
            className="
              absolute 
              bottom-[5%] 
              left-1/2 
              -translate-x-1/2 
              flex gap-6 flex-wrap justify-center
              z-10
            "
          >
            {["POWER 1", "POWER 2"].map((label, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`px-3 py-1 text-sm md:text-base font-semibold transition-colors ${
                  active === i
                    ? "text-[#a18afc] border-b-2 border-[#a18afc]"
                    : "text-white/70 border-b-2 border-white/20"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
