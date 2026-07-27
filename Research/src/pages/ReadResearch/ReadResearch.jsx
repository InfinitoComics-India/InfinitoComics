import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { readResearchService } from '../../services/readResearchService';

const ReadResearch = () => {
  const { id } = useParams();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleUnlock = () => setIsUnlocked(true);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        setLoading(true);
        const res = await readResearchService(id);
        setPaper(res.data);
      } catch (error) {
        console.error('Failed to fetch research paper:', error);
        setPaper(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPaper();
  }, [id]);

  if (loading) {
    return <p className="text-center py-20">Loading research paper...</p>;
  }

  if (!paper) {
    return (
      <p className="text-center py-20 text-red-500">
        Research paper not found.
      </p>
    );
  }

  return (
    <div className="bg-[#fdfdfd] py-12 px-4 sm:px-6 md:px-10 overflow-x-hidden">
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-12 break-words">
        
        {/* Left Content */}
        <div className="w-full lg:w-9/12 text-justify break-words">
          <p className="text-xl text-gray-500 italic mb-1 break-words">
            <span className="text-red-600 font-semibold">
              {paper.journalName || 'Journal'}
            </span>{' '}
            | {paper.publishedAt ? new Date(paper.publishedAt).toLocaleDateString() : 'N/A'}
          </p>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-left break-words">
            {paper.title}
          </h1>

          {paper.authors?.length > 0 && (
            <p className="text-2xl text-gray-700 font-medium mb-2 text-left break-words">
              {paper.authors.join(', ')}
            </p>
          )}

          <div className="flex gap-10 border-y border-gray-200 py-4 mb-6">
            <div>
              <p className="text-4xl border-l-4 px-3 border-gray-200 text-red-600 font-bold leading-tight">
                {paper.citations || 0}
              </p>
              <p className="text-sm text-gray-600">Citations</p>
            </div>
            <div>
              <p className="text-4xl border-l-4 px-3 border-gray-200 text-red-600 font-bold leading-tight">
                {paper.views || 0}
              </p>
              <p className="text-sm text-gray-600">Views</p>
            </div>
          </div>

          {/* Abstract */}
          {paper.abstract && (
            <>
              <h2 className="text-2xl font-semibold mb-2 text-left">Abstract</h2>
              <p className="text-gray-800 leading-relaxed break-words">{paper.abstract}</p>
            </>
          )}

          {/* Keywords */}
          {paper.keywords?.length > 0 && (
            <>
              <h3 className="text-xl font-semibold mb-1 text-left">Keywords:</h3>
              <p className="text-gray-700 mb-4 break-words">{paper.keywords.join(', ')}</p>
            </>
          )}

          {/* Introduction */}
          {paper.introduction && (
            <>
              <h2 className="text-xl font-semibold mb-2 text-left">Introduction</h2>
              <div className="relative overflow-hidden transition-all duration-300 ease-in-out">
                <div className={`${isUnlocked ? '' : 'max-h-[180px] overflow-hidden relative'}`}>
                  <p className="text-gray-800 leading-relaxed break-words">{paper.introduction}</p>
                  {!isUnlocked && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#fdfdfd] to-transparent pointer-events-none" />
                  )}
                </div>
              </div>
            </>
          )}

          {!isUnlocked && (
            <div className="text-center my-6">
              <button
                onClick={handleUnlock}
                className="text-xs uppercase mb-5 tracking-wider font-semibold text-black"
              >
                Get Full Access &gt;
              </button>
            </div>
          )}

          {/* Mobile Buy Section */}
          <div className="block lg:hidden mt-10">
            <BuyPaperCard price={paper.price} />
          </div>

          {/* References */}
          {paper.references?.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-3 mt-10 text-left">References</h2>
              <ol className="text-sm text-gray-800 list-decimal list-inside space-y-4 break-words">
                {paper.references.map((ref, i) => (
                  <li key={i} className="break-words">
                    {typeof ref === 'string'
                      ? ref
                      : `${ref.text}${ref.doi ? ` (DOI: ${ref.doi})` : ''}`}
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>

        {/* Desktop Buy Section */}
        <div className="hidden lg:block w-full lg:w-5/12">
          <BuyPaperCard price={paper.price} />
        </div>
      </div>
    </div>
  );
};

const BuyPaperCard = ({ price }) => (
  <div className="p-6 sm:p-10 shadow-xl rounded-sm bg-white">
    <h3 className="text-lg font-semibold mb-6">Buy Paper Now</h3>
    <p className="text-2xl font-medium mb-4">₹{price || '49.00'}</p>
    <button className="border border-black px-4 py-2 text-sm font-semibold tracking-wide hover:bg-black hover:text-white transition">
      Get Full Access &gt;
    </button>
  </div>
);

export default ReadResearch;
