import { useState } from 'react';
import axios from 'axios';
import maskGroup from '../../assets/Mask group.png';
import rectangle from '../../assets/Rectangle.png';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const TOPICS = [
  'Business', 'AI & Technology', 'Marketing & Sales',
  'Community', 'Society & Policy', 'Psychology & Culture',
  'Technical Issues', 'Cybersecurity',
];

const JoinAsResearcher = () => {
  const [form, setForm] = useState({ fullName: '', topics: [], email: '', details: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleTopic = (topic) => setForm(prev => ({
    ...prev,
    topics: prev.topics.includes(topic)
      ? prev.topics.filter(t => t !== topic)
      : [...prev.topics, topic],
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email) return;
    setSubmitting(true);
    setError('');
    try {
      await axios.post(`${BACKEND_URL}/research-application`, {
        fullName: form.fullName, topics: form.topics,
        email: form.email, details: form.details,
      });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ background: '#f3f4f6', padding: 'clamp(2rem, 5vw, 5rem) 0' }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 clamp(1rem, 4vw, 3rem)',
        display: 'flex',
        flexWrap: 'wrap',          /* stacks on mobile */
        gap: '2rem',
        alignItems: 'flex-start',
      }}>

        {/* ── LEFT: form ── */}
        <div style={{ flex: '1 1 300px', minWidth: 0 }}>
          <h2 style={{
            color: '#DD1215', fontWeight: 900,
            fontSize: 'clamp(1.8rem, 5vw, 3.5rem)',
            textTransform: 'uppercase', marginBottom: '0.6rem', lineHeight: 1.1,
          }}>JOIN AS RESEARCHER</h2>
          <p style={{ fontSize: '0.88rem', color: '#333', marginBottom: '1.8rem', lineHeight: 1.6 }}>
            We're always happy to listen and discuss your thoughts, ideas,
            or feedback. Let us know what's on your mind!
          </p>

          {submitted ? (
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'green', padding: '3rem 0' }}>
              Thank you! We'll be in touch soon.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ background: '#fff', padding: 'clamp(1rem, 3vw, 2rem)', boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>

                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#111', marginBottom: '7px' }}>Full Name</label>
                  <input type="text" placeholder="Your full name" value={form.fullName} required
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    style={{ width: '100%', border: '1px solid #ccc', padding: '11px 14px', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#111', marginBottom: '10px' }}>Select a topic:</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {TOPICS.map(topic => {
                      const active = form.topics.includes(topic);
                      return (
                        <button key={topic} type="button" onClick={() => toggleTopic(topic)} style={{
                          padding: '7px 14px', fontSize: '0.8rem', fontWeight: 500,
                          border: `1px solid ${active ? '#DD1215' : '#ccc'}`,
                          background: active ? '#DD1215' : '#fff',
                          color: active ? '#fff' : '#222',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}>{topic}</button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#111', marginBottom: '7px' }}>Your e-Mail ID:</label>
                  <input type="email" placeholder="you@example.com" value={form.email} required
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', border: '1px solid #ccc', padding: '11px 14px', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#111', marginBottom: '7px' }}>
                    Can you give us more details on your interest/research area (Max 500 words)?
                  </label>
                  <textarea placeholder="Enter a topic" rows={5} value={form.details}
                    onChange={e => setForm({ ...form, details: e.target.value })}
                    style={{ width: '100%', border: '1px solid #ccc', padding: '11px 14px', fontSize: '0.84rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
                  <button type="submit" disabled={submitting} style={{
                    background: '#DD1215', color: '#fff', border: 'none',
                    padding: '0.65rem 1.6rem', fontSize: '0.8rem', fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
                  }}>{submitting ? 'SENDING...' : 'SEND >'}</button>
                  <button type="button" onClick={() => { setForm({ fullName: '', topics: [], email: '', details: '' }); setError(''); }} style={{
                    background: 'none', border: 'none', fontSize: '0.8rem',
                    fontWeight: 700, color: '#333', cursor: 'pointer',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>CLEAR ALL</button>
                </div>
                {error && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.8rem' }}>{error}</p>}
              </div>
            </form>
          )}
        </div>

        {/* ── RIGHT: avatars — responsive grid on mobile, absolute on desktop ── */}
        <div className="hidden md:block" style={{ flex: '0 0 320px', position: 'relative', minHeight: '420px' }}>
          {/* Top-right — very large man */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.08)' }}>
            <img src={rectangle} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', display: 'block' }} />
          </div>
          {/* Middle-left */}
          <div style={{ position: 'absolute', top: '130px', left: 0, width: '155px', height: '155px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.08)' }}>
            <img src={maskGroup} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', display: 'block' }} />
          </div>
          {/* Middle-right */}
          <div style={{ position: 'absolute', top: '190px', right: '20px', width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.08)' }}>
            <img src={maskGroup} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
          </div>
          {/* Bottom-center */}
          <div style={{ position: 'absolute', top: '300px', left: '80px', width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.08)' }}>
            <img src={rectangle} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', display: 'block' }} />
          </div>
        </div>

        {/* Mobile: show avatars as a simple flex row */}
        <div className="flex md:hidden justify-center gap-4 w-full flex-wrap">
          {[rectangle, maskGroup, rectangle, maskGroup].map((src, i) => (
            <div key={i} style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default JoinAsResearcher;
