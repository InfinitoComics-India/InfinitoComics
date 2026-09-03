import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { readResearchService } from '../../services/readResearchService';
import { researchBrowse } from '../../services/browseService';

const ReadResearch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Check subscription from localStorage
  useEffect(() => {
    const subscribed = localStorage.getItem('researchSubscribed') === 'true';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (subscribed || user?.researchSubscribed) {
      setIsUnlocked(true);
    }
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
    <div style={{ padding: '4rem', textAlign: 'center', color: '#888' }}>Loading...</div>
  );

  if (!paper) return (
    <div style={{ padding: '4rem', textAlign: 'center', color: 'red' }}>Research paper not found.</div>
  );

  const authorNames = Array.isArray(paper.authors)
    ? paper.authors.map(a => typeof a === 'string' ? a : (a?.name || '')).filter(Boolean).join(', ')
    : paper.authors || '';

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const MembershipCard = () => (
    <div style={{ border: '1px solid #eee', padding: '1.8rem', background: '#fff' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#DD1215', lineHeight: 1.2, marginBottom: '1rem' }}>
        Research Membership
      </h2>
      <p style={{ fontSize: '2rem', fontWeight: 800, color: '#111', marginBottom: '0.2rem' }}>₹49</p>
      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111', marginBottom: '1.2rem' }}>Membership Benefits</p>

      {[
        { title: 'UNLIMITED READING >', desc: 'Explore All Our Research, Insights, And Findings' },
        { title: 'DOWNLOAD PDFs >', desc: 'Access Offline Copies Anytime, Anywhere' },
        { title: 'CONTRIBUTE IN RESEARCH >', desc: 'The Description Of The Plan. How To Use It, Is It Available' },
        { title: 'EARLY ACCESS >', desc: 'Be The First To Explore New Studies And Innovations' },
        { title: 'EXCLUSIVE UPDATES >', desc: 'Stay Informed With The Latest Breakthroughs In AI, AR/VR, And Future Tech' },
      ].map((item, i) => (
        <div key={i} style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#DD1215', letterSpacing: '0.05em', marginBottom: '2px' }}>{item.title}</p>
          <p style={{ fontSize: '0.78rem', color: '#444', lineHeight: 1.5 }}>{item.desc}</p>
        </div>
      ))}

      <button
        onClick={() => {
          const user = localStorage.getItem('user');
          if (user) {
            // Already logged in — go straight to payment (step 2)
            navigate('/checkout', { state: { skipToPayment: true } });
          } else {
            // Not logged in — go to login step first
            navigate('/checkout');
          }
        }}
        style={{
          width: '100%', marginTop: '1rem',
          border: '2px solid #111', background: 'transparent', color: '#111',
          fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', padding: '0.7rem 1rem', cursor: 'pointer',
          transition: 'background 0.2s, color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#111'; }}
      >
        GET FULL ACCESS &rsaquo;
      </button>
    </div>
  );

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 3rem)' }}>

        {/* Back to Home */}
        <div style={{ padding: '1.2rem 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.82rem', color: '#333', display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            ← BACK TO HOME
          </button>
          {/* Mobile membership toggle */}
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: '#DD1215', color: '#fff', border: 'none',
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em',
              padding: '0.5rem 1rem', cursor: 'pointer',
            }}
          >
            {sidebarOpen ? 'HIDE MEMBERSHIP' : 'VIEW MEMBERSHIP ₹49'}
          </button>
        </div>

        {/* Mobile membership panel */}
        {sidebarOpen && (
          <div className="md:hidden" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <MembershipCard />
          </div>
        )}

        {/* Main layout — stacks on mobile */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '3rem',
          alignItems: 'flex-start',
          padding: '2.5rem 0 4rem',
        }}>

          {/* ── LEFT: Paper content ── */}
          <div style={{ flex: '1 1 280px', minWidth: 0 }}>

            <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '0.5rem' }}>
              <span style={{ color: '#DD1215', fontStyle: 'italic', fontWeight: 600 }}>
                {paper.journalName || 'Journal'}
              </span>
              {' '}| {formatDate(paper.publicationDate || paper.datePublished)}
            </p>

            <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, color: '#111', lineHeight: 1.25, marginBottom: '0.6rem' }}>
              {paper.title}
            </h1>

            {authorNames && (
              <p style={{ fontSize: '1rem', color: '#555', marginBottom: '1.2rem' }}>
                {authorNames}
              </p>
            )}

            <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '0.8rem 0', marginBottom: '1.8rem' }}>
              <div>
                <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#DD1215', borderLeft: '4px solid #eee', paddingLeft: '0.6rem' }}>
                  {paper.views || 0}
                </span>
                <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>Views</p>
              </div>
            </div>

            {paper.abstract && (
              <div style={{ marginBottom: '1.8rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111', marginBottom: '0.6rem' }}>Abstract</h2>
                <div style={{ fontSize: '0.9rem', color: '#333', lineHeight: 1.75, textAlign: 'justify' }}
                  dangerouslySetInnerHTML={{ __html: paper.abstract }} />
              </div>
            )}

            {paper.keywords?.length > 0 && (
              <div style={{ marginBottom: '1.8rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111', marginBottom: '0.4rem' }}>Keywords:</h3>
                <p style={{ fontSize: '0.88rem', color: '#444', lineHeight: 1.7 }}>
                  {paper.keywords.map(k => typeof k === 'string' ? k : (k?.word || '')).filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            {paper.introduction && (
              <div style={{ marginBottom: '1.8rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111', marginBottom: '0.6rem' }}>Introduction</h2>
                <div style={{ position: 'relative', overflow: 'hidden', maxHeight: isUnlocked ? 'none' : '200px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#333', lineHeight: 1.75, textAlign: 'justify' }}
                    dangerouslySetInnerHTML={{ __html: paper.introduction }} />
                  {!isUnlocked && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
                      background: 'linear-gradient(to top, #fff, transparent)',
                    }} />
                  )}
                </div>
              </div>
            )}

            {isUnlocked && [
              { key: 'literatureStudy',   label: 'Literature Study/Review' },
              { key: 'researchGap',       label: 'Research Gap & Related Works' },
              { key: 'objectives',        label: 'Objectives' },
              { key: 'methodology',       label: 'Methodology' },
              { key: 'surveyDataAnalysis',label: 'Survey/Data Analysis' },
              { key: 'experiments',       label: 'Experiments' },
              { key: 'experimentResults', label: 'Experiment Results' },
              { key: 'discussion',        label: 'Discussion' },
              { key: 'conclusion',        label: 'Conclusion' },
            ].map(({ key, label }) => (
              paper[key] ? (
                <div key={key} style={{ marginBottom: '1.8rem' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111', marginBottom: '0.6rem' }}>
                    {label}
                  </h2>
                  <div style={{ fontSize: '0.9rem', color: '#333', lineHeight: 1.75, textAlign: 'justify' }}
                    dangerouslySetInnerHTML={{ __html: paper[key] }} />
                </div>
              ) : null
            ))}

            {!isUnlocked && (
              <div style={{ textAlign: 'center', margin: '1.5rem 0 2rem' }}>
                <button
                  onClick={() => navigate('/checkout')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: '#111',
                  }}
                >
                  GET FULL ACCESS &gt;
                </button>
              </div>
            )}

            {paper.references?.length > 0 && (
              <div style={{ marginTop: '2rem', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111', marginBottom: '1rem' }}>References</h2>
                <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {paper.references.map((ref, i) => {
                    const text = typeof ref === 'string' ? ref : `${ref.text || ''}`;
                    const doi = typeof ref === 'object' && ref.doi ? ref.doi : null;
                    return (
                      <li key={i} style={{ fontSize: '0.85rem', color: '#333', lineHeight: 1.7, textAlign: 'justify' }}>
                        {i + 1}. {text}
                        {doi && (
                          <><br />
                            <a href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer"
                              style={{ color: '#DD1215', textDecoration: 'underline' }}>
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

            {/* Read More Like These — 1 col on mobile, 2 col on md+ */}
            {allPapers.length > 0 && (
              <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111', marginBottom: '1.5rem' }}>Read More Like These</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {allPapers.map(p => (
                    <div
                      key={p._id}
                      onClick={() => navigate(`/readresearch/${p._id}`)}
                      style={{ border: '1px solid #eee', padding: '1.2rem', cursor: 'pointer', background: '#fff' }}
                    >
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111', marginBottom: '0.3rem' }}>{p.title}</h3>
                      <p style={{ fontSize: '0.78rem', color: '#DD1215', marginBottom: '0.2rem' }}>{p.journalName || 'Journal Name'}</p>
                      <p style={{ fontSize: '0.78rem', color: '#555', marginBottom: '0.8rem' }}>
                        {Array.isArray(p.authors) ? p.authors.map(a => typeof a === 'string' ? a : a?.name).filter(Boolean).join(', ') : p.authors}
                      </p>
                      <div style={{ borderLeft: '3px solid #ccc', paddingLeft: '0.6rem', fontSize: '0.78rem', color: '#444', lineHeight: 1.6, marginBottom: '0.8rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.abstract}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#888' }}>{formatDate(p.publicationDate || p.datePublished)}</span>
                        <button style={{ border: '2px solid #111', background: 'transparent', fontSize: '0.7rem', fontWeight: 700, padding: '0.4rem 1rem', cursor: 'pointer' }}>
                          VIEW PAPER &rsaquo;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Membership card — desktop only (sticky) ── */}
          <div className="hidden md:block" style={{ flexShrink: 0, width: '280px', position: 'sticky', top: '2rem' }}>
            <MembershipCard />
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReadResearch;
