import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../utils/constants';
import { Search, Loader, BookOpen, User, FileText, FlaskConical } from 'lucide-react';

const TABS = [
  { key: "all",        label: "All",        icon: Search       },
  { key: "comics",     label: "Comics",     icon: BookOpen     },
  { key: "characters", label: "Characters", icon: User         },
  { key: "blogs",      label: "Blogs",      icon: FileText     },
];

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate   = useNavigate();
  const q          = searchParams.get("q") || "";
  const typeParam  = searchParams.get("type") || "all";

  const [results,  setResults]  = useState({});
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [input,    setInput]    = useState(q);
  const [activeTab, setActiveTab] = useState(typeParam);

  const doSearch = async (query, type) => {
    if (!query.trim() || query.trim().length < 2) return;
    try {
      setLoading(true); setError("");
      const res = await axios.get(`${BASE_URL}/search`, { params: { q: query, type } });
      setResults(res.data.data || {});
    } catch (e) {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (q) doSearch(q, activeTab);
  }, [q, activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSearchParams({ q: input.trim(), type: activeTab });
  };

  const handleTab = (tab) => {
    setActiveTab(tab);
    if (q) setSearchParams({ q, type: tab });
  };

  const total =
    (results.comics?.length || 0) +
    (results.characters?.length || 0) +
    (results.blogs?.length || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans">

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Search comics, characters, blogs..."
          className="flex-1 border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#DD1215] rounded"
        />
        <button type="submit"
          className="flex items-center gap-2 bg-[#DD1215] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition rounded">
          <Search size={15} /> Search
        </button>
      </form>

      {q && (
        <p className="text-sm text-gray-500 mb-4">
          {loading ? "Searching..." : `${total} result${total !== 1 ? "s" : ""} for "${q}"`}
        </p>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const count = tab.key === "all" ? total : (results[tab.key]?.length || 0);
          return (
            <button key={tab.key} onClick={() => handleTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
                activeTab === tab.key
                  ? "border-[#DD1215] text-[#DD1215]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}>
              <Icon size={13} />
              {tab.label}
              {q && count > 0 && (
                <span className="bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5 text-[10px] font-black">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader size={28} className="animate-spin text-[#DD1215]" />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : !q ? (
        <div className="text-center py-20 text-gray-400">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-lg">Type something to search</p>
        </div>
      ) : total === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-lg">No results found for "{q}"</p>
          <p className="text-sm mt-2">Try a different search term</p>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Comics */}
          {(activeTab === "all" || activeTab === "comics") && results.comics?.length > 0 && (
            <Section title="Comics" icon={<BookOpen size={16} className="text-[#DD1215]" />} count={results.comics.length}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {results.comics.map(c => (
                  <div key={c._id} onClick={() => navigate(`/comics`)}
                    className="cursor-pointer group">
                    <div className="aspect-[3/4] bg-gray-100 rounded overflow-hidden mb-2">
                      {c.coverImage || c.coverImg ? (
                        <img src={c.coverImage || c.coverImg} alt={c.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen size={24} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-gray-900 truncate">{c.title}</p>
                    {c.authors && <p className="text-[10px] text-gray-400">{c.authors[0]}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Characters */}
          {(activeTab === "all" || activeTab === "characters") && results.characters?.length > 0 && (
            <Section title="Characters" icon={<User size={16} className="text-[#DD1215]" />} count={results.characters.length}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {results.characters.map(c => (
                  <div key={c._id} onClick={() => navigate(`/characters`)}
                    className="flex items-center gap-3 border border-gray-100 rounded-lg p-3 cursor-pointer hover:border-[#DD1215] transition">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                      {c.profileImage ? (
                        <img src={c.profileImage} alt={c.knownAs} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <User size={18} className="text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{c.knownAs}</p>
                      {c.originalName && <p className="text-[10px] text-gray-400 truncate">{c.originalName}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Blogs */}
          {(activeTab === "all" || activeTab === "blogs") && results.blogs?.length > 0 && (
            <Section title="Blogs & News" icon={<FileText size={16} className="text-[#DD1215]" />} count={results.blogs.length}>
              <div className="space-y-3">
                {results.blogs.map(b => (
                  <div key={b._id} onClick={() => navigate(`/news/${b._id}`)}
                    className="flex items-start gap-4 border border-gray-100 rounded-lg p-3 cursor-pointer hover:border-[#DD1215] transition">
                    {b.coverImage && (
                      <img src={b.coverImage} alt={b.title}
                        className="w-16 h-12 object-cover rounded shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{b.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {b.author} · {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString("en-IN") : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  );
};

const Section = ({ title, icon, count, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h2 className="text-sm font-black uppercase tracking-widest text-gray-800">{title}</h2>
      <span className="text-xs text-gray-400">({count})</span>
    </div>
    {children}
  </div>
);

export default SearchResults;
