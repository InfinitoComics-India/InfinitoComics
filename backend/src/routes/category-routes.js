import express from "express";
const router = express.Router();
import * as categoryController from "../controller/category-controller.js";
import shopImageUpload from '../middleware/shopImageUpload.js';
import { adminauthenticate } from '../middleware/adminauth.js';
import { checkRole } from "../middleware/roleCheck.js";

// Admin routes (protected)
router.post(
  "/",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
  categoryController.createCategory
);

router.get(
  "/admin/all",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
  categoryController.getAllCategories
);

router.get(
  "/:id",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
  categoryController.getCategoryById
);

router.put(
  "/:id",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
  categoryController.deleteCategory
);

router.patch(
  "/reorder",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
  categoryController.reorderCategories
);

// Public routes (for frontend shop)
router.get("/public/all", categoryController.getAllCategories);
router.get("/public/slug/:slug", categoryController.getCategoryBySlug);

// Image upload route
router.post(
  "/upload-image",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
  shopImageUpload.single('image'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        data: {
          url: `/uploads/shop/${req.file.filename}`
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

export default router;
