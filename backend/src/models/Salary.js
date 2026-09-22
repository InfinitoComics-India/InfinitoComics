import mongoose from "mongoose";

const SalarySchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, unique: true },

    // ── Structure ─────────────────────────────────────────────
    basic:       { type: Number, default: 0 },   // base salary
    hra:         { type: Number, default: 0 },   // house rent allowance
    ta:          { type: Number, default: 0 },   // travel allowance
    medical:     { type: Number, default: 0 },   // medical allowance
    special:     { type: Number, default: 0 },   // special allowance / bonus component
    otherAllowances: { type: Number, default: 0 },

    // ── Deductions ────────────────────────────────────────────
    pf:          { type: Number, default: 0 },   // provident fund
    esic:        { type: Number, default: 0 },   // employee state insurance
    tds:         { type: Number, default: 0 },   // tax deducted at source
    otherDeductions: { type: Number, default: 0 },

    // ── Calculated (stored for quick reference) ───────────────
    grossSalary: { type: Number, default: 0 },   // basic + all allowances
    netSalary:   { type: Number, default: 0 },   // gross - all deductions

    // ── Bank details ──────────────────────────────────────────
    bankName:       { type: String, default: "" },
    accountNumber:  { type: String, default: "" },
    ifscCode:       { type: String, default: "" },
    accountHolder:  { type: String, default: "" },

    // ── Pay cycle ─────────────────────────────────────────────
    payDay:      { type: Number, default: 1 }, // day of month salary is paid (1-28)
    currency:    { type: String, default: "INR" },
    salaryGrade: { type: String, default: "" },

    // ── Who set it ────────────────────────────────────────────
    setBy:    { type: mongoose.Schema.Types.ObjectId },
    effectiveFrom: { type: Date },
  },
  { timestamps: true }
);

// Auto-calc gross and net before save
SalarySchema.pre("save", function (next) {
  this.grossSalary = this.basic + this.hra + this.ta + this.medical + this.special + this.otherAllowances;
  this.netSalary   = this.grossSalary - this.pf - this.esic - this.tds - this.otherDeductions;
  next();
});

const Salary = mongoose.model("Salary", SalarySchema);
export default Salary;
