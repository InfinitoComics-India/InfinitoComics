import React from "react";
import { servicesData } from "../data/adsData";

export default function AdsServices() {
  return (
    <section className="w-full bg-white py-16 sm:py-20 text-gray-900">
      <div className="w-full max-w-[1200px] mx-auto px-12">
        <h2 className="text-2xl sm:text-3xl font-black uppercase text-center mb-12 sm:mb-14 tracking-wider text-black">
          WHAT CAN WE DO FOR YOUR BRAND?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {servicesData.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 p-6 rounded-md shadow-xs hover:border-[#d01824] hover:shadow-md transition duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-full bg-red-50 text-[#d01824] flex items-center justify-center font-bold text-lg mb-4">
                  ✦
                </div>

                <h3 className="text-base sm:text-lg font-bold mb-2 text-black">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}