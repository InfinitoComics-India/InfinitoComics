import React, { useState, useEffect, useRef } from 'react';
import { MdVisibility, MdSend, MdCloudUpload, MdClose, MdEdit, MdDelete } from 'react-icons/md';
import { PiFloppyDiskDuotone } from 'react-icons/pi';
import { FaChevronUp, FaImage } from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { BACKEND_URL } from '../../Utils/constant.js';
import RichEditor from '../../components/RichEditor.jsx';

const MySwal = withReactContent(Swal);

const CATEGORIES = [
  'Anime & Manga',
  'Comics',
  'Characters',
  'Movies & Series',
  'News',
  'Reviews',
  'Industry',
];

const showAlert = (type, customMsg) => {
  const config = {
    icon: 'success',
    title: '',
    html: '',
    showConfirmButton: true,
    confirmButtonText: 'Great!',
    confirmButtonColor: '#DD1215',
  };

  switch (type) {
    case 'published':
      config.title = 'Blog Published!';
      config.html = `<strong>Your blog has been <span style="color:#16a34a;">successfully published</span>!</strong>`;
      config.icon = 'success';
      config.confirmButtonColor = '#16a34a';
      break;
    case 'draft':
      config.title = ' Draft Saved!';
      config.html = `<strong>Your blog draft has been <span style="color:#2563eb;">saved</span>!</strong>`;
      config.icon = 'info';
      config.confirmButtonColor = '#2563eb';
      break;
    case 'updated':
      config.title = ' Blog Updated!';
      config.html = `<strong>Your blog changes have been <span style="color:#2563eb;">saved successfully</span>!</strong>`;
      config.icon = 'info';
      config.confirmButtonColor = '#2563eb';
      break;
    case 'deleted':
      config.title = ' Blog Deleted!';
      config.html = `<strong>The blog has been <span style="color:#dc2626;">permanently removed</span>.</strong>`;
      config.icon = 'warning';
      config.confirmButtonColor = '#dc2626';
      break;
    case 'error':
      config.title = ' Error';
      config.html = customMsg || 'Something went wrong.';
      config.icon = 'error';
      config.confirmButtonColor = '#dc2626';
      break;
    default:
      config.title = ' Success';
      config.html = customMsg || 'Operation completed successfully!';
  }

  MySwal.fire(config);
};

