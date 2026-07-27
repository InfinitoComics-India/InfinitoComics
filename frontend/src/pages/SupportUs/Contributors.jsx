import React from 'react';
import contributorNames from '../../constants/contributorNames.js';

function Contributors() {
  return (
    <div className="flex justify-center items-center text-gray-800 ">
      <div className="w-11/12 lg:w-2/3 py-32 font-sans">
        <h2 className="text-start md:text-center text-[1.4rem] md:text-[1.9rem] font-bold mb-12 tracking-widest">
          OUR CONTRIBUTORS
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 text-start sm:text-center">
          {contributorNames.map((name, index) => (
            <div
              key={index}
              className="text-sm md:text-base lg:text-lg text-black hover:text-red-600 hover:underline cursor-pointer"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Contributors;
