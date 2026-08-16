import React from 'react';
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import founderImg from '../../../assets/Images/aboutUs/founder.png';
import aboutUsUrls from '../../utils/imagesUrls/aboutUsUrls.js';

const FounderProfile = () => {
  return (
    <div className="w-full min-h-screen bg-white text-black py-10 sm:py-14 md:py-16 px-4 sm:px-8 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* SECTION 1: MEET THE FOUNDER */}
        <section className="space-y-8">
          {/* Top Title */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest uppercase font-sans text-black">
            MEET THE FOUNDER
          </h1>

          {/* Main Hero Card */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-between">
            {/* Left Portrait Image */}
            <div className="w-full max-w-sm lg:w-[320px] flex-shrink-0 mx-auto lg:mx-0">
              <img
                src={founderImg || aboutUsUrls.FOUNDER_URL}
                alt="Ar. Rajan Sharma"
                className="w-full h-auto object-cover rounded-none shadow-md"
              />
            </div>

            {/* Right Info Section */}
            <div className="flex-1 space-y-6 w-full">
              {/* Name & Title */}
              <div>
                <p className="text-gray-800 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-1">
                  HI, I'M
                </p>
                <h2 className="text-[#E50914] text-3xl sm:text-4xl md:text-5xl font-black tracking-wider uppercase">
                  AR. RAJAN SHARMA
                </h2>
                <h3 className="text-black text-sm sm:text-base md:text-lg font-bold tracking-widest mt-1 uppercase">
                  FOUNDER &amp; CEO
                </h3>
              </div>

              {/* Subtitle & Birthday Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pt-2">
                <p className="md:col-span-2 text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed font-dmsans">
                  Leads and oversees all operations of the company, including creative direction, financial management, and strategic planning.
                </p>

                <div className="md:col-span-1">
                  <p className="text-black font-bold text-xs sm:text-sm tracking-wider uppercase">
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
                  aria-label="Facebook"
                  className="border border-black p-2.5 hover:bg-black hover:text-white transition group"
                >
                  <FaFacebookF className="text-black group-hover:text-white text-base" />
                </a>
                <a
                  href="https://www.instagram.com/ar.rajansharma/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="border border-black p-2.5 hover:bg-black hover:text-white transition group"
                >
                  <FaInstagram className="text-black group-hover:text-white text-base" />
                </a>
                <a
                  href="https://www.linkedin.com/in/rajan11/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="border border-black p-2.5 hover:bg-black hover:text-white transition group"
                >
                  <FaLinkedinIn className="text-black group-hover:text-white text-base" />
                </a>
                <a
                  href="https://x.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X Twitter"
                  className="border border-black p-2.5 hover:bg-black hover:text-white transition group"
                >
                  <FaXTwitter className="text-black group-hover:text-white text-base" />
                </a>
              </div>
            </div>
          </div>

          {/* Full-width Blue Accent Divider Line */}
          <div className="w-full h-[2px] bg-[#3B82F6] my-6" />

          {/* Intro Paragraph */}
          <p className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed font-dmsans tracking-wide text-center sm:text-left max-w-5xl mx-auto">
            Ar. Rajan Sharma is a visionary leader whose pursuits span architecture, entrepreneurship, and athletics. With a passion for excellence and a commitment to contributing meaningfully to India’s growth, Rajan has carved a unique path for himself, balancing creativity, innovation, and discipline.
          </p>
        </section>
      </div>
    </div>
  );
};

export default FounderProfile;
