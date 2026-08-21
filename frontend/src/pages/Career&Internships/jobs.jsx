import React, { useState, useEffect } from "react";
import axios from "axios";
import logo from "../../../assets/Logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, Clock, Briefcase, Globe, ArrowLeft, X, Upload, CheckCircle, AlertCircle } from "lucide-react";
import careerUrls from "../../utils/imagesUrls/carrerUrls.js";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ── Application Modal ──────────────────────────────────────────────
const ApplyModal = ({ job, onClose }) => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    portfolio: "",
    coverLetter: "",
    resume: null,
    portfolioPdf: null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState("");
  const [portfolioFileName, setPortfolioFileName] = useState("");
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, resume: file });
      setFileName(file.name);
    }
  };

  const handlePortfolioFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, portfolioPdf: file });
      setPortfolioFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      const formData = new FormData();
      formData.append("jobId",       job._id       || "");
      formData.append("jobTitle",    job.title     || "");
      formData.append("department",  job.department || "");
      formData.append("jobType",     job.jobType   || "");
      formData.append("fullName",    form.fullName);
      formData.append("email",       form.email);
      formData.append("phone",       form.phone);
      formData.append("linkedin",    form.linkedin);
      formData.append("portfolio",   form.portfolio);
      formData.append("coverLetter", form.coverLetter);
      if (form.resume) {
        formData.append("resume", form.resume);
      }
      if (form.portfolioPdf) {
        formData.append("portfolioPdf", form.portfolioPdf);
      }

      await axios.post(`${BASE_URL}/career/apply`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Mark this job as applied in localStorage so listings update immediately
      try {
        const existing = JSON.parse(localStorage.getItem("appliedJobIds") || "[]");
        if (job._id && !existing.includes(job._id)) {
          localStorage.setItem("appliedJobIds", JSON.stringify([...existing, job._id]));
        }
      } catch {}

      setSubmitted(true);
    } catch (err) {
      console.error("Application submission error:", err);
      setSubmitError(
        err?.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Prevent background scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Apply for {job.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{job.department} · {job.jobType}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {submitted ? (
          /* Success state */
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <CheckCircle size={56} className="text-green-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
            <p className="text-gray-600 mb-2">
              Thank you for applying for <strong>{job.title}</strong> at Infinito Comics.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              We'll review your application and get back to you within 5–7 business days.
            </p>
            <button
              onClick={onClose}
              className="py-3 px-8 bg-[#dd1215] text-white text-sm tracking-widest hover:bg-red-700 transition-colors"
            >
              CLOSE
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                placeholder="Your full name"
                className="w-full border border-gray-300 px-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@email.com"
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* LinkedIn + Portfolio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  name="linkedin"
                  value={form.linkedin}
                  onChange={handleChange}
                  placeholder="linkedin.com/in/yourprofile"
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio / Website</label>
                <input
                  type="url"
                  name="portfolio"
                  value={form.portfolio}
                  onChange={handleChange}
                  placeholder="yourportfolio.com"
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resume / CV <span className="text-red-500">*</span>
              </label>
              <label className="flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-md px-4 py-4 cursor-pointer hover:border-red-400 transition-colors">
                <Upload size={20} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">
                    {fileName ? fileName : "Click to upload PDF, DOC, or DOCX"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Max 5 MB</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFile}
                  required
                  className="hidden"
                />
              </label>
            </div>

            {/* Portfolio PDF Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Portfolio PDF <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <label className="flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-md px-4 py-4 cursor-pointer hover:border-red-400 transition-colors">
                <Upload size={20} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">
                    {portfolioFileName ? portfolioFileName : "Click to upload Portfolio PDF"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">PDF only · Max 10 MB</p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePortfolioFile}
                  className="hidden"
                />
              </label>
            </div>

            {/* Cover Letter */}
              <textarea
                name="coverLetter"
                value={form.coverLetter}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us why you're a great fit for this role..."
                className="w-full border border-gray-300 px-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              {submitError && (
                <div className="flex items-center gap-2 mb-3 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                  <AlertCircle size={16} className="shrink-0" />
                  {submitError}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 text-white text-sm tracking-[3px] uppercase transition-colors ${
                  submitting ? "bg-red-300 cursor-not-allowed" : "bg-[#dd1215] hover:bg-red-700"
                }`}
              >
                {submitting ? "SUBMITTING..." : "SUBMIT APPLICATION"}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                By submitting, you agree to our Privacy Policy and consent to Infinito Comics storing your data for recruitment purposes.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────
const Jobs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { job } = location.state || {};
  const [showApply, setShowApply] = useState(false);

  // Check if this specific job was already applied for
  const [alreadyApplied, setAlreadyApplied] = useState(() => {
    try {
      const ids = JSON.parse(localStorage.getItem("appliedJobIds") || "[]");
      return job?._id ? ids.includes(job._id) : false;
    } catch { return false; }
  });

  // Update when localStorage changes (e.g. after modal submission)
  useEffect(() => {
    const refresh = () => {
      try {
        const ids = JSON.parse(localStorage.getItem("appliedJobIds") || "[]");
        setAlreadyApplied(job?._id ? ids.includes(job._id) : false);
      } catch {}
    };
    window.addEventListener("storage", refresh);
    const interval = setInterval(refresh, 800);
    return () => { window.removeEventListener("storage", refresh); clearInterval(interval); };
  }, [job?._id]);

  if (!job) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex flex-col items-center justify-center gap-6 px-4">
        <h2 className="text-2xl font-bold text-gray-800">No job selected</h2>
        <p className="text-gray-600">Please browse open positions and click Apply.</p>
        <button
          onClick={() => navigate("/careers")}
          className="flex items-center gap-2 py-3 px-6 bg-[#dd1215] text-white text-sm tracking-widest hover:bg-red-700 transition-colors"
        >
          <ArrowLeft size={16} />
          BACK TO CAREERS
        </button>
      </div>
    );
  }

  const formatDate = (rawDate) => {
    if (!rawDate) return "Posted date not available";
    const dateObj = new Date(rawDate);
    return isNaN(dateObj.getTime())
      ? "Posted date not available"
      : `Posted on ${dateObj.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`;
  };

  return (
    <>
      {showApply && <ApplyModal job={job} onClose={() => setShowApply(false)} />}

      {/* Hero Banner */}
      <div
        className="flex justify-start items-center w-full h-72 sm:h-80 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${careerUrls.INFINITO_BANNER})` }}
      >
        <h1 className="font-sans font-extrabold text-2xl sm:text-4xl text-red-600 tracking-[0.2em] scale-y-110 px-6 sm:px-12 md:px-20">
          INFINITO COMICS
        </h1>
      </div>

      {/* Back link */}
      <div className="bg-[#f3f3f3] px-4 sm:px-6 md:px-10 pt-6">
        <button
          onClick={() => navigate("/careers")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-2"
        >
          <ArrowLeft size={16} />
          Back to Careers
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-[#f3f3f3] min-h-screen p-4 sm:p-6 md:p-10 pt-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Content */}
          <div className="bg-white shadow-lg p-6 rounded-md lg:col-span-2">
            <div className="flex flex-col gap-4">

              {/* Title + Apply */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{job.title}</h1>
                  <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    {job.department}
                  </span>
                </div>
                <button
                  onClick={() => !alreadyApplied && setShowApply(true)}
                  disabled={alreadyApplied}
                  className={`self-start sm:self-auto py-2 px-5 sm:py-3 sm:px-7 text-white text-xs sm:text-sm tracking-[3px] transition-colors whitespace-nowrap ${
                    alreadyApplied
                      ? "bg-green-600 cursor-default"
                      : "bg-[#dd1215] hover:bg-red-700"
                  }`}
                >
                  {alreadyApplied ? "✓ APPLIED" : "APPLY >"}
                </button>
              </div>

              <hr className="border-t border-gray-200" />

              {/* Meta info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base text-gray-700">
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-gray-400 shrink-0" />
                  <span>{job.jobType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={18} className="text-gray-400 shrink-0" />
                  <span>{job.positions} {job.positions === 1 ? "position" : "positions"} open</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={18} className="text-gray-400 shrink-0 mt-0.5" />
                  <span>GE Road, Near Raj Kumar College, Raipur, Chhattisgarh 492001</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-gray-400 shrink-0" />
                  <span>{formatDate(job.postDate)}</span>
                </div>
              </div>

              {/* Job Details */}
              <div>
                <h2 className="text-blue-800 font-bold text-lg mt-4 mb-1">Job Details</h2>
                <p className="text-base text-gray-700 leading-relaxed">{job.description}</p>
              </div>

              {/* Tasks */}
              <div>
                <h3 className="text-lg font-semibold mt-4 mb-2">What you will be doing</h3>
                <ul className="list-disc list-outside text-base text-gray-700 space-y-1.5 pl-5">
                  {Array.isArray(job.tasks) && job.tasks.length > 0 ? (
                    job.tasks.map((task, idx) => <li key={idx}>{task}</li>)
                  ) : (
                    <li className="text-gray-400">No tasks listed.</li>
                  )}
                </ul>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-lg font-semibold mt-4 mb-2">What you should have</h3>
                <ul className="list-disc list-outside text-base text-gray-700 space-y-1.5 pl-5">
                  {Array.isArray(job.skills) && job.skills.length > 0 ? (
                    job.skills.map((skill, idx) => <li key={idx}>{skill}</li>)
                  ) : (
                    <li className="text-gray-400">No skills listed.</li>
                  )}
                </ul>
              </div>

              {/* Bottom Apply */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => !alreadyApplied && setShowApply(true)}
                  disabled={alreadyApplied}
                  className={`py-3 px-8 text-white text-sm tracking-[3px] transition-colors ${
                    alreadyApplied
                      ? "bg-green-600 cursor-default"
                      : "bg-[#dd1215] hover:bg-red-700"
                  }`}
                >
                  {alreadyApplied ? "✓ APPLIED" : "APPLY >"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="bg-white shadow-lg p-4 sm:p-6 lg:p-8 rounded-md h-fit self-start sticky top-6">
            <h2 className="font-bold text-lg mb-4">About Us</h2>
            <div className="text-center mb-4">
              <img src={logo} alt="Infinito Comics" className="h-12 object-contain mx-auto" />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              India's most prominent character-based entertainment company with a library of
              more than 2500+ superheroes. We are committed to bringing you the best in
              Comics, Animation, Games, and Merchandise.
            </p>
            <p className="text-sm text-gray-700 font-semibold leading-relaxed">
              Discover our passion, expertise, and mission to revolutionise the world of AVGC–XR!
            </p>
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Role</span>
                <span className="font-medium text-gray-800 text-right max-w-[60%]">{job.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Department</span>
                <span className="font-medium text-gray-800">{job.department}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type</span>
                <span className="font-medium text-gray-800">{job.jobType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Openings</span>
                <span className="font-medium text-gray-800">{job.positions}</span>
              </div>
            </div>
            <button
              onClick={() => !alreadyApplied && setShowApply(true)}
              disabled={alreadyApplied}
              className={`mt-6 w-full py-3 text-white text-sm tracking-[3px] transition-colors ${
                alreadyApplied
                  ? "bg-green-600 cursor-default"
                  : "bg-[#dd1215] hover:bg-red-700"
              }`}
            >
              {alreadyApplied ? "✓ APPLIED" : "APPLY NOW >"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default Jobs;
