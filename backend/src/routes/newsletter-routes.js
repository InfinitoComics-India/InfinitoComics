import express from "express";
const router = express.Router();
import NewsletterController from "../controller/newsletter-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";

router.post("/subscribe",   NewsletterController.subscribe);
router.post("/unsubscribe", NewsletterController.unsubscribe);
router.get("/all",          adminauthenticate, NewsletterController.getAllSubscribers);

export default router;
