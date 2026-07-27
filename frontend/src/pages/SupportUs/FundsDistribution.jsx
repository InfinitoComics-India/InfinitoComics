import React, { useState } from 'react';
import {fundCategories, chartDefault, chartExpanded} from '../../constants/fundCategories.js';

function FundsDistribution() {
  const [expanded, setExpanded] = useState(null);

  return (
    <>
      <div className="flex justify-center items-cente ">
        <div className="w-11/12  lg:w-2/3 h-full bg-white text-center text-gray-800">
          <div className="w-full pt-16 text-black font-sans ">
            <h2 className="text-start text-2xl md:text-[1.9rem] font-bold mb-5">HOW WE DISTRIBUTE OUR FUNDS</h2>

            <div className="flex flex-col lg:flex-row items-center justify-center lg:items-center gap-6">
              {/* Donut Chart */}
              <div className="w-1/2 max-w-[50%] mx-auto lg:mx-0 bg-blue-500">
                <img
                  src={chartDefault}
                  alt="Fund Distribution Chart"
                  className="w-full h-auto"
                />
              </div>

              {/* Fund Categories */}
              <div className="w-full flex-1 space-y-16 ">
                {fundCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`relative border-l-4 ${cat.borderClass} ${cat.extraClass || ''} pl-2 text-start`}
                  >
                    <span className={`${cat.textColor} absolute -top-7 -left-2 text-xl font-semibold`}>
                      {cat.percentage}
                    </span>
                    <h3 className="text-xl font-semibold text-black">{cat.title}</h3>

                    {expanded !== cat.id ? (
                      <div className="text-md text-[#4B5563] mt-1 grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8 ">
                        {cat.collapsedItems.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-1">
                            <span
                              className={`w-2 h-2 inline-block`}
                              style={{ backgroundColor: item.dotColor }}
                            ></span>
                            <span>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ul
                        className={`list-none ${cat.expandedUlClass} text-md mt-2 text-[#4B5563] -space-y-1`}
                      >
                        {cat.expandedItems.map((item, idx) => (
                          <li key={idx}>
                            <span
                              className={`${item.barColor} border-l-4 -ml-8 py-1 mr-2 pl-1`}
                            >
                              {item.percent}
                            </span>
                            {item.label}
                          </li>
                        ))}
                      </ul>
                    )}

                    <button
                      onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                      className="text-[11px] font-medium tracking-widest mt-2 absolute -bottom-5 -left-2 cursor-pointer hover:underline"
                    >
                      {expanded === cat.id ? 'VIEW LESS' : 'VIEW BREAKDOWN'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FundsDistribution;