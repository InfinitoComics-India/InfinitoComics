// 📁 src/components/TrendingPosts.jsx
import React from "react";
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import {posts} from '../../constants/communities'


const TrendingPosts = () => {
  return (
    <div className="w-full px-4 md:px-10 lg:px-20 py-12 mb-8">
      
      {/* Section heading with responsive horizontal spacing */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 mx-4 sm:mx-10 lg:mx-40 space-y-4 sm:space-y-0">
        <h2 className="font-sans font-extrabold text-xl sm:text-4xl tracking-[0.1em] scale-y-100 uppercase text-center sm:text-left">
          TRENDING POSTS
        </h2>
        
        {/* Link to view all posts */}
        <a
          href="#"
          className="text-md tracking-widest text-red-600 uppercase font-semibold hover:underline"
        >
          View All &nbsp; &rsaquo;
        </a>
      </div>

      {/* Responsive grid layout for post cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-4 sm:mx-10 lg:mx-40">
        {posts.map((post, index) => (
          <div
            key={index}
            className="border border-gray-400 overflow-hidden shadow-sm bg-white"
          >
            {/* Post header with avatar and metadata */}
            <div className="flex items-center gap-3 p-4">
              <img
                src={post.avatarUrl}
                alt="avatar"
                className="w-10 h-10 rounded-full bg-gray-300"
              />
              <div>
                <p className="font-bold text-lg text-gray-800">{post.username}</p>
                <p className="text-xs text-gray-500">{post.time}</p>
              </div>
            </div>

            {/* Post description text */}
            <p className="px-5 text-lg text-gray-800 mb-4">{post.text}</p>

            {/* Post image section */}
            <div className="px-5 py-2">
              <img
                src={post.imageUrl}
                alt="post"
                className="w-full object-cover"
              />
            </div>

            {/* Reaction section: likes, comments, shares */}
            <div className="flex justify-between text-xs text-gray-800 border-t border-gray-300 mt-2">
              
              {/* Likes block */}
              <div className="w-1/3 text-center py-3 border-r border-gray-300 flex items-center justify-center gap-2">
                <p className="font-semibold">{post.likes} LIKES</p>
                <Heart size={16} className="inline-block" />
              </div>

              {/* Comments block */}
              <div className="w-1/3 text-center py-3 border-r border-gray-300 flex items-center justify-center gap-2">
                <p className="font-semibold">{post.comments} COMMENTS</p>
                <MessageCircle size={16} className="inline-block" />
              </div>

              {/* Shares block */}
              <div className="w-1/3 text-center py-3 flex items-center justify-center gap-2">
                <p className="font-semibold">{post.shares} SHARES</p>
                <Share2 size={16} className="inline-block" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingPosts;
