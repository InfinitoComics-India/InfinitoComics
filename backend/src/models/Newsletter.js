import mongoose from "mongoose";

const NewsletterSchema = new mongoose.Schema(
  {
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    name:         { type: String, default: "" },
    isActive:     { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
    source:       { type: String, default: "website" }, // "website", "popup", "checkout"
  },
  { timestamps: true }
);

const Newsletter = mongoose.model("Newsletter", NewsletterSchema);
export default Newsletter;
