import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import mammoth from "mammoth";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { MdCloudUpload, MdClose, MdEdit, MdDelete, MdAdd } from "react-icons/md";
import { FaImage } from "react-icons/fa";
import { BACKEND_URL } from "../../Utils/constant";
import RichEditor from "../../components/RichEditor";

const CATEGORIES = [
  "Infinito Originals",
  "News",
  "Anime",
  "Comics",
  "Characters",
  "Movies & Series",
  "Games",
  "Reviews",
  "Industry",
  "Technology",
  "Research"
];

const EMPTY_FORM = {
  title: "",
  category: "Anime",
  coverImage: "",
  content: "",
  authorName: "Admin",
  publicationDate: new Date().toISOString().substring(0, 10),
  isPublished: true,
};

const CreateBlog = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const imageFileInputRef = useRef(null);

  const [mode, setMode] = useState("create"); // 'create' | 'manage'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingBlog, setEditingBlog] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Blogs list state for 'manage' mode
  const [allBlogs, setAllBlogs] = useState([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false);

  const getAuthToken = () => {
    const t = localStorage.getItem("authToken");
    if (!t || t === "undefined" || t === "null") return null;
    return t;
  };

  // ── Fetch all blogs ────────────────────────────────────────────
  const fetchAllBlogs = async () => {
    setIsLoadingBlogs(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/blog/getallblog`);
      const blogs = res?.data?.data || [];
      // Sort newest first
      const sorted = [...blogs].sort((a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setAllBlogs(sorted);
    } catch (err) {
      console.error("Fetch blogs error:", err);
      toast.error("Failed to load blogs.");
    } finally {
      setIsLoadingBlogs(false);
    }
  };

  useEffect(() => {
    if (mode === "manage") {
      fetchAllBlogs();
    }
  }, [mode]);

  // ── Word doc parser (preserves HTML bold, italic, headings) ────
  const handleWordUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".docx")) {
      toast.error("Please upload a .docx file");
      return;
    }

    setParsing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();

      // Convert Word doc to HTML to preserve bold, italic, headings, lists, tables
      const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
      const html = htmlResult.value;

      // Extract raw text for title detection
      const textResult = await mammoth.extractRawText({ arrayBuffer });
      const lines = textResult.value.split("\n").map((l) => l.trim()).filter(Boolean);
      const extractedTitle = lines[0] || file.name.replace(/\.docx$/i, "");

      setForm((prev) => ({
        ...prev,
        title: prev.title || extractedTitle,
        content: html,
      }));

      toast.success("Document parsed — all formatting preserved!");
    } catch (err) {
      console.error("Word parse error", err);
      toast.error("Failed to parse document. Please fill in manually.");
    } finally {
      setParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Form handlers ──────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, coverImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleApplyImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setForm((prev) => ({ ...prev, coverImage: imageUrlInput.trim() }));
    setImageUrlInput("");
  };

  const removeCoverImage = () => {
    setForm((prev) => ({ ...prev, coverImage: "" }));
    if (imageFileInputRef.current) imageFileInputRef.current.value = "";
  };

  const handleStartEdit = (blog) => {
    setEditingBlog(blog);
    setForm({
      title: blog.title || "",
      category: blog.category || "Anime",
      coverImage: blog.coverImage || blog.news?.[0]?.imageUrl || "",
      content: blog.content || (blog.news ? blog.news.map((n) => n.story).join("<br/><br/>") : ""),
      authorName: blog.authorName || "Admin",
      publicationDate: blog.createdAt ? blog.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10),
      isPublished: blog.published !== undefined ? blog.published : blog.status === "published",
    });
    setMode("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingBlog(null);
    setForm(EMPTY_FORM);
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog permanently?")) return;

    const token = getAuthToken();
    if (!token) {
      toast.error("Admin login required");
      return;
    }

    try {
      await axios.delete(`${BACKEND_URL}/blog/deleteblog/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Blog deleted successfully!");
      setAllBlogs((prev) => prev.filter((b) => b._id !== blogId));
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error(err?.response?.data?.message || "Failed to delete blog.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Please enter a blog title");
      return;
    }

    const stripped = form.content.replace(/<[^>]*>/g, "").trim();
    if (!stripped && !form.content.includes("<img")) {
      toast.error("Please write some content for the blog");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error("Admin session expired. Please log in again.");
      return;
    }

    const cleanSubject = stripped.replace(/&nbsp;/g, " ").substring(0, 160);

    const payload = {
      title: form.title.trim(),
      category: form.category,
      coverImage: form.coverImage,
      content: form.content,
      authorName: form.authorName || "Admin",
      published: form.isPublished,
      status: form.isPublished ? "published" : "draft",
      subject: cleanSubject,
      news: form.coverImage || form.content ? [{ imageUrl: form.coverImage, story: form.content }] : [],
    };

    setIsSubmitting(true);
    try {
      if (editingBlog) {
        // Update blog
        await axios.put(`${BACKEND_URL}/blog/updateblog/${editingBlog._id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        toast.success("Blog updated successfully!");
        setEditingBlog(null);
      } else {
        // Create new blog
        await axios.post(`${BACKEND_URL}/blog/createblog`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        toast.success(form.isPublished ? "Blog published successfully!" : "Draft saved successfully!");
      }

      setForm(EMPTY_FORM);
      if (imageFileInputRef.current) imageFileInputRef.current.value = "";
    } catch (err) {
      console.error("Error saving blog:", err);
      toast.error(err?.response?.data?.message || "Failed to save blog.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto bg-white shadow-lg rounded-xl pt-24 min-h-screen">
      <Toaster position="top-right" />

      {/* ── Top Bar with Mode Switch ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {editingBlog ? "Edit Blog" : mode === "create" ? "Create Blog" : "Manage Blogs"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Publish comics, anime, news, and character stories with rich formatting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("create");
              if (!editingBlog) setForm(EMPTY_FORM);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
              mode === "create"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <MdAdd className="text-base" />
            {editingBlog ? "Edit Mode" : "Create New"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("manage");
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              mode === "manage"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Manage All Blogs ({allBlogs.length})
          </button>
        </div>
      </div>

      {/* ── Currently editing alert ── */}
      {editingBlog && (
        <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-3 text-blue-900 font-medium">
            <MdEdit className="text-xl text-blue-600" />
            <span>
              Currently editing: <strong>{editingBlog.title}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="text-sm text-blue-700 hover:text-blue-900 underline font-semibold"
          >
            Cancel Edit
          </button>
        </div>
      )}

      {/* ── MODE 1: CREATE / EDIT FORM ── */}
      {mode === "create" && (
        <>
          {/* Word doc upload section */}
          <div className="mb-8 p-5 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm font-semibold text-blue-800 mb-1">
              📄 Auto-fill from Word Document
            </p>
            <p className="text-xs text-blue-600 mb-3">
              Upload a <strong>.docx</strong> file to automatically import your article. Bold, italic,
              headings, lists, and tables will be preserved and populated into the rich editor below.
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
                onClick={() => {
                  setForm(EMPTY_FORM);
                  setEditingBlog(null);
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition bg-white"
              >
                Clear form
              </button>
            </div>
          </div>

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. The Evolution of Spider-Man in Modern Comics"
                className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-semibold text-base"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image <span className="text-gray-400 font-normal text-xs">(optional, displayed at top of blog)</span>
              </label>

              {form.coverImage ? (
                <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-h-72 flex items-center justify-center mb-3">
                  <img
                    src={form.coverImage}
                    alt="Cover Preview"
                    className="max-h-72 w-full object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={removeCoverImage}
                    className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition flex items-center justify-center cursor-pointer"
                    title="Remove image"
                  >
                    <MdClose size={18} />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    onClick={() => imageFileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
                  >
                    <div className="p-3 bg-gray-100 rounded-full text-gray-600">
                      <MdCloudUpload size={28} />
                    </div>
                    <span className="font-semibold text-gray-700 text-sm">
                      Click to upload cover image
                    </span>
                    <span className="text-xs text-gray-400">PNG, JPG, WebP supported</span>
                  </div>

                  <input
                    ref={imageFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />

                  {/* Or URL Input */}
                  <div className="flex gap-2 items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase">or URL:</span>
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="https://res.cloudinary.com/... or image link"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyImageUrl}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-black text-white text-xs font-semibold rounded-lg transition"
                    >
                      Set URL
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Content with RichEditor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content <span className="text-red-500">*</span>
              </label>
              <RichEditor
                value={form.content}
                onChange={(html) => setForm((prev) => ({ ...prev, content: html }))}
                placeholder="Write your blog article here… Headings, bold, italic, lists, quotes, tables, and images are supported."
              />
            </div>

            {/* Author Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                <input
                  type="text"
                  name="authorName"
                  value={form.authorName}
                  onChange={handleChange}
                  placeholder="Admin"
                  className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                />
              </div>

              {/* Publication Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Publication Date</label>
                <input
                  type="date"
                  name="publicationDate"
                  value={form.publicationDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                />
              </div>
            </div>

            {/* Publish Toggle */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-sm font-medium text-gray-700">Publish this blog?</span>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, isPublished: !prev.isPublished }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    form.isPublished ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      form.isPublished ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span
                  className={`text-sm font-semibold ${
                    form.isPublished ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {form.isPublished ? "Published" : "Draft"}
                </span>
              </div>

              {/* Submit / Update Button */}
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition shadow disabled:opacity-50 cursor-pointer text-base"
                >
                  {isSubmitting
                    ? "Saving…"
                    : editingBlog
                    ? "Update Blog"
                    : form.isPublished
                    ? "Publish Blog"
                    : "Save as Draft"}
                </button>

                {editingBlog && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 font-semibold transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </>
      )}

      {/* ── MODE 2: MANAGE ALL BLOGS ── */}
      {mode === "manage" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              All Created Blogs ({allBlogs.length})
            </h2>
            <button
              type="button"
              onClick={fetchAllBlogs}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Refresh List
            </button>
          </div>

          {isLoadingBlogs ? (
            <div className="text-center py-16 text-gray-500 font-medium">Loading blogs…</div>
          ) : allBlogs.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl text-gray-500">
              <p className="text-lg font-semibold mb-2">No blogs found.</p>
              <button
                type="button"
                onClick={() => setMode("create")}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
              >
                + Create Your First Blog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allBlogs.map((blog) => {
                const cover = blog.coverImage || blog.news?.[0]?.imageUrl || "";
                const isPub =
                  blog.published !== undefined ? blog.published : blog.status === "published";

                return (
                  <div
                    key={blog._id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {cover ? (
                        <img
                          src={cover}
                          alt={blog.title}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                          <FaImage size={30} />
                        </div>
                      )}

                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs uppercase">
                            {blog.category || "Comics"}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              isPub
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {isPub ? "Published" : "Draft"}
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-900 text-base line-clamp-2 mb-1">
                          {blog.title}
                        </h3>

                        <p className="text-gray-400 text-xs mt-2">
                          {blog.createdAt
                            ? `${new Date(blog.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-gray-100 flex items-center justify-between gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(blog)}
                        className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition text-center cursor-pointer flex items-center justify-center gap-1"
                      >
                        <MdEdit /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBlog(blog._id)}
                        className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition text-center cursor-pointer flex items-center justify-center gap-1"
                      >
                        <MdDelete /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateBlog;
