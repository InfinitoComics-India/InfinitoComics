import React from "react";
import { possibilitiesData } from "../data/adsData";

export default function AdsPossibility() {
  return (
    <section className="w-full bg-white py-16 sm:py-20 text-gray-900 border-t border-gray-100">
      <div className="w-full max-w-[1200px] mx-auto px-12">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-black">
            SEE THE POSSIBILITIES!
          </h2>
        </div>

        {/* 3 Possibility Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {possibilitiesData.map((item) => (
            <div key={item.id} className="flex flex-col group cursor-pointer">
              {/* Image Frame */}
              <div className="w-full aspect-square overflow-hidden rounded-md bg-gray-100 shadow-sm border border-gray-100">
                <img
                  src={item.image}
                  alt={item.category}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Text */}
              <div className="mt-4 flex flex-col">
                <h3 className="text-base sm:text-lg font-black text-black uppercase tracking-wider mb-1.5 group-hover:text-[#d01824] transition-colors">
                  {item.category}
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <div className="text-center mt-10">
          <p className="text-xs sm:text-sm text-[#d01824] italic font-medium">
            *We can think other possibilities as per brand preference and
            requirement.
          </p>
        </div>
      </div>
    </section>
  );
}