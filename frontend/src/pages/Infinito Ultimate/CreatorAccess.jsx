import React, { useState } from 'react';
import bgTorn from '../../../assets/Images/Ultimate/CreatorAccessMiddle.png'; 
import topTorn from '../../../assets/Images/Ultimate/CreatorAccessUpper.png'; 
import bottomTorn from '../../../assets/Images/Ultimate/CreatorAccessLower.png'; 
import { PlayCircle } from 'lucide-react';

// Same YouTube videos as Animation page
const trailers = [
  { 
    id: 1, 
    title: "MULTIVERSE UNLEASHED", 
    youtubeId: "27VGbZNOSjo",
    thumbnail: "https://img.youtube.com/vi/27VGbZNOSjo/maxresdefault.jpg"
  },
  { 
    id: 2, 
    title: "INFINITO COMICS", 
    youtubeId: "jImhvA9uNVU",
    thumbnail: "https://img.youtube.com/vi/jImhvA9uNVU/maxresdefault.jpg"
  },
];

const CreatorAccess = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  return (
    <div className="w-full text-white leading-none">
      {/* Top Torn Edge Image */}
      <img
        src={topTorn}
        alt="Top Torn Edge"
        className="w-full object-cover block m-0 p-0 -mb-1"
      />

      {/* Main Section with Background */}
      <div className="relative w-full block m-0 p-0">
        <img
          src={bgTorn}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none m-0 p-0"
        />

        <div className="relative z-10 py-[4rem] px-[1rem]">
          <div className="text-center mb-[2.5rem]">
            <h2 className="text-[1.5rem] md:text-[1.875rem] font-semibold leading-relaxed md:leading-tight">
              Unlock Creator Access with Infinito Ultimate
            </h2>
          </div>

          {/* Cards Container - 2 videos side by side taking full width */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 px-4 md:px-8 max-w-6xl mx-auto">

            {trailers.map((trailer) => (
              <div 
                key={trailer.id} 
                className="cursor-pointer group"
                onClick={() => setSelectedVideo(trailer.youtubeId)}
              >
                <div className="relative w-full aspect-video overflow-hidden rounded-lg">
                  <img
                    src={trailer.thumbnail}
                    alt={trailer.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <PlayCircle className="w-16 h-16 md:w-20 md:h-20 text-white opacity-90 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <p className="mt-3 text-base md:text-lg text-center font-medium group-hover:text-[#DD1215] transition-colors">
                  {trailer.title}
                </p>
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* Bottom Torn Edge Image */}
      <img
        src={bottomTorn}
        alt="Bottom Torn Edge"
        className="w-full object-cover block m-0 p-0 -mt-1"
      />

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-3 right-3 text-white bg-black/70 hover:bg-[#DD1215] w-9 h-9 flex items-center justify-center rounded-full z-20 transition-colors font-bold text-lg"
              aria-label="Close Modal"
            >
              ✕
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
              title="YouTube Video Player"
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

export default CreatorAccess;
