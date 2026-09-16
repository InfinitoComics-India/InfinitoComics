import mongoose from "mongoose";

const TOPICS = [
  "Hiring",
  "Infinito Ultimate",
  "Request a Callback",
  "Internships",
  "Application Status",
  "Feedback or Suggestion",
  "Technical Issues",
  "Issue Not Listed",
  "Other",
];

const contactQuerySchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["new", "in-progress", "resolved"],
      default: "new",
    },
  },
  { timestamps: true }
);

const ContactQuery = mongoose.model("ContactQuery", contactQuerySchema);
export default ContactQuery;
