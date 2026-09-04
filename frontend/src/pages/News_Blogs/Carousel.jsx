import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import botton from '../../../assets/Images/Botton.png';
import defaultSlides from '../../constants/Carousel_data';
import { getLatestBlogs } from '../../services/userServices';

const ComicConHero = () => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    const fetchRecentBlogs = async () => {
      try {
        const blogs = await getLatestBlogs(5);
        if (Array.isArray(blogs) && blogs.length > 0) {
          // Sort strictly by createdAt descending (most recent first)
          const sorted = [...blogs].sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          ).slice(0, 5);

          const mapped = sorted.map((blog, idx) => {
            const cleanDesc = blog.subject
              ? blog.subject.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim()
              : blog.content
              ? blog.content.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').substring(0, 160).trim() + '...'
              : defaultSlides[idx % defaultSlides.length]?.description || '';

            return {
              id: blog._id,
              image: blog.coverImage || blog.news?.[0]?.imageUrl || defaultSlides[idx % defaultSlides.length]?.image,
              title: blog.title || defaultSlides[idx % defaultSlides.length]?.title,
              subtitle: blog.category ? blog.category.toUpperCase() : 'LATEST BLOG',
              description: cleanDesc,
            };
          });
          setSlides(mapped);
          setCurrentSlide(0);
        }
      } catch (err) {
        console.error('Failed to load recent blogs for carousel slider:', err);
      }
    };

    fetchRecentBlogs();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentSlideData = slides[currentSlide] || slides[0] || {};

  const handleReadMore = () => {
    if (currentSlideData.id && typeof currentSlideData.id === 'string' && currentSlideData.id.length > 5) {
      navigate(`/news/${currentSlideData.id}`);
    } else {
      navigate('/all-news');
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className="
          w-full min-h-[600px]
          justify-end sm:justify-end
          sm:pt-0 pt-[25%]
          shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)]
          relative z-0
          transition-all duration-1000 ease-in-out
          -mb-1
        "
        style={{
          backgroundImage: `url(${currentSlideData.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 z-[1]">
          <div className="absolute inset-y-0 left-0 w-5/3 h-full bg-gradient-to-r from-black via-black/40 to-transparent" />
          <div className="absolute bottom-0 right-0 w-5/3 h-2/3 bg-gradient-to-tl from-black/60 via-transparent to-transparent" />
        </div>

        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-[3] text-white hover:text-red-500 transition-colors duration-300 cursor-pointer"
              aria-label="Previous slide"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-[3] text-white hover:text-red-500 transition-colors duration-300 cursor-pointer"
              aria-label="Next slide"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        <div className="absolute top-1/2 left-10 sm:left-20 md:left-40 transform -translate-y-1/2 z-[2] max-w-2xl">
          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-wide m-0 mb-1 transition-all duration-700 ease-in-out uppercase drop-shadow-md">
            {currentSlideData.title}
          </h1>
          {currentSlideData.subtitle && (
            <h2 className="text-red-500 text-2xl sm:text-3xl font-bold mb-4 leading-tight my-0 mt-0 transition-all duration-700 ease-in-out delay-100 tracking-wider">
              {currentSlideData.subtitle}
            </h2>
          )}
          <p className="text-white text-sm sm:text-base mb-6 leading-relaxed opacity-90 max-w-xl transition-all duration-700 ease-in-out delay-200 whitespace-pre-line line-clamp-3">
            {currentSlideData.description}
          </p>
          <button
            onClick={handleReadMore}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 text-sm tracking-wider transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer"
          >
            READ MORE ›
          </button>
        </div>

        {slides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[2] flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-8 h-1 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentSlide ? 'bg-red-500' : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="absolute top-4 right-4 z-[3] text-white/70 hover:text-white transition-colors duration-300 cursor-pointer"
          aria-label={isAutoPlaying ? 'Pause slideshow' : 'Resume slideshow'}
        >
          {isAutoPlaying ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-7a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Decorative bottom image - Fixed */}
      <div
        className="w-full h-[60px] sm:h-[80px]"
        style={{
          backgroundImage: `url(${botton})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          marginTop: '0',
        }}
      />
    </div>
  );
};

export default ComicConHero;