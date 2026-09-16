import { useState } from "react";
import axios from "axios";
import bgImage from "../../../assets/Images/contact-us/contact-us banner.jpeg";
import avatar1 from "../../../assets/Images/contact-us/contact-us person1.jpeg";
import avatar2 from "../../../assets/Images/contact-us/contact-us person2.jpeg";
import avatar3 from "../../../assets/Images/contact-us/contact-us person3.jpeg";
import avatar4 from "../../../assets/Images/contact-us/contact-us person4.jpeg";

const TOPICS = [
  "Hiring",
  "Infinito Ultimate",
  "Request a Callback",
  "Internships",
  "Application Status",
  "Feedback or Suggestion",
  "Technical Issues",
  "Issue Not Listed",
];

const ContactUs = () => {
  const [email, setEmail] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleClear = () => {
    setEmail("");
    setSelectedTopic("");
    setCustomTopic("");
    setDetails("");
    setSubmitted(false);
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/contact-query`,
        { email, topic: selectedTopic, customTopic, details }
      );
      setSubmitted(true);
    } catch (err) {
      console.error("Contact form error:", err);
      setSubmitted(true); // still show confirmation to user
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* ── Hero Banner — 1920×512 aspect ratio ── */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "1920/551" }}>
        <img
          src={bgImage}
          alt="Support Banner"
          className="w-full h-full object-cover object-center brightness-40"
        />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <h1
            className="text-white text-center font-extrabold uppercase tracking-widest"
            style={{
              fontSize: "clamp(1.6rem, 5vw, 3rem)",
              fontFamily: "Impact, Arial Black, sans-serif",
              letterSpacing: "0.1em",
              textShadow: "0 2px 16px rgba(0,0,0,0.7)",
            }}
          >
            Welcome to Infinito Support
          </h1>
        </div>
      </div>

      {/* ── Main Section — grey bg ── */}
      <div className="w-full bg-gray-100 py-10 md:py-14">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading sits on grey, outside the white card */}
          <h2
            className="text-2xl sm:text-3xl font-extrabold uppercase mb-1"
            style={{ color: "#DD1215", fontFamily: "Impact, Arial Black, sans-serif", letterSpacing: "0.06em" }}
          >
            Contact Us
          </h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed max-w-sm">
            We're always happy to listen and discuss our products, services,
            or feedback. Let us know what's on your mind!
          </p>

          <div className="flex flex-col md:flex-row gap-6 items-start">

            {/* ── White form card ── */}
            <div className="w-full md:w-[58%] lg:w-[55%] bg-white px-6 py-7 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Your email address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition placeholder-gray-400 bg-white"
                  />
                </div>

                {/* Topic chips */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Select a topic:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TOPICS.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => setSelectedTopic(topic === selectedTopic ? "" : topic)}
                        className={`px-3 py-1 text-xs border transition ${
                          selectedTopic === topic
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-red-400 hover:text-red-600"
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom topic */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Or tell us what you need help with:
                  </label>
                  <input
                    type="text"
                    placeholder="Enter a topic"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition placeholder-gray-400 bg-white"
                  />
                </div>

                {/* Details */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Can you give us more details?
                  </label>
                  <textarea
                    rows={5}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition resize-none placeholder-gray-400 bg-white"
                    placeholder="Describe your issue or question..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-5 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-red-600 text-white text-xs font-bold tracking-widest uppercase px-7 py-2 hover:bg-red-700 transition disabled:opacity-60"
                  >
                    {loading ? "SENDING..." : "SEND \u203a"}
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-red-600 text-xs font-bold tracking-widest uppercase hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                {/* Success message — invisible until submitted, space always reserved */}
                <p className={`text-sm font-bold text-gray-900 leading-relaxed transition-opacity duration-300 ${submitted ? "opacity-100" : "opacity-0"}`}>
                  Thanks for reaching out. We've received your message and our team will get back to
                  you shortly. In the meantime, feel free to explore more of our universe!
                </p>
              </form>
            </div>

            {/* ── Right: Avatar cluster ── */}
            <div className="hidden md:flex flex-1 items-center justify-center">
              {/*
                Figma spec: Group 54 — 512px tall
                Proportional to viewport, all 4 tightly packed ~8px gaps
                P1 top-right: large (~140px)
                P2 mid-left:  medium (~110px)
                P3 mid-right: small  (~90px)
                P4 bottom-center: medium (~108px)
                All shapes: borderRadius "50% 50% 35% 35%" (arch/tombstone)
              */}
              <div className="relative" style={{ width: 280, height: 370 }}>

                {/* P1 — large — top right */}
                <div
                  className="absolute overflow-hidden shadow-md"
                  style={{
                    width: 140,
                    height: 140,
                    top: 0,
                    right: 0,
                    borderRadius: "50% 50% 35% 35%",
                  }}
                >
                  <img src={avatar1} alt="Support team" className="w-full h-full object-cover object-top" />
                </div>

                {/* P2 — medium — mid left */}
                <div
                  className="absolute overflow-hidden shadow-md"
                  style={{
                    width: 110,
                    height: 110,
                    top: 88,
                    left: 0,
                    borderRadius: "50% 50% 35% 35%",
                  }}
                >
                  <img src={avatar2} alt="Support team" className="w-full h-full object-cover object-top" />
                </div>

                {/* P3 — small — mid right, below P1 */}
                <div
                  className="absolute overflow-hidden shadow-md"
                  style={{
                    width: 90,
                    height: 90,
                    top: 152,
                    right: 4,
                    borderRadius: "50% 50% 35% 35%",
                  }}
                >
                  <img src={avatar3} alt="Support team" className="w-full h-full object-cover object-top" />
                </div>

                {/* P4 — medium — bottom center */}
                <div
                  className="absolute overflow-hidden shadow-md"
                  style={{
                    width: 108,
                    height: 108,
                    top: 250,
                    left: 60,
                    borderRadius: "50% 50% 35% 35%",
                  }}
                >
                  <img src={avatar4} alt="Support team" className="w-full h-full object-cover object-top" />
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Business Hours Banner ── */}
      <div className="w-full bg-gray-200 py-8 px-4 text-center">
        <p className="text-sm font-bold tracking-widest uppercase text-gray-700 mb-1">
          Our business hours:
        </p>
        <p className="text-sm text-gray-500">Monday – Friday, 9:00AM – 6:00PM CT</p>
      </div>
    </div>
  );
};

export default ContactUs;
