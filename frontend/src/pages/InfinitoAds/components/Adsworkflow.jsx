import React from "react";
import { stepsData } from "../data/adsData";

const Adsworkflow = () => {
  return (
    <section className="w-full bg-white py-16 sm:py-20 text-gray-900 border-t border-gray-100">
      <div className="w-full max-w-[1200px] mx-auto px-12">
        <div className="text-center mb-12 sm:mb-14">
          <h2 className="text-3xl font-black uppercase tracking-wide text-black">
            HOW IT WORKS?
          </h2>

          <span className="text-xs tracking-widest text-[#d01824] font-bold uppercase mt-1.5 block">
            FROM IDEA TO IMPACT
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {stepsData.map((step, idx) => (
            <div
              key={idx}
              className="relative bg-white border border-gray-200 p-6 rounded-md shadow-xs hover:border-[#d01824] hover:shadow-md transition duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black text-[#d01824]">
                  {step.step}
                </span>

                {idx < stepsData.length - 1 && (
                  <span className="hidden lg:block text-[#d01824] text-lg font-bold">
                    &gt;
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold mb-2 text-black">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Adsworkflow;