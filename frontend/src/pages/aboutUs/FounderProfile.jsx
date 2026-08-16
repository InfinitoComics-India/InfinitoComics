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
          {/* Top Title in Dharma / Bebas style font */}
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
                  Leads and oversees all operations of the company, including creative direction, financial management, and strategic planning.
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

        {/* Intro Paragraph & Bottom Red Accent Line */}
        <div className="pt-8 space-y-8">
          <p className="text-gray-800 text-[13px] sm:text-[14px] leading-relaxed font-dmsans tracking-wide text-center max-w-4xl mx-auto">
            Ar. Rajan Sharma is a visionary leader whose pursuits span architecture, entrepreneurship, and athletics. With a passion for excellence and a commitment to contributing meaningfully to India’s growth, Rajan has carved a unique path for himself, balancing creativity, innovation, and discipline.
          </p>

          {/* Centered Red Accent Line Segment below Intro */}
          <div className="w-48 sm:w-64 h-[2px] bg-[#E50914] mx-auto mt-8" />
        </div>
      </div>
    </div>
  );
};

export default FounderProfile;
