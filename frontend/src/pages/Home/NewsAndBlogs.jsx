import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Trophy,
  Clock,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getAllBlogs, getTopLovedBlogs } from "../../services/userServices";

// Fallback items matching user's design preview in case API is offline or empty
const FALLBACK_BLOGS = [
  {
    _id: "blog-1",
    id: "blog-1",
    title: "The Growing Influence of Comics in Modern Pop Culture",
    category: "COMICS",
    likes: 2,
    dislikes: 0,
    coverImage:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    subject:
      "Comics have become an important part of modern pop culture. What was once considered a form of entertainment found mainly in comic books has expanded into movie, animation, fashion, and global conventions worldwide.",
    content:
      "Comics have become an important part of modern pop culture. What was once considered a form of entertainment found mainly in comic books has expanded into movie, animation, fashion, and global conventions worldwide.",
  },
  {
    _id: "blog-2",
    id: "blog-2",
    title: "Manga: The Art of Storytelling Through Pages",
    category: "MARVEL",
    likes: 1,
    dislikes: 0,
    coverImage:
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    subject:
      "Manga is more than just Japanese comics—it is a unique form of storytelling that combines art, expressive character dynamics, and deep serialized narratives across generations.",
    content:
      "Manga is more than just Japanese comics—it is a unique form of storytelling that combines art, expressive character dynamics, and deep serialized narratives across generations.",
  },
  {
    _id: "blog-3",
    id: "blog-3",
    title: "Why Comic Characters Become More Than Just Heroes",
    category: "COMICS",
    likes: 0,
    dislikes: 0,
    coverImage:
      "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80",
    subject:
      "Characters in comics often embody complex philosophies, representing hope, morality, and resilience that transcend their fictional origins to inspire readers globally.",
    content:
      "Characters in comics often embody complex philosophies, representing hope, morality, and resilience that transcend their fictional origins to inspire readers globally.",
  },
  {
    _id: "blog-4",
    id: "blog-4",
    title: "Webcomics vs Traditional Comics: Which is Better?",
    category: "COMICS",
    likes: 0,
    dislikes: 0,
    coverImage:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    subject:
      "The comic industry has evolved dramatically over the years, giving readers two popular ways to experience visual storytelling—digital infinite-scroll and physical printed pages.",
    content:
      "The comic industry has evolved dramatically over the years, giving readers two popular ways to experience visual storytelling—digital infinite-scroll and physical printed pages.",
  },
  {
    _id: "blog-5",
    id: "blog-5",
    title: "Missing Character",
    category: "CHARACTERS",
    likes: 0,
    dislikes: 0,
    coverImage:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
    subject:
      "Explore the mysterious lore and untold chronicles of lost heroes and forgotten champions across the multiverse.",
    content:
      "Explore the mysterious lore and untold chronicles of lost heroes and forgotten champions across the multiverse.",
  },
];

const calculateReadTime = (text) => {
  if (!text) return "1 min read";
  const words = text.replace(/<[^>]*>?/gm, "").trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
};

const cleanText = (text, maxLength = 160) => {
  if (!text) return "";
  const cleaned = text
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength).trim() + "...";
};

