import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaLinkedinIn, FaFacebookF } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { FaArrowLeft } from 'react-icons/fa6';

import founderImg from '../../../assets/Images/aboutUs/founder.png';
import aboutUsUrls from '../../utils/imagesUrls/aboutUsUrls.js';

const FounderProfile = () => {
  return (
    <div className="w-full min-h-screen bg-white text-black py-6 sm:py-10 md:py-12 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-12 space-y-6">
        {/* Back to About Us Link */}
        <div>
          <Link
            to="/aboutUS"
            className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-700 hover:text-black transition"
          >
            <FaArrowLeft className="text-xs" />
            BACK TO ABOUT US
          </Link>
        </div>

        {/* SECTION 1: MEET THE FOUNDER */}
        <section className="space-y-8 pt-2">
          {/* Top Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-widest uppercase font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] text-black">
            MEET THE FOUNDER
          </h1>

          {/* Main Hero Card */}
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start justify-between">
            {/* Left Portrait Image */}
            <div className="w-full max-w-xs md:w-[260px] flex-shrink-0 mx-auto md:mx-0">
              <img
                src={founderImg || aboutUsUrls.FOUNDER_URL}
                alt="Ar. Rajan Sharma"
                className="w-full h-auto object-cover rounded-none shadow-sm"
              />
            </div>

            {/* Right Info Section */}
            <div className="flex-1 space-y-5 w-full pt-1">
              {/* Name & Title */}
              <div>
                <p className="text-gray-800 text-xs sm:text-sm font-bold tracking-wider uppercase mb-1">
                  HI, I'M
                </p>
                <h2 className="text-[#E50914] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-wider uppercase">
                  AR. RAJAN SHARMA
                </h2>
                <h3 className="text-black text-xs sm:text-sm md:text-base font-bold tracking-widest mt-1 uppercase">
                  FOUNDER &amp; CEO
                </h3>
              </div>

              {/* Subtitle & Birthday Grid */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-1">
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed max-w-md font-dmsans">
                  Founder &amp; CEO of Infinito Comics (Miraya Corp). Oversees creative direction, character development, and strategic growth across 70+ team members.
                </p>

                <div className="flex-shrink-0">
                  <p className="text-black font-bold text-xs tracking-wider uppercase">
                    BIRTH DAY
                  </p>
                  <p className="text-gray-700 text-xs sm:text-sm mt-0.5 font-dmsans">
                    18 September, 1996
                  </p>
                </div>
              </div>

              {/* Social Icons Row */}
              <div className="flex gap-3 pt-2">
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook Profile"
                  className="border border-black p-2 hover:bg-black hover:text-white transition group"
                >
                  <FaFacebookF className="text-black group-hover:text-white text-sm" />
                </a>
                <a
                  href="https://www.instagram.com/ar.rajansharma/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Profile"
                  className="border border-black p-2 hover:bg-black hover:text-white transition group"
                >
                  <FaInstagram className="text-black group-hover:text-white text-sm" />
                </a>
                <a
                  href="https://www.linkedin.com/in/rajan11/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Profile"
                  className="border border-black p-2 hover:bg-black hover:text-white transition group"
                >
                  <FaLinkedinIn className="text-black group-hover:text-white text-sm" />
                </a>
                <a
                  href="https://x.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X Twitter Profile"
                  className="border border-black p-2 hover:bg-black hover:text-white transition group"
                >
                  <FaXTwitter className="text-black group-hover:text-white text-sm" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Real Bio Paragraph from Rajan's Portfolio (2 lines formatting) */}
        <div className="pt-8 space-y-8">
          <p className="text-gray-800 text-[13px] sm:text-[14px] leading-relaxed font-dmsans tracking-wide text-center max-w-4xl mx-auto">
            Ar. Rajan Sharma is a visionary architect and entrepreneur holding a B.Arch from NIT Raipur and EMBA from IIM Udaipur. Combining design thinking with strategic business management, he leads 70+ creators building India’s premier character-based universe.
          </p>

          {/* Centered Red Accent Line Segment below Intro */}
          <div className="w-48 sm:w-64 h-[2px] bg-[#E50914] mx-auto mt-8" />
        </div>

        {/* SECTION 2: ENTREPRENEURIAL VISIONARY */}
        <section className="pt-12 space-y-10">
          {/* Section Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest uppercase font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] text-black text-center">
            ENTREPRENEURIAL VISIONARY
          </h2>

          {/* Text Paragraphs & Pillars */}
          <div className="max-w-4xl mx-auto space-y-5 text-gray-800 text-[13px] sm:text-[14px] leading-relaxed font-dmsans tracking-wide text-left sm:text-justify">
            <p>
              Rajan’s entrepreneurial journey is driven by a passion to revolutionize storytelling, graphic design, and smart technology. As the Founder &amp; Creative Head of Infinito Comics (a unit of Miraya Corporation), he leads operations across 70+ creative team members to build India’s largest original character universe:
            </p>

            <ol className="list-decimal list-inside space-y-2 pl-2 font-dmsans">
              <li>
                <span className="font-semibold text-black">150+ Character Universe:</span> Engineered over 150 original comic characters with distinct powers, storylines, and rich lore for the Infinito universe.
              </li>
              <li>
                <span className="font-semibold text-black">Comic Book Publication:</span> Oversees end-to-end comic book creation from research and concept art to dynamic poses and published series like <em>Journey to Earth</em>, <em>Dark Hours</em>, and <em>Beauty Ranger</em>.
              </li>
              <li>
                <span className="font-semibold text-black">Next-Gen Audio Eyewear:</span> Innovated smart audio eyewear blending style, Bluetooth connectivity, blue-light filtering, and AR/VR capability.
              </li>
              <li>
                <span className="font-semibold text-black">POD Merchandising &amp; Sports Sponsorship:</span> Designed 100+ superhero apparel items and collectibles, serving as official merchandise partner for the Bihar Archery Association.
              </li>
            </ol>

            <p className="pt-2">
              With over 70+ completed graphics and branding projects for institutions like NIT Raipur, L.G. India, and WaterMark Studio, Rajan seamlessly bridges creative architectural vision with scalable business execution.
            </p>
          </div>

          {/* 4 Empty Gray Placeholders Grid */}
          <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="w-full h-36 sm:h-44 md:h-52 bg-[#D9D9D9]" />
            <div className="w-full h-36 sm:h-44 md:h-52 bg-[#D9D9D9]" />
            <div className="w-full h-36 sm:h-44 md:h-52 bg-[#D9D9D9]" />
            <div className="w-full h-36 sm:h-44 md:h-52 bg-[#D9D9D9]" />
          </div>
        </section>

        {/* SECTION 3: A LEADER FOR THE FUTURE */}
        <section className="pt-16 space-y-10">
          {/* Section Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest uppercase font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] text-black text-center">
            A LEADER FOR THE FUTURE
          </h2>

          {/* Athletic & Sponsorship Content */}
          <div className="max-w-4xl mx-auto space-y-4 text-gray-800 text-[13px] sm:text-[14px] leading-relaxed font-dmsans tracking-wide text-left sm:text-justify">
            <p>
              A gold medalist in the 34th Bihar State 10m Air Rifle Shooting Championship, Rajan's athletic achievements are a testament to his discipline and dedication. His passion for sports extends beyond competition—he aspires to represent India on the global stage in the World Cup &amp; Olympics.
            </p>
            <p>
              Rajan is also dedicated towards Archery &amp; his extraordinary performance in 70m Recurve Archery surely uplift him to represent India at higher level. Balancing a demanding training schedule at the Patliputra Sports Complex (Archery) and Patliputra Gun's Shooting Academy (10m Air Rifle Shooting), Rajan's commitment to excellence in sports mirrors his determination in his professional endeavors.
            </p>
            <p>
              He is also supporting and sponsoring other athletes for their future endeavors through Infinito Foundation.
            </p>
          </div>

          {/* 2 Empty Gray Placeholders Grid */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="w-full h-52 sm:h-64 bg-[#D9D9D9]" />
            <div className="w-full h-52 sm:h-64 bg-[#D9D9D9]" />
          </div>
        </section>

        {/* SECTION 4: A SOURCE OF INSPIRATION */}
        <section className="pt-16 space-y-10">
          {/* Section Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest uppercase font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] text-black text-center">
            A SOURCE OF INSPIRATION
          </h2>

          {/* Mentorship & Leadership Content */}
          <div className="max-w-4xl mx-auto space-y-4 text-gray-800 text-[13px] sm:text-[14px] leading-relaxed font-dmsans tracking-wide text-left sm:text-justify">
            <p>
              Rajan Sharma's journey is an inspiring tale of perseverance, vision, and excellence. As an architect designing India's future, an entrepreneur transforming industries, and an athlete aspiring to represent the nation, Rajan exemplifies the spirit of modern India.
            </p>
            <p>
              This journey of Rajan is framed with the guidance of his mentor Prof. Vivek Agnihotri at NIT Raipur and Mr. Pratik Khandelwal and with the contribution of many people who helped in the transformation of Rajan's Vision.
            </p>
            <p>
              Through his endeavors, he not only showcases what is possible but also inspires others to dream big, work hard, and contribute meaningfully to society. Ar. Rajan Sharma is building a legacy—one that will continue to motivate and shape the leaders of tomorrow.
            </p>
          </div>

          {/* 2 Empty Gray Placeholders Grid */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="w-full h-52 sm:h-64 bg-[#D9D9D9]" />
            <div className="w-full h-52 sm:h-64 bg-[#D9D9D9]" />
          </div>
        </section>

        {/* SECTION 5: ARCHITECT WITH A PURPOSE */}
        <section className="pt-16 space-y-6">
          {/* Section Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest uppercase font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] text-black text-center">
            ARCHITECT WITH A PURPOSE
          </h2>

          {/* Architectural Content */}
          <div className="max-w-4xl mx-auto space-y-4 text-gray-800 text-[13px] sm:text-[14px] leading-relaxed font-dmsans tracking-wide text-left sm:text-justify">
            <p>
              Rajan's journey as an architect is defined by his ability to envision spaces that blend functionality with sustainability. His designs are not just about structures but about creating environments that inspire and serve communities.
            </p>
            <p>
              As a professional architect, Rajan is dedicated to transforming and awaring nations through architectural journalism, integrating modern design principles, history of architecture along with environmentally conscious design practices are his key expertise. His work highlights the power of architecture to drive change and enhance lives.
            </p>
            <p>
              His membership includes ISHRAE (Indian Society of Heating Refrigeration and Air Conditioning Engineering), FSAI (Fire Security of India), IBC (Indian Building Congress) and JCI (Junior Chamber Internationals) etc.
            </p>
          </div>
        </section>

        {/* SECTION 6: FUTURE ASPIRATIONS */}
        <section className="pt-12 pb-8 space-y-8">
          {/* Section Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest uppercase font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] text-black text-center">
            FUTURE ASPIRATIONS
          </h2>

          {/* Future Goals & Cybersecurity Content */}
          <div className="max-w-4xl mx-auto space-y-4 text-gray-800 text-[13px] sm:text-[14px] leading-relaxed font-dmsans tracking-wide text-center">
            <p>
              Ar. Rajan Sharma's goals extend across multiple industries, reflecting his ambition to make India a global leader. His future plans include working in the field of cybersecurity to protect India's digital infrastructure.
            </p>
          </div>

          {/* Red Accent Line Segment */}
          <div className="w-48 sm:w-64 h-[2px] bg-[#E50914] mx-auto my-8" />

          {/* Closing Quote / Highlight */}
          <p className="text-gray-900 text-sm sm:text-base md:text-lg font-bold tracking-wide text-center max-w-3xl mx-auto font-dmsans">
            Rajan Sharma stands as a beacon of hope, determination, and innovation, embodying the best of what India has to offer.
          </p>
        </section>
      </div>
    </div>
  );
};

export default FounderProfile;
