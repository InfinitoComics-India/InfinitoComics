import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { BACKEND_URL } from "../../Utils/constant";
import RichEditor from "../../components/RichEditor";

const ResearchManager = () => {
  const [papers, setPapers] = useState([]);
  const [mode, setMode] = useState("list");
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [form, setForm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, []);

  const fetchPapers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/research-papers`);
      const docs = res?.data?.data || res?.data?.docs || [];
      setPapers(docs);
    } catch (err) {
      toast.error("Failed to load papers.");
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleView = (paper) => {
    setSelectedPaper(paper);
    setMode("view");
  };

  const handleEdit = (paper) => {
    setForm({
      ...paper,
      publicationDate: paper.publicationDate?.substring(0, 10),
    });
    setSelectedPaper(paper);
    setMode("edit");
  };

const handleDelete = async (paperId) => {
  if (!window.confirm("Are you sure you want to delete this paper?")) return;

  try {
    await axios.delete(`${BACKEND_URL}/research-papers/${paperId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    toast.success("Paper deleted successfully");
    fetchPapers();
    setMode("list");
  } catch (err) {
    console.error("Delete failed:", err?.response?.data || err);
    toast.error("Failed to delete paper");
  }
};


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // For RichEditor fields — receives HTML string directly (not an event)
  const handleRichChange = (key, html) => {
    setForm((prev) => ({ ...prev, [key]: html }));
  };

  const handleAuthorChange = (index, field, value) => {
    const updated = [...form.authors];
    updated[index][field] = value;
    setForm({ ...form, authors: updated });
  };

  const addAuthor = () => {
    setForm({
      ...form,
      authors: [...form.authors, { name: "", email: "", affiliation: "" }],
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BACKEND_URL}/research-papers/${selectedPaper._id}`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      toast.success("Paper updated successfully!");
      fetchPapers();
      setMode("list");
    } catch (err) {
      console.error("Update failed", err?.response?.data || err);
      toast.error("Failed to update paper.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-black">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4 mt-20">
        <h1 className="text-3xl font-bold text-gray-800">Research Paper Manager</h1>
        <div className="flex flex-wrap gap-2">
          {["list", "view", "edit"].map((m) => (
            <button
              key={m}
              onClick={() => {
                if (m === "view" || m === "edit") {
                  if (!selectedPaper) return toast.error("Select a paper first");
                  m === "edit" ? handleEdit(selectedPaper) : setMode("view");
                } else {
                  setMode("list");
                }
              }}
              className={`px-4 py-2 rounded transition ${
                mode === m ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
          <button
            onClick={() => navigate("/research/create")}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
          >
            + Create New
          </button>
        </div>
      </div>

      {mode === "list" && (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {papers.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-12">
                <p className="text-xl mb-4">No research papers found.</p>
                <button
                  onClick={() => navigate("/research/create")}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition shadow"
                >
                  + Create Your First Paper
                </button>
              </div>
            ) : (
              papers.map((paper) => (
                <motion.div
                  key={paper._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <h2 className="text-xl font-bold text-blue-900 mb-2">{paper.title}</h2>
                    <p className="text-sm text-gray-500 mb-3">
                      {new Date(paper.publicationDate).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {paper.authors?.slice(0, 3)?.map((a, i) => (
                        <span
                          key={i}
                          className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                        >
                          {a.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3 items-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${paper.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {paper.isPublished ? "Published" : "Draft"}
                    </span>
                    <button
                      onClick={() => handleView(paper)}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(paper)}
                      className="text-green-600 font-medium hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(paper._id)}
                      className="text-red-600 font-medium hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}

      {mode === "view" && selectedPaper && (
        <div className="bg-white p-6 rounded shadow space-y-4 mt-4">
          <h2 className="text-2xl font-semibold text-gray-800">{selectedPaper.title}</h2>
          <p>
            <strong className="text-gray-700">Publication:</strong>{" "}
            {new Date(selectedPaper.publicationDate).toLocaleDateString()}
          </p>
          <p>
            <strong className="text-gray-700">Authors:</strong>{" "}
            {selectedPaper.authors.map((a) => a.name).join(", ")}
          </p>
          {selectedPaper.keywords?.length > 0 && (
            <p>
              <strong className="text-gray-700">Keywords:</strong>{" "}
              {selectedPaper.keywords.join(", ")}
            </p>
          )}
          <div className="grid gap-4 mt-4">
            {[
              { key: "abstract",           label: "Abstract" },
              { key: "introduction",       label: "Introduction" },
              { key: "literatureStudy",    label: "Literature Study/Review" },
              { key: "researchGap",        label: "Research Gap & Related Works" },
              { key: "objectives",         label: "Objectives" },
              { key: "methodology",        label: "Methodology" },
              { key: "surveyDataAnalysis", label: "Survey/Data Analysis" },
              { key: "experiments",        label: "Experiments" },
              { key: "experimentResults",  label: "Experiment Results" },
              { key: "discussion",         label: "Discussion" },
              { key: "conclusion",         label: "Conclusion" },
            ].map(({ key, label }) =>
              selectedPaper[key] ? (
                <div key={key}>
                  <h3 className="font-semibold border-b pb-1 text-gray-700">{label}</h3>
                  <div
                    className="text-gray-800 prose max-w-none mt-2"
                    dangerouslySetInnerHTML={{ __html: selectedPaper[key] }}
                  />
                </div>
              ) : null
            )}
          </div>
          {selectedPaper.references?.length > 0 && (
            <div>
              <h3 className="font-semibold border-b pb-1 text-gray-700">References</h3>
              <ol className="list-none mt-2 space-y-1">
                {selectedPaper.references.map((ref, i) => (
                  <li key={i} className="text-sm text-gray-700">
                    {i + 1}. {typeof ref === "string" ? ref : ref.text}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {mode === "edit" && form && (
        <form onSubmit={handleUpdate} className="bg-white p-6 mt-6 rounded shadow space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Paper</h2>

          {/* Title */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Title"
              className="w-full border px-4 py-2 rounded"
              required
            />
          </div>

          {/* Rich text sections */}
          {[
            { key: "abstract",           label: "Abstract",                     required: true },
            { key: "introduction",       label: "Introduction",                 required: true },
            { key: "literatureStudy",    label: "Literature Study/Review",      required: false },
            { key: "researchGap",        label: "Research Gap & Related Works", required: false },
            { key: "objectives",         label: "Objectives",                   required: false },
            { key: "methodology",        label: "Methodology",                  required: true },
            { key: "surveyDataAnalysis", label: "Survey/Data Analysis",         required: false },
            { key: "experiments",        label: "Experiments",                  required: false },
            { key: "experimentResults",  label: "Experiment Results",           required: false },
            { key: "discussion",         label: "Discussion",                   required: true },
            { key: "conclusion",         label: "Conclusion",                   required: true },
          ].map(({ key, label, required }) => (
            <div key={key} className="space-y-1">
              <label className="block font-semibold text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <RichEditor
                value={form[key] || ""}
                onChange={(html) => handleRichChange(key, html)}
                placeholder={`Enter ${label.toLowerCase()}…`}
              />
            </div>
          ))}

          {/* Keywords */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Keywords <span className="text-gray-400 font-normal text-sm">(comma-separated)</span>
            </label>
            <input
              type="text"
              name="keywords"
              value={Array.isArray(form.keywords) ? form.keywords.join(", ") : (form.keywords || "")}
              onChange={(e) => setForm((prev) => ({ ...prev, keywords: e.target.value.split(",").map(k => k.trim()).filter(Boolean) }))}
              placeholder="e.g. machine learning, neural networks"
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          {/* References */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              References <span className="text-gray-400 font-normal text-sm">(one per line)</span>
            </label>
            <textarea
              name="references"
              rows={6}
              value={
                Array.isArray(form.references)
                  ? form.references.map(r => typeof r === "string" ? r : r.text).join("\n")
                  : (form.references || "")
              }
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  references: e.target.value.split("\n").map(r => r.trim()).filter(Boolean).map(text => ({ text })),
                }))
              }
              placeholder={"[1] Author, Title, Journal, Year\n[2] Author, Title, Conference, Year"}
              className="w-full border px-4 py-2 rounded font-mono text-sm"
            />
          </div>

          {/* Publication date */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Publication Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="publicationDate"
              value={form.publicationDate}
              onChange={handleChange}
              className="border px-4 py-2 rounded"
              required
            />
          </div>

          {/* Publish toggle */}
          <div className="flex items-center gap-3">
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

          {/* Authors */}
          <div>
            <label className="font-semibold text-gray-700">Authors</label>
            {form.authors.map((author, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={author.name}
                  onChange={(e) => handleAuthorChange(i, "name", e.target.value)}
                  className="flex-1 border px-3 py-2 rounded"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={author.email}
                  onChange={(e) => handleAuthorChange(i, "email", e.target.value)}
                  className="flex-1 border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Affiliation"
                  value={author.affiliation}
                  onChange={(e) => handleAuthorChange(i, "affiliation", e.target.value)}
                  className="flex-1 border px-3 py-2 rounded"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addAuthor}
              className="mt-2 px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              + Add Author
            </button>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </form>
      )}
    </div>
  );
};

export default ResearchManager;
