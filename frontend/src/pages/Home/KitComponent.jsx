import React from 'react';
import { CircleCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import kitimg from '../../../assets/Images/kit/Kit.png';
import logo from '../../../assets/Logo.png';

const KitComponent = () => {
  const navigate = useNavigate();

  const features = [
    'Comic of your choice',
    'Surprise Superhero Toy',
    'Digital Wall Paintings',
    'Superhero Stickers',
    'Infinito T-shirt',
  ];

  return (
    <section className="w-full bg-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 font-dmsans">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <h2 className="text-xl sm:text-3xl md:text-4xl font-black uppercase text-center tracking-widest text-black mb-8 md:mb-12">
          ULTIMATE KIT
        </h2>

        {/* Main Card with outer border */}
        <div className="border border-neutral-400 bg-white p-3 sm:p-5 md:p-6 flex flex-col lg:flex-row gap-6 items-stretch shadow-sm">
          {/* Left: Kit Image with inner border */}
          <div className="lg:w-[62%] w-full border border-neutral-300 p-2 sm:p-4 flex items-center justify-center bg-[#fafafa]">
            <img
              src={kitimg}
              alt="Infinito Ultimate Kit"
              className="w-full h-auto max-h-[380px] object-contain"
            />
          </div>

          {/* Right: Details & Pricing Panel */}
          <div className="lg:w-[38%] w-full flex flex-col justify-between py-2 sm:py-3 px-1 sm:px-3">
            <div>
              {/* Top Row: Badge + Title and Prices */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <img
                    src={logo}
                    alt="Infinito"
                    className="h-6 md:h-7 w-auto object-contain"
                  />
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-black mt-1">
                    ULTIMATE KIT
                  </h3>
                </div>

                {/* Pricing */}
                <div className="flex items-baseline gap-1.5 shrink-0">
                  <span className="text-gray-400 line-through text-sm sm:text-base font-semibold">
                    ₹2199
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                    ₹1999
                  </span>
                </div>
              </div>

              {/* Divider Line */}
              <hr className="border-t border-neutral-300 my-4" />

              {/* Feature Checklist */}
              <ul className="space-y-3 my-4 sm:my-6">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2.5 text-sm sm:text-base text-neutral-800 font-medium">
                    <CircleCheck size={18} className="text-red-600 shrink-0" strokeWidth={2.5} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <div className="mt-4 pt-2">
              <button
                onClick={() => navigate('/ultimate')}
                className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold py-3 text-base sm:text-lg transition uppercase tracking-wider shadow-sm"
              >
                Get Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KitComponent;
