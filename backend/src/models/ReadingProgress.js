import mongoose from "mongoose";

const ReadingProgressSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comicId:   { type: mongoose.Schema.Types.ObjectId, ref: "Comics", required: true },
    chapId:    { type: mongoose.Schema.Types.ObjectId, required: true },
    lastPage:  { type: Number, default: 1 },
    totalPages:{ type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    lastReadAt:  { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique per user per comic chapter
ReadingProgressSchema.index({ userId: 1, comicId: 1, chapId: 1 }, { unique: true });

const ReadingProgress = mongoose.model("ReadingProgress", ReadingProgressSchema);
export default ReadingProgress;
