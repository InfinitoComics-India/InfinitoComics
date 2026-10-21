import React, { useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

// Video data fetched/shared with Infinito Animation page
const animationVideos = [
  {
    id: 1,
    title: "MULTIVERSE UNLEASHED",
    firstWord: "MULTIVERSE",
    secondWord: "UNLEASHED",
    youtubeId: "27VGbZNOSjo",
    thumbnail: "https://img.youtube.com/vi/27VGbZNOSjo/maxresdefault.jpg",
  },
  {
    id: 2,
    title: "INFINITO ANIMATION",
    firstWord: "INFINITO",
    secondWord: "ANIMATION",
    youtubeId: "jImhvA9uNVU",
    thumbnail: "https://img.youtube.com/vi/jImhvA9uNVU/maxresdefault.jpg",
  },
];

const InfinitoAnimation = () => {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
   <div className="w-full bg-white py-6 sm:py-10 md:py-12">
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12">
        {/* ── Section Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-wide">
              <span className="text-black">INFINITO </span>
              <span className="text-[#E50914]">ANIMATION</span>
            </h2>
            <p className="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed mt-1 max-w-2xl font-normal">
              Stories and characters to life through captivating animation,
              creative storytelling, and immersive visual experiences.
            </p>
          </div>

          <Link
            to="/animation"
            className="text-[#E50914] hover:underline font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-1 shrink-0 mt-1 sm:mt-0"
          >
            VIEW ALL &gt;
          </Link>
        </div>

        {/* ── Two Video Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
          {animationVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => setActiveVideo(video.youtubeId)}
              className="group cursor-pointer flex flex-col"
            >
              {/* Thumbnail Container */}
              <div className="relative w-full aspect-video bg-black rounded-sm overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  onError={(e) => {
                    e.target.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors" />

                {/* Center Red Circular Play Button with inner white ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-[#E50914] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 p-1 sm:p-1.5">
                    <div className="w-full h-full rounded-full border-2 border-white flex items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        fill="white"
                        className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 ml-0.5 sm:ml-1"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title Below Video */}
              <div className="mt-2.5 sm:mt-4">
                <h3 className="text-base sm:text-xl font-black uppercase tracking-wide">
                  <span className="text-black">{video.firstWord} </span>
                  <span className="text-[#E50914]">{video.secondWord}</span>
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── YouTube Video Player Modal ── */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-3 right-3 text-white bg-black/70 hover:bg-[#E50914] w-9 h-9 flex items-center justify-center rounded-full z-20 transition-colors cursor-pointer"
              aria-label="Close Video"
            >
              <X size={20} />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0`}
              title="Infinito Animation Video"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InfinitoAnimation;
