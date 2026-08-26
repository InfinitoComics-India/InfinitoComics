import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";
import founderImg from "../../../assets/Images/aboutUs/founder.png";
import aboutUsUrls from "../../utils/imagesUrls/aboutUsUrls.js";

const FounderSection = () => {
  return (
    <div className="w-full px-4 sm:px-8 md:px-20 py-10 sm:py-14 md:py-16 bg-white">
      <div className="mx-0 sm:mx-10 md:mx-20 lg:mx-40">
        {/* Section Title */}
        <h2 className="text-black font-bold tracking-widest text-base sm:text-lg md:text-3xl uppercase mb-6 sm:mb-10 font-sans">
          OUR FOUNDER
        </h2>

        {/* Content Layout */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Founder Image */}
          <div className="w-full max-w-xs md:w-[260px] flex-shrink-0 mx-auto md:mx-0">
            <img
              src={founderImg || aboutUsUrls.FOUNDER_URL}
              alt="AR. Rajan Sharma"
              className="w-full h-auto object-cover rounded-none shadow-sm"
            />
          </div>

          {/* Text Content */}
          <div className="flex-1 space-y-5">
            {/* Name and Role */}
            <div>
              <h3 className="text-red-600 text-xl sm:text-2xl md:text-3xl font-bold tracking-wider uppercase">
                AR. RAJAN SHARMA
              </h3>
              <p className="text-black text-xs sm:text-sm font-semibold tracking-widest mt-1 uppercase">
                FOUNDER & CEO
              </p>
            </div>

            {/* Paragraph */}
            <p className="text-gray-800 text-xs sm:text-sm md:text-base leading-relaxed tracking-wide font-dmsans">
              Ar. Rajan Sharma is a visionary architect and entrepreneur holding a B.Arch from NIT Raipur and EMBA from IIM Udaipur. Combining design thinking with strategic business management, he leads 70+ creators building India’s premier original character universe. As Founder &amp; Creative Head of Infinito Comics (a unit of Miraya Corporation), he oversees creative direction, character development, comic publishing, smart audio eyewear innovation, and strategic growth across 70+ team members.
            </p>

            {/* Icons and Read More */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
              {/* Social Icons */}
              <div className="flex gap-3 justify-center sm:justify-start">
                <a
                  href="https://www.instagram.com/ar.rajansharma/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Profile"
                  className="border border-black p-2.5 hover:bg-black hover:text-white transition group"
                >
                  <FaInstagram className="text-black group-hover:text-white" />
                </a>
                <a
                  href="https://www.linkedin.com/in/rajan11/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Profile"
                  className="border border-black p-2.5 hover:bg-black hover:text-white transition group"
                >
                  <FaLinkedinIn className="text-black group-hover:text-white" />
                </a>
              </div>

              {/* Read More (Commented Out) */}
              {/* <Link
                to="/founder-profile"
                className="text-red-600 font-bold text-xs sm:text-sm tracking-wider uppercase text-center sm:text-left hover:underline"
              >
                READ MORE &gt;
              </Link> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderSection;
