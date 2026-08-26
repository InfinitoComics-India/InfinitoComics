import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaperCard from './PaperCard';
import PaperSearchBar from './PaperSearchBar';
import PaperCardShimmer from './Shimmer/PaperCardShimmer';
import PaperSearchBarShimmer from './Shimmer/PaperSearchBarShimmer';
import BrowseSectionShimmer from './Shimmer/BrowseSectionShimmer';
import { readResearchService } from '../../services/readResearchService';

const DEMO_PAPERS = [
  {
    _id: 'dp1', isDemo: true,
    title: 'Title Of The Research Paper',
    journalName: 'Journal Name',
    authors: ['Authors'],
    abstract: "Content Stuff. One Day Spiderman Ate A Spider, He Chocked On It, He Died. You Think That's The End. NAAAAH!! One Day Spiderman Ate A Spider, He Chocked On It, He Died. You Think That's The End.",
    datePublished: new Date().toISOString(),
  },
  {
    _id: 'dp2', isDemo: true,
    title: 'Title Of The Research Paper',
    journalName: 'Journal Name',
    authors: ['Authors'],
    abstract: "Content Stuff. One Day Spiderman Ate A Spider, He Chocked On It, He Died. You Think That's The End. NAAAAH!! One Day Spiderman Ate A Spider, He Chocked On It, He Died. You Think That's The End.",
    datePublished: new Date().toISOString(),
  },
  {
    _id: 'dp3', isDemo: true,
    title: 'Title Of The Research Paper',
    journalName: 'Journal Name',
    authors: ['Authors'],
    abstract: "Content Stuff. One Day Spiderman Ate A Spider, He Chocked On It, He Died. You Think That's The End. NAAAAH!! One Day Spiderman Ate A Spider, He Chocked On It, He Died. You Think That's The End.",
    datePublished: new Date().toISOString(),
  },
];

const CATEGORIES = [
  { key: 'all',                   label: 'All' },
  { key: 'business',              label: 'Business' },
  { key: 'technology',            label: 'Technology' },
  { key: 'design & creativity',   label: 'Design & Creativity' },
  { key: 'psychology & culture',  label: 'Psychology & Culture' },
  { key: 'society & policy',      label: 'Society & Policy' },
];

const BrowsePapers = ({ allPapers, isLoading }) => {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(3);
  const [searchText, setSearchText] = useState('');
  const [authorText, setAuthorText] = useState('');
  const [yearText, setYearText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredPapers, setFilteredPapers] = useState([]);

  // Use real data if available, else show demo
  const sourcePapers = Array.isArray(allPapers) && allPapers.length > 0 ? allPapers : DEMO_PAPERS;

  useEffect(() => {
    const filtered = sourcePapers.filter((paper) => {
      const matchTitle = searchText ? paper.title?.toLowerCase().includes(searchText.toLowerCase()) : true;
      const matchAuthors = authorText ? paper.authors?.some((a) => a.toLowerCase().includes(authorText.toLowerCase())) : true;
      const matchYear = yearText ? String(paper.datePublished || '').includes(yearText) : true;
      const matchCategory = selectedCategory === 'all' ? true : paper.category?.toLowerCase() === selectedCategory;
      return matchTitle && matchAuthors && matchYear && matchCategory;
    });
    setFilteredPapers(filtered);
    setVisibleCount(3);
  }, [sourcePapers, searchText, authorText, yearText, selectedCategory]);

  const handlePaperClick = async (id, isDemo) => {
    if (isDemo) return;
    try {
      const res = await readResearchService(id);
      navigate(`/readresearch/${id}`, { state: { paper: res.data } });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ background: '#f3f4f6' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 3rem 4rem' }}>

        {/* Search Bar */}
        {isLoading ? <PaperSearchBarShimmer /> : (
          <PaperSearchBar
            searchText={searchText} setSearchText={setSearchText}
            authorText={authorText} setAuthorText={setAuthorText}
            yearText={yearText} setYearText={setYearText}
          />
        )}

        {/* Browse Our Papers */}
        {isLoading ? <BrowseSectionShimmer /> : (
          <div style={{ marginTop: '2.5rem' }}>
            <h2 style={{
              fontSize: '1.3rem', fontWeight: 900, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: '#111', marginBottom: '1.2rem',
            }}>
              BROWSE OUR PAPERS
            </h2>
            <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', borderBottom: '1px solid #ddd', marginBottom: '1.5rem' }}>
              {CATEGORIES.map((cat) => (
                <button key={cat.key} onClick={() => setSelectedCategory(cat.key)} style={{
                  background: 'none', border: 'none',
                  borderBottom: selectedCategory === cat.key ? '2px solid #DD1215' : '2px solid transparent',
                  color: selectedCategory === cat.key ? '#DD1215' : '#444',
                  fontWeight: selectedCategory === cat.key ? 700 : 400,
                  fontSize: '0.85rem', padding: '0.5rem 0',
                  cursor: 'pointer', transition: 'all 0.2s', marginBottom: '-1px',
                }}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Paper Cards */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {isLoading ? (
            [...Array(3)].map((_, i) => <PaperCardShimmer key={i} />)
          ) : filteredPapers.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>No results found.</p>
          ) : (
            <>
              {filteredPapers.slice(0, visibleCount).map((paper) => (
                <div key={paper._id} onClick={() => handlePaperClick(paper._id, paper.isDemo)}
                  style={{ cursor: paper.isDemo ? 'default' : 'pointer' }}>
                  <PaperCard paper={paper} />
                </div>
              ))}
              {filteredPapers.length > 3 && (
                <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                  {visibleCount < filteredPapers.length ? (
                    <button onClick={() => setVisibleCount(filteredPapers.length)}
                      style={{ border: '1px solid #111', background: 'transparent', padding: '0.5rem 1.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                      Show More
                    </button>
                  ) : (
                    <button onClick={() => setVisibleCount(3)}
                      style={{ border: '1px solid #111', background: 'transparent', padding: '0.5rem 1.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
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
  );
};

export default BrowsePapers;
