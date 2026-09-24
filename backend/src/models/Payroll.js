import mongoose from "mongoose";

const PayrollSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },

    // ── Period ────────────────────────────────────────────────
    month: { type: Number, required: true }, // 1-12
    year:  { type: Number, required: true },

    // ── Salary snapshot (copied from Salary at time of generation) ──
    basic:           { type: Number, default: 0 },
    hra:             { type: Number, default: 0 },
    ta:              { type: Number, default: 0 },
    medical:         { type: Number, default: 0 },
    special:         { type: Number, default: 0 },
    otherAllowances: { type: Number, default: 0 },
    grossSalary:     { type: Number, default: 0 },

    // ── Deductions ────────────────────────────────────────────
    pf:              { type: Number, default: 0 },
    esic:            { type: Number, default: 0 },
    tds:             { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
    lossOfPay:       { type: Number, default: 0 }, // auto-calc from absent days

    // ── Attendance summary for this period ───────────────────
    workingDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    absentDays:  { type: Number, default: 0 },
    leaveDays:   { type: Number, default: 0 },

    // ── Final amounts ────────────────────────────────────────
    totalDeductions: { type: Number, default: 0 },
    netSalary:       { type: Number, default: 0 },

    // ── Status ────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["draft", "approved", "paid"],
      default: "draft",
    },
    paidAt:    { type: Date },
    paidBy:    { type: mongoose.Schema.Types.ObjectId },

    // ── Notes ────────────────────────────────────────────────
    remarks:   { type: String, default: "" },
    generatedBy: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

// Unique: one payslip per employee per month+year
PayrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });
PayrollSchema.index({ month: 1, year: 1, status: 1 });

const Payroll = mongoose.model("Payroll", PayrollSchema);
export default Payroll;
