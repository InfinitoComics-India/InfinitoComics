import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaperCard from './PaperCard';
import PaperSearchBar from './PaperSearchBar';
import PaperCardShimmer from './Shimmer/PaperCardShimmer';
import PaperSearchBarShimmer from './Shimmer/PaperSearchBarShimmer';
import BrowseSectionShimmer from './Shimmer/BrowseSectionShimmer';
import { readResearchService } from '../../services/readResearchService';
const BrowsePapers = ({ allPapers, isLoading }) => {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(3);
  const [searchText, setSearchText] = useState('');
  const [journalText, setJournalText] = useState('');
  const [authorText, setAuthorText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredPapers, setFilteredPapers] = useState([]);

  useEffect(() => {
    if (!Array.isArray(allPapers)) return;
    const filtered = allPapers.filter((paper) => {
      const matchTitle = searchText
        ? paper.title?.toLowerCase().includes(searchText.toLowerCase())
        : true;
      const matchJournal = journalText
        ? paper.journalName?.toLowerCase().includes(journalText.toLowerCase())
        : true;
      const matchAuthors = authorText
        ? paper.authors?.some((author) =>
            author.toLowerCase().includes(authorText.toLowerCase())
          )
        : true;
      const matchCategory =
        selectedCategory === 'all'
          ? true
          : paper.category?.toLowerCase() === selectedCategory.toLowerCase();
      return matchTitle && matchJournal && matchAuthors && matchCategory;
    });

    setFilteredPapers(filtered);
    setVisibleCount(3);
  }, [allPapers, searchText, journalText, authorText, selectedCategory]);

  const handleShowMore = () => setVisibleCount(filteredPapers.length);
  const handleShowLess = () => setVisibleCount(3);

  // ✅ Fetch paper details before navigating
  const handlePaperClick = async (id) => {
    try {
      const paperDetails = await readResearchService(id); // fetch full paper
      console.log("Full paper data:", paperDetails);

      // Pass paper details via route state
      navigate(`/readresearch/${id}`, { state: { paper: paperDetails.data } });
    } catch (error) {
      console.error("Failed to fetch paper details:", error);
    }
  };

  const categories = ['all', 'business', 'psychology', 'design', 'development'];

  return (
    <div className="w-full min-h-screen bg-gray-100 flex justify-center overflow-hidden">
      <div className="flex flex-col min-h-screen w-2/3">

        {/* Search Bar */}
        {isLoading ? (
          <PaperSearchBarShimmer />
        ) : (
          <PaperSearchBar
            searchText={searchText}
            setSearchText={setSearchText}
            journalText={journalText}
            setJournalText={setJournalText}
            authorText={authorText}
            setAuthorText={setAuthorText}
          />
        )}

        {/* Category Tabs */}
        {isLoading ? (
          <BrowseSectionShimmer />
        ) : (
          <div className="w-full border-b border-[#B5B5B5] mt-4">
            <h1 className="text-3xl font-bold text-[#202020] mb-3">BROWSE OUR PAPERS</h1>
            <div className="flex space-x-6 mt-10 gap-10 text-sm">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`border-b-3 pb-2 transition ${
                    selectedCategory === cat
                      ? 'border-[#DD1215] text-[#DD1215] font-semibold'
                      : 'border-transparent hover:border-black text-gray-700'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Paper Cards Section */}
        <div
          className={`w-full h-[calc(100vh-150px)] ${
            isLoading ? 'overflow-hidden' : 'overflow-y-auto'
          } pr-2 pt-8 pb-20`}
        >
          <div className="flex flex-col">
            {isLoading ? (
              [...Array(6)].map((_, i) => <PaperCardShimmer key={i} />)
            ) : filteredPapers.length === 0 ? (
              <p className="text-center text-gray-500 mt-4">No results found.</p>
            ) : (
              <>
                {filteredPapers.slice(0, visibleCount).map((paper) => (
                  <div
                    key={paper._id}
                   
                    className="cursor-pointer"
                  >
                    <PaperCard paper={paper} />
                  </div>
                ))}
                {filteredPapers.length > 3 && (
                  <div className="mt-6 mb-6 text-center">
                    {visibleCount < filteredPapers.length ? (
                      <button
                        className="px-6 py-2 border mb-6 border-black text-sm hover:bg-black hover:text-white transition"
                        onClick={handleShowMore}
                      >
                        Show More
                      </button>
                    ) : (
                      <button
                        className="px-6 py-2 mb-6 border border-black text-sm hover:bg-black hover:text-white transition"
                        onClick={handleShowLess}
                      >
                        Show Less
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowsePapers;
