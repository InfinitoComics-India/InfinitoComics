import React from "react";
import { statsData } from "../data/adsData";

export default function AdsStats() {
  return (
    <section className="w-full bg-white border-y border-gray-200 py-8">
      <div className="w-full max-w-[1200px] mx-auto px-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 text-center">
          {statsData.map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-3"
            >
              <span className="text-[11px] sm:text-xs uppercase tracking-wider text-gray-800 font-extrabold mb-1.5 leading-snug">
                {stat.title}
              </span>

              <span className="text-2xl sm:text-3xl font-black text-[#d01824] tracking-wide">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}