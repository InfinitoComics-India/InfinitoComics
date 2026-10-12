import express from "express";
const router = express.Router();
import * as inventoryController from "../controller/inventory-controller.js";
import { adminauthenticate } from '../middleware/adminauth.js';
import { checkRole } from "../middleware/roleCheck.js";

// All inventory routes are admin-protected
const adminGuard = [
  adminauthenticate,
  checkRole(["superadmin", "shop_admin", "employee"]),
];

// -----------------------------------------------------------------------------
// IMPORTANT: Express matches routes in declaration order. Specific literal
// paths (`/low-stock`, `/out-of-stock`, `/export`, `/bulk-update`) MUST be
// declared BEFORE parameterized paths (`/:productId`, `/:productId/history`)
// otherwise Express will treat "low-stock" as a productId and 404 the request.
// -----------------------------------------------------------------------------

// Overview + specific product-status lists
router.get("/", ...adminGuard, inventoryController.getAllInventory);
router.get("/low-stock", ...adminGuard, inventoryController.getLowStockProducts);
router.get("/out-of-stock", ...adminGuard, inventoryController.getOutOfStockProducts);
router.get("/export", ...adminGuard, inventoryController.exportInventoryReport);

// Bulk update (must come BEFORE `PATCH /:productId`)
router.patch("/bulk-update", ...adminGuard, inventoryController.bulkUpdateInventory);

// Product-scoped operations
router.get("/product/:productId", ...adminGuard, inventoryController.getInventoryByProductId);
router.get("/:productId/history", ...adminGuard, inventoryController.getInventoryHistory);
router.patch("/:productId", ...adminGuard, inventoryController.updateInventoryStock);

export default router;
