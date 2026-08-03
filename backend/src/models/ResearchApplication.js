import mongoose from 'mongoose';

const researchApplicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    topics: {
      type: [String],
      default: [],
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    details: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

const ResearchApplication = mongoose.model('ResearchApplication', researchApplicationSchema);
export default ResearchApplication;
