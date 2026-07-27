import React, { useState, useEffect } from "react";
import ImaginationsLeadsShimmer from "../../shimmer/Career/ImaginationsLeadsShimmer";
import careerUrls from "../../utils/imagesUrls/carrerUrls.js"; // Importing URLs for images

const ImaginationsLeads = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => setLoading(false), 2400);
  }, []);
  return loading ? (
    <ImaginationsLeadsShimmer />
  ) : (
    <div className="w-full px-4 md:px-20 py-12 space-y-16">
      {/* Section Title */}
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto py-10">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">
          Work Where Imagination Leads
        </h2>
        <p className="text-gray-600 text-sm md:text-lg tracking-tight">
          We’re building a future where creativity is limitless, collaboration
          is seamless, and every voice helps shape the story. Come draw your
          path with us.
        </p>
      </div>

      {/* Three Pillars - made fully responsive with max-w and auto margin */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center max-w-6xl mx-auto">
        {/* Pillar 1 */}
        <div className="border p-6 rounded-md">
          <h3 className="font-bold mb-2 text-xl">Connected by Stories</h3>
          <p className="text-gray-600 text-lg tracking-tight">
            From anywhere in the world, we come together to create something
            unforgettable.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="bg-red-600 text-white p-6 rounded-md">
          <h3 className="font-bold mb-2 text-xl">Inclusive by Design</h3>
          <p className="text-lg tracking-tight">
            Different voices. One vision. We celebrate every perspective.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="border p-6 rounded-md">
          <h3 className="font-bold mb-2 text-xl">Flexible by Nature</h3>
          <p className="text-gray-600 text-lg tracking-tight">
            Work how you work best—because creativity needs freedom.
          </p>
        </div>
      </div>

      {/* Core Values Section - made responsive with container width classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto my-20">
        <div className="space-y-6">
          {/* Text Content for Core Values */}
          <div className="mb-12">
            <h3 className="text-lg md:text-3xl font-semibold mb-5">
              Our core values
            </h3>
            <p className="text-sm md:text-lg text-gray-800 tracking-tight">
              These values guide every page we create and every team we build.
              At Infinito Comics, we believe in telling bold stories—with heart,
              purpose, and a little bit of mischief. We’re not just making
              comics; we’re building a culture where creators thrive, grow, and
              feel seen—wherever they are.
            </p>
          </div>

          {/* Core Values List with custom bullet design */}
          <ul className="grid grid-cols-2 gap-y-3 text-sm text-gray-700 list-none">
            {/* Each core value is styled with a bullet point and label */}
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 bg-gray-400 rounded-full inline-block"></span>
              <strong className="text-gray-800">Empathy</strong>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 bg-gray-400 rounded-full inline-block"></span>
              <strong className="text-gray-800">Courtesy</strong>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 bg-gray-400 rounded-full inline-block"></span>
              <strong className="text-gray-800">Thriving</strong>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 bg-gray-400 rounded-full inline-block"></span>
              <strong className="text-gray-800">Craftsmanship</strong>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 bg-gray-400 rounded-full inline-block"></span>
              <strong className="text-gray-800">Playfulness</strong>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 bg-gray-400 rounded-full inline-block"></span>
              <strong className="text-gray-800">Solidarity</strong>
            </li>
          </ul>
        </div>

        {/* Sticky Note Image - responsive image with adaptive height */}
        <img
          src={careerUrls.CAREER_IMAGE_2}
          alt="team planning with sticky notes"
          className="rounded shadow-md object-cover w-full h-72 md:h-96 lg:h-[350px] max-w-lg mx-auto"
        />
      </div>

      {/* Working and Thriving Section - responsive layout with adjusted margins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-25 items-center max-w-6xl mx-auto  mb-20 md:mt-40  ">
        {/* Left side image */}
        <img
          src={careerUrls.CAREER_IMAGE_1}
          alt="team working on computer"
          className="rounded shadow-md object-cover w-full h-72 md:h-96 lg:h-[350px] max-w-lg "
        />

        {/* Right side text content */}
        <div className="space-y-4">
          <h3 className="text-lg md:text-3xl font-semibold">
            Working and Thriving
          </h3>
          <p className="text-sm md:text-lg text-black tracking-tight">
            At Infinito Comics, your well-being fuels our creativity. We’re
            committed to helping you feel your best—on and off the page. From
            rest and recharge time to holistic support, we make sure you thrive
            with a clear mind and a full heart.
          </p>

          {/* Benefits list */}
          <div className="flex flex-col gap-4 text-lg mt-8">
            <p>Generous time off to rest, create, and give back</p>
            <p>Comprehensive healthcare for body and mind</p>
            <p>Support for your well-being, family, and future</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImaginationsLeads;
