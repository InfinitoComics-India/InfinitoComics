import React, { useState } from "react";
import { faqData } from "../data/adsData";

export default function AdsFAQ() {
  const [openIds, setOpenIds] = useState([]);

  const toggleFAQ = (id) => {
    setOpenIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (openIds.length === faqData.length) {
      setOpenIds([]);
    } else {
      setOpenIds(faqData.map((f) => f.id));
    }
  };

  return (
    <section className="w-full bg-white py-16 sm:py-20 text-gray-900 border-t border-gray-100">
      <div className="w-full max-w-[1200px] mx-auto px-12">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-black">
            Frequently asked questions
          </h2>

          <button
            onClick={toggleAll}
            className="text-xs text-[#d01824] hover:underline uppercase font-bold cursor-pointer"
          >
            {openIds.length === faqData.length
              ? "Collapse all -"
              : "Expand all +"}
          </button>
        </div>

        <div className="space-y-3">
          {faqData.map((item) => {
            const isOpen = openIds.includes(item.id);

            return (
              <div
                key={item.id}
                className="border border-gray-200 bg-white rounded-md overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-semibold text-sm sm:text-base text-gray-900 hover:text-[#d01824] transition cursor-pointer"
                >
                  <span>{item.question}</span>

                  <span className="text-xl text-gray-400 font-light ml-4">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}