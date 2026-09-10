import Blog from "../models/Blog.js";
import CrudRepository from "./crud-repository.js";

class BlogRepository extends CrudRepository {
    constructor(){
        super(Blog)
    }

    async getLatest(limit = 5) {
        try {
            return await Blog.find({ status: { $ne: 'draft' }, published: { $ne: false } })
                .sort({ createdAt: -1, _id: -1 })
                .limit(limit);
        } catch (error) {
            throw error;
        }
    }

    async getByCategory(category, limit) {
    return await this.model.find({ category })
        .sort({ createdAt: 1 })
        .limit(limit);
    }

    async getBlogsByCategory(category, limit) {
    return await Blog.find({ category })
        .sort({ createdAt: 1 }) 
        .limit(limit);
    }

    async getBlogById(id) {
        return await Blog.findById(id);
    }

    async reactToBlog(id, reaction, visitorId) {
        try {
            const blog = await Blog.findById(id);
            if (!blog) throw new Error("Blog not found");

            if (!Array.isArray(blog.likedBy)) blog.likedBy = [];
            if (!Array.isArray(blog.dislikedBy)) blog.dislikedBy = [];

            const hasLiked = blog.likedBy.includes(visitorId);
            const hasDisliked = blog.dislikedBy.includes(visitorId);

            let userReaction = null;

            if (reaction === "love" || reaction === "like") {
                if (hasLiked) {
                    blog.likedBy = blog.likedBy.filter((v) => v !== visitorId);
                    userReaction = null;
                } else {
                    blog.likedBy.push(visitorId);
                    if (hasDisliked) {
                        blog.dislikedBy = blog.dislikedBy.filter((v) => v !== visitorId);
                    }
                    userReaction = "love";
                }
            } else if (reaction === "hate" || reaction === "dislike") {
                if (hasDisliked) {
                    blog.dislikedBy = blog.dislikedBy.filter((v) => v !== visitorId);
                    userReaction = null;
                } else {
                    blog.dislikedBy.push(visitorId);
                    if (hasLiked) {
                        blog.likedBy = blog.likedBy.filter((v) => v !== visitorId);
                    }
                    userReaction = "hate";
                }
            }

            blog.likes = blog.likedBy.length;
            blog.dislikes = blog.dislikedBy.length;
            blog.score = blog.likes - blog.dislikes;
            await blog.save();

            return {
                likes: blog.likes,
                dislikes: blog.dislikes,
                score: blog.score,
                userReaction,
            };
        } catch (error) {
            throw error;
        }
    }

    async getTopLoved(limit = 4) {
        try {
            return await Blog.aggregate([
                {
                    $match: {
                        status: { $ne: 'draft' },
                        published: { $ne: false }
                    }
                },
                {
                    $addFields: {
                        score: {
                            $subtract: [
                                { $ifNull: ["$likes", 0] },
                                { $ifNull: ["$dislikes", 0] }
                            ]
                        }
                    }
                },
                {
                    $sort: {
                        score: -1,
                        likes: -1,
                        createdAt: -1
                    }
                },
                {
                    $limit: limit
                }
            ]);
        } catch (error) {
            throw error;
        }
    }
}

export default BlogRepository