import mongoose from "mongoose";

const MeetingSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    agenda:      { type: String, default: "" },
    meetLink:    { type: String, default: "" }, // Google Meet URL pasted by admin
    scheduledAt: { type: Date, required: true },
    duration:    { type: Number, default: 60 }, // minutes
    status:      { type: String, enum: ["scheduled","ongoing","completed","cancelled"], default: "scheduled" },
    // Who created it
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    createdByName:{ type: String, default: "" },
    // Participants — Admin _ids (employees use admin accounts)
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Admin" }],
    participantNames: [{ type: String }], // snapshots for quick display
    // Notes added after meeting
    notes:       { type: String, default: "" },
  },
  { timestamps: true }
);

MeetingSchema.index({ scheduledAt: -1 });
MeetingSchema.index({ participants: 1, scheduledAt: -1 });

const Meeting = mongoose.model("Meeting", MeetingSchema);
export default Meeting;
