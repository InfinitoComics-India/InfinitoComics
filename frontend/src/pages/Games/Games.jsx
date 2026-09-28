import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../utils/constants';
import { Gamepad2, ExternalLink, Loader } from 'lucide-react';

const GENRES = ["All", "Action", "Adventure", "Puzzle", "Strategy", "Racing", "Other"];

const Games = () => {
  const [games,    setGames]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [genre,    setGenre]    = useState("All");

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/games`);
        setGames(res.data.data || []);
      } catch (e) {
        setError("Failed to load games.");
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const filtered = genre === "All"
    ? games
    : games.filter(g => g.genre?.includes(genre));

  return (
    <div className="bg-black min-h-screen text-white">

      {/* Hero */}
      <div className="relative bg-gradient-to-b from-[#1a0000] to-black px-6 py-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Gamepad2 size={36} className="text-[#DD1215]" />
          <h1 className="text-4xl sm:text-5xl font-black tracking-widest uppercase text-white">
            INFINITO GAMES
          </h1>
        </div>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          Play games inspired by InfinitoComics characters and universes.
        </p>
      </div>

      {/* Genre Filter */}
      <div className="px-6 py-4 flex gap-2 flex-wrap justify-center">
        {GENRES.map(g => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest border transition rounded-full ${
              genre === g
                ? "bg-[#DD1215] text-white border-[#DD1215]"
                : "border-gray-600 text-gray-400 hover:border-[#DD1215] hover:text-white"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader size={32} className="animate-spin text-[#DD1215]" />
          </div>
        ) : error ? (
          <div className="text-center py-24 text-gray-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Gamepad2 size={48} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold text-lg">
              {games.length === 0 ? "Games coming soon. Stay tuned!" : `No ${genre} games found.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(game => (
              <div
                key={game._id}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-[#DD1215] transition group"
              >
                {/* Cover */}
                <div className="aspect-video bg-gray-800 overflow-hidden">
                  {game.coverImage ? (
                    <img
                      src={game.coverImage}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gamepad2 size={48} className="text-gray-700" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  {/* Genre badges */}
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {(game.genre || []).map(g => (
                      <span key={g} className="text-[10px] bg-[#DD1215]/20 text-[#DD1215] px-2 py-0.5 rounded-full font-bold uppercase">
                        {g}
                      </span>
                    ))}
                    {(game.platform || []).map(p => (
                      <span key={p} className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full font-semibold">
                        {p}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-lg font-black text-white mb-1">{game.title}</h3>
                  {game.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">{game.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">
                      {game.developer || "InfinitoComics"}
                    </span>
                    {game.playUrl ? (
                      <a
                        href={game.playUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-[#DD1215] hover:bg-red-700 text-white text-xs font-bold uppercase px-4 py-2 rounded transition"
                        onClick={e => e.stopPropagation()}
                      >
                        <Gamepad2 size={13} /> Play Now
                      </a>
                    ) : (
                      <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-widest">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;
