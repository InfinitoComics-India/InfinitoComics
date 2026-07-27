import React, { useEffect, useRef } from 'react';
import networkError from './1.gif';

const PageNotFoundWithCanvas = () => {
  const canvasRef = useRef(null);
  const homeRef = useRef(null);
  const dots = useRef([]);
  const arrayColors = ['#7209b7', '#0077B6', '#00B4D8', '#003554', '#ffd500'];

  useEffect(() => {
    const canvas = canvasRef.current;
    const home = homeRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = home.offsetWidth;
    canvas.height = home.offsetHeight;

    dots.current = Array.from({ length: 50 }, () => ({
      x: Math.floor(Math.random() * canvas.width),
      y: Math.floor(Math.random() * canvas.height),
      size: Math.random() * 3 + 5,
      color: arrayColors[Math.floor(Math.random() * arrayColors.length)],
    }));

    const drawDots = () => {
      dots.current.forEach((dot) => {
        ctx.fillStyle = dot.color;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    drawDots();

    const handleMouseMove = (event) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawDots();

      const mouse = {
        x: event.pageX - home.getBoundingClientRect().left,
        y: event.pageY - home.getBoundingClientRect().top,
      };

      dots.current.forEach((dot) => {
        const distance = Math.sqrt((mouse.x - dot.x) ** 2 + (mouse.y - dot.y) ** 2);
        if (distance < 300) {
          ctx.strokeStyle = dot.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(dot.x, dot.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      });
    };

    const handleMouseOut = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawDots();
    };

    home.addEventListener('mousemove', handleMouseMove);
    home.addEventListener('mouseout', handleMouseOut);

    return () => {
      home.removeEventListener('mousemove', handleMouseMove);
      home.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <div ref={homeRef} className="relative w-full h-screen overflow-hidden">
      {/* Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-[-1]"
      />

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row items-center justify-center p-6 lg:p-10 h-full">
        {/* GIF Section */}
        <div className="mb-10 lg:mb-0 lg:ml-24 lg:mt-20 w-full lg:w-auto flex justify-center">
          <img
            src={networkError}
            alt="Animated GIF"
            className="h-64 sm:h-72 md:h-96 lg:h-[500px] w-auto"
          />
        </div>

        {/* Text Section */}
        <div className="text-center lg:text-left lg:ml-2 lg:mt-23 max-w-[90%] md:max-w-[600px]">
          <div className="text-blue-300 text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-extrabold font-mono mb-4">
            Whooops!
          </div>

          <p className="text-blue-400 text-lg sm:text-xl md:text-2xl font-mono mb-4">
            Try:
          </p>

          <ul className="text-blue-400 text-base sm:text-lg md:text-xl font-mono space-y-2 text-left lg:text-left">
            <li>-- Checking the network cables, modem, and router</li>
            <li>-- Reconnecting to Wi-Fi</li>
            <li>-- Running Windows Network Diagnostics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PageNotFoundWithCanvas;
