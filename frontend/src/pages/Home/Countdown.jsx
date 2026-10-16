import React, { useState, useEffect } from 'react';

// Sparkle/Diamond Star icon matching the Infinito Comics brand
const SparkleIcon = () => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 shrink-0"
    aria-hidden="true"
  >
    {/* Main Large Red 4-Point Star */}
    <path
      d="M38 12 C38 30 46 38 64 38 C46 38 38 46 38 64 C38 46 30 38 12 38 C30 38 38 30 38 12 Z"
      fill="#E60000"
    />
    {/* Medium Red 4-Point Star (bottom right) */}
    <path
      d="M74 50 C74 59 78 63 87 63 C78 63 74 67 74 76 C74 67 70 63 61 63 C70 63 74 59 74 50 Z"
      fill="#E60000"
    />
    {/* Small Black 4-Point Star (top right) */}
    <path
      d="M70 16 C70 20 72 22 76 22 C72 22 70 24 70 28 C70 24 68 22 64 22 C68 22 70 20 70 16 Z"
      fill="#111827"
    />
    {/* Small Black 4-Point Star (left) */}
    <path
      d="M20 54 C20 57.5 21.5 59 25 59 C21.5 59 20 60.5 20 64 C20 60.5 18.5 59 15 59 C18.5 59 20 57.5 20 54 Z"
      fill="#111827"
    />
    {/* Small Black dot accent */}
    <circle cx="56" cy="18" r="2" fill="#111827" />
    <circle cx="58" cy="58" r="2" fill="#111827" />
  </svg>
);

// Individual mechanical split-flap digit card
const FlipDigit = ({ digit }) => {
  return (
    <div className="relative w-[18px] h-6 sm:w-6 sm:h-9 md:w-7 md:h-10 bg-[#E60000] flex items-center justify-center font-bold text-white text-xs sm:text-xl md:text-2xl select-none overflow-hidden font-sans tabular-nums">
      {/* Top half subtle tint */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/[0.08] pointer-events-none" />

      {/* Digit Display */}
      <span className="relative z-10 leading-none tracking-tight font-black">
        {digit}
      </span>

      {/* Horizontal split-flap seam */}
      <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-black/40 -translate-y-1/2 z-20 pointer-events-none" />

      {/* Left hinge notch */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[4px] bg-white/50 rounded-r-xs z-30 pointer-events-none" />

      {/* Right hinge notch */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-[4px] bg-white/50 rounded-l-xs z-30 pointer-events-none" />
    </div>
  );
};

// Colon separator between digit boxes
const ColonSeparator = () => (
  <div className="flex flex-col justify-center items-center gap-1 px-0.5 sm:px-1">
    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white" />
    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white" />
  </div>
);

// Target date: 8th November 2026 local time midnight
const DEFAULT_TARGET_DATE = new Date(2026, 10, 8, 0, 0, 0);

const calculateTimeRemaining = (target) => {
  const targetTime = target instanceof Date ? target.getTime() : new Date(target).getTime();
  const diff = targetTime - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isEnded: false };
};

const Countdown = ({ targetDate = DEFAULT_TARGET_DATE }) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeRemaining(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // Format into padded strings: Days (3 digits), Hours (2 digits), Minutes (2 digits), Seconds (2 digits)
  const daysDigits = String(timeLeft.days).padStart(3, '0').split('');
  const hoursDigits = String(timeLeft.hours).padStart(2, '0').split('');
  const minutesDigits = String(timeLeft.minutes).padStart(2, '0').split('');
  const secondsDigits = String(timeLeft.seconds).padStart(2, '0').split('');

  return (
    <div className="countdown-section w-full bg-white">
      {/* ── Title block ── */}
      <div className="title w-full pt-5 pb-3 sm:pt-7 sm:pb-4">
        <div className="w-full flex items-center justify-center gap-2.5 sm:gap-5 px-3 sm:px-6">
          <SparkleIcon />
          <div className="flex flex-col text-left sm:text-center">
            <h1 className="text-lg sm:text-3xl md:text-4xl font-extrabold tracking-[0.15em] sm:tracking-[0.3em] uppercase leading-tight">
              <span className="text-[#0B132B]">INFINITO </span>
              <span className="text-[#E60000]">COMICS</span>
            </h1>
            <p className="text-xs sm:text-base md:text-lg font-bold text-black mt-0.5 sm:mt-1">
              Stories Beyond Imagination.
            </p>
            <p className="text-[11px] sm:text-sm text-gray-700 mt-0.5">
              A next-generation comic and entertainment universe.
            </p>
          </div>
        </div>
      </div>

      {/* ── Body (Red Banner with Timer - Compact & Contained) ── */}
      <div className="body w-full bg-[#E60000] text-white py-2 sm:py-2.5 px-3 sm:px-6 md:px-8 shadow-sm">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-6">
          {/* Left Text */}
          <div className="flex flex-col items-center sm:items-start select-none">
            <span className="text-white text-[10px] sm:text-xs font-bold tracking-widest uppercase">
              WE ARE
            </span>
            <div className="text-base sm:text-xl md:text-2xl font-black uppercase tracking-wider leading-none mt-0.5">
              <span className="text-black">BACK </span>
              <span className="text-white">AGAIN</span>
            </div>
          </div>

          {/* Thin vertical divider (desktop) */}
          <div className="hidden lg:block w-[1.5px] h-8 bg-white/70 mx-2" />

          {/* Timer: Split-Flap Countdown Display */}
          <div className="timer flex items-center justify-center gap-0.5 sm:gap-1.5 overflow-x-auto max-w-full py-0.5">
            {/* Days Box (3 digits) */}
            <div className="flex border border-white sm:border-2 border-white bg-[#E60000] divide-x divide-white/20 shadow-sm">
              {daysDigits.map((digit, idx) => (
                <FlipDigit key={`d-${idx}`} digit={digit} />
              ))}
            </div>

            {/* Colon */}
            <ColonSeparator />

            {/* Hours Box (2 digits) */}
            <div className="flex border border-white sm:border-2 border-white bg-[#E60000] divide-x divide-white/20 shadow-sm">
              {hoursDigits.map((digit, idx) => (
                <FlipDigit key={`h-${idx}`} digit={digit} />
              ))}
            </div>

            {/* Colon */}
            <ColonSeparator />

            {/* Minutes Box (2 digits) */}
            <div className="flex border border-white sm:border-2 border-white bg-[#E60000] divide-x divide-white/20 shadow-sm">
              {minutesDigits.map((digit, idx) => (
                <FlipDigit key={`m-${idx}`} digit={digit} />
              ))}
            </div>

            {/* Colon */}
            <ColonSeparator />

            {/* Seconds Box (2 digits) */}
            <div className="flex border border-white sm:border-2 border-white bg-[#E60000] divide-x divide-white/20 shadow-sm">
              {secondsDigits.map((digit, idx) => (
                <FlipDigit key={`s-${idx}`} digit={digit} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Countdown;
