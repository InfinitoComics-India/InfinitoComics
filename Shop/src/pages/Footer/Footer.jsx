import React from 'react';
import { FRONTEND_BASE_URL, FOUNDATION_BASE_URL, RESEARCH_BASE_URL } from '../../utils/constants';
import { FaPinterestP, FaXTwitter, FaYoutube, FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa6';
import logo from '../../assets/Logo.png';

const socials = [
  { icon: <FaPinterestP className="w-4 h-4" />, url: 'https://www.pinterest.com' },
  { icon: <FaXTwitter className="w-4 h-4" />,   url: 'https://twitter.com' },
  { icon: <FaYoutube className="w-4 h-4" />,    url: 'https://www.youtube.com/@InfinitoHQ' },
  { icon: <FaFacebookF className="w-4 h-4" />,  url: 'https://www.facebook.com/infinitoHQ' },
  { icon: <FaInstagram className="w-4 h-4" />,  url: 'https://www.instagram.com/infinitoHQ/' },
  { icon: <FaLinkedinIn className="w-4 h-4" />, url: 'https://www.linkedin.com/company/infinitoHQ' },
];

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white mt-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* ── Left: Logo, tagline, description ─────────── */}
          <div className="md:col-span-1">
            <img src={logo} alt="Infinito" className="h-14 w-auto object-contain mb-3" />
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/80 mb-6">
              Where Imaginations Breaks Boundaries
            </p>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              India's Most Prominent Character Based Entertainment Company With Library Of More Than 2500+ Superheroes
            </p>
          </div>

          {/* ── Middle: 2 columns of links ───────────────── */}
          <div className="md:col-span-2 grid grid-cols-2 gap-6 md:pl-8">
            <ul className="space-y-5 text-sm font-bold tracking-widest">
              <li>
                <a href={`${FRONTEND_BASE_URL}/news`} className="hover:text-red-400 transition">
                  BLOGS &amp; NEWS
                </a>
              </li>
              <li>
                <a href={`${FRONTEND_BASE_URL}/careers`} className="hover:text-red-400 transition">
                  CAREER
                </a>
              </li>
              <li>
                <a href={`${FRONTEND_BASE_URL}/internships`} className="hover:text-red-400 transition">
                  INTERNSHIP
                </a>
              </li>
              <li>
                <a href={`${FRONTEND_BASE_URL}/contact-us`} className="hover:text-red-400 transition">
                  CONTACT US
                </a>
              </li>
            </ul>

            <ul className="space-y-5 text-sm font-bold tracking-widest">
              <li>
                <a href={FOUNDATION_BASE_URL} className="hover:text-red-400 transition">
                  FOUNDATION
                </a>
              </li>
              <li>
                <a href={RESEARCH_BASE_URL} className="hover:text-red-400 transition">
                  RESEARCH
                </a>
              </li>
              <li>
                <a href={`${FRONTEND_BASE_URL}/support-us`} className="hover:text-red-400 transition">
                  SUPPORT US
                </a>
              </li>
            </ul>
          </div>

          {/* ── Right: Socials + Ultimate CTA ────────────── */}
          <div className="md:col-span-1 flex flex-col items-start md:items-end gap-6">
            <div className="flex items-center gap-2">
              {socials.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center border border-white/40 hover:border-white hover:bg-white/10 transition"
                >
                  {s.icon}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4 max-w-xs md:justify-end">
              <div className="w-12 h-12 flex items-center justify-center bg-black border border-white/40 flex-shrink-0">
                <span className="text-[#DD1215] font-black text-xl">U</span>
              </div>
              <p className="text-xs text-white/70 leading-tight">
                Unlocks Exclusive Comics, Early Access To New Releases &amp; Member-Only Merch!
              </p>
            </div>

            <a
              href={`${FRONTEND_BASE_URL}/ultimate`}
              className="w-full md:w-auto bg-white text-black px-6 py-3 text-xs font-bold tracking-widest hover:bg-gray-200 transition text-center"
            >
              JOIN INFINITO ULTIMATE &gt;
            </a>
          </div>
        </div>
      </div>

      {/* ── Bottom legal bar ──────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-5 flex flex-wrap items-center justify-center md:justify-between gap-4 text-[11px] text-white/60 tracking-wide">
          <nav className="flex flex-wrap items-center gap-6 md:gap-8">
            <a href={`${FRONTEND_BASE_URL}/terms-of-use`} className="hover:text-white transition">Terms Of Use</a>
            <a href={`${FRONTEND_BASE_URL}/privacy-policy`} className="hover:text-white transition">Privacy Policy</a>
            <a href={`${FRONTEND_BASE_URL}/contact-us`} className="hover:text-white transition">FAQs</a>
            <a href={`${FRONTEND_BASE_URL}/children-privacy-policy`} className="hover:text-white transition">Children's Privacy Policy</a>
            <a href={`${FRONTEND_BASE_URL}/contact-us`} className="hover:text-white transition">Help Centre</a>
          </nav>
          <p>© 2025-26 By Infinito Comics</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
