import BlogService from "../services/blog-service.js";
const blogservice = new BlogService();

// Create a new blog
const createBlog = async (req, res) => {
   try {
    const { title, coverImage, content, category, published, subject, authorName, news, status } = req.body;

    const isPublished = published !== undefined 
      ? (published === true || published === 'true') 
      : (status === 'published');

    let finalCoverImage = coverImage || '';
    if (!finalCoverImage && req.files && req.files.length > 0) {
      finalCoverImage = req.files[0].path || req.files[0].location || '';
    }
    if (!finalCoverImage && news && news.length > 0) {
      finalCoverImage = news[0].imageUrl || '';
    }

    const cleanSubject = (subject ? subject.replace(/<[^>]*>/g, '') : (content ? content.replace(/<[^>]*>/g, '').substring(0, 160) : '')).replace(/&nbsp;/g, ' ').trim();

    const blogData = await blogservice.create({
      title,
      coverImage: finalCoverImage,
      content: content || (news ? news.map(n => n.story).join('\n\n') : ''),
      category: category || 'Comics',
      published: isPublished,
      status: isPublished ? 'published' : 'draft',
      subject: cleanSubject,
      authorName: authorName || 'Admin',
      news: news || (finalCoverImage || content ? [{ imageUrl: finalCoverImage, story: content }] : []),
      createdAt: new Date()
    });

    return res.status(201).json({
      success: true,
      message: "Successfully created blog",
      data: blogData,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all blogs
const getAllBlogs = async (req, res) => {
  try {
    const allBlogs = await blogservice.getAll();
    return res.status(200).json({
      success: true,
      message: "Successfully fetched all blogs",
      data: allBlogs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get blog by ID
const getBlogById = async (req, res) => {
  try {
    const blog = await blogservice.getById(req.params.id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Blog found",
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update blog by ID
const updateBlog = async (req, res) => {
  try {
    const { title, coverImage, content, category, published, subject, authorName, news, status } = req.body;

    const updatePayload = {};
    if (title !== undefined) updatePayload.title = title;
    if (coverImage !== undefined) {
      updatePayload.coverImage = coverImage;
    } else if (req.files && req.files.length > 0) {
      updatePayload.coverImage = req.files[0].path || req.files[0].location || '';
    }
    if (content !== undefined) updatePayload.content = content;
    if (category !== undefined) updatePayload.category = category;
    if (published !== undefined) {
      const isPub = published === true || published === 'true';
      updatePayload.published = isPub;
      updatePayload.status = isPub ? 'published' : 'draft';
    } else if (status !== undefined) {
      updatePayload.status = status;
      updatePayload.published = status === 'published';
    }
    if (subject !== undefined) {
      updatePayload.subject = subject.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    } else if (content !== undefined) {
      updatePayload.subject = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').substring(0, 160).trim();
    }
    if (authorName !== undefined) updatePayload.authorName = authorName;
    if (news !== undefined) updatePayload.news = news;

    const updatedBlog = await blogservice.update(req.params.id, updatePayload);
    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: updatedBlog,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete blog by ID
const deleteBlog = async (req, res) => {
  try {
    await blogservice.delete(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getLatestBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || req.body?.limit) || 5;
    const latestBlogs = await blogservice.getLatest(limit); // fetch latest
    return res.status(200).json({
      success: true,
      message: "Fetched latest blogs",
      blogs: latestBlogs,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getFoundationBlogs = async (req, res) => {
  try {
    const blogs = await blogservice.getByCategory("Foundation", 4);
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Foundation blogs" });
  }
};

const getICBlogs = async (req, res) => {
  try {
    const blogs = await blogservice.getTopBlogsByCategory("IC", 4); // sorted by createdAt ascending
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching IC blogs" });
  }
}
export default {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getLatestBlogs,
  getFoundationBlogs,
  getICBlogs
};
