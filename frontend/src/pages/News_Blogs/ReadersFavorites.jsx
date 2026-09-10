import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Flame, Trophy, Clock, ArrowUpRight } from "lucide-react";
import { getTopLovedBlogs, getAllBlogs } from "../../services/userServices";

const calculateReadTime = (text) => {
  if (!text) return "2 min read";
  const words = text.replace(/<[^>]*>?/gm, "").trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
};

const ReadersFavorites = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await getTopLovedBlogs(4);
        if (Array.isArray(data) && data.length > 0) {
          const published = data.filter(
            (b) => b.published !== false && b.status !== "draft"
          );
          if (published.length > 0) {
            setBlogs(published);
            return;
          }
        }

        // Fallback: fetch all blogs and sort by likes/createdAt
        const all = await getAllBlogs();
        if (Array.isArray(all) && all.length > 0) {
          const sorted = all
            .filter((b) => b.published !== false && b.status !== "draft")
            .sort((a, b) => (b.likes || 0) - (a.likes || 0) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          setBlogs(sorted.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch readers favorites, attempting fallback:", err);
        try {
          const all = await getAllBlogs();
          if (Array.isArray(all) && all.length > 0) {
            const sorted = all
              .filter((b) => b.published !== false && b.status !== "draft")
              .sort((a, b) => (b.likes || 0) - (a.likes || 0));
            setBlogs(sorted.slice(0, 4));
          }
        } catch (fallbackErr) {
          console.error("Fallback failed:", fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (loading || blogs.length === 0) {
    return null;
  }

  const primaryBlog = blogs[0];
  const secondaryBlogs = blogs.slice(1);

  return (
    <section className="py-8 sm:py-12 w-11/12 lg:w-2/3 mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-[#DD1215] text-xs font-black tracking-wider uppercase mb-2">
            <Flame size={14} className="fill-[#DD1215]" />
            <span>Community Choice</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-black uppercase">
            READERS' FAVORITES
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            The most-loved stories and lore voted by comic fans.
          </p>
        </div>
      </div>

      {/* Grid Layout: Top #1 Hero Card + Ranked Secondary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* #1 Most Loved Feature Card */}
        {primaryBlog && (
          <div className="lg:col-span-6 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div>
              <Link
                to={`/news/${primaryBlog._id}`}
                className="block relative w-full h-[240px] sm:h-[300px] overflow-hidden bg-gray-100"
              >
                <img
                  src={
                    primaryBlog.coverImage ||
                    primaryBlog.news?.[0]?.imageUrl ||
                    ""
                  }
                  alt={primaryBlog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

                {/* Rank Badge */}
                <div className="absolute top-4 left-4 bg-[#DD1215] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
                  <Trophy size={13} />
                  <span>#1 Fan Favorite</span>
                </div>

                {/* Love Count Badge */}
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-sm text-red-600 rounded-full text-xs font-black shadow-sm">
                  <Heart size={14} className="fill-red-600" />
                  <span>{primaryBlog.likes || 0} Loves</span>
                </div>

                <div className="absolute bottom-4 right-4 text-white/90 text-xs font-medium flex items-center gap-1">
                  <Clock size={12} />
                  <span>{calculateReadTime(primaryBlog.content || primaryBlog.subject)}</span>
                </div>
              </Link>

              <div className="p-5 sm:p-6">
                <span className="text-[#DD1215] text-[11px] font-black uppercase tracking-widest">
                  {primaryBlog.category || "Comics Lore"}
                </span>
                <Link to={`/news/${primaryBlog._id}`}>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug mt-1 mb-3 group-hover:text-[#DD1215] transition-colors line-clamp-2">
                    {primaryBlog.title}
                  </h3>
                </Link>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  {primaryBlog.subject
                    ? primaryBlog.subject.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ")
                    : primaryBlog.content
                    ? primaryBlog.content.replace(/<[^>]*>?/gm, "").substring(0, 160)
                    : ""}
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 pt-0">
              <Link
                to={`/news/${primaryBlog._id}`}
                className="inline-flex items-center gap-1 text-[#DD1215] font-extrabold text-xs tracking-wider uppercase hover:text-black transition-colors"
              >
                <span>Read Full Story</span>
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        )}

        {/* Secondary Ranked Cards Stack (Rank #2, #3, #4) */}
        <div className="lg:col-span-6 flex flex-col gap-4 justify-between">
          {secondaryBlogs.map((blog, idx) => {
            const rank = idx + 2;
            return (
              <div
                key={blog._id}
                className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-4 items-center group"
              >
                {/* Thumbnail with Rank Tag */}
                <Link
                  to={`/news/${blog._id}`}
                  className="relative w-full sm:w-44 h-40 sm:h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0"
                >
                  <img
                    src={blog.coverImage || blog.news?.[0]?.imageUrl || ""}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    #{rank}
                  </div>
                  <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 bg-white/95 text-red-600 rounded-full text-[10px] font-black">
                    <Heart size={11} className="fill-red-600" />
                    <span>{blog.likes || 0}</span>
                  </div>
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase mb-1">
                      <span className="text-[#DD1215] font-black">
                        {blog.category || "Spotlight"}
                      </span>
                      <span>
                        {calculateReadTime(blog.content || blog.subject)}
                      </span>
                    </div>
                    <Link to={`/news/${blog._id}`}>
                      <h4 className="text-base font-black text-gray-900 group-hover:text-[#DD1215] transition-colors line-clamp-2 leading-snug mb-1.5">
                        {blog.title}
                      </h4>
                    </Link>
                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                      {blog.subject
                        ? blog.subject.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ")
                        : blog.content
                        ? blog.content.replace(/<[^>]*>?/gm, "").substring(0, 120)
                        : ""}
                    </p>
                  </div>

                  <div className="mt-3">
                    <Link
                      to={`/news/${blog._id}`}
                      className="text-[#DD1215] font-bold text-xs uppercase tracking-wider hover:text-black transition-colors inline-block"
                    >
                      READ MORE &gt;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ReadersFavorites;
