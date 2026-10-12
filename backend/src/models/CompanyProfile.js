import mongoose from "mongoose";

const CompanyProfileSchema = new mongoose.Schema(
  {
    // ── Basic & Brand Information ────────────────────────────
    companyName: {
      type: String,
      required: true,
      trim: true,
      default: "Infinito Comics Private Limited",
    },
    brandName: {
      type: String,
      trim: true,
      default: "Infinito Comics",
    },
    tagline: {
      type: String,
      trim: true,
      default: "India's Premier Universe of Graphic Fiction & Comics",
    },
    logoUrl: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      trim: true,
      default: "https://infinitocomics.com",
    },

    // ── Legal & Tax Information ──────────────────────────────
    gstNumber: {
      type: String,
      trim: true,
      default: "",
    },
    panNumber: {
      type: String,
      trim: true,
      default: "",
    },
    cinNumber: {
      type: String,
      trim: true,
      default: "",
    },
    tanNumber: {
      type: String,
      trim: true,
      default: "",
    },

    // ── Registered Address ───────────────────────────────────
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      country: { type: String, default: "India" },
    },

    // ── Contact Information ──────────────────────────────────
    contact: {
      email: { type: String, default: "contact@infinitohq.com" },
      billingEmail: { type: String, default: "billing@infinitohq.com" },
      phone: { type: String, default: "" },
      supportPhone: { type: String, default: "" },
    },

    // ── Bank Account & Settlement Details ─────────────────────
    bankDetails: {
      bankName: { type: String, default: "" },
      accountHolder: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      branchName: { type: String, default: "" },
      accountType: { type: String, default: "Current Account" },
      upiId: { type: String, default: "" },
    },

    // ── Invoice & Store Billing Preferences ───────────────────
    invoiceSettings: {
      invoicePrefix: { type: String, default: "INF-INV-" },
      authorizedSignatory: { type: String, default: "" },
      termsAndConditions: {
        type: String,
        default: "Thank you for shopping with Infinito Comics. Goods once sold can be replaced in case of manufacturing defects within 7 days.",
      },
      footerNote: {
        type: String,
        default: "This is a computer generated invoice and does not require physical signature.",
      },
    },

    // ── Audit Metadata ───────────────────────────────────────
    updatedBy: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const CompanyProfile = mongoose.model("CompanyProfile", CompanyProfileSchema);
export default CompanyProfile;
