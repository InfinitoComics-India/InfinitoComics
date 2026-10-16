import React, { useState } from "react";

const questions = [
  ["What is Infinito Foundation?", "Infinito Foundation is a platform focused on creating opportunities through education, sports, research, innovation, and social welfare."],
  ["What is Infinito primary focus area?", "The Foundation supports young talent and helps individuals unlock their potential through focused initiatives and fellowships."],
  ["Which type of support Infinito Foundation can provide?", "Support can include education funding, sports fellowships, research fellowships, mentorship, and collaboration opportunities."],
  ["Who can be the part of Infinito Foundation?", "Students, researchers, athletes, organisations, contributors, and partners who share the Foundation's purpose can participate."],
  ["How Infinito is going to create hope and encourages innovation for better tomorrow?", "By connecting people with resources, funding ideas, supporting talent, and building partnerships that create lasting social impact."],
];

const FoundationFaq = () => {
  const [openItems, setOpenItems] = useState([]);
  const allOpen = openItems.length === questions.length;

  const toggleItem = (index) => {
    setOpenItems((current) => current.includes(index)
      ? current.filter((item) => item !== index)
      : [...current, index]);
  };

  const toggleAll = () => setOpenItems(allOpen ? [] : questions.map((_, index) => index));

  return (
    <section className="foundation-faq" aria-labelledby="faq-title">
      <div className="foundation-faq-header">
        <h2 id="faq-title">Frequently asked questions</h2>
        <button type="button" onClick={toggleAll}>{allOpen ? "Collapse all" : "Expand all"} <span>⌄</span></button>
      </div>
      <div className="foundation-faq-list">
        {questions.map(([question, answer], index) => {
          const isOpen = openItems.includes(index);
          return (
            <div className={`foundation-faq-item ${isOpen ? "is-open" : ""}`} key={question}>
              <button type="button" onClick={() => toggleItem(index)} aria-expanded={isOpen}>
                <span>{question}</span>
                <strong aria-hidden="true">{isOpen ? "−" : "+"}</strong>
              </button>
              {isOpen && <p>{answer}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FoundationFaq;