import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRegUserCircle } from 'react-icons/fa';
import { Heart, ThumbsDown } from 'lucide-react';
import { getBlogsById, reactToBlog } from '../../services/userServices';

const getVisitorId = () => {
  let vid = localStorage.getItem('infinito_visitor_id');
  if (!vid) {
    vid = 'visitor_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('infinito_visitor_id', vid);
  }
  return vid;
};

const NewsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedNews, setSelectedNews] = useState(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userReaction, setUserReaction] = useState(null);
  const [isReacting, setIsReacting] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const blog = await getBlogsById(id);
        const blogData = blog && blog.data ? blog.data : null;
        setSelectedNews(blogData);
        if (blogData) {
          const cachedReaction = localStorage.getItem(`blog_reaction_${id}`);
          const cachedLikesDelta = parseInt(localStorage.getItem(`blog_likes_delta_${id}`) || '0');
          const cachedDislikesDelta = parseInt(localStorage.getItem(`blog_dislikes_delta_${id}`) || '0');

          setLikes(Math.max(0, (blogData.likes || 0) + cachedLikesDelta));
          setDislikes(Math.max(0, (blogData.dislikes || 0) + cachedDislikesDelta));

          const vid = getVisitorId();
          if (Array.isArray(blogData.likedBy) && blogData.likedBy.includes(vid)) {
            setUserReaction('love');
          } else if (Array.isArray(blogData.dislikedBy) && blogData.dislikedBy.includes(vid)) {
            setUserReaction('hate');
          } else if (cachedReaction) {
            setUserReaction(cachedReaction);
          }
        }
      } catch (error) {
        console.error("Failed to fetch blog:", error.message);
      }
    };

    fetchBlog();
  }, [id]);

  const handleReaction = async (type) => {
    if (isReacting) return;
    setIsReacting(true);

    const prevReaction = userReaction;
    const prevLikes = likes;
    const prevDislikes = dislikes;

    let nextReaction = null;
    let nextLikes = likes;
    let nextDislikes = dislikes;

    if (type === 'love') {
      if (prevReaction === 'love') {
        nextReaction = null;
        nextLikes = Math.max(0, nextLikes - 1);
      } else {
        nextReaction = 'love';
        nextLikes = nextLikes + 1;
        if (prevReaction === 'hate') {
          nextDislikes = Math.max(0, nextDislikes - 1);
        }
      }
    } else if (type === 'hate') {
      if (prevReaction === 'hate') {
        nextReaction = null;
        nextDislikes = Math.max(0, nextDislikes - 1);
      } else {
        nextReaction = 'hate';
        nextDislikes = nextDislikes + 1;
        if (prevReaction === 'love') {
          nextLikes = Math.max(0, nextLikes - 1);
        }
      }
    }

    setUserReaction(nextReaction);
    setLikes(nextLikes);
    setDislikes(nextDislikes);

    if (nextReaction) {
      localStorage.setItem(`blog_reaction_${id}`, nextReaction);
    } else {
      localStorage.removeItem(`blog_reaction_${id}`);
    }

    const baseLikes = selectedNews?.likes || 0;
    const baseDislikes = selectedNews?.dislikes || 0;
    localStorage.setItem(`blog_likes_delta_${id}`, String(nextLikes - baseLikes));
    localStorage.setItem(`blog_dislikes_delta_${id}`, String(nextDislikes - baseDislikes));

    try {
      const vid = getVisitorId();
      const res = await reactToBlog(id, type, vid);
      if (res?.data) {
        setLikes(res.data.likes);
        setDislikes(res.data.dislikes);
        setUserReaction(res.data.userReaction);
        if (res.data.userReaction) {
          localStorage.setItem(`blog_reaction_${id}`, res.data.userReaction);
        } else {
          localStorage.removeItem(`blog_reaction_${id}`);
        }
        localStorage.removeItem(`blog_likes_delta_${id}`);
        localStorage.removeItem(`blog_dislikes_delta_${id}`);
      }
    } catch (err) {
      // Backend route pending deployment to Render - keep the optimistic local vote active
      console.warn('Backend reaction sync pending deployment:', err.message);
    } finally {
      setIsReacting(false);
    }
  };

  if (!selectedNews) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="flex justify-center my-8">
      <div className="w-11/12 lg:w-2/3">
        <button
          onClick={() => navigate(-1)}
          className="text-sm hover:underline mb-8 tracking-widest font-semibold cursor-pointer"
        >
          ← BACK TO BLOGS &amp; NEWS
        </button>

        <h1
          className="text-4xl sn:text-4xl lg:text-5xl font-black text-[#DD1215] mb-2"
          style={{ fontFamily: 'DM Sans' }}
        >
          {selectedNews.title}
        </h1>

        <p
          className="text-xl md:text-xl text-[#111111] mb-4"
          style={{ fontFamily: 'DM Sans', fontWeight: '500' }}
        >
          {selectedNews.subject ? selectedNews.subject.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') : ''}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mb-6 text-sm text-gray-700 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <FaRegUserCircle className="text-2xl" />
            <p className="text-base md:text-md font-semibold">
              By <span>{selectedNews.authorName || 'Admin'}</span>&nbsp;&nbsp;•&nbsp;&nbsp;
              {new Date(selectedNews.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              &nbsp;at&nbsp;
              {new Date(selectedNews.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleReaction('love')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm ${
                userReaction === 'love'
                  ? 'bg-[#DD1215] text-white shadow-red-200 shadow-md scale-105'
                  : 'bg-red-50 text-[#DD1215] hover:bg-red-100 hover:scale-105 border border-red-200'
              }`}
              title={userReaction === 'love' ? 'You loved this story! Click to remove' : 'Click to Love this story'}
            >
              <Heart
                size={14}
                className={userReaction === 'love' ? 'fill-white stroke-white' : 'fill-[#DD1215] stroke-[#DD1215]'}
              />
              <span>{likes} {likes === 1 ? 'Love' : 'Loves'}</span>
            </button>
          </div>
        </div>

        {/* Cover image at top if present */}
        {selectedNews.coverImage && (
          <div className="mb-6">
            <img
              src={selectedNews.coverImage}
              alt={selectedNews.title}
              className="w-full max-h-[30rem] object-cover rounded-xl shadow-sm"
            />
          </div>
        )}

        <div className="pt-4">
          {/* Main content */}
          <div className="w-full">
            {selectedNews.content ? (
              <div
                className="rich-content prose prose-lg max-w-none text-md sm:text-lg leading-relaxed mb-8 text-[#111111] [&_table]:border-collapse [&_table]:w-full [&_table]:my-4 [&_td]:border [&_td]:border-gray-300 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-gray-300 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-100 [&_th]:font-semibold [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-red-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_pre]:bg-gray-900 [&_pre]:text-white [&_pre]:p-4 [&_pre]:rounded-lg"
                style={{ fontFamily: 'DM Sans' }}
                dangerouslySetInnerHTML={{ __html: selectedNews.content }}
              />
            ) : (
              Array.isArray(selectedNews.news) &&
              selectedNews.news.map((item, idx) => (
                <div key={idx} className="mb-8">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt="news"
                      className="w-full lg:h-[24rem] mb-4 object-cover"
                    />
                  )}
                  {item.story && (
                    <div
                      className="rich-content text-md sm:text-lg lg:text-md leading-relaxed mb-6 text-[#111111] prose max-w-none [&_table]:border-collapse [&_table]:w-full [&_table]:my-4 [&_td]:border [&_td]:border-gray-300 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-gray-300 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-100 [&_th]:font-semibold [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                      style={{ fontFamily: 'DM Sans', fontWeight: '500' }}
                      dangerouslySetInnerHTML={{ __html: item.story }}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Reader Reaction Section */}
          <div className="my-10 p-6 sm:p-8 bg-neutral-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-wide text-gray-900 mb-1 font-['DM_Sans']">
                Did you enjoy this story?
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm">
                Leave your reaction to help rank our community's favorite stories!
              </p>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              {/* Love Button */}
              <button
                onClick={() => handleReaction('love')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 cursor-pointer shadow-sm ${
                  userReaction === 'love'
                    ? 'bg-[#DD1215] text-white shadow-red-200 shadow-md scale-105'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-red-500 hover:text-[#DD1215]'
                }`}
                aria-label="Love this story"
              >
                <Heart
                  size={18}
                  className={userReaction === 'love' ? 'fill-white stroke-white' : 'fill-none stroke-current'}
                />
                <span>Love It</span>
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-extrabold ${
                    userReaction === 'love' ? 'bg-red-800 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {likes}
                </span>
              </button>

              {/* Hate Button */}
              <button
                onClick={() => handleReaction('hate')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 cursor-pointer shadow-sm ${
                  userReaction === 'hate'
                    ? 'bg-neutral-900 text-white shadow-md scale-105'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-neutral-500 hover:text-black'
                }`}
                aria-label="Hate this story"
              >
                <ThumbsDown
                  size={18}
                  className={userReaction === 'hate' ? 'fill-white stroke-white' : 'fill-none stroke-current'}
                />
                <span>Hate It</span>
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-extrabold ${
                    userReaction === 'hate' ? 'bg-neutral-700 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {dislikes}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetails;
