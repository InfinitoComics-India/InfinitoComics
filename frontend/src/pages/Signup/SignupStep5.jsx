import React from 'react';
import { useNavigate } from 'react-router-dom';
import InfinitoLogo from '../../../assets/Images/LoginLogo.png';
import ComicImg from '../../../assets/Images/Signup/ComicImg.png';
import CharacterImg from '../../../assets/Images/Signup/CharacterImg.png';
import CommunityImg from '../../../assets/Images/Signup/CommunityImg.png';
import GamesImg from '../../../assets/Images/Signup/GamesImg.png';
import { useSelector } from 'react-redux';

const TILE_LABELS = ['COMICS', 'CHARACTERS', 'COMMUNITY', 'GAMES'];
const TILE_ROUTES = ['/comics', '/characters', '/community', '/games'];

const CharacterPreview = ({ colors }) => {
  const c = colors || {
    head: '#C8729A', body: '#C8729A', weapon: '#888',
    legs: '#C8729A', accessory: '#888',
  };
  return (
    <div className="relative w-24 h-40 mx-auto">
      {/* Head */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-sm" style={{ backgroundColor: c.head }} />
      {/* Body */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-8 h-12 rounded-sm" style={{ backgroundColor: c.body }} />
      {/* Weapon */}
      <div className="absolute top-12 left-0 w-3 h-8 rounded-sm" style={{ backgroundColor: c.weapon }} />
      {/* Legs */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 flex gap-1">
        <div className="w-3 h-8 rounded-sm" style={{ backgroundColor: c.legs }} />
        <div className="w-3 h-8 rounded-sm" style={{ backgroundColor: c.legs }} />
      </div>
    </div>
  );
};

const SignupStep5 = ({ onBack, characterColors }) => {
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();

  return (
    <div className="w-[540px] bg-white bg-opacity-95 px-8 py-8 rounded shadow-md font-sans relative">
      {/* Logo & Title */}
      <div className="flex flex-col items-center text-center gap-2 mb-6">
        <img src={InfinitoLogo} alt="Infinito" className="w-[160px]" />
        <p className="text-lg font-semibold text-gray-900">
          All set, let the adventure begin!
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-row w-full justify-center items-center gap-8">
        {/* Left: Character & Username */}
        <div className="flex flex-col items-center gap-2 min-w-[120px]">
          <CharacterPreview colors={characterColors} />
          <p className="text-[10px] text-gray-500 font-semibold tracking-widest uppercase mt-2">
            User Name
          </p>
          <p className="text-sm font-semibold tracking-wide lowercase text-gray-800">
            {user?.username || 'username'}
          </p>
        </div>

        {/* Right: Navigation tiles */}
        <div className="grid grid-cols-2 gap-3">
          {[ComicImg, CharacterImg, CommunityImg, GamesImg].map((img, i) => (
            <button
              key={i}
              onClick={() => navigate(TILE_ROUTES[i])}
              className="flex flex-col items-center justify-end hover:scale-105 transition-transform relative overflow-hidden rounded"
            >
              <img
                src={img}
                alt={TILE_LABELS[i]}
                className="w-28 h-24 object-cover rounded"
              />
              <span className="absolute bottom-1 left-0 right-0 text-center text-[10px] font-bold text-white tracking-widest uppercase drop-shadow">
                {TILE_LABELS[i]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Go to Home button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => navigate('/')}
          className="text-xs font-bold uppercase tracking-widest text-gray-700 hover:underline"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default SignupStep5;
