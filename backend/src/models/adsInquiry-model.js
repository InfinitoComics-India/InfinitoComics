import mongoose from "mongoose";
const adSchema=new mongoose.Schema(
    {
    companyName: { type: String, required: true, trim: true },
    yourName:    { type: String, required: true, trim: true },
    email:       { type: String, required: true, trim: true },
    phone:       { type: String, required: true, trim: true },
    industry:    { type: String, trim: true },
    message:     { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "contacted", "in-discussion", "closed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const AdsInquiry=mongoose.model("AdsInquiry",adSchema);
export default AdsInquiry;