import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';

const DEFAULT_PROMO_BARS = [
  {
    id: "bar-1",
    text: "⚡ SPECIAL LAUNCH OFFER: GET 35% OFF ON SELECTED MERCH WITH CODE CRIMSON35 | FREE SHIPPING ON ORDERS ABOVE ₹999",
    link: "https://shop.infinitohq.com/",
    bgColor: "#DD1215",
    textColor: "#ffffff",
    isActive: true,
  },
  {
    id: "bar-2",
    text: "🔥 NEW DROP ALERT: THE CRIMSON BLOODLINE IS NOW LIVE — ONLY 500 PIECES WORLDWIDE",
    link: "https://shop.infinitohq.com/",
    bgColor: "#0f172a",
    textColor: "#ffffff",
    isActive: true,
  },
];

const TopPromoBar = () => {
  const [bars, setBars] = useState(DEFAULT_PROMO_BARS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  const loadBars = () => {
    try {
      const stored = localStorage.getItem('infinito_shop_banners');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.promoBars) && parsed.promoBars.length > 0) {
          const activeOnes = parsed.promoBars.filter((b) => b && b.isActive !== false);
          if (activeOnes.length > 0) {
            setBars(activeOnes);
            return;
          }
        } else if (parsed.promoBar && parsed.promoBar.isActive !== false && parsed.promoBar.text) {
          setBars([
            {
              id: 'bar-legacy',
              text: parsed.promoBar.text,
              link: parsed.promoBar.link || 'https://shop.infinitohq.com/',
              bgColor: parsed.promoBar.bgColor || '#DD1215',
              textColor: parsed.promoBar.textColor || '#ffffff',
              isActive: true,
            },
          ]);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse infinito_shop_banners for TopPromoBar', e);
    }
    setBars(DEFAULT_PROMO_BARS);
  };

  useEffect(() => {
    loadBars();

    // Listen for storage changes across tabs & BroadcastChannel for instant updates from Admin
    const handleStorage = (e) => {
      if (e.key === 'infinito_shop_banners') {
        loadBars();
      }
    };
    window.addEventListener('storage', handleStorage);

    let channel;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        channel = new BroadcastChannel('infinito_banners_channel');
        channel.onmessage = (msg) => {
          if (msg.data?.type === 'BANNERS_UPDATED' || msg.data?.type === 'PROMO_BARS_UPDATED') {
            loadBars();
          }
        };
      } catch (err) {
        // BroadcastChannel fallback
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) channel.close();
    };
  }, []);

  // Auto rotate if multiple active bars
  useEffect(() => {
    if (bars.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bars.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [bars.length]);

  if (isDismissed || bars.length === 0) return null;

  const current = bars[currentIndex % bars.length] || bars[0];
  const bgStyle = current.bgColor || '#DD1215';
  const textStyle = current.textColor || '#ffffff';

  const handleBarClick = () => {
    if (current.link) {
      if (current.link.startsWith('http')) {
        window.location.href = current.link;
      } else {
        window.location.pathname = current.link;
      }
    }
  };

  return (
    <aside
      role="banner"
      aria-label="Promotional Announcement"
      style={{ backgroundColor: bgStyle, color: textStyle }}
      className="relative z-50 w-full transition-colors duration-500 text-xs sm:text-sm font-medium tracking-wide shadow-sm select-none"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between min-h-[36px]">
        {/* Previous Button (if multiple) */}
        {bars.length > 1 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + bars.length) % bars.length);
            }}
            className="p-1 rounded hover:bg-black/20 text-current transition shrink-0 cursor-pointer"
            aria-label="Previous announcement"
          >
            <ChevronLeft size={16} />
          </button>
        ) : (
          <div className="w-4 shrink-0" />
        )}

        {/* Announcement Message Content */}
        <div
          onClick={handleBarClick}
          className={`flex-1 text-center px-2 sm:px-4 cursor-pointer hover:underline flex items-center justify-center gap-2 overflow-hidden transition-all duration-300`}
        >
          <Sparkles size={14} className="shrink-0 opacity-80 hidden sm:inline" />
          <span className="truncate font-semibold tracking-wide uppercase text-[11px] sm:text-xs">
            {current.text}
          </span>
          {bars.length > 1 && (
            <span className="hidden md:inline-block ml-2 text-[10px] px-1.5 py-0.2 rounded-full bg-black/25 opacity-80 shrink-0 font-mono">
              {currentIndex + 1}/{bars.length}
            </span>
          )}
        </div>

        {/* Controls: Next Button + Dismiss X */}
        <div className="flex items-center gap-1 shrink-0">
          {bars.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev + 1) % bars.length);
              }}
              className="p-1 rounded hover:bg-black/20 text-current transition cursor-pointer"
              aria-label="Next announcement"
            >
              <ChevronRight size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="p-1 rounded hover:bg-black/20 text-current transition cursor-pointer ml-1 opacity-70 hover:opacity-100"
            aria-label="Dismiss announcement"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default TopPromoBar;
