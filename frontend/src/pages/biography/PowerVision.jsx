import React, { useState } from "react";

export default function PowersCarousel({ character }) {
  const [active, setActive] = useState(0);

  const powers = [
    character?.power1ImageUrl || "/images/placeholder.png",
    character?.power2ImageUrl || "/images/placeholder.png",
    character?.power3ImageUrl || "/images/placeholder.png",
  ];

  return (
    <div className="relative w-full bg-[#181717] overflow-hidden">
      <div className="relative w-full max-w-6xl mx-auto">
        {/* Rectangular fixed frame */}
        <div className="relative w-full" style={{ aspectRatio: "18 / 8" }}>
          <img
            src={powers[active]}
            alt={`Power ${active + 1}`}
            className="w-full h-full object-fill" // fills the rectangle completely
            draggable="false"
          />

          {/* Buttons overlay */}
          <div
            className="
              absolute 
              bottom-[5%] 
              left-1/2 
              -translate-x-1/2 
              flex gap-6 flex-wrap justify-center
            "
          >
            {["POWER 1", "POWER 2", "POWER 3"].map((label, i) => (
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
