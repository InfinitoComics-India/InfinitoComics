import CompanyProfile from "../models/CompanyProfile.js";

/**
 * Get company profile (Singleton document)
 */
export const getCompanyProfile = async (req, res) => {
  try {
    let profile = await CompanyProfile.findOne();
    if (!profile) {
      // Auto-initialize default profile
      profile = await CompanyProfile.create({
        companyName: "Infinito Comics Private Limited",
        brandName: "Infinito Comics",
        tagline: "India's Premier Universe of Graphic Fiction & Comics",
        website: "https://infinitocomics.com",
        contact: {
          email: "contact@infinitohq.com",
          billingEmail: "billing@infinitohq.com",
          phone: "+91 98765 43210",
          supportPhone: "+91 98765 43210",
        },
        address: {
          street: "Infinito Headquarters, Outer Ring Road",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560103",
          country: "India",
        },
        bankDetails: {
          bankName: "HDFC Bank",
          accountHolder: "Infinito Comics Private Limited",
          accountNumber: "50200012345678",
          ifscCode: "HDFC0001234",
          branchName: "Koramangala Branch",
          accountType: "Current Account",
          upiId: "infinitocomics@hdfcbank",
        },
        invoiceSettings: {
          invoicePrefix: "INF-INV-",
          authorizedSignatory: "Director, Infinito Comics Pvt Ltd",
          termsAndConditions: "Thank you for shopping with Infinito Comics. Goods once sold can be replaced in case of manufacturing defects within 7 days.",
          footerNote: "This is a computer generated invoice and does not require physical signature.",
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company profile retrieved successfully",
      data: profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to fetch company profile: ${error.message}`,
    });
  }
};

/**
 * Update company profile (Singleton document)
 */
export const updateCompanyProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.user?.email) {
      updateData.updatedBy = req.user.email;
    }

    let profile = await CompanyProfile.findOne();
    if (!profile) {
      profile = await CompanyProfile.create(updateData);
    } else {
      profile = await CompanyProfile.findByIdAndUpdate(
        profile._id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Company profile updated successfully",
      data: profile,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: `Failed to update company profile: ${error.message}`,
    });
  }
};
