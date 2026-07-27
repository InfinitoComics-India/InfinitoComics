import React from "react";

const OurVision = () => {
  return (
    <div className="w-full px-4 sm:px-8 md:px-16 lg:px-24 py-8 sm:py-12 bg-white text-black font-sans mb-10">
      {/* Section Heading */}
      <h2 className="text-lg sm:text-xl md:text-3xl font-bold tracking-widest uppercase mb-8 text-center md:text-left mx-0 sm:mx-10 md:mx-15 lg:mx-50">
        Our Vision
      </h2>
      <div className="mx-0 sm:mx-10 md:mx-15 lg:mx-50">
        {/* Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Innovation */}
        <div className="bg-white border shadow-sm p-4 sm:p-6 md:p-8 rounded-sm">
          <h3 className="text-lg md:text-xl font-bold mb-2">INNOVATION</h3>
          <p className="text-sm leading-relaxed">
            We harness the power of cutting-edge ABM technology to design immersive and interactive AVGC–XR experiences. Our focus is on continuous evolution and platform enhancement, ensuring our consumers always benefit from the latest and most innovative features.
          </p>
        </div>

        {/* Card 2: Growing Audience */}
        <div className="bg-[#161616] text-white border shadow-sm p-4 sm:p-6 md:p-8 rounded-sm">
          <h3 className="text-lg md:text-xl font-bold mb-2">GROWING AUDIENCE</h3>
          <p className="text-sm leading-relaxed">
            We aim to captivate and engage a diverse, passionate audience of superhero fans, continually growing and enriching our community of both creators and enthusiasts.
          </p>
        </div>

        {/* Card 3: Growth */}
        <div className="bg-[#161616] text-white border shadow-sm p-4 sm:p-6 md:p-8 rounded-sm">
          <h3 className="text-lg md:text-xl font-bold mb-2">GROWTH</h3>
          <p className="text-sm leading-relaxed">
            We are dedicated to expanding our global reach and impact within the AVGC–XR industry. Our goal is to grow our content library, cultivate a vibrant community of creators and audiences, and play a pivotal role in shaping the future of the industry.
          </p>
        </div>

        {/* Card 4: Future Goals */}
        <div className="bg-white border shadow-sm p-4 sm:p-6 md:p-8 rounded-sm">
          <h3 className="text-lg md:text-xl font-bold mb-2">FUTURE GOALS</h3>
          <p className="text-sm leading-relaxed">
            Our goal is to innovate, expand, educate, and inspire. We are dedicated to pushing the limits of the AVGC–XR industry, amplifying diverse voices and driving meaningful change.
          </p>
        </div>
        </div>
    </div>
    </div>
  );
};

export default OurVision;
