import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Play, PlayCircle, Film, ArrowRight, X } from "lucide-react";
import trailer1 from "../../../assets/Images/Ultimate/trailer1.png";

const teasers = [
  {
    id: "27VGbZNOSjo",
    title: "MULTIVERSE UNLEASHED | INFINITO SAGA",
    subtitle: "OFFICIAL TRAILER",
    tag: "FEATURED",
    duration: "2:15",
    description:
      "An ancient force awakens across dimensions. Heroes will rise, worlds will collide, and the Infinito Universe will never be the same.",
    thumbnail: "https://img.youtube.com/vi/27VGbZNOSjo/maxresdefault.jpg",
  },
  {
    id: "jImhvA9uNVU",
    title: "INFINITO COMICS — A NEW SAGA",
    subtitle: "MOTION COMIC TEASER",
    tag: "TEASER",
    duration: "1:48",
    description:
      "Step into India's premier original character universe. Breathtaking motion comics, rich lore, and superhero action.",
    thumbnail: "https://img.youtube.com/vi/jImhvA9uNVU/maxresdefault.jpg",
  },
  {
    id: "27VGbZNOSjo",
    title: "ORIGINS OF THE HEROES",
    subtitle: "BEHIND THE SCENES ANIMATION",
    tag: "SPECIAL",
    duration: "3:02",
    description:
      "Exclusive character animation breakdown, art evolution, and combat choreography previews.",
    thumbnail: trailer1,
  },
];

const AnimationTeaser = () => {
  const [activeVideo, setActiveVideo] = useState(null);
  const mainTeaser = teasers[0];
  const sideTeasers = teasers.slice(1);

  return (
    <section className="py-10 w-11/12 lg:w-2/3 mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3">
        <div>
          <div className="flex items-center gap-2 text-[#DD1215] text-xs font-bold tracking-widest uppercase mb-1">
            <Film size={14} />
            <span>Infinito Motion Universe</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-black uppercase">
            ANIMATION &amp; TRAILERS
          </h2>
        </div>

        <Link
          to="/animation"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#DD1215] font-bold tracking-wider hover:text-black transition-colors uppercase group"
        >
          <span>Explore All Animations</span>
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      {/* Main Grid: Featured Hero Video + Side Teasers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Main Featured Video Card */}
        <div className="lg:col-span-7 bg-black rounded-xl overflow-hidden shadow-lg flex flex-col justify-between group relative">
          <div
            className="relative w-full aspect-video overflow-hidden cursor-pointer bg-neutral-900"
            onClick={() => setActiveVideo(mainTeaser.id)}
          >
            <img
              src={mainTeaser.thumbnail}
              alt={mainTeaser.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
            />
            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

            {/* Badge */}
            <div className="absolute top-3 left-3 bg-[#DD1215] text-white text-[10px] font-black tracking-widest px-2.5 py-1 uppercase rounded">
              {mainTeaser.tag}
            </div>

            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded">
              {mainTeaser.duration}
            </div>

            {/* Large Center Play Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#DD1215] text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300">
                <Play size={26} className="ml-1 fill-white" />
              </div>
            </div>
          </div>

          {/* Description & Action Bar */}
          <div className="p-5 sm:p-6 bg-gradient-to-b from-neutral-900 to-black text-white flex-1 flex flex-col justify-between">
            <div>
              <p className="text-[#DD1215] text-xs font-bold tracking-widest uppercase mb-1.5">
                {mainTeaser.subtitle}
              </p>
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-wide mb-2 line-clamp-2">
                {mainTeaser.title}
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-4">
                {mainTeaser.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setActiveVideo(mainTeaser.id)}
                className="px-4 py-2 bg-[#DD1215] hover:bg-red-700 text-white text-xs font-bold tracking-wider uppercase rounded transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Play size={14} className="fill-white" />
                <span>Watch Trailer</span>
              </button>
              <Link
                to="/animation"
                className="px-4 py-2 bg-transparent hover:bg-white/10 text-white border border-neutral-700 hover:border-white text-xs font-bold tracking-wider uppercase rounded transition-colors"
              >
                Animation Hub
              </Link>
            </div>
          </div>
        </div>

        {/* Secondary Teasers Stack */}
        <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
          {sideTeasers.map((teaser, idx) => (
            <div
              key={idx}
              onClick={() => setActiveVideo(teaser.id)}
              className="group bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl p-3 sm:p-4 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row gap-4 items-center"
            >
              {/* Thumbnail */}
              <div className="relative w-full sm:w-44 aspect-video rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                <img
                  src={teaser.thumbnail}
                  alt={teaser.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle className="w-9 h-9 text-white group-hover:text-[#DD1215] group-hover:scale-110 transition-all duration-300 drop-shadow-md" />
                </div>

                <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                  {teaser.duration}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#DD1215]">
                    {teaser.tag}
                  </span>
                </div>
                <h4 className="text-white font-bold text-sm leading-snug group-hover:text-[#DD1215] transition-colors line-clamp-2 uppercase mb-1">
                  {teaser.title}
                </h4>
                <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                  {teaser.description}
                </p>
              </div>
            </div>
          ))}

          {/* Banner calling out to /animation */}
          <div className="bg-gradient-to-r from-red-950/40 via-black to-neutral-950 border border-red-900/30 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-white font-extrabold text-sm uppercase tracking-wide">
                More in the Animation Arena
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                Episodes, character lore animations, and teaser reels.
              </p>
            </div>
            <Link
              to="/animation"
              className="flex-shrink-0 px-3 py-1.5 bg-[#DD1215] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
            >
              Watch All
            </Link>
          </div>
        </div>
      </div>

      {/* Video Modal Popup */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-3 right-3 text-white bg-black/70 hover:bg-[#DD1215] w-9 h-9 flex items-center justify-center rounded-full z-20 transition-colors cursor-pointer"
              aria-label="Close Video"
            >
              <X size={20} />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0`}
              title="YouTube video player"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default AnimationTeaser;