const NewsAndBlogs = () => {
  const [allBlogs, setAllBlogs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  // Responsive items count for "Latest Updates" carousel
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch blogs data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all blogs
        const blogsData = await getAllBlogs();
        let blogList = Array.isArray(blogsData) ? blogsData : [];

        // Filter published
        blogList = blogList.filter(
          (b) => b.published !== false && b.status !== "draft"
        );

        if (blogList.length === 0) {
          blogList = FALLBACK_BLOGS;
        }

        // Sort latest blogs by date descending
        const sortedLatest = [...blogList].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        setAllBlogs(sortedLatest);

        // Fetch / sort top loved blogs
        try {
          const topLoved = await getTopLovedBlogs(4);
          if (Array.isArray(topLoved) && topLoved.length > 0) {
            setFavorites(topLoved.slice(0, 4));
          } else {
            // Sort by likes descending
            const ranked = [...blogList].sort(
              (a, b) =>
                (b.likes || 0) -
                (b.dislikes || 0) -
                ((a.likes || 0) - (a.dislikes || 0))
            );
            setFavorites(ranked.slice(0, 4));
          }
        } catch {
          const ranked = [...blogList].sort(
            (a, b) =>
              (b.likes || 0) -
              (b.dislikes || 0) -
              ((a.likes || 0) - (a.dislikes || 0))
          );
          setFavorites(ranked.slice(0, 4));
        }
      } catch (err) {
        console.error("Error fetching blogs for NewsAndBlogs section:", err);
        setAllBlogs(FALLBACK_BLOGS);
        setFavorites(FALLBACK_BLOGS.slice(0, 4));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Carousel handlers
  const maxPages = Math.ceil(allBlogs.length / itemsPerPage);

  const handlePrev = () => {
    setSliderIndex((prev) =>
      prev - itemsPerPage >= 0
        ? prev - itemsPerPage
        : Math.max(0, (maxPages - 1) * itemsPerPage)
    );
  };

  const handleNext = () => {
    setSliderIndex((prev) =>
      prev + itemsPerPage < allBlogs.length ? prev + itemsPerPage : 0
    );
  };

  const visibleLatest = allBlogs.slice(
    sliderIndex,
    sliderIndex + itemsPerPage
  );

  const primaryBlog = favorites[0] || allBlogs[0] || FALLBACK_BLOGS[0];
  const secondaryBlogs =
    favorites.length > 1
      ? favorites.slice(1, 4)
      : allBlogs.slice(1, 4).length > 0
      ? allBlogs.slice(1, 4)
      : FALLBACK_BLOGS.slice(1, 4);

  return (
    <section className="w-full bg-white py-6 sm:py-10 md:py-12 overflow-x-hidden">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 flex items-start justify-center gap-4 lg:gap-6 xl:gap-8">
        {/* Left Ad */}
        <div className="hidden lg:flex w-20 xl:w-24 h-[420px] bg-[#D0D0D0] shrink-0 items-center justify-center mt-20 select-none">
          <span className="text-white font-bold text-sm tracking-widest uppercase">
            AD
          </span>
        </div>

        {/* Center Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* ── Main Section Header ── */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-wide">
              <span className="text-black">INFINITO </span>
              <span className="text-[#DD1215]">NEWS &amp; BLOGS</span>
            </h2>
          </div>

        {/* ── Latest Updates Heading ── */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
            LATEST UPDATES
          </h3>
        </div>

        {/* ── Latest Updates Carousel ── */}
        <div className="w-full">
          <div
            className={`grid gap-6 transition-all duration-300 ${
              itemsPerPage === 1
                ? "grid-cols-1"
                : itemsPerPage === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {visibleLatest.map((blog) => {
              const imageSrc =
                blog.coverImage ||
                blog.news?.[0]?.imageUrl ||
                FALLBACK_BLOGS[0].coverImage;

              return (
                <div
                  key={blog._id || blog.id}
                  className="flex flex-col justify-between h-full group bg-white"
                >
                  <div>
                    <Link
                      to={`/news/${blog._id || blog.id}`}
                      className="block w-full h-[220px] sm:h-[230px] overflow-hidden rounded-xl bg-gray-100 shadow-sm"
                    >
                      <img
                        src={imageSrc}
                        alt={blog.title}
                        onError={(e) => {
                          e.target.src = FALLBACK_BLOGS[0].coverImage;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    <Link to={`/news/${blog._id || blog.id}`}>
                      <h4 className="text-[#DD1215] font-extrabold text-base sm:text-lg leading-snug line-clamp-2 mt-4 hover:underline">
                        {blog.title}
                      </h4>
                    </Link>
                  </div>

                  <div className="mt-3">
                    <Link
                      to={`/news/${blog._id || blog.id}`}
                      className="text-[#DD1215] font-bold text-xs uppercase tracking-wider hover:text-black transition-colors inline-block"
                    >
                      READ MORE &gt;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Navigation Arrows & Dots */}
          {allBlogs.length > itemsPerPage && (
            <div className="flex justify-between items-center mt-6 sm:mt-8">
              <button
                onClick={handlePrev}
                aria-label="Previous slide"
                className="p-2 sm:p-2.5 bg-white border border-gray-300 rounded hover:bg-gray-100 cursor-pointer flex items-center justify-center transition-colors text-black shadow-xs"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex justify-center items-center gap-2">
                {Array.from({ length: maxPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSliderIndex(index * itemsPerPage)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      index === Math.floor(sliderIndex / itemsPerPage)
                        ? "w-6 bg-[#DD1215]"
                        : "w-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                aria-label="Next slide"
                className="p-2 sm:p-2.5 bg-white border border-gray-300 rounded hover:bg-gray-100 cursor-pointer flex items-center justify-center transition-colors text-black shadow-xs"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* ── Readers' Favorites / Trending Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mt-10 sm:mt-14">
          {/* #1 Fan Favorite Card (Left Column) */}
          {primaryBlog && (
            <div className="lg:col-span-6 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <Link
                  to={`/news/${primaryBlog._id || primaryBlog.id}`}
                  className="block relative w-full h-[240px] sm:h-[300px] overflow-hidden bg-gray-100"
                >
                  <img
                    src={
                      primaryBlog.coverImage ||
                      primaryBlog.news?.[0]?.imageUrl ||
                      FALLBACK_BLOGS[0].coverImage
                    }
                    alt={primaryBlog.title}
                    onError={(e) => {
                      e.target.src = FALLBACK_BLOGS[0].coverImage;
                    }}
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
                    <Heart size={14} className="fill-red-600 text-red-600" />
                    <span>{primaryBlog.likes || 0} Loves</span>
                  </div>

                  {/* Read Time */}
                  <div className="absolute bottom-4 right-4 text-white/90 text-xs font-medium flex items-center gap-1">
                    <Clock size={12} />
                    <span>
                      {calculateReadTime(
                        primaryBlog.content || primaryBlog.subject
                      )}
                    </span>
                  </div>
                </Link>

                <div className="p-5 sm:p-6">
                  <span className="text-[#DD1215] text-[11px] font-black uppercase tracking-widest">
                    {primaryBlog.category || "COMICS"}
                  </span>

                  <Link to={`/news/${primaryBlog._id || primaryBlog.id}`}>
                    <h4 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug mt-1 mb-3 group-hover:text-[#DD1215] transition-colors line-clamp-2">
                      {primaryBlog.title}
                    </h4>
                  </Link>

                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {cleanText(
                      primaryBlog.subject || primaryBlog.content,
                      180
                    )}
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6 pt-0">
                <Link
                  to={`/news/${primaryBlog._id || primaryBlog.id}`}
                  className="inline-flex items-center gap-1 text-[#DD1215] font-extrabold text-xs tracking-wider uppercase hover:text-black transition-colors"
                >
                  <span>READ FULL STORY</span>
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>
          )}

          {/* Secondary Ranked Cards Stack: #2, #3, #4 (Right Column) */}
          <div className="lg:col-span-6 flex flex-col gap-4 justify-between">
            {secondaryBlogs.map((blog, idx) => {
              const rank = idx + 2;
              const isFirstSecondary = idx === 0;

              return (
                <div
                  key={blog._id || blog.id || idx}
                  className="bg-white border border-gray-200 rounded-2xl p-3.5 sm:p-5 hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center group"
                >
                  {/* Thumbnail with Rank Tag */}
                  <Link
                    to={`/news/${blog._id || blog.id}`}
                    className="relative w-full sm:w-44 h-36 sm:h-32 rounded-xl overflow-hidden bg-gray-100 shrink-0"
                  >
                    <img
                      src={
                        blog.coverImage ||
                        blog.news?.[0]?.imageUrl ||
                        FALLBACK_BLOGS[idx % FALLBACK_BLOGS.length].coverImage
                      }
                      alt={blog.title}
                      onError={(e) => {
                        e.target.src =
                          FALLBACK_BLOGS[idx % FALLBACK_BLOGS.length].coverImage;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      #{rank}
                    </div>
                    <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 bg-white/95 text-red-600 rounded-full text-[10px] font-black">
                      <Heart size={11} className="fill-red-600 text-red-600" />
                      <span>{blog.likes || 0}</span>
                    </div>
                  </Link>

                  {/* Text Details */}
                  <div className="flex-1 flex flex-col justify-between h-full min-w-0 w-full">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider mb-1">
                        <span className="text-[#DD1215]">
                          {blog.category || "COMICS"}
                        </span>
                        <span className="text-gray-400 font-medium">
                          {calculateReadTime(
                            blog.content || blog.subject
                          ).toUpperCase()}
                        </span>
                      </div>

                      <Link to={`/news/${blog._id || blog.id}`}>
                        <h5
                          className={`text-base sm:text-lg font-black leading-snug mb-1 line-clamp-2 transition-colors ${
                            isFirstSecondary
                              ? "text-[#DD1215] group-hover:underline"
                              : "text-gray-900 group-hover:text-[#DD1215]"
                          }`}
                        >
                          {blog.title}
                        </h5>
                      </Link>

                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
                        {cleanText(blog.subject || blog.content, 110)}
                      </p>
                    </div>

                    <div>
                      <Link
                        to={`/news/${blog._id || blog.id}`}
                        className="inline-flex items-center gap-1 text-[#DD1215] font-extrabold text-[11px] tracking-wider uppercase hover:text-black transition-colors"
                      >
                        <span>READ MORE &gt;</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

        {/* Right Ad */}
        <div className="hidden lg:flex w-20 xl:w-24 h-[420px] bg-[#D0D0D0] shrink-0 items-center justify-center mt-20 select-none">
          <span className="text-white font-bold text-sm tracking-widest uppercase">
            AD
          </span>
        </div>
      </div>
    </section>
  );
};

export default NewsAndBlogs;
