import express from "express";
const router = express.Router();
import WishlistController from "../controller/wishlist-controller.js";
import { authenticate } from "../middleware/auth.js";

router.get("/",              authenticate, WishlistController.getWishlist);
router.post("/",             authenticate, WishlistController.addToWishlist);
router.get("/check/:comicId",authenticate, WishlistController.checkWishlist);
router.delete("/:comicId",   authenticate, WishlistController.removeFromWishlist);

export default router;
