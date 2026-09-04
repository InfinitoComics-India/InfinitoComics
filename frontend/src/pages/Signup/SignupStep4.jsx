import React, { useState } from 'react';
import LoginLogo from '../../../assets/Images/LoginLogo.png';
import Avatar from '../../../assets/Images/Signup/Avatar.png';
import { Shuffle, ChevronLeft, ChevronRight } from 'lucide-react';

// Character part options — colors to simulate different parts
const PARTS = {
  head:    { label: 'Head',       colors: ['#C8729A', '#8B4B8B', '#E86D3F', '#3F7FE8', '#4BA858', '#E8D23F'] },
  body:    { label: 'Body',       colors: ['#C8729A', '#3F7FE8', '#8B4B8B', '#E86D3F', '#4BA858', '#E8D23F'] },
  weapon:  { label: 'Weapon',     colors: ['#888', '#C8729A', '#E86D3F', '#3F7FE8', '#4BA858', '#8B4B8B'] },
  legs:    { label: 'Legs',       colors: ['#C8729A', '#8B4B8B', '#3F7FE8', '#E86D3F', '#E8D23F', '#4BA858'] },
  accessory: { label: 'Accessory', colors: ['#888', '#C8729A', '#E86D3F', '#3F7FE8', '#4BA858', '#8B4B8B'] },
};

const PartSelector = ({ label, index, total, onPrev, onNext, color }) => (
  <div className="flex items-center gap-2">
    <button onClick={onPrev} className="w-6 h-6 flex items-center justify-center border border-gray-300 hover:bg-gray-100 rounded">
      <ChevronLeft size={14} />
    </button>
    <div className="w-12 h-12 rounded" style={{ backgroundColor: color }} />
    <button onClick={onNext} className="w-6 h-6 flex items-center justify-center border border-gray-300 hover:bg-gray-100 rounded">
      <ChevronRight size={14} />
    </button>
  </div>
);

const SignupStep4 = ({ onBack, onConfirm }) => {
  const [selected, setSelected] = useState({
    head: 0,
    body: 0,
    weapon: 0,
    legs: 0,
    accessory: 0,
  });

  const cycle = (part, dir) => {
    const total = PARTS[part].colors.length;
    setSelected(prev => ({
      ...prev,
      [part]: (prev[part] + dir + total) % total,
    }));
  };

  const randomise = () => {
    const rand = {};
    Object.keys(PARTS).forEach(part => {
      rand[part] = Math.floor(Math.random() * PARTS[part].colors.length);
    });
    setSelected(rand);
  };

  const characterColors = {
    head: PARTS.head.colors[selected.head],
    body: PARTS.body.colors[selected.body],
    weapon: PARTS.weapon.colors[selected.weapon],
    legs: PARTS.legs.colors[selected.legs],
    accessory: PARTS.accessory.colors[selected.accessory],
  };

  return (
    <div className="w-[540px] bg-white bg-opacity-95 px-10 py-8 rounded shadow-md font-sans relative">
      {/* Logo */}
      <div className="flex flex-col items-center gap-2 mb-4">
        <img src={LoginLogo} alt="Infinito" className="w-[160px]" />
        <h2 className="text-lg font-semibold text-center text-[#1f1f1f]">Create something uniquely you!</h2>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mt-1">
          <div className="w-20 h-1 bg-red-600" />
          <div className="w-6 h-6 flex items-center justify-center border-2 border-red-600 text-red-600 text-sm font-bold">1</div>
          <div className="w-20 h-1 bg-red-600" />
          <div className="w-6 h-6 flex items-center justify-center border-2 border-red-600 text-red-600 text-sm font-semibold">2</div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex gap-6 items-start justify-center">
        {/* Left — part selectors (head, body, weapon, legs) */}
        <div className="flex flex-col gap-3 pt-4">
          {['head', 'body', 'weapon', 'legs'].map(part => (
            <PartSelector
              key={part}
              label={PARTS[part].label}
              index={selected[part]}
              total={PARTS[part].colors.length}
              color={PARTS[part].colors[selected[part]]}
              onPrev={() => cycle(part, -1)}
              onNext={() => cycle(part, 1)}
            />
          ))}
        </div>

        {/* Centre — character preview */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-28 h-44">
            {/* Simple block character using colors */}
            {/* Head */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-sm" style={{ backgroundColor: characterColors.head }} />
            {/* Body */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-10 h-14 rounded-sm" style={{ backgroundColor: characterColors.body }} />
            {/* Weapon */}
            <div className="absolute top-14 left-0 w-3 h-10 rounded-sm" style={{ backgroundColor: characterColors.weapon }} />
            {/* Legs */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 flex gap-1">
              <div className="w-4 h-10 rounded-sm" style={{ backgroundColor: characterColors.legs }} />
              <div className="w-4 h-10 rounded-sm" style={{ backgroundColor: characterColors.legs }} />
            </div>
          </div>
        </div>

        {/* Right — accessory selector */}
        <div className="flex flex-col gap-3 pt-16 justify-center">
          <PartSelector
            key="accessory"
            label="Accessory"
            index={selected.accessory}
            total={PARTS.accessory.colors.length}
            color={PARTS.accessory.colors[selected.accessory]}
            onPrev={() => cycle('accessory', -1)}
            onNext={() => cycle('accessory', 1)}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={randomise}
          className="flex items-center gap-2 border-2 border-[#DD1215] text-[#DD1215] px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition"
        >
          <Shuffle size={14} />
          Randomise
        </button>
        <button
          onClick={onBack}
          className="text-xs font-bold uppercase tracking-widest text-gray-600 hover:underline"
        >
          Back
        </button>
        <button
          onClick={() => onConfirm(characterColors)}
          className="flex items-center gap-2 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition"
        >
          <span>✓</span> Confirm My Character
        </button>
      </div>
    </div>
  );
};

export default SignupStep4;
