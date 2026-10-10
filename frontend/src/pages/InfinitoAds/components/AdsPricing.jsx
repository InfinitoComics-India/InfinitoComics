import React from "react";
import { pricingData } from "../data/adsData";

const AdsPricing = () => {
  return (
    <section className="w-full bg-white py-16 sm:py-20 text-gray-900 border-t border-gray-100">
      <div className="w-full max-w-[1200px] mx-auto px-12">
        <h2 className="text-2xl sm:text-3xl font-black uppercase text-center mb-12 sm:mb-14 tracking-wider text-black">
          CHOOSE THE BEST FIT PACKAGE!
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingData.map((pkg, idx) => (
            <div
              key={idx}
              className={`relative rounded-md p-6 flex flex-col justify-between transition-all duration-300 ${
                pkg.isPopular
                  ? "bg-black text-white shadow-xl scale-[1.02] z-10"
                  : "bg-white text-gray-900 border border-gray-200 shadow-xs hover:shadow-md"
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#d01824] text-white text-[10px] uppercase font-black px-3.5 py-0.5 tracking-wider rounded-full shadow-sm">
                  Most Popular
                </div>
              )}

              <div>
                <h3
                  className={`text-xl font-black ${
                    pkg.isPopular ? "text-white" : "text-black"
                  }`}
                >
                  {pkg.name}
                </h3>

                <p
                  className={`text-xs mb-5 ${
                    pkg.isPopular ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {pkg.tagline}
                </p>

                <ul
                  className={`space-y-2.5 text-xs mb-8 ${
                    pkg.isPopular ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {pkg.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#d01824] font-bold">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-base sm:text-lg font-black text-[#d01824] mb-4">
                  *{pkg.price}
                </div>

                <a
                  href="#contact-form"
                  className={`w-full py-2.5 text-center text-xs font-bold uppercase tracking-wider block transition rounded-xs ${
                    pkg.isPopular
                      ? "bg-[#d01824] hover:bg-[#b0131d] text-white shadow-md"
                      : "border border-gray-300 hover:border-black text-black hover:bg-gray-50"
                  }`}
                >
                  GET STARTED &gt;
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footnote Bar */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between text-xs border-t border-gray-100 pt-5 gap-2">
          <span className="text-[#d01824] font-bold">
            *SME Package - INR 49,999/- Super-Hero integrated 10 graphics!
          </span>

          <span className="text-[#d01824] font-bold">
            *Additional 18% GST
          </span>
        </div>
      </div>
    </section>
  );
};

export default AdsPricing;