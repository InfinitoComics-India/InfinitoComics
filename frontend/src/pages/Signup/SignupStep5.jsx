import React from 'react';
import { useNavigate } from 'react-router-dom';
import InfinitoLogo from '../../../assets/Images/LoginLogo.png'; // Infinito logo
import Avatar from '../../../assets/Images/Signup/Avatar.png'; // Character avatar
import ComicImg from '../../../assets/Images/Signup/ComicImg.png';
import CharacterImg from '../../../assets/Images/Signup/CharacterImg.png';
import CommunityImg from '../../../assets/Images/Signup/CommunityImg.png';
import GamesImg from '../../../assets/Images/Signup/GamesImg.png';
import { ArrowLeft } from 'lucide-react';
import { useSelector } from 'react-redux';

const SignupStep5 = ({ onBack }) => {
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-screen-xl bg-white px-4 sm:px-8 md:px-16 py-6 md:py-10 flex flex-col items-center min-h-[75vh] font-sans relative rounded-lg shadow-md">
      {/* Back Button */}
      <div
        className="absolute top-4 left-4 p-2 rounded-full cursor-pointer bg-red-100 text-red-700 hover:text-red-600 hover:bg-red-200 transition-all duration-200"
        onClick={() => onBack()}
      >
        <ArrowLeft size={20} />
      </div>

      {/* Logo & Title */}
      <div className="flex flex-col items-center text-center mt-2 md:mt-4">
        <img
          src={InfinitoLogo}
          alt="Infinito"
          className="w-36 md:w-48 lg:w-56 mb-3"
        />
        <p className="text-lg sm:text-xl md:text-2xl font-semibold tracking-wide text-gray-900">
          All set, let the adventure begin!
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row w-full max-w-5xl mt-8 md:mt-14 justify-center items-center gap-8">
        {/* Left: Avatar & Username */}
        <div className="flex flex-col items-center gap-2">
          <img
            src={Avatar}
            alt="Character"
            className="h-40 sm:h-48 md:h-56 lg:h-64 object-contain"
          />
          <p className="text-xs sm:text-sm text-gray-600 font-semibold tracking-widest">
            USER NAME
          </p>
          <p className="text-sm sm:text-base md:text-lg font-semibold tracking-wide lowercase">
            {user.username}
          </p>
        </div>

        {/* Right: Interactive Tiles */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {[ComicImg, CharacterImg, CommunityImg, GamesImg].map(
            (img, index) => (
              <button
                key={index}
                onClick={() => navigate('/')}
                className="flex flex-col items-center justify-center hover:scale-105 transition-transform"
              >
                <img
                  src={img}
                  alt={`Tile ${index + 1}`}
                  className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 object-contain"
                />
              </button>
            )
          )}
        </div>
      </div>

      {/* Skip Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute bottom-6 right-6 text-xs sm:text-sm md:text-base tracking-widest text-gray-700 hover:underline font-bold"
      >
        SKIP
      </button>
    </div>
  );
};

export default SignupStep5;
