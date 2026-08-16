import React, { useState, useRef } from "react";
import axios from "axios";
import mammoth from "mammoth";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { BACKEND_URL } from "../../Utils/constant";
import RichEditor from "../../components/RichEditor";

// Map Word document heading/section names to form field keys
const SECTION_MAP = {
  "title":                "title",
  "abstract":             "abstract",
  "introduction":         "introduction",
  "related work":         "relatedWork",
  "relatedwork":          "relatedWork",
  "methodology":          "methodology",
  "experimental results": "experimentalResults",
  "experimentalresults":  "experimentalResults",
  "results":              "experimentalResults",
  "discussion":           "discussion",
  "conclusion":           "conclusion",
  "conclusions":          "conclusion",
};

// Extract authors from lines like "Author: John Doe, john@email.com, MIT"
const parseAuthors = (text) => {
  const authorSection = text.match(/authors?[:\s]+([\s\S]*?)(?=\n[A-Z]|\n\d\.|\n---|\n\n[A-Z]|$)/i);
  if (!authorSection) return null;

  const lines = authorSection[1].split("\n").filter(Boolean);
  return lines.map((line) => {
    const parts = line.split(",").map((p) => p.trim());
    return {
      name:        parts[0] || "",
      email:       parts[1] || "",
      affiliation: parts[2] || "",
    };
  }).filter((a) => a.name);
};

const EMPTY_FORM = {
  title: "",
  abstract: "",
  introduction: "",
  relatedWork: "",
  methodology: "",
  experimentalResults: "",
  discussion: "",
  conclusion: "",
  publicationDate: "",
  isPublished: false,
  authors: [{ name: "", email: "", affiliation: "" }],
};

const PaperCreate = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [parsing, setParsing] = useState(false);

  // ── Word doc parser ────────────────────────────────────────────
  const handleWordUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".docx")) {
      toast.error("Please upload a .docx file");
      return;
    }

    setParsing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const rawText = result.value;

      // Split on lines and parse section by section
      const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
      const extracted = { ...EMPTY_FORM };
      let currentSection = null;
      let buffer = [];

      const flushBuffer = () => {
        if (currentSection && buffer.length > 0) {
          extracted[currentSection] = buffer.join("\n").trim();
        }
        buffer = [];
      };

      for (const line of lines) {
        const lower = line.toLowerCase().replace(/[^a-z ]/g, "").trim();
        const mapped = SECTION_MAP[lower];

        if (mapped) {
          flushBuffer();
          currentSection = mapped;
        } else if (currentSection) {
          buffer.push(line);
        } else {
          // Before any heading — treat as title if title is empty
          if (!extracted.title) extracted.title = line;
        }
      }
      flushBuffer();

      // Try to parse authors block
      const parsedAuthors = parseAuthors(rawText);
      if (parsedAuthors && parsedAuthors.length > 0) {
        extracted.authors = parsedAuthors;
      }

      setForm(extracted);
      toast.success("Document parsed — please review and submit");
    } catch (err) {
      console.error("Word parse error", err);
      toast.error("Failed to parse document. Please fill in manually.");
    } finally {
      setParsing(false);
      // Reset file input so same file can be re-uploaded
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Form handlers ──────────────────────────────────────────────
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAuthorChange = (index, field, value) => {
    const updatedAuthors = [...form.authors];
    updatedAuthors[index][field] = value;
    setForm({ ...form, authors: updatedAuthors });
  };

  const addAuthor = () =>
    setForm({ ...form, authors: [...form.authors, { name: "", email: "", affiliation: "" }] });

  const removeAuthor = (index) =>
    setForm({ ...form, authors: form.authors.filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`${BACKEND_URL}/research-papers`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      toast.success("Research paper created successfully!");
      setTimeout(() => navigate("/research"), 1500);
    } catch (err) {
      console.error("Error creating paper", err);
      toast.error("Failed to create research paper.");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto bg-white shadow-lg rounded-xl pt-24">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Research Paper</h1>

      {/* ── Word upload section ── */}
      <div className="mb-8 p-5 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm font-semibold text-blue-800 mb-1">
          📄 Auto-fill from Word Document
        </p>
        <p className="text-xs text-blue-600 mb-3">
          Upload a <strong>.docx</strong> file with section headings (Title, Abstract,
          Introduction, Related Work, Methodology, Experimental Results, Discussion, Conclusion).
          The form will be filled automatically.
        </p>
        <div className="flex items-center gap-4">
          <label
            htmlFor="wordUpload"
            className={`cursor-pointer px-5 py-2 rounded-md text-sm font-semibold text-white transition ${
              parsing ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {parsing ? "Parsing…" : "Upload .docx"}
          </label>
          <input
            id="wordUpload"
            ref={fileInputRef}
            type="file"
            accept=".docx"
            className="hidden"
            onChange={handleWordUpload}
            disabled={parsing}
          />
          <button
            type="button"
            onClick={() => setForm(EMPTY_FORM)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition"
          >
            Clear form
          </button>
        </div>
      </div>

      {/* ── Main form ── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Text sections */}
        {[
          { key: "abstract",             label: "Abstract" },
          { key: "introduction",         label: "Introduction" },
          { key: "relatedWork",          label: "Related Work" },
          { key: "methodology",          label: "Methodology" },
          { key: "experimentalResults",  label: "Experimental Results" },
          { key: "discussion",           label: "Discussion" },
          { key: "conclusion",           label: "Conclusion" },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <RichEditor
              value={form[key]}
              onChange={(html) => setForm((prev) => ({ ...prev, [key]: html }))}
              placeholder={`Enter ${label.toLowerCase()}…`}
            />
          </div>
        ))}

        {/* Publication date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Publication Date</label>
          <input
            type="date"
            name="publicationDate"
            value={form.publicationDate}
            onChange={handleChange}
            className="border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        {/* Authors */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Authors</h2>
          <div className="space-y-4">
            {form.authors.map((author, i) => (
              <div key={i} className="bg-gray-50 border rounded-md p-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={author.name}
                      onChange={(e) => handleAuthorChange(i, "name", e.target.value)}
                      className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={author.email}
                      onChange={(e) => handleAuthorChange(i, "email", e.target.value)}
                      className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Affiliation</label>
                    <input
                      type="text"
                      value={author.affiliation}
                      onChange={(e) => handleAuthorChange(i, "affiliation", e.target.value)}
                      className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                {form.authors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAuthor(i)}
                    className="mt-3 text-xs text-red-500 hover:underline"
                  >
                    Remove author
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addAuthor}
            className="mt-4 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 transition"
          >
            Add Another Author
          </button>
        </div>

        <div className="pt-6">
          {/* Publish toggle */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm font-medium text-gray-700">Publish this paper?</span>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, isPublished: !prev.isPublished }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                form.isPublished ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.isPublished ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-sm font-semibold ${form.isPublished ? "text-green-600" : "text-gray-400"}`}>
              {form.isPublished ? "Published" : "Draft"}
            </span>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition"
          >
            Submit Research Paper
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaperCreate;
