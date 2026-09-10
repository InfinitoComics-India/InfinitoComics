import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
  },
  story: {
    type: String,
  },
});

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    published: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // Backwards-compatibility fields:
    subject: {
      type: String,
      default: "",
    },
    authorName: {
      type: String,
      default: "Admin",
    },
    news: [newsSchema],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    likedBy: [{
      type: String,
    }],
    dislikedBy: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.model("Blog", BlogSchema);
export default Blog;