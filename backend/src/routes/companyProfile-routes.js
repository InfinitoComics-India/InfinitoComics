import express from "express";
import { getCompanyProfile, updateCompanyProfile } from "../controller/companyProfile-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";
import { checkRole } from "../middleware/roleCheck.js";

const router = express.Router();

// Get Company Profile details
router.get("/", getCompanyProfile);

// Update Company Profile (Superadmin, shop_admin, or authorized employees)
router.put(
  "/",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin", "employee"]),
  updateCompanyProfile
);

router.patch(
  "/",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin", "employee"]),
  updateCompanyProfile
);

router.post(
  "/",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin", "employee"]),
  updateCompanyProfile
);

export default router;
