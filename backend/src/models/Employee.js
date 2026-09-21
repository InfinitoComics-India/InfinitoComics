import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────
    employeeId: {
      type: String,
      unique: true,
      // auto-generated in pre-save hook: EMP-001, EMP-002 ...
    },
    firstName:  { type: String, required: true, trim: true },
    lastName:   { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:      { type: String, trim: true },
    avatar:     { type: String, default: "" }, // S3 URL

    // ── Job Info ──────────────────────────────────────────────
    designation:      { type: String, required: true, trim: true },
    department:       {
      type: String,
      enum: ["Engineering", "Design", "Marketing", "HR", "Finance", "Operations", "Research", "Content", "Other"],
      default: "Engineering",
    },
    employmentType:   {
      type: String,
      enum: ["full-time", "part-time", "intern", "contractor", "freelance"],
      default: "full-time",
    },
    joiningDate:      { type: Date, required: true },
    endDate:          { type: Date }, // filled when employee leaves
    reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },

    // ── Role & Access ─────────────────────────────────────────
    hrRole: {
      type: String,
      enum: ["employee", "team_lead", "manager", "hr_manager", "finance", "superadmin"],
      default: "employee",
    },

    // ── Status ────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["active", "inactive", "on_leave", "terminated"],
      default: "active",
    },

    // ── Salary Grade (for Payroll Phase) ─────────────────────
    salaryGrade: { type: String, default: "" },

    // ── Personal Info ─────────────────────────────────────────
    dateOfBirth:       { type: Date },
    gender:            { type: String, enum: ["male", "female", "other", "prefer_not_to_say"] },
    address:           { type: String },
    emergencyContact:  {
      name:  { type: String },
      phone: { type: String },
      relation: { type: String },
    },

    // ── Skills & Links ────────────────────────────────────────
    skills:       { type: [String], default: [] },
    linkedIn:     { type: String, default: "" },
    github:       { type: String, default: "" },

    // ── Leave Balance (for Leave Phase) ──────────────────────
    leaveBalance: {
      casual:  { type: Number, default: 12 },
      sick:    { type: Number, default: 10 },
      earned:  { type: Number, default: 15 },
    },
  },
  { timestamps: true }
);

// Auto-generate employeeId before saving
EmployeeSchema.pre("save", async function (next) {
  if (!this.employeeId) {
    const count = await mongoose.model("Employee").countDocuments();
    this.employeeId = `EMP-${String(count + 1).padStart(3, "0")}`;
  }
  next();
});

// Virtual: full name
EmployeeSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const Employee = mongoose.model("Employee", EmployeeSchema);
export default Employee;
