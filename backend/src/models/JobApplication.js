import mongoose from "mongoose";

const JobApplicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Career",
        default: null
    },
    jobTitle: {
        type: String,
        required: true
    },
    department: {
        type: String,
        default: ""
    },
    jobType: {
        type: String,
        default: ""
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: ""
    },
    linkedin: {
        type: String,
        default: ""
    },
    portfolio: {
        type: String,
        default: ""
    },
    coverLetter: {
        type: String,
        default: ""
    },
    resumeFileName: {
        type: String,
        default: ""
    },
    resumeUrl: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["pending", "reviewed", "shortlisted", "rejected"],
        default: "pending"
    }
}, { timestamps: true });

const JobApplication = mongoose.model("JobApplication", JobApplicationSchema);
export default JobApplication;
