import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { fetchJob } from "../../services/CareerService";
import { steps, departments } from "../../constants/career";
import careerUrls from "../../utils/imagesUrls/carrerUrls.js";

// ─── DATA ──────────────────────────────────────────────────────────────────────

const WHY_ITEMS = [
  {
    label: "Learn from the Pros",
    img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80",
  },
  {
    label: "Real Work, Real Impact",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
  },
  {
    label: "Grow Your Skillset",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
  },
  {
    label: "Get Industry Ready",
    img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80",
  },
];

const ROLES = [
  { label: "UI\ndesigners",          seed: "ui-designer-male"    },
  { label: "UX\ndesigners",          seed: "ux-designer-female"  },
  { label: "Animator",               seed: "animator-red"        },
  { label: "Video\nEditors",         seed: "video-editor"        },
  { label: "Human\nResource",        seed: "hr-purple"           },
  { label: "Bloggers",               seed: "blogger-male"        },
  { label: "R&D",                    seed: "rnd-glasses"         },
  { label: "Graphic\nDesign",        seed: "graphic-design"      },
  { label: "Character\nDesigners",   seed: "character-designer"  },
  { label: "Comic\nArtist",          seed: "comic-artist"        },
  { label: "Content\nCreator",       seed: "content-creator-red" },
  { label: "Animation\nArtist",      seed: "animation-artist"    },
  { label: "Fashion\nCommunication", seed: "fashion-comm"        },
  { label: "Fashion\nDesign",        seed: "fashion-design"      },
  { label: "2D\nAnimator",           seed: "2d-animator-dark"    },
];

const VALUES = [
  { label: "Excellence"   },
  { label: "Integrity"    },
  { label: "Passion"      },
  { label: "Proactivity"  },
  { label: "Togetherness" },
  { label: "Trust"        },
];

const MENTORSHIP_POINTS = [
  {
    title: "Writing and Publishing Research Papers",
    desc: "Whether you're diving into AR storytelling or exploring 3D animation pipelines, our team helps you shape your ideas into compelling research topics.",
  },
  {
    title: "1:1 Mentorship from Industry Pros",
    desc: "Work closely with creative directors, senior artists, and technologists who've been there, done that — and are excited to help you grow.",
  },
  {
    title: "End-to-End Research Support",
    desc: "From ideation and structuring your paper to peer reviews, formatting, and submission — we're with you through it all.",
  },
  {
    title: "Get Published, Get Recognized",
    desc: "Selected research papers are submitted to top AVGC–XR journals and conferences — giving you real credibility, even before you graduate.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sujal Karande",
    role: "Ui/Ux Designer",
    quote: "\"At Infinito, I got to bring my character designs to life in an actual published comic. The mentorship was amazing!\"",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  },
  {
    name: "Priya Sharma",
    role: "2D Animator",
    quote: "\"Working on real animation projects from day one was something I never expected as an intern. Truly transformative.\"",
    img: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&q=80",
  },
  {
    name: "Rahul Mehta",
    role: "Web Developer",
    quote: "\"The team treated me like a full member from my very first week. I shipped features that are live in production today.\"",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
  },
];

const ACCORDION_ITEMS = [
  {
    title: "Duration",
    content: "3 to 6 months — flexible based on your academic calendar and role requirements.",
  },
  {
    title: "Location",
    content: "Hybrid – Work from our studio or remote (based on availability)",
  },
  {
    title: "Stipend",
    content: "Competitive stipend provided based on role and performance. Details shared during the offer stage.",
  },
  {
    title: "Eligibility",
    content: "Open to undergraduate and postgraduate students in design, animation, technology, marketing, and related fields.",
  },
  {
    title: "Tools Required",
    content: "Role-specific tools (e.g. Adobe Suite, Figma, Unity, VS Code). A laptop with minimum 8GB RAM is recommended.",
  },
];

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────────

// Section 1 — Hero
const Hero = ({ onApply }) => (
  <div
    className="w-full min-h-[520px] flex items-center bg-cover bg-center relative"
    style={{ backgroundImage: `url(${careerUrls.BANNER_URL})` }}
  >
    {/* dark overlay */}
    <div className="absolute inset-0 bg-black/55" />
    <div className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-8 md:px-12 py-16">
      <p className="text-red-500 font-bold text-sm tracking-widest mb-3 uppercase">
        Internship at Infinito Comics
      </p>
      <h1 className="text-white font-extrabold text-3xl sm:text-5xl leading-tight mb-5 max-w-3xl uppercase">
        Start Your Creative Journey With Infinito Comics
      </h1>
      <p className="text-gray-200 text-base sm:text-lg mb-8 max-w-md leading-relaxed">
        Get hands-on experience, learn from industry pros, and be part of
        real-world projects that shape the comic universe.
      </p>
      <button
        onClick={onApply}
        className="py-3 px-8 bg-red-600 text-white text-sm font-bold tracking-[3px] uppercase hover:bg-red-700 transition-colors"
      >
        Apply for Internship
      </button>
    </div>
  </div>
);

