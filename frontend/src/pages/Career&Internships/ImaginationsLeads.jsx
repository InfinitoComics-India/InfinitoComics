import React, { useState, useEffect } from "react";
import ImaginationsLeadsShimmer from "../../shimmer/Career/ImaginationsLeadsShimmer";
import careerUrls from "../../utils/imagesUrls/carrerUrls.js";

const ImaginationsLeads = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2400);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <ImaginationsLeadsShimmer />;

  return (
    <div className="w-full bg-white py-16 space-y-20">
      <div className="w-full max-w-[1200px] mx-auto px-12">

        {/* Section title */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto py-10">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Work Where Imagination Leads
          </h2>
          <p className="text-gray-600 text-sm md:text-lg tracking-tight">
            We're building a future where creativity is limitless, collaboration
            is seamless, and every voice helps shape the story. Come draw your
            path with us.
          </p>
        </div>

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="border p-6 rounded-md">
            <h3 className="font-bold mb-2 text-xl">Connected by Stories</h3>
            <p className="text-gray-600 text-lg tracking-tight">
              From anywhere in the world, we come together to create something unforgettable.
            </p>
          </div>
          <div className="bg-red-600 text-white p-6 rounded-md">
            <h3 className="font-bold mb-2 text-xl">Inclusive by Design</h3>
            <p className="text-lg tracking-tight">
              Different voices. One vision. We celebrate every perspective.
            </p>
          </div>
          <div className="border p-6 rounded-md">
            <h3 className="font-bold mb-2 text-xl">Flexible by Nature</h3>
            <p className="text-gray-600 text-lg tracking-tight">
              Work how you work best—because creativity needs freedom.
            </p>
          </div>
        </div>

        {/* Core values + image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start pt-16">
          <div className="space-y-6">
            <div className="mb-8">
              <h3 className="text-lg md:text-3xl font-semibold mb-5">Our core values</h3>
              <p className="text-sm md:text-lg text-gray-800 tracking-tight">
                These values guide every page we create and every team we build.
                At Infinito Comics, we believe in telling bold stories—with heart,
                purpose, and a little bit of mischief. We're not just making comics;
                we're building a culture where creators thrive, grow, and feel seen—wherever they are.
              </p>
            </div>
            <ul className="grid grid-cols-2 gap-y-3 text-sm text-gray-700 list-none">
              {["Empathy", "Craftsmanship", "Courtesy", "Playfulness", "Thriving", "Solidarity"].map((v) => (
                <li key={v} className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-gray-400 rounded-full inline-block"></span>
                  <strong className="text-gray-800">{v}</strong>
                </li>
              ))}
            </ul>
          </div>
          <img
            src={careerUrls.CAREER_IMAGE_2}
            alt="team planning with sticky notes"
            className="rounded shadow-md object-cover w-full h-72 md:h-96 lg:h-[350px]"
          />
        </div>

        {/* Working and Thriving */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-16 pb-8">
          <img
            src={careerUrls.CAREER_IMAGE_1}
            alt="team working on computer"
            className="rounded shadow-md object-cover w-full h-72 md:h-96 lg:h-[350px]"
          />
          <div className="space-y-4">
            <h3 className="text-lg md:text-3xl font-semibold">Working and Thriving</h3>
            <p className="text-sm md:text-lg text-black tracking-tight">
              At Infinito Comics, your well-being fuels our creativity. We're committed to
              helping you feel your best—on and off the page. From rest and recharge time to
              holistic support, we make sure you thrive with a clear mind and a full heart.
            </p>
            <div className="flex flex-col gap-4 text-lg mt-8">
              <p>Generous time off to rest, create, and give back</p>
              <p>Comprehensive healthcare for body and mind</p>
              <p>Support for your well-being, family, and future</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ImaginationsLeads;
