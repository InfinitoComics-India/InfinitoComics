import React from 'react';

const NewsletterSection = () => {
  return (
    <div
      className="w-full bg-cover bg-center flex flex-col md:flex-row items-center justify-between px-12 md:px-20 py-12 md:py-20"
      style={{ backgroundImage: "url('/assets/Images/Newsletter.png')" }}
    >
      <div className="text-white max-w-xl mt-14 md:mt-24">
        <h2 className="text-3xl md:text-xl font-extrabold tracking-widest mb-4">
          STAY UPDATED
        </h2>
        <p className="text-lg md:text-xl mb-6">
          Get the latest news and updates with our newsletter!
        </p>
        <form className="flex w-full max-w-md">
          <input
            type="email"
            placeholder="Join Us, Write your mail"
            className="flex-grow px-4 py-3 rounded-l-md focus:outline-none text-black placeholder-white bg-white bg-opacity-20"
          />
          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-3 rounded-r-md font-bold tracking-wider hover:bg-red-700 transition"
          >
            JOIN NOW!
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewsletterSection;


