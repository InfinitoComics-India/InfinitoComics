import React from 'react';
import alienGif from './2.gif';
import { Link } from 'react-router-dom';
const App = () => {
  return (
    <div className="flex justify-center mb-12 bg-white">
      <div className="flex flex-col items-center text-center max-w-4xl w-full">
        <img
          src={alienGif}
          alt="Alien Attack"
          className="max-h-[550px] w-auto object-contain "
        />

        <h1 className="text-blue-300 text-3xl sm:text-4xl md:text-5xl font-mono font-bold mb-2 uppercase">
          Page Not Found!
        </h1>

        <p className="text-blue-400 text-base sm:text-lg md:text-xl font-mono mb-2">
          Looks like this page is under Aliens Attack...
        </p>

        <div className="flex flex-wrap justify-center items-center gap-3 text-blue-400 text-base sm:text-lg font-mono">
          <span>
            Our Heroes will fight it out... meanwhile you can explore more on
          </span>
          <Link to="/">
          <button className="bg-blue-300 hover:bg-blue-400 text-green-50 px-3 py-1 text-sm sm:text-base rounded">
            INFINITO COMICS
          </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default App;
