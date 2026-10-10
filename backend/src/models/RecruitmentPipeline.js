import mongoose from "mongoose";

// Extends the existing JobApplication model with pipeline stage tracking
const InterviewSchema = new mongoose.Schema({
  round:        { type: Number, default: 1 },
  type:         { type: String, enum: ["phone","video","technical","hr","final"], default: "phone" },
  scheduledAt:  { type: Date },
  conductedBy:  { type: String, default: "" }, // interviewer name
  conductedById:{ type: mongoose.Schema.Types.ObjectId }, // employee ref
  feedback:     { type: String, default: "" },
  rating:       { type: Number, min: 1, max: 5 },
  result:       { type: String, enum: ["pending","passed","failed","no_show"], default: "pending" },
  notes:        { type: String, default: "" },
});

const RecruitmentPipelineSchema = new mongoose.Schema(
  {
    // ── Link to existing JobApplication ───────────────────────
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobApplication",
      required: true,
      unique: true,
    },

    // ── Snapshot of applicant info ────────────────────────────
    candidateName:  { type: String, required: true },
    candidateEmail: { type: String, required: true },
    candidatePhone: { type: String, default: "" },
    jobTitle:       { type: String, required: true },
    jobType:        { type: String, default: "" },
    resumeUrl:      { type: String, default: "" },

    // ── Pipeline stage ────────────────────────────────────────
    stage: {
      type: String,
      enum: ["applied","screening","interview_scheduled","interview_done","offer_sent","hired","rejected","withdrawn"],
      default: "applied",
    },

    // ── Stage history ─────────────────────────────────────────
    stageHistory: [{
      stage:     String,
      movedAt:   { type: Date, default: Date.now },
      movedBy:   mongoose.Schema.Types.ObjectId,
      note:      String,
    }],

    // ── Interviews ────────────────────────────────────────────
    interviews: [InterviewSchema],

    // ── Offer ─────────────────────────────────────────────────
    offerDetails: {
      salary:      { type: Number },
      joiningDate: { type: Date },
      note:        { type: String, default: "" },
      sentAt:      { type: Date },
    },

    // ── Rejection ─────────────────────────────────────────────
    rejectionReason: { type: String, default: "" },

    // ── Source ────────────────────────────────────────────────
    source: {
      type: String,
      enum: ["website","linkedin","referral","naukri","internshala","other"],
      default: "website",
    },

    // ── Rating ────────────────────────────────────────────────
    overallRating: { type: Number, min: 1, max: 5 },

    // ── Notes ─────────────────────────────────────────────────
    internalNotes: { type: String, default: "" },
    assignedTo:    { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    createdBy:     { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

RecruitmentPipelineSchema.index({ stage: 1, createdAt: -1 });
RecruitmentPipelineSchema.index({ jobTitle: 1, stage: 1 });

const RecruitmentPipeline = mongoose.model("RecruitmentPipeline", RecruitmentPipelineSchema);
export default RecruitmentPipeline;
