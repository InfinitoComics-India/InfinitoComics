import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRegUserCircle } from 'react-icons/fa';
import { getBlogsById } from '../../services/userServices';

const NewsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const blog = await getBlogsById(id);
        setSelectedNews(blog && blog.data ? blog.data : null);
      } catch (error) {
        console.error("Failed to fetch blog:", error.message);
      }
    };

    fetchBlog();
  }, [id]);

  if (!selectedNews) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="flex justify-center my-8">
      <div className="w-11/12 lg:w-2/3">
        <button
          onClick={() => navigate(-1)}
          className="text-sm hover:underline mb-8 tracking-widest font-semibold cursor-pointer"
        >
          ← BACK TO BLOGS & NEWS
        </button>

        <h1
          className="text-4xl sn:text-4xl lg:text-5xl font-black text-[#DD1215] mb-2"
          style={{ fontFamily: 'DM Sans' }}
        >
          {selectedNews.title}
        </h1>

        <p
          className="text-xl md:text-xl text-[#111111] mb-4"
          style={{ fontFamily: 'DM Sans', fontWeight: '500' }}
        >
          {selectedNews.subject ? selectedNews.subject.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') : ''}
        </p>

        <div className="flex items-center gap-2 pt-3 mb-6 text-sm text-gray-700">
          <FaRegUserCircle className="text-2xl" />
          <p className="text-base md:text-md font-semibold">
            By <span>{selectedNews.authorName || 'Admin'}</span>&nbsp;&nbsp;•&nbsp;&nbsp;
            {new Date(selectedNews.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
            &nbsp;at&nbsp;
            {new Date(selectedNews.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Cover image at top if present */}
        {selectedNews.coverImage && (
          <div className="mb-6">
            <img
              src={selectedNews.coverImage}
              alt={selectedNews.title}
              className="w-full max-h-[30rem] object-cover rounded-xl shadow-sm"
            />
          </div>
        )}

        <div className="pt-4">
          {/* Main content */}
          <div className="w-full">
            {selectedNews.content ? (
              <div
                className="prose prose-lg max-w-none text-md sm:text-lg leading-relaxed mb-8 text-[#111111] [&_table]:border-collapse [&_table]:w-full [&_table]:my-4 [&_td]:border [&_td]:border-gray-300 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-gray-300 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-100 [&_th]:font-semibold [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-red-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_pre]:bg-gray-900 [&_pre]:text-white [&_pre]:p-4 [&_pre]:rounded-lg"
                style={{ fontFamily: 'DM Sans' }}
                dangerouslySetInnerHTML={{ __html: selectedNews.content }}
              />
            ) : (
              Array.isArray(selectedNews.news) &&
              selectedNews.news.map((item, idx) => (
                <div key={idx} className="mb-8">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt="news"
                      className="w-full lg:h-[24rem] mb-4 object-cover"
                    />
                  )}
                  {item.story && (
                    <div
                      className="text-md sm:text-lg lg:text-md leading-relaxed mb-6 text-[#111111] prose max-w-none [&_table]:border-collapse [&_table]:w-full [&_table]:my-4 [&_td]:border [&_td]:border-gray-300 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-gray-300 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-100 [&_th]:font-semibold [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                      style={{ fontFamily: 'DM Sans', fontWeight: '500' }}
                      dangerouslySetInnerHTML={{ __html: item.story }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetails;
