import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { readResearchService } from '../../services/readResearchService';
import { researchBrowse } from '../../services/browseService';

const ReadResearch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const subscribed = localStorage.getItem('researchSubscribed') === 'true';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (subscribed || user?.researchSubscribed) setIsUnlocked(true);
  }, []);

  const [paper, setPaper] = useState(null);
  const [allPapers, setAllPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  useEffect(() => {
    researchBrowse().then(res => {
      if (res?.data) setAllPapers(res.data.filter(p => p._id !== id).slice(0, 2));
    }).catch(() => {});
  }, [id]);

  if (loading) return (
    <div className="py-16 text-center text-gray-400 text-base">Loading...</div>
  );

  if (!paper) return (
    <div className="py-16 text-center text-red-500 text-base">Research paper not found.</div>
  );

  // Build author lines: each author on its own line as "Name - Affiliation"
  const authorLines = Array.isArray(paper.authors)
    ? paper.authors
        .filter(a => typeof a === 'object' ? a?.name?.trim() : a?.trim())
        .map(a => {
          if (typeof a === 'string') return a.trim();
          const name = (a?.name || '').trim();
          const affiliation = (a?.affiliation || '').trim();
          return affiliation ? `${name} - ${affiliation}` : name;
        })
        .filter(Boolean)
    : (paper.authors ? [paper.authors] : []);

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const MembershipCard = () => (
    <div className="border border-gray-200 p-6 bg-white">
      <h2 className="text-2xl font-black text-[#DD1215] leading-tight mb-4">Research Membership</h2>
      <p className="text-3xl font-extrabold text-gray-900 mb-1">₹49</p>
      <p className="text-sm font-bold text-gray-900 mb-4">Membership Benefits</p>
      {[
        { title: 'UNLIMITED READING >', desc: 'Explore All Our Research, Insights, And Findings' },
        { title: 'DOWNLOAD PDFs >', desc: 'Access Offline Copies Anytime, Anywhere' },
        { title: 'CONTRIBUTE IN RESEARCH >', desc: 'The Description Of The Plan. How To Use It, Is It Available' },
        { title: 'EARLY ACCESS >', desc: 'Be The First To Explore New Studies And Innovations' },
        { title: 'EXCLUSIVE UPDATES >', desc: 'Stay Informed With The Latest Breakthroughs In AI, AR/VR, And Future Tech' },
      ].map((item, i) => (
        <div key={i} className="mb-4">
          <p className="text-[0.72rem] font-bold text-[#DD1215] tracking-wide mb-0.5">{item.title}</p>
          <p className="text-[0.78rem] text-gray-600 leading-relaxed">{item.desc}</p>
        </div>
      ))}
      <button
        onClick={() => {
          const user = localStorage.getItem('user');
          navigate('/checkout', user ? { state: { skipToPayment: true } } : undefined);
        }}
        className="w-full mt-4 border-2 border-gray-900 bg-transparent text-gray-900 text-xs font-bold tracking-widest uppercase py-3 px-4 cursor-pointer transition-colors hover:bg-black hover:text-white"
      >
        GET FULL ACCESS ›
      </button>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">

        {/* Top bar */}
        <div className="py-4 border-b border-gray-100 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-gray-600 hover:text-black transition flex items-center gap-1.5"
          >
            ← BACK TO HOME
          </button>
          {/* Mobile membership toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden bg-[#DD1215] text-white text-xs font-bold tracking-wide px-4 py-2"
          >
            {sidebarOpen ? 'HIDE MEMBERSHIP' : 'VIEW MEMBERSHIP ₹49'}
          </button>
        </div>

        {/* Mobile membership panel */}
        {sidebarOpen && (
          <div className="md:hidden mt-4 mb-4">
            <MembershipCard />
          </div>
        )}

        {/* Main layout */}
        <div className="flex flex-col md:flex-row gap-10 py-8 pb-16 items-start">

          {/* ── LEFT: Paper content ── */}
          <div className="flex-1 min-w-0">

            {/* Journal + date */}
            <p className="text-sm text-gray-500 mb-2">
              <span className="text-[#DD1215] italic font-semibold">
                {paper.journalName || 'Journal'}
              </span>
              {' '}| {formatDate(paper.publicationDate || paper.datePublished)}
            </p>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3">
              {paper.title}
            </h1>

            {/* Authors */}
            {authorLines.length > 0 && (
              <div className="text-sm text-gray-500 mb-5 leading-7">
                {authorLines.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            )}

            {/* Views */}
            <div className="flex gap-8 border-t border-b border-gray-100 py-3 mb-7">
              <div>
                <span className="text-4xl font-black text-[#DD1215] border-l-4 border-gray-200 pl-2">
                  {paper.views || 0}
                </span>
                <p className="text-xs text-gray-400 mt-0.5">Views</p>
              </div>
            </div>

            {/* Abstract */}
            {paper.abstract && (
              <div className="mb-7">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Abstract</h2>
                <div className="text-sm text-gray-700 leading-7 text-justify paper-content"
                  dangerouslySetInnerHTML={{ __html: paper.abstract }} />
              </div>
            )}

            {/* Keywords */}
            {paper.keywords?.length > 0 && (
              <div className="mb-7">
                <h3 className="text-base font-bold text-gray-900 mb-1">Keywords:</h3>
                <p className="text-sm text-gray-600 leading-7">
                  {paper.keywords.map(k => typeof k === 'string' ? k : (k?.word || '')).filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            {/* Introduction */}
            {paper.introduction && (
              <div className="mb-7">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Introduction</h2>
                <div className={`relative overflow-hidden ${!isUnlocked ? 'max-h-52' : ''}`}>
                  <div className="text-sm text-gray-700 leading-7 text-justify paper-content"
                    dangerouslySetInnerHTML={{ __html: paper.introduction }} />
                  {!isUnlocked && (
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
                  )}
                </div>
              </div>
            )}

            {/* Gated sections */}
            {isUnlocked && [
              { key: 'literatureStudy',    label: 'Literature Study/Review' },
              { key: 'researchGap',        label: 'Research Gap & Related Works' },
              { key: 'objectives',         label: 'Objectives' },
              { key: 'methodology',        label: 'Methodology' },
              { key: 'surveyDataAnalysis', label: 'Survey/Data Analysis' },
              { key: 'experiments',        label: 'Experiments' },
              { key: 'experimentResults',  label: 'Experiment Results' },
              { key: 'discussion',         label: 'Discussion' },
              { key: 'conclusion',         label: 'Conclusion' },
            ].map(({ key, label }) => paper[key] ? (
              <div key={key} className="mb-7">
                <h2 className="text-lg font-bold text-gray-900 mb-2">{label}</h2>
                <div className="text-sm text-gray-700 leading-7 text-justify paper-content"
                  dangerouslySetInnerHTML={{ __html: paper[key] }} />
              </div>
            ) : null)}

            {/* Get full access CTA */}
            {!isUnlocked && (
              <div className="text-center my-6">
                <button
                  onClick={() => navigate('/checkout')}
                  className="text-xs font-bold tracking-widest uppercase text-gray-900 border-none bg-transparent cursor-pointer hover:text-[#DD1215] transition"
                >
                  GET FULL ACCESS &gt;
                </button>
              </div>
            )}

            {/* References */}
            {paper.references?.length > 0 && (
              <div className="mt-8 mb-10">
                <h2 className="text-lg font-bold text-gray-900 mb-4">References</h2>
                <ol className="list-none p-0 m-0 flex flex-col gap-4">
                  {paper.references.map((ref, i) => {
                    const text = typeof ref === 'string' ? ref : (ref.text || '');
                    const doi = typeof ref === 'object' && ref.doi ? ref.doi : null;
                    return (
                      <li key={i} className="text-sm text-gray-700 leading-7 text-justify">
                        {i + 1}. {text}
                        {doi && (
                          <><br />
                            <a href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer"
                              className="text-[#DD1215] underline">
                              doi:{doi}
                            </a>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            {/* Read More Like These */}
            {allPapers.length > 0 && (
              <div className="mt-10 pt-8 border-t border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Read More Like These</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {allPapers.map(p => (
                    <div
                      key={p._id}
                      onClick={() => navigate(`/readresearch/${p._id}`)}
                      className="border border-gray-200 p-5 cursor-pointer bg-white hover:shadow-md transition-shadow"
                    >
                      <h3 className="text-base font-bold text-gray-900 mb-1 leading-snug">{p.title}</h3>
                      <p className="text-xs text-[#DD1215] mb-1">{p.journalName || 'Journal Name'}</p>
                      <p className="text-xs text-gray-500 mb-3">
                        {Array.isArray(p.authors)
                          ? p.authors.map(a => typeof a === 'string' ? a : a?.name).filter(Boolean).join(', ')
                          : p.authors}
                      </p>
                      <div className="border-l-4 border-gray-200 pl-3 text-xs text-gray-600 leading-relaxed mb-3 line-clamp-3">
                        {p.abstract}
                      </div>
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-xs text-gray-400">{formatDate(p.publicationDate || p.datePublished)}</span>
                        <button className="border-2 border-gray-900 bg-transparent text-xs font-bold px-4 py-1.5 cursor-pointer hover:bg-black hover:text-white transition">
                          VIEW PAPER ›
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Membership sidebar — desktop only ── */}
          <div className="hidden md:block flex-shrink-0 w-72 sticky top-8">
            <MembershipCard />
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReadResearch;
