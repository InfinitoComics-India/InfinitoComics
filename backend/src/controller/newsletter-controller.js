import Newsletter from "../models/Newsletter.js";
import { sendEmail } from "../utils/sendEmail.js";

// POST subscribe
const subscribe = async (req, res) => {
  try {
    const { email, name, source } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required." });

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.isActive) return res.status(409).json({ success: false, message: "This email is already subscribed." });
      // Reactivate
      existing.isActive = true;
      await existing.save();
      return res.status(200).json({ success: true, message: "Welcome back! You have been re-subscribed.", data: existing });
    }

    const subscriber = await Newsletter.create({ email, name: name || "", source: source || "website" });

    // Send welcome email
    await sendEmail(
      email,
      "Welcome to InfinitoComics Newsletter!",
      `Hi ${name || "there"},\n\nThank you for subscribing to the InfinitoComics newsletter!\n\nYou'll be the first to know about new comics, character reveals, events, and exclusive offers.\n\nUse code INFINT10 for 10% off on our shop!\n\nBest regards,\nThe InfinitoComics Team\nhttps://infinitohq.com`
    );

    res.status(201).json({ success: true, message: "Successfully subscribed!", data: subscriber });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST unsubscribe
const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required." });
    await Newsletter.findOneAndUpdate({ email: email.toLowerCase() }, { isActive: false });
    res.status(200).json({ success: true, message: "You have been unsubscribed." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// GET all subscribers (admin)
const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ isActive: true }).sort({ subscribedAt: -1 });
    res.status(200).json({ success: true, data: subscribers, count: subscribers.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export default { subscribe, unsubscribe, getAllSubscribers };
