import DirectMessage from "../models/DirectMessage.js";
import Admin from "../models/Admin.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, subject, body } = req.body;
    if (!receiverId || !body?.trim()) return res.status(400).json({ success: false, message: "receiverId and body are required." });
    const receiver = await Admin.findById(receiverId).select("name email");
    if (!receiver) return res.status(404).json({ success: false, message: "Receiver not found." });
    const msg = await DirectMessage.create({
      senderId: req.user._id, senderName: req.user.name || req.user.email || "Admin",
      receiverId, receiverName: receiver.name || receiver.email,
      subject: subject?.trim() || "", body: body.trim(),
    });
    res.status(201).json({ success: true, message: "Message sent.", data: msg });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const getInbox = async (req, res) => {
  try {
    const msgs = await DirectMessage.find({ receiverId: req.user._id, isDeletedByReceiver: false }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, data: msgs, count: msgs.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const getSent = async (req, res) => {
  try {
    const msgs = await DirectMessage.find({ senderId: req.user._id, isDeletedBySender: false }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, data: msgs, count: msgs.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await DirectMessage.countDocuments({ receiverId: req.user._id, isRead: false, isDeletedByReceiver: false });
    res.status(200).json({ success: true, count });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const markRead = async (req, res) => {
  try {
    const msg = await DirectMessage.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() }, { new: true });
    if (!msg) return res.status(404).json({ success: false, message: "Message not found." });
    res.status(200).json({ success: true, data: msg });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const deleteMessage = async (req, res) => {
  try {
    const msg = await DirectMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: "Message not found." });
    if (msg.senderId.toString()   === req.user._id.toString()) msg.isDeletedBySender   = true;
    if (msg.receiverId.toString() === req.user._id.toString()) msg.isDeletedByReceiver = true;
    await msg.save();
    res.status(200).json({ success: true, message: "Message deleted." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const getContacts = async (req, res) => {
  try {
    const contacts = await Admin.find({ _id: { $ne: req.user._id } }).select("name email roles role employeeId").sort({ name: 1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
