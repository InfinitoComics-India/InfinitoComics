import React from "react";

const OurVision = () => {
  return (
    <div className="w-full px-4 sm:px-8 md:px-12 lg:px-20 py-8 sm:py-12 bg-white text-black font-sans mb-12">
      {/* Section Heading */}
      <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wider uppercase font-['Bebas_Neue','Dharma_Gothic_E',sans-serif]">
          OUR VISION
        </h2>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto">
        {/* DESKTOP / TABLET VIEW: 100% Exact Polygon Seamless Grid */}
        <div className="hidden md:block relative w-full h-[560px] lg:h-[520px] border border-black bg-white overflow-hidden shadow-sm">
          {/* SVG Grid Divider Overlay (Outer border, horizontal seam, diagonal seam) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
          >
            {/* Outer Box Border */}
            <rect
              x="0"
              y="0"
              width="1000"
              height="1000"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="4"
            />
            {/* Horizontal Middle Seam */}
            <line
              x1="0"
              y1="500"
              x2="1000"
              y2="500"
              stroke="#1a1a1a"
              strokeWidth="3"
            />
            {/* Continuous Diagonal Seam (60% top -> 50% middle -> 40% bottom) */}
            <line
              x1="600"
              y1="0"
              x2="400"
              y2="1000"
              stroke="#1a1a1a"
              strokeWidth="3"
            />
          </svg>

          {/* TOP ROW (height: 50%) */}
          {/* CARD 1: INNOVATION (Top-Left - White Background) */}
          <div
            className="absolute top-0 left-0 w-full h-[50%] bg-white z-10 flex items-center justify-start"
            style={{
              clipPath: "polygon(0% 0%, 60% 0%, 50% 100%, 0% 100%)",
            }}
          >
            <div className="w-[48%] h-full flex flex-col justify-center pl-8 lg:pl-12 pr-6 text-left">
              <h3 className="text-2xl lg:text-3xl font-extrabold uppercase mb-2 lg:mb-3 text-black tracking-wide">
                INNOVATION
              </h3>
              <p className="text-xs lg:text-sm leading-relaxed text-black/90 font-normal">
                We harness the power of cutting-edge ABM technology to design
                immersive and interactive AVGC–XR experiences. Our focus is on
                continuous evolution and platform enhancement, ensuring our
                consumers always benefit from the latest and most innovative
                features.
              </p>
            </div>
          </div>

          {/* CARD 2: GROWING AUDIENCE (Top-Right - Dark Background) */}
          <div
            className="absolute top-0 left-0 w-full h-[50%] bg-[#1c1c1c] text-white z-10 flex items-center justify-end"
            style={{
              clipPath: "polygon(60% 0%, 100% 0%, 100% 100%, 50% 100%)",
            }}
          >
            <div className="w-[44%] h-full flex flex-col justify-center pr-8 lg:pr-12 pl-6 text-center md:text-right">
              <h3 className="text-2xl lg:text-3xl font-extrabold uppercase mb-2 lg:mb-3 text-white tracking-wide">
                GROWING AUDIENCE
              </h3>
              <p className="text-xs lg:text-sm leading-relaxed text-white/90 font-normal max-w-md ml-auto">
                We aim to captivate and engage a diverse, passionate audience of
                superhero fans, continually growing and enriching our community
                of both creators and enthusiasts.
              </p>
            </div>
          </div>

          {/* BOTTOM ROW (height: 50%, top: 50%) */}
          {/* CARD 3: GROWTH (Bottom-Left - Dark Background) */}
          <div
            className="absolute top-[50%] left-0 w-full h-[50%] bg-[#1c1c1c] text-white z-10 flex items-center justify-start"
            style={{
              clipPath: "polygon(0% 0%, 50% 0%, 40% 100%, 0% 100%)",
            }}
          >
            <div className="w-[44%] h-full flex flex-col justify-center pl-8 lg:pl-12 pr-6 text-left">
              <h3 className="text-2xl lg:text-3xl font-extrabold uppercase mb-2 lg:mb-3 text-white tracking-wide">
                GROWTH
              </h3>
              <p className="text-xs lg:text-sm leading-relaxed text-white/90 font-normal max-w-md">
                We are dedicated to expanding our global reach and impact within
                the AVGC–XR industry. Our goal is to grow our content library,
                cultivate a vibrant community of creators and audiences, and play
                a pivotal role in shaping the future of the industry.
              </p>
            </div>
          </div>

          {/* CARD 4: FUTURE GOALS (Bottom-Right - White Background) */}
          <div
            className="absolute top-[50%] left-0 w-full h-[50%] bg-white text-black z-10 flex items-center justify-end"
            style={{
              clipPath: "polygon(50% 0%, 100% 0%, 100% 100%, 40% 100%)",
            }}
          >
            <div className="w-[48%] h-full flex flex-col justify-center pr-8 lg:pr-12 pl-6 text-center md:text-right">
              <h3 className="text-2xl lg:text-3xl font-extrabold uppercase mb-2 lg:mb-3 text-black tracking-wide">
                FUTURE GOALS
              </h3>
              <p className="text-xs lg:text-sm leading-relaxed text-black/90 font-normal max-w-md ml-auto">
                Our goal is to innovate, expand, educate, and inspire. We are
                dedicated to pushing the limits of the AVGC–XR industry,
                amplifying diverse voices and driving meaningful change.
              </p>
            </div>
          </div>
        </div>

        {/* MOBILE VIEW: Clean Stacked Grid with Borders */}
        <div className="block md:hidden border border-black divide-y divide-black">
          {/* Card 1: INNOVATION */}
          <div className="bg-white text-black p-6">
            <h3 className="text-xl font-extrabold uppercase mb-2">INNOVATION</h3>
            <p className="text-sm leading-relaxed text-black/90">
              We harness the power of cutting-edge ABM technology to design
              immersive and interactive AVGC–XR experiences. Our focus is on
              continuous evolution and platform enhancement, ensuring our
              consumers always benefit from the latest and most innovative
              features.
            </p>
          </div>

          {/* Card 2: GROWING AUDIENCE */}
          <div className="bg-[#1c1c1c] text-white p-6">
            <h3 className="text-xl font-extrabold uppercase mb-2">
              GROWING AUDIENCE
            </h3>
            <p className="text-sm leading-relaxed text-white/90">
              We aim to captivate and engage a diverse, passionate audience of
              superhero fans, continually growing and enriching our community
              of both creators and enthusiasts.
            </p>
          </div>

          {/* Card 3: GROWTH */}
          <div className="bg-[#1c1c1c] text-white p-6">
            <h3 className="text-xl font-extrabold uppercase mb-2">GROWTH</h3>
            <p className="text-sm leading-relaxed text-white/90">
              We are dedicated to expanding our global reach and impact within
              the AVGC–XR industry. Our goal is to grow our content library,
              cultivate a vibrant community of creators and audiences, and play
              a pivotal role in shaping the future of the industry.
            </p>
          </div>

          {/* Card 4: FUTURE GOALS */}
          <div className="bg-white text-black p-6">
            <h3 className="text-xl font-extrabold uppercase mb-2">
              FUTURE GOALS
            </h3>
            <p className="text-sm leading-relaxed text-black/90">
              Our goal is to innovate, expand, educate, and inspire. We are
              dedicated to pushing the limits of the AVGC–XR industry,
              amplifying diverse voices and driving meaningful change.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurVision;