const CreateBlog = () => {
  const getAuthToken = () => {
    const t = localStorage.getItem('authToken');
    if (!t || t === 'undefined' || t === 'null') {
      return null;
    }
    return t;
  };

  const requireLoginPrompt = () => {
    MySwal.fire({
      icon: 'warning',
      title: ' Admin Login Required',
      html: 'Your session is missing or invalid. Please log in as an Admin to create or modify blogs.',
      showCancelButton: true,
      confirmButtonText: 'Go to Login',
      confirmButtonColor: '#DD1215',
      cancelButtonText: 'Stay Here',
    }).then((res) => {
      if (res.isConfirmed) {
        window.location.href = '/login';
      }
    });
  };

  // The 5 core fields
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Character');
  const [published, setPublished] = useState(true);

  // UI state
  const [editingBlog, setEditingBlog] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [allBlogs, setAllBlogs] = useState([]);
  const [showBlogs, setShowBlogs] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination for all blogs list
  const [currentPage, setCurrentPage] = useState(0);
  const blogsPerPage = 6;
  const startIndex = currentPage * blogsPerPage;
  const totalPages = Math.ceil(allBlogs.length / blogsPerPage);
  const currentBlogs = allBlogs.slice(startIndex, startIndex + blogsPerPage);

  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const blogSectionRef = useRef(null);

  // Load saved local draft on initial mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('comicBlogDraft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.coverImage) setCoverImage(parsed.coverImage);
        if (parsed.content) setContent(parsed.content);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.published !== undefined) setPublished(parsed.published);
      } catch (err) {
        console.error('Error loading draft from localStorage', err);
      }
    }
  }, []);

  // Handle local image file upload -> Base64
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle setting image URL directly
  const handleApplyImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setCoverImage(imageUrlInput.trim());
    setImageUrlInput('');
  };

  const removeCoverImage = () => {
    setCoverImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Save draft locally
  const handleSaveLocalDraft = () => {
    if (!title.trim() && !content.trim() && !coverImage) {
      alert('Cannot save an empty draft. Please add content before saving.');
      return;
    }

    const draftData = {
      title,
      coverImage,
      content,
      category,
      published,
    };
    localStorage.setItem('comicBlogDraft', JSON.stringify(draftData));
    showAlert('draft');
  };

  // Reset form
  const handleResetForm = () => {
    const confirmReset = window.confirm('Are you sure you want to reset all form fields?');
    if (!confirmReset) return;

    localStorage.removeItem('comicBlogDraft');
    setTitle('');
    setCoverImage('');
    setContent('');
    setCategory('Marvel');
    setPublished(true);
    setEditingBlog(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Cancel editing mode
  const handleCancelEdit = () => {
    setEditingBlog(null);
    setTitle('');
    setCoverImage('');
    setContent('');
    setCategory('Marvel');
    setPublished(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Fetch all blogs
  const handleGetAllBlogs = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/blog/getallblog`);
      const result = await response.json();
      if (response.ok && result.data) {
        setAllBlogs(result.data);
      } else {
        alert(`Error fetching blogs: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Fetch blogs error:', err);
      alert('Failed to connect to server when fetching blogs.');
    }
  };

  // Submit new blog
  const handleSubmitBlog = async (e) => {
    e?.preventDefault?.();

    if (!title.trim()) {
      alert('Please enter a blog title.');
      return;
    }

    if (!category) {
      alert('Please select a category.');
      return;
    }

    // Strip HTML to verify text presence
    const strippedContent = content.replace(/<[^>]*>/g, '').trim();
    if (!strippedContent && !content.includes('<img')) {
      alert('Please write some content for the blog.');
      return;
    }

    const payload = {
      title: title.trim(),
      coverImage: coverImage.trim(),
      content,
      category,
      published: Boolean(published),
      status: published ? 'published' : 'draft',
      subject: strippedContent.substring(0, 160),
      authorName: 'Admin',
      news: coverImage || content ? [{ imageUrl: coverImage, story: content }] : [],
    };

    const activeToken = getAuthToken();
    if (!activeToken) {
      requireLoginPrompt();
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/blog/createblog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.status === 401) {
        MySwal.fire({
          icon: 'error',
          title: 'Session Expired or Invalid Token',
          html: `${result.message || 'Your session has expired or token is invalid.'}<br/>Please log in again.`,
          showCancelButton: true,
          confirmButtonText: 'Log In Now',
          confirmButtonColor: '#DD1215',
          cancelButtonText: 'Cancel',
        }).then((r) => {
          if (r.isConfirmed) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
          }
        });
        return;
      }

      if (response.ok) {
        showAlert(published ? 'published' : 'draft');
        localStorage.removeItem('comicBlogDraft');
        setTitle('');
        setCoverImage('');
        setContent('');
        setCategory('Marvel');
        setPublished(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setShowPreview(false);
        // Refresh blog list if open
        if (showBlogs) handleGetAllBlogs();
      } else {
        showAlert('error', result.message || 'Failed to create blog');
      }
    } catch (err) {
      console.error('Create blog error:', err);
      showAlert('error', 'Network error while creating blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing blog
  const handleUpdateBlog = async (e) => {
    e?.preventDefault?.();

    if (!editingBlog) return;

    if (!title.trim()) {
      alert('Please enter a blog title.');
      return;
    }

    const strippedContent = content.replace(/<[^>]*>/g, '').trim();

    const payload = {
      title: title.trim(),
      coverImage: coverImage.trim(),
      content,
      category,
      published: Boolean(published),
      status: published ? 'published' : 'draft',
      subject: strippedContent.substring(0, 160),
      authorName: editingBlog.authorName || 'Admin',
      news: coverImage || content ? [{ imageUrl: coverImage, story: content }] : [],
    };

    const activeToken = getAuthToken();
    if (!activeToken) {
      requireLoginPrompt();
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/blog/updateblog/${editingBlog._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.status === 401) {
        MySwal.fire({
          icon: 'error',
          title: 'Session Expired or Invalid Token',
          html: `${result.message || 'Your session has expired or token is invalid.'}<br/>Please log in again.`,
          showCancelButton: true,
          confirmButtonText: 'Log In Now',
          confirmButtonColor: '#DD1215',
          cancelButtonText: 'Cancel',
        }).then((r) => {
          if (r.isConfirmed) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
          }
        });
        return;
      }

      if (response.ok) {
        showAlert('updated');
        setEditingBlog(null);
        setTitle('');
        setCoverImage('');
        setContent('');
        setCategory('Marvel');
        setPublished(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setShowPreview(false);
        if (showBlogs) handleGetAllBlogs();
      } else {
        showAlert('error', result.message || 'Failed to update blog');
      }
    } catch (err) {
      console.error('Update blog error:', err);
      showAlert('error', 'Network error while updating blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete blog
  const handleDeleteBlog = async (blogId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this blog permanently?');
    if (!confirmDelete) return;

    const activeToken = getAuthToken();
    if (!activeToken) {
      requireLoginPrompt();
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/blog/deleteblog/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
      });

      const result = await response.json();
      if (response.status === 401) {
        MySwal.fire({
          icon: 'error',
          title: 'Session Expired or Invalid Token',
          html: `${result.message || 'Your session has expired or token is invalid.'}<br/>Please log in again.`,
          showCancelButton: true,
          confirmButtonText: 'Log In Now',
          confirmButtonColor: '#DD1215',
          cancelButtonText: 'Cancel',
        }).then((r) => {
          if (r.isConfirmed) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
          }
        });
        return;
      }

      if (response.ok) {
        showAlert('deleted');
        setAllBlogs((prev) => prev.filter((b) => b._id !== blogId));
      } else {
        showAlert('error', result.message || 'Failed to delete blog');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showAlert('error', 'Network error while deleting blog');
    }
  };

  // Edit blog - populate form
  const handleStartEdit = (blog) => {
    setEditingBlog(blog);
    setTitle(blog.title || '');
    setCoverImage(blog.coverImage || blog.news?.[0]?.imageUrl || '');
    setContent(blog.content || (blog.news ? blog.news.map((n) => n.story).join('<br/><br/>') : ''));
    setCategory(blog.category || 'Marvel');
    setPublished(blog.published !== undefined ? blog.published : blog.status === 'published');

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="bg-[#f8f9fc] min-h-screen pt-20 pb-16 font-sans">
      <div ref={formRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <span></span> {editingBlog ? 'Edit Blog' : 'Create Blog'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Publish comic blogs, news, reviews, and character articles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (!showBlogs) handleGetAllBlogs();
                setShowBlogs((prev) => !prev);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-black transition-colors shadow-sm"
            >
              <span>{showBlogs ? 'Hide All Blogs' : 'View All Blogs'}</span>
              <FaChevronUp
                className={`transition-transform duration-300 text-xs ${
                  showBlogs ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Edit mode alert banner */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN FORM: The 5 core fields */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
              {/* 1. Title */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">
                  1. Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The Evolution of Spider-Man in Modern Comics"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                />
              </div>

              {/* 2. Cover Image */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">
                  2. Cover Image
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  The main image that appears on the blog card and at the top of the blog.
                </p>

                {coverImage ? (
                  <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-h-80 flex items-center justify-center">
                    <img
                      src={coverImage}
                      alt="Cover Preview"
                      className="max-h-80 w-full object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={removeCoverImage}
                      className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition flex items-center justify-center"
                      title="Remove image"
                    >
                      <MdClose size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* File upload trigger */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 hover:border-red-500 hover:bg-red-50/20 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
                    >
                      <div className="p-3 bg-gray-100 rounded-full text-gray-600">
                        <MdCloudUpload size={28} />
                      </div>
                      <span className="font-semibold text-gray-700 text-sm">
                        Click to upload image
                      </span>
                     
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    {/* Or URL input */}
                    <div className="flex gap-2 items-center">
                      <span className="text-xs font-semibold text-gray-500 uppercase">or URL:</span>
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="https://res.cloudinary.com/... or image link"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-500"
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

              {/* 3. Content - Rich Text Editor */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">
                  3. Content <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Write the complete blog body: headings, paragraphs, images, comic panels, quotes, and links.
                </p>

                <RichEditor
                  value={content}
                  onChange={(html) => setContent(html)}
                  placeholder="Write your blog content here…"
                />
              </div>

              {/* 4. Category */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">
                  4. Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Publish */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                  5. Publish Blog?
                </label>
                <div className="flex items-center gap-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="publishStatus"
                      checked={!published}
                      onChange={() => setPublished(false)}
                      className="w-5 h-5 text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                    <span className="font-semibold text-gray-700 text-sm">○ Draft</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="publishStatus"
                      checked={published}
                      onChange={() => setPublished(true)}
                      className="w-5 h-5 text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                    <span className="font-semibold text-green-700 text-sm">● Published</span>
                  </label>
                </div>
              </div>

              {/* Actions: Submit / Save Draft / Reset */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveLocalDraft}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition shadow-sm"
                  >
                    <PiFloppyDiskDuotone className="text-lg" /> Save Local Draft
                  </button>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-4 py-2.5 rounded-xl text-gray-500 hover:text-red-600 font-semibold text-sm transition"
                  >
                    Reset
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {editingBlog ? (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleUpdateBlog}
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-md disabled:opacity-50"
                    >
                      <MdSend className="text-lg" /> {isSubmitting ? 'Updating...' : 'Update Blog'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleSubmitBlog}
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#DD1215] hover:bg-red-700 text-white font-bold text-sm transition shadow-md disabled:opacity-50"
                    >
                      <MdSend className="text-lg" /> {isSubmitting ? 'Submitting...' : 'Submit Blog'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR: Live Preview */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MdVisibility className="text-gray-600" /> Blog Preview
                </h2>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {published ? 'Published' : 'Draft'}
                </span>
              </div>

              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                {/* Category badge */}
                <div className="mb-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-red-100 text-red-700 font-bold text-xs uppercase tracking-wide">
                    {category || 'Category'}
                  </span>
                </div>

                {/* Cover Image in preview */}
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt="Cover Preview"
                    className="w-full h-44 object-cover rounded-lg mb-3"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 mb-3">
                    <FaImage size={24} />
                    <span className="text-xs mt-1">No Cover Image</span>
                  </div>
                )}

                {/* Title */}
                <h3 className="font-extrabold text-gray-900 text-lg leading-tight mb-2">
                  {title || 'Your Blog Title Will Appear Here'}
                </h3>

                {/* Created At & Time */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-2 border-b border-gray-200">
                  <span>Created At:</span>
                  <span className="font-medium text-gray-700">
                    {new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    at{' '}
                    {new Date().toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Content preview snippet or toggle */}
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full py-2 px-3 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition"
                >
                  {showPreview ? 'Hide Full Content Preview' : 'Show Full Content Preview'}
                </button>

                {showPreview && (
                  <div className="mt-4 pt-4 border-t border-gray-200 max-h-96 overflow-y-auto text-sm text-gray-800 prose prose-sm max-w-none">
                    {content ? (
                      <div dangerouslySetInnerHTML={{ __html: content }} />
                    ) : (
                      <p className="text-gray-400 italic text-xs">No content written yet...</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ALL BLOGS MANAGEMENT SECTION */}
        {showBlogs && (
          <div ref={blogSectionRef} className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">All Created Blogs</h2>
                <p className="text-sm text-gray-500">
                  Total: {allBlogs.length} blog{allBlogs.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={handleGetAllBlogs}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition"
              >
                Refresh List
              </button>
            </div>

            {allBlogs.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 text-gray-500">
                <p className="text-base font-semibold">No blogs found.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Create your first comic blog using the form above!
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentBlogs.map((blog) => {
                    const blogCover = blog.coverImage || blog.news?.[0]?.imageUrl || '';
                    const isPub =
                      blog.published !== undefined ? blog.published : blog.status === 'published';

                    return (
                      <div
                        key={blog._id}
                        className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div>
                          {blogCover ? (
                            <img
                              src={blogCover}
                              alt={blog.title}
                              className="w-full h-44 object-cover"
                            />
                          ) : (
                            <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400">
                              <FaImage size={32} />
                            </div>
                          )}

                          <div className="p-5">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-xs uppercase">
                                {blog.category || 'General'}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                  isPub
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {isPub ? 'Published' : 'Draft'}
                              </span>
                            </div>

                            <h3 className="font-bold text-gray-900 text-base line-clamp-2 mb-1">
                              {blog.title}
                            </h3>

                            <p className="text-gray-400 text-xs mt-2">
                              {blog.createdAt
                                ? `${new Date(blog.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })} at ${new Date(blog.createdAt).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}`
                                : ''}
                            </p>
                          </div>
                        </div>

                        <div className="p-5 pt-0 border-t border-gray-100 flex items-center justify-between gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(blog)}
                            className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition text-center"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBlog(blog._id)}
                            className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition text-center"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center space-x-3">
                    <button
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                      className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                    >
                      &lt; Previous
                    </button>
                    <span className="text-sm font-medium text-gray-600">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <button
                      disabled={currentPage >= totalPages - 1}
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages - 1))}
                      className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                    >
                      Next &gt;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateBlog;

