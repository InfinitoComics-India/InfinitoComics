import React, { useState } from "react";

const CARE_ITEMS = [
  { label: "Our customers",  img: "https://api.dicebear.com/7.x/initials/svg?seed=OC&backgroundColor=4CAF50&fontColor=ffffff&radius=8" },
  { label: "Our teammates",  img: "https://api.dicebear.com/7.x/initials/svg?seed=OT&backgroundColor=2196F3&fontColor=ffffff&radius=8" },
  { label: "Our company",    img: "https://api.dicebear.com/7.x/initials/svg?seed=OC2&backgroundColor=9C27B0&fontColor=ffffff&radius=8" },
  { label: "Our community",  img: "https://api.dicebear.com/7.x/initials/svg?seed=OCM&backgroundColor=FF5722&fontColor=ffffff&radius=8" },
  { label: "Ourselves",      img: "https://api.dicebear.com/7.x/initials/svg?seed=OS&backgroundColor=FF9800&fontColor=ffffff&radius=8" },
];

const BENEFITS = [
  { icon: "🏖️", title: "Generous Time Off",   desc: "Rest, recharge, and create. We support vacations and personal days." },
  { icon: "🏥", title: "Health Coverage",      desc: "Comprehensive healthcare for body and mind, including mental wellness support." },
  { icon: "📈", title: "Growth & Learning",    desc: "Stipends for courses, conferences, and tools that help you grow." },
  { icon: "🏠", title: "Flexible Work",        desc: "Remote-friendly setup. Work from home, the office, or somewhere in between." },
  { icon: "👨‍👩‍👧", title: "Family Support",     desc: "Parental leave and support programs for every family structure." },
  { icon: "🎨", title: "Creative Freedom",     desc: "Time and space to explore personal creative projects alongside your work." },
];

const BELONGING = [
  { title: "Connected by Stories",  desc: "From anywhere in the world, we come together to create something unforgettable." },
  { title: "Inclusive by Design",   desc: "Different voices. One vision. We celebrate every perspective that makes us stronger." },
  { title: "Flexible by Nature",    desc: "Work how you work best — because great creativity needs real freedom." },
  { title: "Safe to Be Yourself",   desc: "Zero tolerance for discrimination. Everyone belongs here, full stop." },
];

const TABS = ["OUR VALUES", "OUR BENEFITS", "BELONGING AT INFINITO"];

const ValuesTab = () => (
  <div className="w-full bg-white py-12">
    <div className="w-full max-w-[1200px] mx-auto px-12">
      <h2 className="text-xl md:text-2xl font-bold mb-10 text-center">We care for:</h2>
      {/* Row 1 — 3 items centered */}
      <div className="flex flex-wrap justify-center gap-x-16 gap-y-6 mb-8">
        {CARE_ITEMS.slice(0, 3).map((item) => (
          <div key={item.label} className="flex items-center gap-4">
            <img src={item.img} alt={item.label} className="w-14 h-14 rounded-lg object-cover shadow-sm" />
            <span className="text-sm md:text-base font-medium text-gray-800">{item.label}</span>
          </div>
        ))}
      </div>
      {/* Row 2 — 2 items centered */}
      <div className="flex flex-wrap justify-center gap-x-16 gap-y-6">
        {CARE_ITEMS.slice(3).map((item) => (
          <div key={item.label} className="flex items-center gap-4">
            <img src={item.img} alt={item.label} className="w-14 h-14 rounded-lg object-cover shadow-sm" />
            <span className="text-sm md:text-base font-medium text-gray-800">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const BenefitsTab = () => (
  <div className="w-full bg-white py-12">
    <div className="w-full max-w-[1200px] mx-auto px-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {BENEFITS.map((b) => (
          <div key={b.title} className="bg-gray-50 rounded-xl p-6 flex flex-col gap-3">
            <span className="text-3xl">{b.icon}</span>
            <h3 className="font-bold text-gray-900">{b.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const BelongingTab = () => (
  <div className="w-full bg-white py-12">
    <div className="w-full max-w-[1200px] mx-auto px-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {BELONGING.map((b, i) => (
          <div
            key={b.title}
            className={`rounded-xl p-6 border ${i === 1 ? "bg-red-600 text-white border-red-600" : "bg-white border-gray-200"}`}
          >
            <h3 className={`font-bold text-lg mb-2 ${i === 1 ? "text-white" : "text-gray-900"}`}>{b.title}</h3>
            <p className={`text-sm leading-relaxed ${i === 1 ? "text-red-100" : "text-gray-600"}`}>{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ValuesTabs = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full">
      {/* Tab bar — full width background, inner content constrained */}
      <div className="w-full border-b border-gray-200">
        <div className="w-full max-w-[1200px] mx-auto px-12">
          <div className="flex">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`flex-1 py-4 text-xs sm:text-sm font-bold tracking-widest uppercase transition-colors focus:outline-none ${
                  activeTab === i ? "bg-red-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 0 && <ValuesTab />}
      {activeTab === 1 && <BenefitsTab />}
      {activeTab === 2 && <BelongingTab />}
    </div>
  );
};

export default ValuesTabs;