// Section 2 — Why Intern with Us
const WhyIntern = () => (
  <div className="w-full bg-white py-16">
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 md:px-12">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Why Intern with Us?</h2>
      <p className="text-center text-gray-500 mb-10">Focus on learning outcomes and industry exposure.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {WHY_ITEMS.map((item) => (
          <div key={item.label} className="relative overflow-hidden group h-56 sm:h-72">
            <img
              src={item.img}
              alt={item.label}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
            <span className="absolute bottom-4 left-4 text-white font-bold text-lg drop-shadow">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Section 3 — Internship Job Listings
const InternshipListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selectedDept, setSelectedDept] = useState("All Departments");

  // Track which job IDs the user has already applied for
  const [appliedIds, setAppliedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("appliedJobIds") || "[]");
    } catch {
      return [];
    }
  });

  // Listen for storage changes (jobs.jsx sets this after a successful submit)
  useEffect(() => {
    const onStorage = () => {
      try {
        setAppliedIds(JSON.parse(localStorage.getItem("appliedJobIds") || "[]"));
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    // Also poll every second in case same-tab storage event isn't fired
    const interval = setInterval(onStorage, 1000);
    return () => { window.removeEventListener("storage", onStorage); clearInterval(interval); };
  }, []);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetchJob();
        const raw = res?.data?.data;
        if (Array.isArray(raw)) {
          setJobs(
            raw
              .filter((j) => j.jobtypes?.trim() === "Internship")
              .map((j) => ({
                id: j._id,
                postDate: j.createdAt,
                title: j.jobtitle.trim(),
                description: j.description.trim(),
                department: j.department.trim(),
                jobType: j.jobtypes.trim(),
                positions: parseInt(j.position) || 1,
                tasks: Array.isArray(j.tasks) ? j.tasks : [],
                skills: Array.isArray(j.skills) ? j.skills : [],
              }))
          );
        }
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const allDepts = ["All Departments", ...new Set(jobs.map((j) => j.department))];
  const filtered = selectedDept === "All Departments" ? jobs : jobs.filter((j) => j.department === selectedDept);
  const filteredDepts = [...new Set(filtered.map((j) => j.department))];

  return (
    <div id="internship-listings" className="w-full bg-gray-50 py-10">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 md:px-12">
        {/* Header */}
        <div className="text-center py-10">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">Career opportunities</h2>
          <p className="text-gray-500 text-sm">
            Explore our intern roles for working totally remotely, from the office or somewhere in between.
          </p>
        </div>

        <div className="bg-white shadow-sm">
          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 py-4 border-b border-gray-100 gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <span className="text-sm font-semibold text-gray-700">Filter by</span>
              <select
                className="border border-gray-300 p-2 text-sm w-full sm:min-w-[180px] focus:outline-none"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                {allDepts.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select className="border border-gray-300 p-2 text-sm min-w-[180px] focus:outline-none" disabled>
                <option>All job types</option>
              </select>
            </div>
            <p className="text-sm text-gray-500 mt-3 sm:mt-0">
              {filtered.length} {filtered.length === 1 ? "position" : "positions"}
            </p>
          </div>

          {/* Listings */}
          <div className="pb-8">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : fetchError ? (
              <div className="flex justify-center items-center h-40 text-red-500 font-semibold">
                Could not load internships
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-500">
                <span>No internships match your filter.</span>
                <button onClick={() => setSelectedDept("All Departments")} className="text-sm text-red-600 underline">Clear filter</button>
              </div>
            ) : (
              filteredDepts.map((dept) => (
                <div key={dept} className="mb-10 px-6 pt-12">
                  <div className="border-t border-gray-200 relative mb-3">
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-red-600 text-white px-5 py-1 text-xs font-bold tracking-widest uppercase whitespace-nowrap">
                      {dept}
                    </span>
                  </div>
                  <div className="flex flex-col mt-10">
                    {filtered.filter((j) => j.department === dept).map((job) => (
                      <div key={job.id} className="flex justify-between items-center px-4 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                        <div className="text-gray-800 font-medium flex-1">{job.title}</div>
                        <div className="text-sm text-gray-500 w-32 text-center hidden sm:block">
                          {job.positions} {job.positions === 1 ? "position" : "positions"}
                        </div>
                        <div className="w-28 text-right">
                          {appliedIds.includes(job.id) ? (
                            <span className="text-green-600 font-semibold text-sm tracking-wide uppercase flex items-center justify-end gap-1">
                              <CheckCircle size={14} /> Applied
                            </span>
                          ) : (
                            <Link to="/careers/apply" state={{ job }} className="text-blue-700 font-semibold text-sm tracking-widest uppercase hover:text-blue-900">
                              APPLY &rsaquo;
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Section 4 — Hiring explained (reuse steps)
const HiringExplained = () => (
  <div className="w-full bg-white py-16">
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 md:px-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">Infinitos' hiring, explained</h2>
      <p className="text-center text-gray-500 text-sm mb-10">Not all heroes wear capes — but we do email back.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step) => (
          <div key={step.id} className="bg-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col items-start mb-5">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 font-medium text-sm mb-2">
                {step.id}
              </div>
              <h3 className="text-lg font-bold">{step.title}</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Section 5 — We are always hiring
const AlwaysHiring = () => (
  <div className="w-full bg-white py-16">
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 md:px-12 text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-3">We are always hiring!</h2>
      <p className="text-gray-500 mb-16 text-sm">Apply for a wide range of positions we have to offer</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12 justify-items-center">
        {ROLES.map((role) => (
          <div key={role.seed} className="flex flex-col items-center gap-2">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(role.seed)}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
              alt={role.label.replace("\n", " ")}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100"
            />
            <p className="text-xs md:text-sm text-gray-800 font-medium leading-snug text-center whitespace-pre-line">
              {role.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Section 6 — Our Values (SVG icons matching blue+orange design)
const VALUE_ICONS = {
  Excellence: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
      <path d="M40 8L46 28H68L50 40L57 60L40 48L23 60L30 40L12 28H34L40 8Z" stroke="#3B9ED4" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
      <circle cx="40" cy="38" r="5" fill="#F97316"/>
      <path d="M28 62L22 74M52 62L58 74" stroke="#3B9ED4" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M22 74H58" stroke="#3B9ED4" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  Integrity: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
      <circle cx="40" cy="22" r="12" stroke="#3B9ED4" strokeWidth="2.5"/>
      <circle cx="40" cy="22" r="3" fill="#F97316"/>
      <path d="M18 65C18 52 28 44 40 44C52 44 62 52 62 65" stroke="#3B9ED4" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M50 50L60 38" stroke="#3B9ED4" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M60 38L55 35" stroke="#3B9ED4" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M57 44L62 40" stroke="#3B9ED4" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="62" cy="36" r="3" fill="#F97316"/>
    </svg>
  ),
  Passion: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
      <path d="M40 68C40 68 12 50 12 30C12 20 20 12 30 14C35 15 38 18 40 22C42 18 45 15 50 14C60 12 68 20 68 30C68 50 40 68 40 68Z" stroke="#3B9ED4" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
      <circle cx="40" cy="30" r="4" fill="#F97316"/>
    </svg>
  ),
  Proactivity: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
      <circle cx="20" cy="40" r="4" fill="#F97316"/>
      <line x1="28" y1="30" x2="62" y2="30" stroke="#3B9ED4" strokeWidth="2.5" strokeLinecap="round"/>
      <polyline points="54,22 62,30 54,38" stroke="#3B9ED4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <line x1="28" y1="50" x2="62" y2="50" stroke="#3B9ED4" strokeWidth="2.5" strokeLinecap="round"/>
      <polyline points="54,42 62,50 54,58" stroke="#3B9ED4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  Togetherness: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
      <circle cx="40" cy="20" r="8" stroke="#3B9ED4" strokeWidth="2.5"/>
      <circle cx="40" cy="20" r="3" fill="#F97316"/>
      <circle cx="18" cy="30" r="7" stroke="#3B9ED4" strokeWidth="2.5"/>
      <circle cx="62" cy="30" r="7" stroke="#3B9ED4" strokeWidth="2.5"/>
      <path d="M8 65C8 55 13 48 20 46" stroke="#3B9ED4" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M72 65C72 55 67 48 60 46" stroke="#3B9ED4" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M26 65C26 53 32 46 40 46C48 46 54 53 54 65" stroke="#3B9ED4" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  Trust: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
      <rect x="10" y="20" width="60" height="45" rx="4" stroke="#3B9ED4" strokeWidth="2.5"/>
      <path d="M25 42C30 37 35 45 40 40C45 35 50 43 55 38" stroke="#3B9ED4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="40" cy="20" r="4" fill="#F97316"/>
      <path d="M30 20C30 14 34 10 40 10C46 10 50 14 50 20" stroke="#3B9ED4" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  ),
};

const OurValues = () => (
  <div className="w-full bg-white py-16">
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 md:px-12">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-14">Our Values</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 sm:gap-x-16 gap-y-10 sm:gap-y-14 max-w-3xl mx-auto">
        {VALUES.map((v) => (
          <div key={v.label} className="flex flex-col items-start gap-4">
            {VALUE_ICONS[v.label]}
            <span className="font-bold text-gray-900 text-sm">{v.label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Section 7 — Research & Mentorship
const MentorshipSupport = () => (
  <div className="w-full bg-white py-16">
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 md:px-12">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Research &amp; Mentorship Support</h2>
      <p className="text-center text-gray-500 text-sm mb-12">We don't just give you tasks — we help you build your future.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left text */}
        <div>
          <p className="text-gray-700 text-sm leading-relaxed mb-8">
            At Infinito Comics, our internship isn't just about executing projects — it's about
            discovering insights, asking bold questions, and pushing creative boundaries. That's
            why we offer personalized support for research and academic growth.
          </p>
          <div className="flex flex-col gap-6">
            {MENTORSHIP_POINTS.map((pt) => (
              <div key={pt.title} className="flex items-start gap-3">
                <CheckCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900 text-sm">{pt.title}</p>
                  <p className="text-gray-600 text-sm mt-0.5 leading-relaxed">{pt.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Right photo */}
        <img
          src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80"
          alt="Mentorship"
          className="rounded shadow-md object-cover w-full h-80 lg:h-[420px]"
        />
      </div>
    </div>
  </div>
);

// Section 8 — Testimonials
const Testimonials = () => {
  const [active, setActive] = useState(0);
  const t = TESTIMONIALS[active];

  return (
    <div className="w-full bg-white py-16">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 md:px-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Intern Testimonials</h2>
        <p className="text-center text-gray-500 text-sm mb-12">
          At Infinito, your career isn't a ladder. It's a universe — and you get to build it.
        </p>

        {/* Stacked card effect */}
        <div className="relative max-w-xl mx-auto">
          {/* Shadow cards behind */}
          <div className="absolute top-3 left-3 right-3 h-full bg-gray-100 rounded shadow-sm" />
          <div className="absolute top-1.5 left-1.5 right-1.5 h-full bg-gray-200 rounded shadow-sm" />

          {/* Main card */}
          <div className="relative bg-white rounded shadow-md p-8 flex flex-col sm:flex-row items-center gap-6 z-10">
            <img
              src={t.img}
              alt={t.name}
              className="w-24 h-24 rounded-full object-cover shrink-0 border-4 border-gray-100"
            />
            <div>
              <p className="text-gray-800 text-sm leading-relaxed mb-4 italic">{t.quote}</p>
              <p className="font-bold text-gray-900 text-sm">{t.name}</p>
              <p className="text-gray-500 text-xs">{t.role}</p>
              <button className="text-blue-600 text-xs mt-2 hover:underline">
                + Read {t.name.split(" ")[0]}'s story
              </button>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${i === active ? "bg-gray-700" : "bg-gray-300"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Section 9 — Internship Details accordion
const InternshipDetails = () => {
  const [open, setOpen] = useState(null);

  return (
    <div className="w-full bg-white py-16">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 md:px-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Internship Details</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left image */}
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80"
            alt="Internship details"
            className="rounded shadow-md object-cover w-full h-72 lg:h-[380px]"
          />

          {/* Right accordion */}
          <div className="divide-y divide-gray-200 border-t border-gray-200">
            {ACCORDION_ITEMS.map((item, i) => (
              <div key={item.title}>
                <button
                  className="w-full flex justify-between items-center py-4 text-left text-gray-800 font-medium text-sm hover:text-red-600 transition-colors"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  {item.title}
                  {open === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {open === i && (
                  <p className="pb-4 text-sm text-gray-600 leading-relaxed">{item.content}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PAGE SHELL ────────────────────────────────────────────────────────────────

const InternshipsPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToListings = () => {
    const el = document.getElementById("internship-listings");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Hero onApply={scrollToListings} />
      <WhyIntern />
      <InternshipListings />
      <HiringExplained />
      <AlwaysHiring />
      <OurValues />
      <MentorshipSupport />
      <Testimonials />
      <InternshipDetails />
    </>
  );
};

export default InternshipsPage;

