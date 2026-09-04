import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Account from '../models/User.js';
import config from '../config/server-config.js';

export const adminauthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
  if (!token || token === "undefined" || token === "null") {
    return res.status(401).json({ message: "No valid token provided. Please log in again." });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET_KEY);
    let user = await Admin.findById(decoded.id);
    if (!user) {
      user = await Account.findById(decoded.id);
    }
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    console.error("adminauthenticate error:", err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    }
    return res.status(401).json({ message: "Invalid token. Please log in again." });
  }
};

