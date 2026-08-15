import React, { useState, useEffect } from "react";
import CarouselShimmer from "./Shimmer/CarouselShimmer";
import { readResearchService } from "../../services/readResearchService";
import { useNavigate } from "react-router-dom";

const DEMO_PAPERS = [
  { _id: "demo1", isDemo: true, title: "Title Of The Research Paper", keywords: ["Keywords, Keywords, Keywords..."], abstract: "Content Stuff. One Day Spiderman Ate A Spider, He Chocked On It, He Died. You Think That's The End. NAAAAH!! One Day Spiderman Ate A Spider, He Chocked On It, He Died. You Think That's The End." },
  { _id: "demo2", isDemo: true, title: "AI in Storytelling & Comics", keywords: ["AI, Technology, Comics..."], abstract: "Exploring how machine learning models augment human creativity in comics and animation." },
  { _id: "demo3", isDemo: true, title: "Future of Immersive Media", keywords: ["AVGC, XR, Immersive..."], abstract: "An exploration of extended reality technologies and their application in building the next generation of entertainment platforms." },
  { _id: "demo4", isDemo: true, title: "Psychology & Narrative Culture", keywords: ["Narrative, Emotion, Culture..."], abstract: "Understanding how narrative structures influence emotional responses in comic book audiences across South Asia." },
];

const InfinitoCarousel = ({ researchPaper, isLoading }) => {
  const [idx, setIdx] = useState(0);
  const navigate = useNavigate();
  const papers = Array.isArray(researchPaper) && researchPaper.length > 0 ? researchPaper : DEMO_PAPERS;
  const paper = papers[idx];

  useEffect(() => {
    const t = setInterval(() => setIdx(p => (p + 1) % papers.length), 4000);
    return () => clearInterval(t);
  }, [papers.length]);

  if (isLoading) return <CarouselShimmer />;

  const handleClick = async () => {
    if (paper.isDemo) return;
    try {
      const res = await readResearchService(paper._id);
      navigate(`/readresearch/${paper._id}`, { state: { paper: res.data } });
    } catch (e) { console.error(e); }
  };

  const getSubtitle = () => {
    const kw = paper.keywords;
    if (Array.isArray(kw) && kw.length > 0) {
      const s = kw.map(k => typeof k === 'string' ? k : (k?.word || '')).filter(Boolean).join(', ');
      if (s) return s;
    }
    const au = paper.authors;
    if (Array.isArray(au) && au.length > 0) {
      return au.map(a => typeof a === 'string' ? a : (a?.name || '')).filter(Boolean).join(', ');
    }
    return '';
  };

  return (
    <div style={{ background: "#f3f4f6" }}>

      {/* Gray spacer — only on desktop so card overlaps into it */}
      <div className="hidden md:block" style={{ height: "70px", background: "#f3f4f6" }} />

      {/* Full-width black band */}
      <div style={{ background: "#000", position: "relative" }}>

        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 clamp(1rem, 4vw, 3rem)",
          display: "flex",
          alignItems: "flex-start",
          position: "relative",
        }}>

          {/* LEFT: text — full width on mobile, 53% on desktop */}
          <div className="w-full md:w-[53%]" style={{ padding: "2rem clamp(0px,2vw,2rem) 2.5rem 0", flexShrink: 0 }}>

            {/* INFINITO RESEARCH heading */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1.3rem", flexWrap: "wrap", gap: "4px" }}>
              <span style={{
                background: "#DD1215", color: "#fff", fontWeight: 900,
                fontSize: "clamp(1.6rem, 4vw, 3rem)", letterSpacing: "0.05em",
                textTransform: "uppercase", padding: "3px 12px", lineHeight: 1.2,
              }}>INFINITO</span>
              <span style={{
                color: "#fff", fontWeight: 900,
                fontSize: "clamp(1.6rem, 4vw, 3rem)", letterSpacing: "0.05em",
                textTransform: "uppercase", paddingLeft: "8px", lineHeight: 1.2,
              }}>RESEARCH</span>
            </div>

            <p style={{ color: "#ccc", fontSize: "0.82rem", lineHeight: 1.75, marginBottom: "0.8rem" }}>
              Infinito Research &amp; Development fuels innovation in storytelling by integrating AI, ABM in
              AVGC‑XR industry, and emerging technologies. We focus on building scalable solutions that
              power growth across comics, animation, games, future technologies and immersive media.
            </p>
            <p style={{ color: "#ccc", fontSize: "0.82rem", lineHeight: 1.75, marginBottom: "2rem" }}>
              Our mission is to push the boundaries of creativity through data‑driven insights and
              intelligent systems. By blending imagination with technology, we aim to redefine the
              future of entertainment and human experiences.
            </p>

            {/* Dots */}
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {papers.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)} style={{
                  width: i === idx ? "26px" : "14px", height: "4px", borderRadius: "2px",
                  background: i === idx ? "#DD1215" : "#fff",
                  border: "none", padding: 0, cursor: "pointer", transition: "all 0.3s",
                }} />
              ))}
            </div>
          </div>

          {/* RIGHT: white card — full width below on mobile, 47% beside on desktop */}
          {/* On desktop: pulled up via negative marginTop to overlap into gray spacer */}
          <div
            className="w-full md:w-[47%]"
            style={{ flexShrink: 0, paddingLeft: "clamp(0px, 1.5vw, 1.5rem)" }}
          >
            {/* Negative margin only on md+ via inline style override via a wrapper */}
            <div className="md:-mt-[70px] md:-mb-8 mb-0">
              <div style={{
                background: "#fff",
                boxShadow: "0 4px 28px rgba(0,0,0,0.15)",
                padding: "1.5rem clamp(1rem, 2.5vw, 2.2rem)",
              }}>
                <h2 style={{ fontWeight: 800, fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)", color: "#111", lineHeight: 1.2, marginBottom: "0.5rem" }}>
                  {paper.title}
                </h2>
                <p style={{ fontSize: "0.95rem", color: "#aaa", marginBottom: "1rem", fontWeight: 400 }}>
                  {getSubtitle()}
                </p>
                <div style={{
                  borderLeft: "3px solid #d0d0d0", paddingLeft: "0.9rem",
                  fontSize: "0.85rem", color: "#555", lineHeight: 1.75, marginBottom: "1.6rem",
                  textAlign: "justify",
                  display: "-webkit-box", WebkitLineClamp: 7, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {paper.abstract}
                </div>
                <button onClick={handleClick} style={{
                  border: "2px solid #1a1a1a", background: "transparent", color: "#1a1a1a",
                  fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em",
                  padding: "0.6rem 1.6rem", cursor: paper.isDemo ? "default" : "pointer",
                  transition: "background 0.2s, color 0.2s",
                }}
                  onMouseEnter={e => { if (!paper.isDemo) { e.currentTarget.style.background = "#000"; e.currentTarget.style.color = "#fff"; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1a1a1a"; }}>
                  VIEW PAPER &rsaquo;
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InfinitoCarousel;
