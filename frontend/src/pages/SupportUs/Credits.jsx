import React from 'react';
import companies from '../../constants/companies.js';

function Credits() {
    return (
        <div className="flex justify-center items-center min-h-screen ">
            <div className="w-11/12 lg:w-2/3 min-h-screen bg-white text-gray-800">
                <div className="py-16 font-sans">
                    <h2 className="text-start md:text-center text-2xl md:text-[1.9rem] font-bold mb-5 md:mb-12 pb-2 tracking-widest">CREDITS</h2>

                    {[
                        { title: 'Corporate Patron', data: companies.patron, type: 'image' },
                        { title: 'Corporate Titanium', data: companies.titanium, type: 'image' },
                        { title: 'Corporate Platinum', data: companies.platinum, type: 'text' },
                        { title: 'Corporate Gold', data: companies.gold, type: 'text' },
                    ].map((section, idx) => (
                        <section key={idx} className="mb-8 lg:mb-12">
                            {/* Heading Layout */}
                            {/* For small screens: left text + right line */}
                            <div className="block md:hidden mb-8">
                                <div className="flex items-center">
                                    <h3 className="text-lg font-semibold text-black whitespace-nowrap">{section.title}</h3>
                                    <div className="flex-1 border-t border-gray-500 ml-4"></div>
                                </div>
                            </div>

                            {/* For medium and above: centered text with line behind */}
                            <div className="relative hidden md:flex items-center justify-center mb-8">
                                <div className="border-t border-gray-500 w-full absolute top-1/2 left-0 transform -translate-y-1/2 z-0"></div>
                                <span className="relative z-10 px-6 bg-white text-2xl font-semibold text-black">
                                    {section.title}
                                </span>
                            </div>


                            {/* Content */}
                            {section.type === 'image' ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 place-items-center">
                                    {section.data.map((src, index) => (
                                        <div key={index} className="flex flex-col items-center">
                                            <img src={src} alt="Logo" className="w-28 sm:w-32 md:w-44 h-auto object-contain" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-wrap justify-center gap-6 text-center">
                                    {section.data.map((_, index) => (
                                        <div
                                            key={index}
                                            className="text-sm md:text-lg text-black hover:text-blue-600 hover:underline cursor-pointer"
                                        >
                                            Maere Studios
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Credits;
