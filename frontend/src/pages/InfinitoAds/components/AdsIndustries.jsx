import React from "react";
import { industriesData } from "../data/adsData";
import {
  Shirt,
  Cpu,
  ShoppingBag,
  Car,
  Plane,
  Briefcase,
  Activity,
} from "lucide-react";

const iconMap = {
  shirt: Shirt,
  cpu: Cpu,
  "shopping-bag": ShoppingBag,
  car: Car,
  plane: Plane,
  briefcase: Briefcase,
  activity: Activity,
};

const AdsIndustries = () => {
  return (
    <section className="w-full bg-white py-12 sm:py-16 lg:py-20 text-gray-900 text-center border-t border-gray-100">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase mb-2 text-black tracking-wide">
          WHO CAN PARTNER WITH US?
        </h2>

        <p className="text-xs text-[#d01824] italic mb-8 sm:mb-12 font-medium">
          *We can make different industries fit into the Infinito Universe.
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:flex md:flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-10">
          {industriesData.map((ind, idx) => {
            const Icon = iconMap[ind.icon] || Activity;

            return (
              <div
                key={idx}
                className="flex flex-col items-center group w-full max-w-[90px] sm:max-w-none md:w-24 mx-auto cursor-pointer"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[#d01824] mb-2 group-hover:bg-[#d01824] group-hover:text-white transition duration-300 shadow-xs">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                <span className="text-[11px] sm:text-xs font-bold text-gray-800 text-center group-hover:text-[#d01824] transition">
                  {ind.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AdsIndustries;