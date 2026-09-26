import express from "express";
const router = express.Router();
import * as inventoryController from "../controller/inventory-controller.js";
import { adminauthenticate } from '../middleware/adminauth.js';
import { checkRole } from "../middleware/roleCheck.js";

// All inventory routes are admin-protected
router.get(
  "/",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
  inventoryController.getAllInventory
);

router.get(
  "/product/:productId",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
  inventoryController.getInventoryByProductId
);

router.patch(
  "/:productId",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
  inventoryController.updateInventoryStock
);

router.patch(
  "/bulk-update",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
  inventoryController.bulkUpdateInventory
);

router.get(
  "/:productId/history",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
  inventoryController.getInventoryHistory
);

router.get(
  "/low-stock",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
  inventoryController.getLowStockProducts
);

router.get(
  "/out-of-stock",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
  inventoryController.getOutOfStockProducts
);

router.get(
  "/export",
  adminauthenticate,
  checkRole(["superadmin", "shop_admin"]),
  inventoryController.exportInventoryReport
);

export default router;
