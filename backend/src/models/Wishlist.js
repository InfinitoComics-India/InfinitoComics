import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comicId:   { type: mongoose.Schema.Types.ObjectId, ref: "Comics", required: true },
    addedAt:   { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique per user per comic
WishlistSchema.index({ userId: 1, comicId: 1 }, { unique: true });
WishlistSchema.index({ userId: 1 });

const Wishlist = mongoose.model("Wishlist", WishlistSchema);
export default Wishlist;
