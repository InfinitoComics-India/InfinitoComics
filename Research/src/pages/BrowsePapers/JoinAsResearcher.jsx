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

/* Single avatar — perfect circle, no border */
const Circle = ({ src, size, top, left, right, objPos = 'center center' }) => (
  <div style={{
    position: 'absolute', top, left, right,
    width: size, height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
  }}>
    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: objPos, display: 'block' }} />
  </div>
);

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
    <section style={{ background: '#f3f4f6', padding: '4rem 0 5rem' }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '0 3rem',
        display: 'flex', gap: '3rem', alignItems: 'flex-start',
      }}>

        {/* ── LEFT ── */}
        <div style={{ flex: '0 0 62%', maxWidth: '62%' }}>
          <h2 style={{
            color: '#DD1215', fontWeight: 900,
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            textTransform: 'uppercase', marginBottom: '0.6rem', lineHeight: 1.1,
          }}>JOIN AS RESEARCHER</h2>
          <p style={{ fontSize: '0.88rem', color: '#333', marginBottom: '1.8rem', lineHeight: 1.6 }}>
            We're always happy to listen and discuss your thoughts, ideas,<br />
            or feedback. Let us know what's on your mind!
          </p>

          {submitted ? (
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'green', padding: '3rem 0' }}>
              Thank you! We'll be in touch soon.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ background: '#fff', padding: '1.8rem 2rem 2rem', boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>

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
                          padding: '7px 16px', fontSize: '0.8rem', fontWeight: 500,
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
                    Can you give us more details on you interest/research area (Max 500 words)?
                  </label>
                  <textarea placeholder="Enter a topic" rows={5} value={form.details}
                    onChange={e => setForm({ ...form, details: e.target.value })}
                    style={{ width: '100%', border: '1px solid #ccc', padding: '11px 14px', fontSize: '0.84rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
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

        {/* ── RIGHT: 4 circles matching reference layout ── */}
        <div style={{ flex: 1, position: 'relative', minHeight: '420px' }}>
          {/* Top-right — very large man */}
          <Circle src={rectangle} size="200px" top="0" right="0" />
          {/* Middle-left — large woman */}
          <Circle src={maskGroup} size="155px" top="130px" left="0" />
          {/* Middle-right — medium woman */}
          <Circle src={maskGroup} size="120px" top="190px" right="20px" objPos="center top" />
          {/* Bottom-center — medium man */}
          <Circle src={rectangle} size="120px" top="300px" left="80px" objPos="center 20%" />
        </div>

      </div>
    </section>
  );
};

export default JoinAsResearcher;
