import React, { useState, useEffect, useRef } from 'react';
import { MdVisibility } from 'react-icons/md';
import { PiFloppyDiskDuotone } from 'react-icons/pi'; 
import { MdSend, MdAccountCircle } from 'react-icons/md';
import { FaChevronUp, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { BACKEND_URL } from '../../Utils/constant.js';

const MySwal = withReactContent(Swal);
const showAlert = (type) => {
  const config = {
    icon: 'success',
    title: '',
    html: '',
    showConfirmButton: true,
    confirmButtonText: 'Awesome!',
    confirmButtonColor: '#4CAF50',
    backdrop: `
      rgba(0,0,123,0.4)
      left top
      no-repeat
    `,
  };
  switch (type) {
    case 'published':
      config.title = '🎉 Blog Published!';
      config.html = `<strong>Your blog has been <span style="color:#4CAF50;">successfully published</span>!</strong>`;
      config.icon = 'success';
      break;
    case 'updated':
      config.title = '✏️ Blog Updated!';
      config.html = `<strong>Your blog changes have been <span style="color:#2196F3;">saved</span>!</strong>`;
      config.icon = 'info';
      config.confirmButtonColor = '#2196F3';
      break;
    case 'deleted':
      config.title = '🗑️ Blog Deleted!';
      config.html = `<strong>The blog has been <span style="color:#f44336;">permanently removed</span>.</strong>`;
      config.icon = 'warning';
      config.confirmButtonColor = '#f44336';
      break;
    default:
      config.title = '✅ Success';
      config.html = 'Operation completed successfully!';
  }
  MySwal.fire(config).then(() => {
    window.location.reload(); 
  });
};
const BlogCreator = () => {
  const token = localStorage.getItem("authToken");
  const [showPreview, setShowPreview] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [publishedBlogs, setPublishedBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [fullStoryBlocks, setFullStoryBlocks] = useState([
  { image: null, description: ''}
]);
const [expandedImage, setExpandedImage] = useState(null);

const [currentPage, setCurrentPage] = useState(0);
const blogsPerPage = 3;
const startIndex = currentPage * blogsPerPage;
const totalPages = Math.ceil(allBlogs.length / blogsPerPage);
const currentBlogs = allBlogs.slice(startIndex, startIndex + blogsPerPage);
const [showBlogs, setShowBlogs] = useState(false);
const [authorName, setAuthorName] = useState('');
const [category, setCategory] = useState('');

const blogSectionRef = useRef(null);
const formRef = useRef(null);

  const handleDelete = async (blogId) => {  
    const confirmDelete = window.confirm("Are you sure you want to delete this blog?");
    if (!confirmDelete) return;
  try {
   const response = await fetch(`${BACKEND_URL}/blog/deleteblog/${blogId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    if (response.ok) {
      showAlert('deleted');

      const updated = publishedBlogs.filter((b) => b._id !== blogId);
      setPublishedBlogs(updated);

      localStorage.setItem('publishedBlogs', JSON.stringify(updated));

      const updatedAll = allBlogs.filter((b) => b._id !== blogId);
      setAllBlogs(updatedAll);
    } else {
      alert(`Error deleting blog: ${result.message}`);
    }
  } catch (err) {
    alert('Error deleting blog - check console for details');
  }
};
const handleAddBlock = () => {
  setFullStoryBlocks([...fullStoryBlocks, { image: null, description: ''}]);
};
const handleUpdate = async () => {
  if (!editingBlog) {
    alert('No blog is being edited!');
    return;
  }
  const confirmUpdate = window.confirm("Are you sure you want to save the changes or update this blog?");
  if (!confirmUpdate) return;

  const news = fullStoryBlocks.map(block => ({
    imageUrl: block.image ? block.image : '', 
    story: block.description
  }));

  const payload = {
    title,
    subject,
    news,
    status: 'published',
    authorName,
    category
  };

  try {
    const response = await fetch(`${BACKEND_URL}/blog/updateblog/${editingBlog._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (response.ok) {
     showAlert('updated');

      const updatedBlogs = publishedBlogs.map((b) =>
        b._id === editingBlog._id
          ? { ...b, title, subject, fullStory: fullStoryBlocks, authorName, category }
          : b
      );
      setPublishedBlogs(updatedBlogs);
      localStorage.setItem('publishedBlogs', JSON.stringify(updatedBlogs));

      const updatedAllBlogs = allBlogs.map((b) =>
        b._id === editingBlog._id
          ? { ...b, title, subject, fullStory: fullStoryBlocks, authorName, category }
          : b
      );
      setAllBlogs(updatedAllBlogs);
      setEditingBlog(null);
      setTitle('');
      setSubject('');
      setFullStoryBlocks([{ image: null, description: '' }]);
      setAuthorName('');
      setCategory('');
      setShowPreview(false);
    } else {
      console.error('Error updating:', result);
      alert(`Error updating blog: ${result.message}`);
    }
  } catch (err) {
    alert('Error updating blog - check console for details');
  }
};
  const handleGetAllBlogs = async () => {
    console.log(BACKEND_URL);
  try {
    const response = await fetch(`${BACKEND_URL}/blog/getallblog`);
    const result = await response.json();

    if (response.ok) {
      setAllBlogs(result.data);
      localStorage.setItem('allBlogs', JSON.stringify(result.data));
    } else {
      alert(`Error fetching blogs: ${result.message}`);
    }
  } catch (err) {
    alert('Error fetching blogs - check console for details');
  }
};

  useEffect(() => {
    const savedDraft = localStorage.getItem('blogDraft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setTitle(draft.title || '');
      setSubject(draft.subject || '');
     setFullStoryBlocks(draft.fullStoryBlocks || []);
     setAuthorName(draft.authorName||'');
     setCategory(draft.category || '');
      setShowNotification(true);
      setShowReset(true);
    }
    const savedPublished = localStorage.getItem('publishedBlogs');
    if (savedPublished) {
      setPublishedBlogs(JSON.parse(savedPublished));
    }
  }, []);

  useEffect(() => {
  if (showBlogs && allBlogs.length > 0 && blogSectionRef.current) {
    setTimeout(() => {
      blogSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }
}, [showBlogs, allBlogs.length]); 


  const handleSaveDraft = async () => {
      if (
    !title.trim() &&
    !subject.trim() &&
    fullStoryBlocks.every(block => !block.description.trim() && !block.image) &&
    !authorName.trim() &&
    !category.trim()
  ) {
    alert("Cannot save an empty draft. Please add content before saving.");
    return;
  }
  const prevDraft = JSON.parse(localStorage.getItem('blogDraft')) || {};
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const updatedBlocks = await Promise.all(
    fullStoryBlocks.map(async (block, index) => {
      const previousImage = prevDraft.fullStoryBlocks?.[index]?.image;
      const base64Image =
        block.image instanceof File
          ? await convertToBase64(block.image)
          : block.image || previousImage || null;

      return {
        description: block.description || prevDraft.fullStoryBlocks?.[index]?.description || '',
        image: base64Image,
      };
    })
  );

  const draftData = {
    title: title || prevDraft.title || '',
    subject: subject || prevDraft.subject || '',
    fullStoryBlocks: updatedBlocks.length > 0 ? updatedBlocks : prevDraft.fullStoryBlocks || [{ image: null, description: '' }],
    authorName : authorName || prevDraft.authorName || '',
    category: category || prevDraft.authorName || ''
  };

  localStorage.setItem('blogDraft', JSON.stringify(draftData));
  setShowNotification(true);
  setShowReset(true);
  alert('Draft saved locally!');
  };

  const handleResetDraft = () => {
    const confirmReset = window.confirm("Do you want to reset the changes made?");
    if (!confirmReset) return;

    localStorage.removeItem('blogDraft');
    setTitle('');
    setSubject('');
    setFullStoryBlocks([{ image: null, description: '' }]);
    setAuthorName('');
    setCategory('');
    setShowNotification(false);
    setShowReset(false);
    alert('Draft reset!');
  };

const convertToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

const handlePublish = async () => {
  if (
    !title.trim() &&
    !subject.trim() &&
    fullStoryBlocks.every(block => !block.description.trim() && !block.image) &&
    !authorName.trim() &&
    !category.trim()
  ) {
    alert("Cannot publish an empty draft. Please add content before publishing.");
    return;
  }

  const newsArray = await Promise.all(
    fullStoryBlocks.map(async block => {
      const base64 = typeof block.image === 'string'
        ? block.image
        : block.image
        ? await convertToBase64(block.image)
        : '';

      return {
        imageUrl: base64,
        story: block.description,
      };
    })
  );

  const payload = {
    title,
    subject,
    authorName,
    category,
    status: 'published',
    news: newsArray,
  };
 

  try {
const response = await fetch(`${BACKEND_URL}/blog/createblog`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}` 
  },
  body: JSON.stringify(payload)
});
    const result = await response.json();
    if (response.ok) {
      showAlert('published');
      setPublishedBlogs([...publishedBlogs, result.data]);
      setTitle('');
      setSubject('');
      setFullStoryBlocks([{ image: null, description: '' }]);
      setAuthorName('');
      setCategory('');
      localStorage.removeItem('blogDraft');
      setShowNotification(false);
      setShowReset(false);
    } else {
      console.error('Error:', result);
      alert(`Error publishing blog: ${result.message}`);
    }
  } catch (err) {
    console.error('Network Error:', err);
    alert('Error publishing blog - check console for details');
  }
};
  return (
    <div className='bg-[#f6f6ff] min-h-screen'>
    <div  ref={formRef} className="p-4 sm:p-8 md:p-12 lg:p-20 font-sans relative max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <p className="text-gray-500 text-lg font-medium">
            Create and publish engaging blog content for your audience
          </p>
        </div>

        <button
          onClick={() => {
              handleGetAllBlogs(); 
              setShowBlogs((prev) => !prev);
            }}
            className="mt-4 md:mt-0 px-6 py-3 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700" 
        >
        <div className='flex'>
            All Blogs
          <FaChevronUp
            className={`transition-transform duration-300  mt-1 ml-2 ${
              showBlogs ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </div>
        </button>
      </div>
      {showNotification && (
        <div className="fixed top-4 right-4 bg-green-200 text-green-900 px-4 py-2 rounded shadow-lg z-50">
          Draft saved locally!
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-4 sm:p-6 mb-6 shadow-md">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-3">
              <span className="text-xl">T</span> Title
            </h2>
            <textarea
              className="w-full border p-3 rounded mb-4 placeholder-red-500"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ fontFamily: 'DM Sans', fontWeight: '900', color: '#DD1215', height:'100px', fontSize:'1.5rem' }}
            />
          </div>
           <div className="bg-white rounded-lg p-4 sm:p-6 mb-6 shadow-md">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-3">
                <span className="text-xl">T</span> Subject
              </h2>
              <textarea
                className="w-full border p-3 rounded mb-4 placeholder-gray-900"
                placeholder="Enter subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ fontFamily: 'DM Sans', fontWeight: '500', color: '#111111' , height:'100px'}}
              />
           </div>
           <div className="bg-white rounded-lg p-4 sm:p-6 mb-6 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:gap-6">
              <div className="flex-1 mb-4 md:mb-0">
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-3">
                  <span className="text-xl">T</span> Author Name
                </h2>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Enter author name"
                  className="w-full border p-3 rounded placeholder-gray-900"
                  style={{ fontFamily: 'DM Sans', fontWeight: '500', color: '#111111' }}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-3">
                  <span className="text-xl">T</span> Category
                </h2>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border p-3 rounded placeholder-gray-900"
                  style={{ fontFamily: 'DM Sans', fontWeight: '500', color: '#111111' }}
                >
                  <option value="">Select category</option>
                  <option value="IC">IC</option>
                  <option value="Foundation">Foundation</option>
              </select>
              </div>
            </div>
          </div>
         <div className="bg-white rounded-lg p-4 sm:p-6 mb-6 shadow-md">
           <h2 className="text-2xl font-bold flex items-center gap-2 mb-3">
            <span className="text-xl">T</span> Full Story
          </h2>
          {fullStoryBlocks.map((block, index) => (
            <div key={index} className="mb-6 border p-2 sm:p-4 rounded shadow relative">
             <button
                onClick={() => {
                  const updatedBlocks = fullStoryBlocks.filter((_, i) => i !== index);
                  setFullStoryBlocks(updatedBlocks)
                }}
                className="absolute top-4 right-7 text-red-600 hover:text-red-800"
                title="Delete this block"
              >
                <FaTrash size={19} />
              </button>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const newBlocks = [...fullStoryBlocks];
                    newBlocks[index].image = reader.result; 
                    setFullStoryBlocks(newBlocks);
                  };
                  reader.readAsDataURL(file);
                }}
                className="mb-2"
                id={`fileInput-${index}`}
              />
              {block.image && (
                <div className="relative mt-2 w-24 h-24 sm:w-32 sm:h-32 cursor-pointer group mb-3">
                  <img
                    src= {block.image}
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover rounded"
                    onClick={() => setExpandedImage({ src: block.image, index })}
                  />
                  <button
                    onClick={() => {
                      const newBlocks = [...fullStoryBlocks];
                      newBlocks[index].image = null;
                      setFullStoryBlocks(newBlocks);
                      const input = document.getElementById(`fileInput-${index}`);
                      if (input) input.value = '';
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                  >
                    &times;
                  </button>
                </div>
              )}
              <textarea
                className="w-full border p-2 rounded mb-2 placeholder-gray-500 min-h-[100px] sm:min-h-[150px]"
                placeholder="Enter description..."
                value={block.description}
                onChange={(e) => {
                  const newBlocks = [...fullStoryBlocks];
                  newBlocks[index].description = e.target.value;
                  setFullStoryBlocks(newBlocks);
                }}
              ></textarea>
            </div>
          ))}
          {expandedImage && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute top-6 right-6 text-white text-3xl font-bold"
              >
                &times;
              </button>
              <img
                src={
                  typeof expandedImage.src === 'string'
                    ? expandedImage.src
                    : URL.createObjectURL(expandedImage.src)
                }
                alt="Expanded"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
          <button
            onClick={handleAddBlock}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add More Blocks
          </button>
        </div>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-2 px-6 py-3 border rounded bg-white text-black font-semibold hover:bg-gray-50"
            >
              <PiFloppyDiskDuotone className="text-xl" /> Save Draft
            </button>
            {showReset && (
              <button
                onClick={handleResetDraft}
                className="flex items-center gap-2 px-6 py-3 border rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200"
              >
                Reset
              </button>
            )}
            <button
              onClick={handlePublish}
              className="flex items-center gap-2 px-6 py-3 rounded bg-black text-white font-semibold hover:bg-gray-800"
            >
              <MdSend className="text-xl" /> Publish Blog
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md mt-6 lg:mt-0">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-3">
            <MdVisibility /> Preview
          </h2>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="border px-4 py-2 rounded hover:bg-gray-100 w-full"
          >
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          {showPreview && (
            <div className="mt-4 prose max-w-none">
              <h1 style={{ fontFamily: 'DM Sans', fontWeight: '900', color: '#DD1215', fontSize:'1.5rem' }}>{title}</h1>
              <h2 style={{ fontFamily: 'DM Sans', fontWeight: '500', color: '#111111' }}>{subject}</h2>
                  {authorName && (
                    <div className="flex items-center gap-2 mt-2 text-gray-700 mb-6">
                      <MdAccountCircle className="w-5 h-5 text-gray-600" />
                      <h1 style={{ fontFamily: 'DM Sans', fontWeight: '500', color: '#11111' }}>{authorName}</h1>
                    </div>
                  )}
                {fullStoryBlocks.map((block, index) => (
                    <div key={index} className="mb-4">
                      {block.image && (
                        <img
                          src={
                            typeof block.image === 'string'
                              ? block.image
                              : block.image instanceof File
                              ? URL.createObjectURL(block.image)
                              : ''
                          }
                          alt={`Story ${index}`}
                          className="w-full max-w-full h-auto mx-auto mb-2"
                        />
                      )}
                      <p style={{ fontFamily: 'DM Sans', fontWeight: '400', color: '#111111', marginBottom: '1.50rem'  }}>
                        {block.description}
                      </p>
                    </div>
                ))}
              {editingBlog && (
                <button
                  onClick={handleUpdate}
                  className="mt-4 px-6 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Update
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {showBlogs && allBlogs.length > 0 && (  
  <div className="mt-10">
    <h2 ref={blogSectionRef}  className="text-3xl font-bold mb-4">All Blogs</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {currentBlogs.map((blog) => (
        <div
          key={blog._id}
          className="relative group rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 bg-white"
        >
          <div className="p-4">
            <h3
              className="text-lg font-bold mb-1"
              style={{ fontFamily: 'DM Sans', fontWeight: '900', color: '#DD1215',  }}
            >
              {blog.title}
            </h3>
            <p
              className="text-gray-600 text-sm"
              style={{ fontFamily: 'DM Sans', fontWeight: '500', color: '#111111' }}
            >
              {blog.subject}
            </p>
          </div>

          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex justify-center items-center space-x-4 transition-opacity duration-300">
            <button
              onClick={() => {
                setTitle(blog.title);
                setSubject(blog.subject);
                const storyBlocks = (blog.news || []).map(newsItem => ({
                  image: newsItem.imageUrl || null, 
                  description: newsItem.story || ''
                }));
                setFullStoryBlocks(storyBlocks.length > 0 ? storyBlocks : [{ image: null, description: '' }]);
                setAuthorName(blog.authorName);
                setCategory(blog.category);
                setShowPreview(true);

                setTimeout(() => {
                  formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="bg-white text-black px-4 py-2 rounded font-semibold hover:bg-gray-200"
            >
              Open
            </button>
            <button
              onClick={() => handleDelete(blog._id)}
              className="bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setTitle(blog.title);
                setSubject(blog.subject);
                const storyBlocks = (blog.news || []).map(newsItem => ({
                  image: newsItem.imageUrl || null, 
                  description: newsItem.story || ''
                }));
                setFullStoryBlocks(storyBlocks.length > 0 ? storyBlocks : [{ image: null, description: '' }]);
                setAuthorName(blog.authorName);
                setCategory(blog.category);
                setShowPreview(true);
                setEditingBlog(blog);

                setTimeout(() => {
                  formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-600"
            >
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-6 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
      <button
        disabled={currentPage === 0}
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
      >
        &lt;&lt;
      </button>
      <span className="text-lg font-semibold">
        {startIndex + 1} - {Math.min(startIndex + blogsPerPage, allBlogs.length)} of {allBlogs.length}
      </span>
      <button
        disabled={currentPage >= totalPages - 1}
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
      >
        &gt;&gt;
      </button>
    </div>
  </div>
)}
   </div>
  </div>)
};
export default BlogCreator;
