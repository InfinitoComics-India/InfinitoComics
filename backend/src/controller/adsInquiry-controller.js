import ExcelJS from "exceljs";
import AdsInquiry from "../models/adsInquiry-model.js";

// 1. Submit a new Ads Inquiry (Public)
export const submitAdsInquiry = async (req, res) => {
  try {
    const { companyName, yourName, email, phone, industry, message } = req.body;

    if (!companyName || !yourName || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (Company Name, Your Name, Email, Phone, Message)",
      });
    }

    const inquiry = await AdsInquiry.create({
      companyName,
      yourName,
      email,
      phone,
      industry: industry || "Other",
      message,
    });

    res.status(201).json({
      success: true,
      message: "Thank you! Your brand advertising inquiry has been submitted successfully.",
      data: inquiry,
    });
  } catch (error) {
    console.error("submitAdsInquiry error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get All Ads Inquiries (Admin)
export const getAllAdsInquiries = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { yourName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { industry: { $regex: search, $options: "i" } },
      ];
    }

    const inquiries = await AdsInquiry.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    console.error("getAllAdsInquiries error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update Status (Admin)
export const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "contacted", "in-discussion", "closed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowed.join(", ")}`,
      });
    }

    const updated = await AdsInquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    res.status(200).json({
      success: true,
      message: "Inquiry status updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("updateInquiryStatus error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Delete Inquiry (Admin)
export const deleteAdsInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AdsInquiry.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    res.status(200).json({
      success: true,
      message: "Inquiry deleted successfully",
    });
  } catch (error) {
    console.error("deleteAdsInquiry error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper to prepare the workbook with columns & data
const generateWorkbook = async () => {
  const inquiries = await AdsInquiry.find().sort({ createdAt: -1 });
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Ads Inquiries");

  worksheet.columns = [
    { header: "Date", key: "date", width: 15 },
    { header: "Company Name", key: "companyName", width: 25 },
    { header: "Contact Person", key: "yourName", width: 20 },
    { header: "Email Address", key: "email", width: 30 },
    { header: "Contact Number", key: "phone", width: 18 },
    { header: "Industry", key: "industry", width: 20 },
    { header: "Message / Brand Ideas", key: "message", width: 45 },
    { header: "Status", key: "status", width: 15 },
  ];

  inquiries.forEach((item) => {
    worksheet.addRow({
      date: new Date(item.createdAt).toLocaleDateString(),
      companyName: item.companyName,
      yourName: item.yourName,
      email: item.email,
      phone: item.phone,
      industry: item.industry || "N/A",
      message: item.message,
      status: item.status,
    });
  });

  // Style header row (Dark Red background with white text)
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD01824" },
  };

  return { workbook, worksheet };
};

// 1. Export as EXCEL (.xlsx)
export const exportToExcel = async (req, res) => {
  try {
    const { workbook } = await generateWorkbook();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Infinito_Ads_Inquiries.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("exportToExcel error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// 2. Export as CSV (.csv)
export const exportToCSV = async (req, res) => {
  try {
    const { workbook } = await generateWorkbook();

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Infinito_Ads_Inquiries.csv"
    );

    await workbook.csv.write(res);
    res.end();
  } catch (error) {
    console.error("exportToCSV error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};