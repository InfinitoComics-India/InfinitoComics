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
  checkRole(["superadmin", "shop_admin"]),
  productController.createProduct
);

router.get(
  "/admin/all",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
  productController.getAllProducts
);

router.get(
  "/:id",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
  productController.getProductById
);

router.put(
  "/:id",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
  productController.updateProduct
);

router.delete(
  "/:id",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
  productController.deleteProduct
);

router.patch(
  "/bulk-update",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
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
  checkRole(["superadmin", "shop_admin"]),
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
          const result = await uploadToS3(file.buffer, file.originalname, file.mimetype);
          return {
            url: result.Location,
            alt: file.originalname,
            isPrimary: index === 0
          };
        })
      );

      return res.status(200).json({
        success: true,
        message: "Images uploaded successfully",
        data: uploadedImages
      });
    } catch (error) {
      console.error("Error uploading product images to Cloudinary:", error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

export default router;
