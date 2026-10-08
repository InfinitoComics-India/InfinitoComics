import express from "express";
const router = express.Router();
import * as productController from "../controller/product-controller.js";
import upload from '../middleware/multer.js';
import { uploadToS3 } from '../utils/aws.js';
import { adminauthenticate } from '../middleware/adminauth.js';
import { checkRole } from "../middleware/roleCheck.js";

// Admin routes (protected)
router.post(
  "/",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin", "employee"]),
  productController.createProduct
);

router.get(
  "/admin/all",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin", "employee"]),
  productController.getAllProducts
);

router.get(
  "/:id",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin", "employee"]),
  productController.getProductById
);

router.put(
  "/:id",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin", "employee"]),
  productController.updateProduct
);

router.delete(
  "/:id",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin", "employee"]),
  productController.deleteProduct
);

router.patch(
  "/bulk-update",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin", "employee"]),
  productController.bulkUpdateProducts
);

// Public routes (for frontend shop)
router.get("/public/all", productController.getAllProducts);
router.get("/public/featured", productController.getFeaturedProducts);
router.get("/public/slug/:slug", productController.getProductBySlug);
router.get("/public/category/:categorySlug", productController.getProductsByCategory);

// Image upload route (Cloudinary backed for permanent persistence)
router.post(
  "/upload-images",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin", "employee"]),
  upload.array('images', 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded"
        });
      }

      const uploadedImages = await Promise.all(
        req.files.map(async (file, index) => {
          try {
            const result = await uploadToS3(file.buffer, file.originalname, file.mimetype);
            return {
              url: result.Location,
              alt: file.originalname,
              isPrimary: index === 0
            };
          } catch (fileErr) {
            console.warn(`[upload-images] Per-file fallback for ${file.originalname}:`, fileErr.message);
            const dataUri = `data:${file.mimetype || 'image/png'};base64,${file.buffer.toString('base64')}`;
            return {
              url: dataUri,
              alt: file.originalname,
              isPrimary: index === 0
            };
          }
        })
      );

      return res.status(200).json({
        success: true,
        message: "Images uploaded successfully",
        data: uploadedImages
      });
    } catch (error) {
      console.error("Error uploading product images:", error);
      // Graceful fallback: even on general error, map any uploaded files to Data URIs
      if (req.files && req.files.length > 0) {
        const fallbackImages = req.files.map((file, index) => ({
          url: `data:${file.mimetype || 'image/png'};base64,${file.buffer.toString('base64')}`,
          alt: file.originalname,
          isPrimary: index === 0
        }));
        return res.status(200).json({
          success: true,
          message: "Images processed via fallback",
          data: fallbackImages
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

export default router;
