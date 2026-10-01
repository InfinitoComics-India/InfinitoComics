import express from "express";
const router = express.Router();
import * as categoryController from "../controller/category-controller.js";
import upload from '../middleware/multer.js';
import { uploadToS3 } from '../utils/aws.js';
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

// Image upload route (Cloudinary backed for permanent persistence)
router.post(
  "/upload-image",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      const result = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);

      return res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        data: {
          url: result.Location
        }
      });
    } catch (error) {
      console.error("Error uploading category image to Cloudinary:", error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

export default router;
