import React from 'react';
import { Search } from 'lucide-react';

const PaperSearchBar = ({ searchText, setSearchText, authorText, setAuthorText, yearText, setYearText }) => {
  return (
    <div style={{ padding: '2.5rem 0 0' }}>
      {/* Title */}
      <h2 style={{
        fontSize: '1.3rem', fontWeight: 900, letterSpacing: '0.15em',
        textTransform: 'uppercase', color: '#111', marginBottom: '1.2rem',
      }}>
        SEARCH FOR PAPERS
      </h2>

      {/* Fields row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', flexWrap: 'wrap' }}>

        {/* Domain/Topic/Article */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: '150px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 500, color: '#333' }}>
            Search by Domain, Topic, Article
          </label>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: '100%', border: '1px solid #bbb', background: '#fff',
              padding: '10px 12px', fontSize: '0.82rem', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Author */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: '150px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 500, color: '#333' }}>
            Author
          </label>
          <input
            type="text"
            value={authorText}
            onChange={(e) => setAuthorText(e.target.value)}
            style={{
              width: '100%', border: '1px solid #bbb', background: '#fff',
              padding: '10px 12px', fontSize: '0.82rem', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Year of Publication */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: '150px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 500, color: '#333' }}>
            Year of Publication
          </label>
          <input
            type="text"
            value={yearText}
            onChange={(e) => setYearText(e.target.value)}
            style={{
              width: '100%', border: '1px solid #bbb', background: '#fff',
              padding: '10px 12px', fontSize: '0.82rem', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Red SEARCH button */}
        <button style={{
          background: '#DD1215', color: '#fff', border: 'none',
          padding: '10px 22px', fontSize: '0.75rem', fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '7px',
          height: '42px', flexShrink: 0,
        }}>
          <Search size={14} />
          SEARCH
        </button>
      </div>
    </div>
  );
};

export default PaperSearchBar;
