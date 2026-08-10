import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';import { readResearchService } from '../../services/readResearchService';
import { researchBrowse } from '../../services/browseService';

const ReadResearch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [paper, setPaper] = useState(null);
  const [allPapers, setAllPapers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 3rem' }}>

        {/* Back to Home */}
        <div style={{ padding: '1.2rem 0', borderBottom: '1px solid #eee' }}>
          <button
            onClick={() => navigate('/browseResearch')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.82rem', color: '#333', display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            ← BACK TO HOME
          </button>
        </div>

        {/* Main layout */}
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', padding: '2.5rem 0 4rem' }}>

          {/* ── LEFT: Paper content ── */}
          <div style={{ flex: '1 1 0', minWidth: 0 }}>

            {/* Journal | Date */}
            <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '0.5rem' }}>
              <span style={{ color: '#DD1215', fontStyle: 'italic', fontWeight: 600 }}>
                {paper.journalName || 'Journal'}
              </span>
              {' '}| {formatDate(paper.publicationDate || paper.datePublished)}
            </p>

            {/* Title */}
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111', lineHeight: 1.25, marginBottom: '0.6rem' }}>
              {paper.title}
            </h1>

            {/* Authors */}
            {authorNames && (
              <p style={{ fontSize: '1rem', color: '#555', marginBottom: '1.2rem' }}>
                {authorNames}
              </p>
            )}

            {/* Views counter */}
            <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '0.8rem 0', marginBottom: '1.8rem' }}>
              <div>
                <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#DD1215', borderLeft: '4px solid #eee', paddingLeft: '0.6rem' }}>
                  {paper.views || 0}
                </span>
                <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>Views</p>
              </div>
            </div>

            {/* Abstract */}
            {paper.abstract && (
              <div style={{ marginBottom: '1.8rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111', marginBottom: '0.6rem' }}>Abstract</h2>
                <div style={{ fontSize: '0.9rem', color: '#333', lineHeight: 1.75, textAlign: 'justify' }}
                  dangerouslySetInnerHTML={{ __html: paper.abstract }} />
              </div>
            )}

            {/* Keywords */}
            {paper.keywords?.length > 0 && (
              <div style={{ marginBottom: '1.8rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111', marginBottom: '0.4rem' }}>Keywords:</h3>
                <p style={{ fontSize: '0.88rem', color: '#444', lineHeight: 1.7 }}>
                  {paper.keywords.map(k => typeof k === 'string' ? k : (k?.word || '')).filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            {/* Introduction with fade/unlock */}
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

            {/* Other sections when unlocked */}
            {isUnlocked && ['relatedWork', 'methodology', 'experimentalResults', 'discussion', 'conclusion'].map(key => (
              paper[key] ? (
                <div key={key} style={{ marginBottom: '1.8rem' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111', marginBottom: '0.6rem', textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </h2>
                  <div style={{ fontSize: '0.9rem', color: '#333', lineHeight: 1.75, textAlign: 'justify' }}
                    dangerouslySetInnerHTML={{ __html: paper[key] }} />
                </div>
              ) : null
            ))}

            {/* Get Full Access CTA */}
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

            {/* References */}
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

            {/* Read More Like These */}
            {allPapers.length > 0 && (
              <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111', marginBottom: '1.5rem' }}>Read More Like These</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

          {/* ── RIGHT: Research Membership card ── */}
          <div style={{ flexShrink: 0, width: '280px', position: 'sticky', top: '2rem' }}>
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
                onClick={() => navigate('/checkout')}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadResearch;
