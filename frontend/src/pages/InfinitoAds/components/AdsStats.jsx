import React from "react";
import { statsData } from "../data/adsData";

export default function AdsStats() {
  return (
    <section className="w-full bg-white border-y border-gray-200 py-6 sm:py-8">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-6 text-center">
          {statsData.map((stat, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center p-2.5 sm:p-3 bg-gray-50/50 sm:bg-transparent rounded-sm ${
                idx === statsData.length - 1 ? "col-span-2 sm:col-span-1" : ""
              }`}
            >
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-800 font-extrabold mb-1 sm:mb-1.5 leading-snug">
                {stat.title}
              </span>

              <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#d01824] tracking-wide break-words">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}